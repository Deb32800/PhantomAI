import { BrowserWindow, ipcMain, shell, dialog } from 'electron';
import Store from 'electron-store';
import { Agent } from '../core/agent';
import { VisionSystem } from '../vision/capture';
import { OllamaClient } from '../vision/ollama-client';
import { ControlSystem } from '../control/control-system';
import { SafetyManager } from '../safety/safety-manager';
import { ActivityLogger } from '../safety/activity-logger';
import { Logger } from './logger';

const logger = new Logger('ipc-handlers');

// Core systems
let agent: Agent | null = null;
let visionSystem: VisionSystem | null = null;
let ollamaClient: OllamaClient | null = null;
let controlSystem: ControlSystem | null = null;
let safetyManager: SafetyManager | null = null;
let activityLogger: ActivityLogger | null = null;

/**
 * Initialize all core systems
 */
async function initializeSystems(store: Store<any>): Promise<void> {
    const ollamaUrl = store.get('ollamaUrl') as string;
    const defaultModel = store.get('defaultModel') as string;

    // Initialize systems
    activityLogger = new ActivityLogger();
    visionSystem = new VisionSystem();
    ollamaClient = new OllamaClient(ollamaUrl, defaultModel);
    controlSystem = new ControlSystem();
    safetyManager = new SafetyManager(store);

    // Initialize AI agent
    agent = new Agent({
        vision: visionSystem,
        ollama: ollamaClient,
        control: controlSystem,
        safety: safetyManager,
        activity: activityLogger,
    });

    logger.info('All systems initialized');
}

/**
 * Setup IPC handlers for main window communication
 */
export function setupIpcHandlers(
    mainWindow: BrowserWindow,
    store: Store<any>,
    checkLicenseStatus: () => { isValid: boolean; daysRemaining: number; isPro: boolean }
): void {
    // Initialize systems on first call
    let systemsInitialized = false;

    const ensureInitialized = async () => {
        if (!systemsInitialized) {
            await initializeSystems(store);
            systemsInitialized = true;
        }
    };

    // ==========================================
    // Agent Handlers
    // ==========================================

    ipcMain.handle('agent:execute', async (_event, command: string) => {
        await ensureInitialized();

        // Check license first
        const license = checkLicenseStatus();
        if (!license.isValid) {
            throw new Error('Trial expired. Please upgrade to Pro.');
        }

        logger.info(`Executing command: ${command}`);

        // Send updates to renderer
        agent!.on('update', (update) => {
            mainWindow.webContents.send('agent:update', update);
        });

        agent!.on('actionPreview', (action) => {
            mainWindow.webContents.send('agent:actionPreview', action);
        });

        try {
            await agent!.execute(command);
            return { success: true };
        } catch (error: any) {
            logger.error('Agent execution failed:', error);
            throw error;
        }
    });

    ipcMain.handle('agent:stop', async () => {
        if (agent) {
            await agent.stop();
        }
        return { success: true };
    });

    ipcMain.handle('agent:status', async () => {
        await ensureInitialized();
        return agent!.getStatus();
    });

    // ==========================================
    // Vision Handlers
    // ==========================================

    ipcMain.handle('vision:captureScreen', async () => {
        await ensureInitialized();
        const screenshot = await visionSystem!.captureScreen();
        return screenshot;
    });

    ipcMain.handle('vision:captureRegion', async (_event, region: { x: number; y: number; width: number; height: number }) => {
        await ensureInitialized();
        const screenshot = await visionSystem!.captureRegion(region);
        return screenshot;
    });

    // ==========================================
    // Settings Handlers
    // ==========================================

    ipcMain.handle('settings:get', async () => {
        return {
            theme: store.get('theme'),
            ollamaUrl: store.get('ollamaUrl'),
            defaultModel: store.get('defaultModel'),
            voiceEnabled: store.get('voiceEnabled'),
            confirmDestructiveActions: store.get('confirmDestructiveActions'),
            maxActionsPerMinute: store.get('maxActionsPerMinute'),
            startOnBoot: store.get('startOnBoot'),
            startMinimized: store.get('startMinimized'),
        };
    });

    ipcMain.handle('settings:update', async (_event, settings: Partial<any>) => {
        for (const [key, value] of Object.entries(settings)) {
            store.set(key, value);
        }

        // Reinitialize systems if ollama settings changed
        if (settings.ollamaUrl || settings.defaultModel) {
            ollamaClient = new OllamaClient(
                store.get('ollamaUrl') as string,
                store.get('defaultModel') as string
            );
        }

        return { success: true };
    });

    // ==========================================
    // License Handlers
    // ==========================================

    ipcMain.handle('license:status', async () => {
        const status = checkLicenseStatus();
        return {
            ...status,
            licenseKey: store.get('licenseKey'),
        };
    });

    ipcMain.handle('license:activate', async (_event, key: string) => {
        const isValid = /^PH-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key);

        if (isValid) {
            store.set('licenseKey', key);
            store.set('isPro', true);
            return true;
        }

        return false;
    });

    // ==========================================
    // Ollama Handlers
    // ==========================================

    ipcMain.handle('ollama:status', async () => {
        await ensureInitialized();
        return ollamaClient!.getStatus();
    });

    ipcMain.handle('ollama:models', async () => {
        await ensureInitialized();
        return ollamaClient!.listModels();
    });

    ipcMain.handle('ollama:check', async () => {
        await ensureInitialized();
        return { isRunning: await ollamaClient!.isRunning() };
    });

    // ==========================================
    // Activity Handlers
    // ==========================================

    ipcMain.handle('activity:log', async (_event, limit?: number) => {
        await ensureInitialized();
        return activityLogger!.getLog(limit);
    });

    ipcMain.handle('activity:clear', async () => {
        await ensureInitialized();
        await activityLogger!.clear();
        return { success: true };
    });

    // ==========================================
    // Window Handlers
    // ==========================================

    ipcMain.on('window:minimize', () => {
        mainWindow.minimize();
    });

    ipcMain.on('window:maximize', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on('window:close', () => {
        mainWindow.close();
    });

    ipcMain.on('overlay:hide', () => {
        mainWindow.webContents.send('overlay:hidden');
    });

    // ==========================================
    // File/URL Handlers
    // ==========================================

    ipcMain.handle('shell:openExternal', async (_event, url: string) => {
        await shell.openExternal(url);
    });

    ipcMain.handle('dialog:showOpenDialog', async (_event, options: any) => {
        return dialog.showOpenDialog(mainWindow, options);
    });

    ipcMain.handle('dialog:showSaveDialog', async (_event, options: any) => {
        return dialog.showSaveDialog(mainWindow, options);
    });

    logger.info('IPC handlers registered');
}
