export interface CaptureOptions {
    displayId?: number;
    quality?: number;
    format?: 'png' | 'jpeg';
}
export interface ScreenInfo {
    id: number;
    name: string;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    scaleFactor: number;
}
/**
 * Vision System - Screen capture and analysis
 */
export declare class VisionSystem {
    private captureQuality;
    private cacheDir;
    constructor();
    /**
     * Capture the entire primary screen
     */
    captureScreen(options?: CaptureOptions): Promise<string>;
    /**
     * Capture a specific region of the screen
     */
    captureRegion(region: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): Promise<string>;
    /**
     * Capture a specific window
     */
    captureWindow(windowName: string): Promise<string>;
    /**
     * Get list of all available screens
     */
    getScreens(): ScreenInfo[];
    /**
     * Get list of all windows
     */
    getWindows(): Promise<Array<{
        id: string;
        name: string;
    }>>;
    /**
     * Save screenshot to file
     */
    saveScreenshot(filename?: string): Promise<string>;
    /**
     * Compare two screenshots for differences
     */
    compareScreenshots(before: string, after: string): Promise<{
        different: boolean;
        similarityScore: number;
    }>;
    /**
     * Get mouse cursor position
     */
    getCursorPosition(): {
        x: number;
        y: number;
    };
    /**
     * Check if a point is within screen bounds
     */
    isPointOnScreen(x: number, y: number): boolean;
    /**
     * Get screen containing a point
     */
    getScreenAtPoint(x: number, y: number): ScreenInfo | null;
    private getScreenSize;
    private ensureCacheDir;
    private simpleHash;
    private calculateHashSimilarity;
    /**
     * Clear screenshot cache
     */
    clearCache(): void;
}
//# sourceMappingURL=capture.d.ts.map