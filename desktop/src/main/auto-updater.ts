import { autoUpdater } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';
import { Logger } from './logger';

const logger = new Logger('auto-updater');

/**
 * Setup automatic updates for the application
 */
export function setupAutoUpdater(mainWindow: BrowserWindow): void {
    // Configure auto-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Logging
    autoUpdater.logger = {
        info: (message: any) => logger.info(message),
        warn: (message: any) => logger.warn(message),
        error: (message: any) => logger.error(message),
        debug: (message: any) => logger.debug(message),
    };

    // Event handlers
    autoUpdater.on('checking-for-update', () => {
        logger.info('Checking for updates...');
        mainWindow.webContents.send('update:checking');
    });

    autoUpdater.on('update-available', (info) => {
        logger.info('Update available:', info);
        mainWindow.webContents.send('update:available', info);

        // Show dialog to user
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Update Available',
            message: `A new version (${info.version}) is available!`,
            detail: 'Would you like to download it now?',
            buttons: ['Download', 'Later'],
            defaultId: 0,
        }).then(({ response }) => {
            if (response === 0) {
                autoUpdater.downloadUpdate();
            }
        });
    });

    autoUpdater.on('update-not-available', (info) => {
        logger.info('No updates available');
        mainWindow.webContents.send('update:not-available', info);
    });

    autoUpdater.on('download-progress', (progress) => {
        logger.info(`Download progress: ${progress.percent.toFixed(1)}%`);
        mainWindow.webContents.send('update:progress', progress);
    });

    autoUpdater.on('update-downloaded', (info) => {
        logger.info('Update downloaded:', info);
        mainWindow.webContents.send('update:downloaded', info);

        // Show dialog to install
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Update Ready',
            message: 'Update has been downloaded!',
            detail: 'The application will restart to install the update.',
            buttons: ['Restart Now', 'Later'],
            defaultId: 0,
        }).then(({ response }) => {
            if (response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    });

    autoUpdater.on('error', (error) => {
        logger.error('Update error:', error);
        mainWindow.webContents.send('update:error', error.message);
    });

    // Check for updates on startup (after 3 seconds)
    setTimeout(() => {
        autoUpdater.checkForUpdates().catch((error) => {
            logger.error('Failed to check for updates:', error);
        });
    }, 3000);
}

/**
 * Manually trigger update check
 */
export async function checkForUpdates(): Promise<void> {
    try {
        await autoUpdater.checkForUpdates();
    } catch (error) {
        logger.error('Manual update check failed:', error);
        throw error;
    }
}

/**
 * Get current version
 */
export function getCurrentVersion(): string {
    return autoUpdater.currentVersion.version;
}
