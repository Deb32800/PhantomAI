export interface ClipboardItem {
    type: 'text' | 'html' | 'image' | 'rtf';
    content: string;
    timestamp: number;
}
/**
 * Clipboard Manager - Read and write to system clipboard
 */
export declare class ClipboardManager {
    private history;
    private maxHistory;
    private watchInterval;
    private lastContent;
    /**
     * Read text from clipboard
     */
    readText(): string;
    /**
     * Write text to clipboard
     */
    writeText(text: string): void;
    /**
     * Read HTML from clipboard
     */
    readHtml(): string;
    /**
     * Write HTML to clipboard
     */
    writeHtml(html: string): void;
    /**
     * Read RTF from clipboard
     */
    readRtf(): string;
    /**
     * Write RTF to clipboard
     */
    writeRtf(rtf: string): void;
    /**
     * Read image from clipboard as base64
     */
    readImage(): string | null;
    /**
     * Write image to clipboard from base64
     */
    writeImage(base64: string): void;
    /**
     * Check if clipboard has text
     */
    hasText(): boolean;
    /**
     * Check if clipboard has image
     */
    hasImage(): boolean;
    /**
     * Clear clipboard
     */
    clear(): void;
    /**
     * Get available formats in clipboard
     */
    getFormats(): string[];
    /**
     * Get clipboard history
     */
    getHistory(): ClipboardItem[];
    /**
     * Clear history
     */
    clearHistory(): void;
    /**
     * Get item from history by index
     */
    getFromHistory(index: number): ClipboardItem | null;
    /**
     * Restore item from history to clipboard
     */
    restoreFromHistory(index: number): boolean;
    /**
     * Start watching clipboard for changes
     */
    startWatch(callback: (item: ClipboardItem) => void, intervalMs?: number): void;
    /**
     * Stop watching clipboard
     */
    stopWatch(): void;
    /**
     * Add item to history
     */
    private addToHistory;
    /**
     * Search history
     */
    searchHistory(query: string): ClipboardItem[];
}
//# sourceMappingURL=clipboard.d.ts.map