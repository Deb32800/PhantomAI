"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
/**
 * Application Controller - Launch and manage applications
 */
class ApplicationController {
    runningApps = new Map(); // name -> pid
    /**
     * Launch an application by name
     */
    async launch(appName) {
        const platform = process.platform;
        try {
            if (platform === 'darwin') {
                return await this.launchMac(appName);
            }
            else if (platform === 'win32') {
                return await this.launchWindows(appName);
            }
            else {
                return await this.launchLinux(appName);
            }
        }
        catch (error) {
            console.error(`Failed to launch ${appName}:`, error);
            return false;
        }
    }
    /**
     * Launch app on macOS
     */
    async launchMac(appName) {
        return new Promise((resolve) => {
            // Try 'open' command first
            (0, child_process_1.exec)(`open -a "${appName}"`, (error) => {
                if (!error) {
                    resolve(true);
                    return;
                }
                // Try with .app extension
                (0, child_process_1.exec)(`open -a "${appName}.app"`, (error2) => {
                    resolve(!error2);
                });
            });
        });
    }
    /**
     * Launch app on Windows
     */
    async launchWindows(appName) {
        return new Promise((resolve) => {
            // Try start command
            (0, child_process_1.exec)(`start "" "${appName}"`, (error) => {
                if (!error) {
                    resolve(true);
                    return;
                }
                // Try as executable
                (0, child_process_1.exec)(`start "" "${appName}.exe"`, (error2) => {
                    resolve(!error2);
                });
            });
        });
    }
    /**
     * Launch app on Linux
     */
    async launchLinux(appName) {
        return new Promise((resolve) => {
            const lowerName = appName.toLowerCase();
            // Try common locations
            const commands = [
                lowerName,
                `/usr/bin/${lowerName}`,
                `/usr/local/bin/${lowerName}`,
            ];
            const tryNext = (index) => {
                if (index >= commands.length) {
                    resolve(false);
                    return;
                }
                const child = (0, child_process_1.spawn)(commands[index], [], {
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
    async openUrl(url) {
        // Ensure URL has protocol
        let fullUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            fullUrl = `https://${url}`;
        }
        await electron_1.shell.openExternal(fullUrl);
    }
    /**
     * Open a file with default application
     */
    async openFile(filePath) {
        const absolutePath = path.isAbsolute(filePath)
            ? filePath
            : path.resolve(filePath);
        await electron_1.shell.openPath(absolutePath);
    }
    /**
     * Open Finder/Explorer to a folder
     */
    async showInFolder(filePath) {
        electron_1.shell.showItemInFolder(filePath);
    }
    /**
     * Get running applications (macOS only for now)
     */
    async getRunningApps() {
        if (process.platform !== 'darwin') {
            return [];
        }
        return new Promise((resolve) => {
            (0, child_process_1.exec)('osascript -e \'tell application "System Events" to get name of every process whose background only is false\'', (error, stdout) => {
                if (error) {
                    resolve([]);
                    return;
                }
                const apps = stdout.trim().split(', ');
                resolve(apps);
            });
        });
    }
    /**
     * Focus an application window
     */
    async focusApp(appName) {
        if (process.platform === 'darwin') {
            return new Promise((resolve) => {
                (0, child_process_1.exec)(`osascript -e 'tell application "${appName}" to activate'`, (error) => resolve(!error));
            });
        }
        else if (process.platform === 'win32') {
            // Windows focus logic would go here
            return this.launch(appName);
        }
        return false;
    }
    /**
     * Quit an application
     */
    async quitApp(appName) {
        if (process.platform === 'darwin') {
            return new Promise((resolve) => {
                (0, child_process_1.exec)(`osascript -e 'tell application "${appName}" to quit'`, (error) => resolve(!error));
            });
        }
        else if (process.platform === 'win32') {
            return new Promise((resolve) => {
                (0, child_process_1.exec)(`taskkill /IM "${appName}.exe"`, (error) => resolve(!error));
            });
        }
        return false;
    }
    /**
     * Check if an application is running
     */
    async isRunning(appName) {
        const runningApps = await this.getRunningApps();
        return runningApps.some((app) => app.toLowerCase().includes(appName.toLowerCase()));
    }
    /**
     * Get list of common applications
     */
    getCommonApps() {
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
        }
        else if (process.platform === 'win32') {
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
    async openInBrowser(url, browser) {
        const platform = process.platform;
        let command = '';
        if (platform === 'darwin') {
            const browserMap = {
                chrome: 'Google Chrome',
                firefox: 'Firefox',
                safari: 'Safari',
                edge: 'Microsoft Edge',
            };
            command = `open -a "${browserMap[browser]}" "${url}"`;
        }
        else if (platform === 'win32') {
            const browserMap = {
                chrome: 'chrome',
                firefox: 'firefox',
                safari: 'safari',
                edge: 'msedge',
            };
            command = `start ${browserMap[browser]} "${url}"`;
        }
        return new Promise((resolve) => {
            (0, child_process_1.exec)(command, (error) => resolve(!error));
        });
    }
}
exports.ApplicationController = ApplicationController;
//# sourceMappingURL=applications.js.map