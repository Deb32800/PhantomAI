export interface ApplicationInfo {
    name: string;
    path: string;
    bundleId?: string;
    isRunning: boolean;
}
/**
 * Application Controller - Launch and manage applications
 */
export declare class ApplicationController {
    private runningApps;
    /**
     * Launch an application by name
     */
    launch(appName: string): Promise<boolean>;
    /**
     * Launch app on macOS
     */
    private launchMac;
    /**
     * Launch app on Windows
     */
    private launchWindows;
    /**
     * Launch app on Linux
     */
    private launchLinux;
    /**
     * Open a URL in default browser
     */
    openUrl(url: string): Promise<void>;
    /**
     * Open a file with default application
     */
    openFile(filePath: string): Promise<void>;
    /**
     * Open Finder/Explorer to a folder
     */
    showInFolder(filePath: string): Promise<void>;
    /**
     * Get running applications (macOS only for now)
     */
    getRunningApps(): Promise<string[]>;
    /**
     * Focus an application window
     */
    focusApp(appName: string): Promise<boolean>;
    /**
     * Quit an application
     */
    quitApp(appName: string): Promise<boolean>;
    /**
     * Check if an application is running
     */
    isRunning(appName: string): Promise<boolean>;
    /**
     * Get list of common applications
     */
    getCommonApps(): string[];
    /**
     * Open specific browser with URL
     */
    openInBrowser(url: string, browser: 'chrome' | 'firefox' | 'safari' | 'edge'): Promise<boolean>;
}
//# sourceMappingURL=applications.d.ts.map