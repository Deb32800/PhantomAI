import { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, nativeImage } from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import { setupAutoUpdater } from './auto-updater';
import { setupTray } from './tray';
import { registerShortcuts } from './shortcuts';
import { setupIpcHandlers } from './ipc-handlers';
import { LicenseManager } from './license';
import { Logger } from './logger';

// Initialize logger
const logger = new Logger('main');

// Initialize persistent store
const store = new Store({
    name: 'phantom-ai-config',
    defaults: {
        windowBounds: { width: 1200, height: 800 },
        theme: 'dark',
        startMinimized: false,
        startOnBoot: false,
        ollamaUrl: 'http://localhost:11434',
        defaultModel: 'llava:13b',
        voiceEnabled: false,
        confirmDestructiveActions: true,
        maxActionsPerMinute: 60,
        trialStartDate: null,
        licenseKey: null,
        isPro: false,
    },
});

// Global references
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let overlayWindow: BrowserWindow | null = null;

// Trial configuration
const TRIAL_DAYS = 7;

/**
 * Check if user is in trial or has pro license
 */
function checkLicenseStatus(): { isValid: boolean; daysRemaining: number; isPro: boolean } {
    const licenseKey = store.get('licenseKey') as string | null;
    const isPro = store.get('isPro') as boolean;

    if (isPro && licenseKey) {
        const licenseManager = new LicenseManager();
        if (licenseManager.validateKey(licenseKey)) {
            return { isValid: true, daysRemaining: -1, isPro: true };
        }
    }

    // Check trial
    let trialStartDate = store.get('trialStartDate') as string | null;
    if (!trialStartDate) {
        trialStartDate = new Date().toISOString();
        store.set('trialStartDate', trialStartDate);
    }

    const startDate = new Date(trialStartDate);
    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, TRIAL_DAYS - daysElapsed);

    return {
        isValid: daysRemaining > 0,
        daysRemaining,
        isPro: false
    };
}

/**
 * Create the main application window
 */
function createMainWindow(): BrowserWindow {
    const bounds = store.get('windowBounds') as { width: number; height: number };

    mainWindow = new BrowserWindow({
        width: bounds.width,
        height: bounds.height,
        minWidth: 800,
        minHeight: 600,
        title: 'Phantom AI',
        icon: path.join(__dirname, '../../assets/icon.png'),
        backgroundColor: '#0a0a0f',
        titleBarStyle: 'hiddenInset',
        trafficLightPosition: { x: 15, y: 15 },
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            sandbox: false,
        },
        show: false,
    });

    // Load the app
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Show when ready
    mainWindow.once('ready-to-show', () => {
        if (!store.get('startMinimized')) {
            mainWindow?.show();
        }
    });

    // Save window bounds on resize
    mainWindow.on('resize', () => {
        if (mainWindow) {
            const [width, height] = mainWindow.getSize();
            store.set('windowBounds', { width, height });
        }
    });

    // Handle close - hide to tray instead of quitting
    mainWindow.on('close', (event) => {
        if (!(app as any).isQuitting) {
            event.preventDefault();
            mainWindow?.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    logger.info('Main window created');
    return mainWindow;
}

/**
 * Create the floating command overlay window
 */
function createOverlayWindow(): BrowserWindow {
    overlayWindow = new BrowserWindow({
        width: 600,
        height: 80,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        focusable: true,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if (process.env.NODE_ENV === 'development') {
        overlayWindow.loadURL('http://localhost:5173/#/overlay');
    } else {
        overlayWindow.loadFile(path.join(__dirname, '../renderer/index.html'), {
            hash: '/overlay',
        });
    }

    overlayWindow.on('blur', () => {
        overlayWindow?.hide();
    });

    logger.info('Overlay window created');
    return overlayWindow;
}

/**
 * Toggle the command overlay visibility
 */
function toggleOverlay(): void {
    if (!overlayWindow) {
        createOverlayWindow();
    }

    if (overlayWindow?.isVisible()) {
        overlayWindow.hide();
    } else {
        // Position overlay in center of screen
        const { screen } = require('electron');
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;

        overlayWindow?.setBounds({
            x: Math.round((width - 600) / 2),
            y: Math.round(height / 3),
            width: 600,
            height: 80,
        });

        overlayWindow?.show();
        overlayWindow?.focus();
    }
}

/**
 * Application ready handler
 */
async function onAppReady(): Promise<void> {
    logger.info('Phantom AI starting...');

    // Check license
    const licenseStatus = checkLicenseStatus();
    logger.info(`License status: ${JSON.stringify(licenseStatus)}`);

    // Create windows
    createMainWindow();
    createOverlayWindow();

    // Setup system tray
    tray = setupTray(mainWindow!, toggleOverlay);

    // Register global shortcuts
    registerShortcuts(toggleOverlay, mainWindow!);

    // Setup IPC handlers
    setupIpcHandlers(mainWindow!, store, checkLicenseStatus);

    // Setup auto-updater (production only)
    if (process.env.NODE_ENV !== 'development') {
        setupAutoUpdater(mainWindow!);
    }

    logger.info('Phantom AI ready');
}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// App lifecycle
app.on('ready', onAppReady);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    } else {
        mainWindow?.show();
    }
});

app.on('before-quit', () => {
    (app as any).isQuitting = true;
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    logger.info('Phantom AI shutting down');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
});

export { mainWindow, overlayWindow, store, toggleOverlay };
