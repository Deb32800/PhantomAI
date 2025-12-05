import { globalShortcut, BrowserWindow, app } from 'electron';
import { Logger } from './logger';

const logger = new Logger('shortcuts');

interface Shortcut {
    accelerator: string;
    action: () => void;
    description: string;
}

/**
 * Register global keyboard shortcuts
 */
export function registerShortcuts(toggleOverlay: () => void, mainWindow: BrowserWindow): void {
    const shortcuts: Shortcut[] = [
        {
            accelerator: 'CommandOrControl+Shift+Space',
            action: toggleOverlay,
            description: 'Toggle command overlay',
        },
        {
            accelerator: 'CommandOrControl+Shift+P',
            action: () => {
                mainWindow.show();
                mainWindow.focus();
            },
            description: 'Show main window',
        },
        {
            accelerator: 'CommandOrControl+Shift+S',
            action: () => {
                mainWindow.webContents.send('agent:stop');
            },
            description: 'Stop current task',
        },
        {
            accelerator: 'CommandOrControl+Shift+R',
            action: () => {
                mainWindow.webContents.send('workflow:toggleRecording');
            },
            description: 'Toggle workflow recording',
        },
        {
            accelerator: 'CommandOrControl+Shift+V',
            action: () => {
                mainWindow.webContents.send('voice:toggle');
            },
            description: 'Toggle voice input',
        },
        {
            accelerator: 'Escape',
            action: () => {
                mainWindow.webContents.send('overlay:hide');
            },
            description: 'Hide overlay / Cancel action',
        },
    ];

    shortcuts.forEach(({ accelerator, action, description }) => {
        try {
            const success = globalShortcut.register(accelerator, action);
            if (success) {
                logger.info(`Registered shortcut: ${accelerator} -> ${description}`);
            } else {
                logger.warn(`Failed to register shortcut: ${accelerator}`);
            }
        } catch (error) {
            logger.error(`Error registering shortcut ${accelerator}:`, error);
        }
    });
}

/**
 * Unregister all shortcuts (call before app.quit)
 */
export function unregisterShortcuts(): void {
    globalShortcut.unregisterAll();
    logger.info('All shortcuts unregistered');
}

/**
 * Get list of registered shortcuts for display in UI
 */
export function getShortcutsList(): { accelerator: string; description: string }[] {
    return [
        { accelerator: '⌘⇧Space', description: 'Open command overlay' },
        { accelerator: '⌘⇧P', description: 'Show Phantom AI window' },
        { accelerator: '⌘⇧S', description: 'Stop current task' },
        { accelerator: '⌘⇧R', description: 'Record workflow' },
        { accelerator: '⌘⇧V', description: 'Voice input' },
        { accelerator: 'Esc', description: 'Cancel / Close' },
    ];
}
