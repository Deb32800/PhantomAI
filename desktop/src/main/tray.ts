import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron';
import * as path from 'path';

/**
 * Create and configure the system tray
 */
export function setupTray(mainWindow: BrowserWindow, toggleOverlay: () => void): Tray {
    // Create tray icon
    const iconPath = path.join(__dirname, '../../assets/tray-icon.png');
    const icon = nativeImage.createFromPath(iconPath);

    // Resize for proper display
    const trayIcon = icon.resize({ width: 16, height: 16 });
    trayIcon.setTemplateImage(true);

    const tray = new Tray(trayIcon);
    tray.setToolTip('Phantom AI - Your AI Desktop Assistant');

    // Build context menu
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Phantom AI',
            type: 'normal',
            click: () => {
                mainWindow.show();
                mainWindow.focus();
            },
        },
        {
            label: 'Quick Command',
            type: 'normal',
            accelerator: 'CmdOrCtrl+Shift+Space',
            click: toggleOverlay,
        },
        { type: 'separator' },
        {
            label: 'Status',
            type: 'submenu',
            submenu: [
                {
                    label: 'Ready',
                    type: 'radio',
                    checked: true,
                },
                {
                    label: 'Busy',
                    type: 'radio',
                },
                {
                    label: 'Paused',
                    type: 'radio',
                },
            ],
        },
        { type: 'separator' },
        {
            label: 'Settings',
            type: 'normal',
            click: () => {
                mainWindow.show();
                mainWindow.webContents.send('navigate', '/settings');
            },
        },
        {
            label: 'Activity Log',
            type: 'normal',
            click: () => {
                mainWindow.show();
                mainWindow.webContents.send('navigate', '/activity');
            },
        },
        { type: 'separator' },
        {
            label: 'Help & Support',
            type: 'normal',
            click: () => {
                const { shell } = require('electron');
                shell.openExternal('https://phantom-ai.com/docs');
            },
        },
        {
            label: 'Check for Updates',
            type: 'normal',
            click: () => {
                mainWindow.webContents.send('check-updates');
            },
        },
        { type: 'separator' },
        {
            label: 'Quit Phantom AI',
            type: 'normal',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
                (app as any).isQuitting = true;
                app.quit();
            },
        },
    ]);

    tray.setContextMenu(contextMenu);

    // Click behavior
    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }
    });

    tray.on('double-click', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    return tray;
}

/**
 * Update tray icon to reflect agent status
 */
export function updateTrayStatus(tray: Tray, status: 'ready' | 'busy' | 'error'): void {
    const iconMap = {
        ready: 'tray-icon.png',
        busy: 'tray-icon-busy.png',
        error: 'tray-icon-error.png',
    };

    const iconPath = path.join(__dirname, `../../assets/${iconMap[status]}`);
    const icon = nativeImage.createFromPath(iconPath);
    const trayIcon = icon.resize({ width: 16, height: 16 });
    trayIcon.setTemplateImage(true);

    tray.setImage(trayIcon);

    const tooltipMap = {
        ready: 'Phantom AI - Ready',
        busy: 'Phantom AI - Working...',
        error: 'Phantom AI - Error occurred',
    };

    tray.setToolTip(tooltipMap[status]);
}
