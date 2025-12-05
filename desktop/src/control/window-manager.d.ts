export interface WindowInfo {
    id: number;
    name: string;
    owner: string;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    isMinimized: boolean;
    isVisible: boolean;
}
/**
 * Window Controller - Manage desktop windows
 */
export declare class WindowController {
    /**
     * Get all open windows
     */
    getWindows(): Promise<WindowInfo[]>;
    /**
     * Get windows on macOS
     */
    private getMacWindows;
    /**
     * Get windows on Windows
     */
    private getWindowsWindows;
    /**
     * Focus a window by name
     */
    focusWindow(windowName: string): Promise<boolean>;
    /**
     * Minimize a window
     */
    minimizeWindow(owner: string): Promise<boolean>;
    /**
     * Maximize/zoom a window
     */
    maximizeWindow(owner: string): Promise<boolean>;
    /**
     * Close a window
     */
    closeWindow(owner: string): Promise<boolean>;
    /**
     * Move window to position
     */
    moveWindow(owner: string, x: number, y: number): Promise<boolean>;
    /**
     * Resize window
     */
    resizeWindow(owner: string, width: number, height: number): Promise<boolean>;
    /**
     * Tile windows left/right
     */
    tileWindow(owner: string, position: 'left' | 'right'): Promise<boolean>;
    /**
     * Get active/focused window
     */
    getActiveWindow(): Promise<string | null>;
    /**
     * Get window bounds
     */
    getWindowBounds(owner: string): Promise<{
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>;
    /**
     * Center window on screen
     */
    centerWindow(owner: string): Promise<boolean>;
    /**
     * Get screen information
     */
    getScreenInfo(): {
        primary: {
            width: number;
            height: number;
        };
        workArea: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        displays: number;
    };
}
//# sourceMappingURL=window-manager.d.ts.map