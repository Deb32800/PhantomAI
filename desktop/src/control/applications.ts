import { shell, app } from 'electron';
import { exec, spawn } from 'child_process';
import * as path from 'path';

export interface ApplicationInfo {
    name: string;
    path: string;
    bundleId?: string;
    isRunning: boolean;
}

/**
 * Application Controller - Launch and manage applications
 */
export class ApplicationController {
    private runningApps: Map<string, number> = new Map(); // name -> pid

    /**
     * Launch an application by name
     */
    async launch(appName: string): Promise<boolean> {
        const platform = process.platform;

        try {
            if (platform === 'darwin') {
                return await this.launchMac(appName);
            } else if (platform === 'win32') {
                return await this.launchWindows(appName);
            } else {
                return await this.launchLinux(appName);
            }
        } catch (error) {
            console.error(`Failed to launch ${appName}:`, error);
            return false;
        }
    }

    /**
     * Launch app on macOS
     */
    private async launchMac(appName: string): Promise<boolean> {
        return new Promise((resolve) => {
            // Try 'open' command first
            exec(`open -a "${appName}"`, (error) => {
                if (!error) {
                    resolve(true);
                    return;
                }

                // Try with .app extension
                exec(`open -a "${appName}.app"`, (error2) => {
                    resolve(!error2);
                });
            });
        });
    }

    /**
     * Launch app on Windows
     */
    private async launchWindows(appName: string): Promise<boolean> {
        return new Promise((resolve) => {
            // Try start command
            exec(`start "" "${appName}"`, (error) => {
                if (!error) {
                    resolve(true);
                    return;
                }

                // Try as executable
                exec(`start "" "${appName}.exe"`, (error2) => {
                    resolve(!error2);
                });
            });
        });
    }

    /**
     * Launch app on Linux
     */
    private async launchLinux(appName: string): Promise<boolean> {
        return new Promise((resolve) => {
            const lowerName = appName.toLowerCase();

            // Try common locations
            const commands = [
                lowerName,
                `/usr/bin/${lowerName}`,
                `/usr/local/bin/${lowerName}`,
            ];

            const tryNext = (index: number) => {
                if (index >= commands.length) {
                    resolve(false);
                    return;
                }

                const child = spawn(commands[index], [], {
                    detached: true,
                    stdio: 'ignore',
                });

                child.on('error', () => {
                    tryNext(index + 1);
                });

                child.unref();
                resolve(true);
            };

            tryNext(0);
        });
    }

    /**
     * Open a URL in default browser
     */
    async openUrl(url: string): Promise<void> {
        // Ensure URL has protocol
        let fullUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            fullUrl = `https://${url}`;
        }

        await shell.openExternal(fullUrl);
    }

    /**
     * Open a file with default application
     */
    async openFile(filePath: string): Promise<void> {
        const absolutePath = path.isAbsolute(filePath)
            ? filePath
            : path.resolve(filePath);

        await shell.openPath(absolutePath);
    }

    /**
     * Open Finder/Explorer to a folder
     */
    async showInFolder(filePath: string): Promise<void> {
        shell.showItemInFolder(filePath);
    }

    /**
     * Get running applications (macOS only for now)
     */
    async getRunningApps(): Promise<string[]> {
        if (process.platform !== 'darwin') {
            return [];
        }

        return new Promise((resolve) => {
            exec(
                'osascript -e \'tell application "System Events" to get name of every process whose background only is false\'',
                (error, stdout) => {
                    if (error) {
                        resolve([]);
                        return;
                    }
                    const apps = stdout.trim().split(', ');
                    resolve(apps);
                }
            );
        });
    }

    /**
     * Focus an application window
     */
    async focusApp(appName: string): Promise<boolean> {
        if (process.platform === 'darwin') {
            return new Promise((resolve) => {
                exec(
                    `osascript -e 'tell application "${appName}" to activate'`,
                    (error) => resolve(!error)
                );
            });
        } else if (process.platform === 'win32') {
            // Windows focus logic would go here
            return this.launch(appName);
        }
        return false;
    }

    /**
     * Quit an application
     */
    async quitApp(appName: string): Promise<boolean> {
        if (process.platform === 'darwin') {
            return new Promise((resolve) => {
                exec(
                    `osascript -e 'tell application "${appName}" to quit'`,
                    (error) => resolve(!error)
                );
            });
        } else if (process.platform === 'win32') {
            return new Promise((resolve) => {
                exec(`taskkill /IM "${appName}.exe"`, (error) => resolve(!error));
            });
        }
        return false;
    }

    /**
     * Check if an application is running
     */
    async isRunning(appName: string): Promise<boolean> {
        const runningApps = await this.getRunningApps();
        return runningApps.some((app) =>
            app.toLowerCase().includes(appName.toLowerCase())
        );
    }

    /**
     * Get list of common applications
     */
    getCommonApps(): string[] {
        if (process.platform === 'darwin') {
            return [
                'Safari', 'Chrome', 'Firefox',
                'Mail', 'Messages', 'FaceTime',
                'Notes', 'Reminders', 'Calendar',
                'Finder', 'Terminal', 'Preview',
                'Photos', 'Music', 'Podcasts',
                'System Preferences', 'App Store',
                'Visual Studio Code', 'Xcode',
                'Slack', 'Discord', 'Zoom',
            ];
        } else if (process.platform === 'win32') {
            return [
                'chrome', 'firefox', 'msedge',
                'notepad', 'explorer', 'cmd',
                'outlook', 'teams', 'slack',
                'code', 'powershell',
            ];
        }
        return [];
    }

    /**
     * Open specific browser with URL
     */
    async openInBrowser(url: string, browser: 'chrome' | 'firefox' | 'safari' | 'edge'): Promise<boolean> {
        const platform = process.platform;
        let command = '';

        if (platform === 'darwin') {
            const browserMap: Record<string, string> = {
                chrome: 'Google Chrome',
                firefox: 'Firefox',
                safari: 'Safari',
                edge: 'Microsoft Edge',
            };
            command = `open -a "${browserMap[browser]}" "${url}"`;
        } else if (platform === 'win32') {
            const browserMap: Record<string, string> = {
                chrome: 'chrome',
                firefox: 'firefox',
                safari: 'safari',
                edge: 'msedge',
            };
            command = `start ${browserMap[browser]} "${url}"`;
        }

        return new Promise((resolve) => {
            exec(command, (error) => resolve(!error));
        });
    }
}
