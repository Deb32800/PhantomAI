import { clipboard } from 'electron';

export interface ClipboardItem {
    type: 'text' | 'html' | 'image' | 'rtf';
    content: string;
    timestamp: number;
}

/**
 * Clipboard Manager - Read and write to system clipboard
 */
export class ClipboardManager {
    private history: ClipboardItem[] = [];
    private maxHistory = 50;
    private watchInterval: NodeJS.Timeout | null = null;
    private lastContent = '';

    /**
     * Read text from clipboard
     */
    readText(): string {
        return clipboard.readText();
    }

    /**
     * Write text to clipboard
     */
    writeText(text: string): void {
        clipboard.writeText(text);
        this.addToHistory({ type: 'text', content: text, timestamp: Date.now() });
    }

    /**
     * Read HTML from clipboard
     */
    readHtml(): string {
        return clipboard.readHTML();
    }

    /**
     * Write HTML to clipboard
     */
    writeHtml(html: string): void {
        clipboard.writeHTML(html);
        this.addToHistory({ type: 'html', content: html, timestamp: Date.now() });
    }

    /**
     * Read RTF from clipboard
     */
    readRtf(): string {
        return clipboard.readRTF();
    }

    /**
     * Write RTF to clipboard
     */
    writeRtf(rtf: string): void {
        clipboard.writeRTF(rtf);
        this.addToHistory({ type: 'rtf', content: rtf, timestamp: Date.now() });
    }

    /**
     * Read image from clipboard as base64
     */
    readImage(): string | null {
        const image = clipboard.readImage();
        if (image.isEmpty()) return null;
        return image.toDataURL();
    }

    /**
     * Write image to clipboard from base64
     */
    writeImage(base64: string): void {
        const { nativeImage } = require('electron');
        const image = nativeImage.createFromDataURL(base64);
        clipboard.writeImage(image);
        this.addToHistory({ type: 'image', content: base64, timestamp: Date.now() });
    }

    /**
     * Check if clipboard has text
     */
    hasText(): boolean {
        return clipboard.readText().length > 0;
    }

    /**
     * Check if clipboard has image
     */
    hasImage(): boolean {
        return !clipboard.readImage().isEmpty();
    }

    /**
     * Clear clipboard
     */
    clear(): void {
        clipboard.clear();
    }

    /**
     * Get available formats in clipboard
     */
    getFormats(): string[] {
        return clipboard.availableFormats();
    }

    /**
     * Get clipboard history
     */
    getHistory(): ClipboardItem[] {
        return [...this.history];
    }

    /**
     * Clear history
     */
    clearHistory(): void {
        this.history = [];
    }

    /**
     * Get item from history by index
     */
    getFromHistory(index: number): ClipboardItem | null {
        return this.history[index] || null;
    }

    /**
     * Restore item from history to clipboard
     */
    restoreFromHistory(index: number): boolean {
        const item = this.history[index];
        if (!item) return false;

        switch (item.type) {
            case 'text':
                clipboard.writeText(item.content);
                break;
            case 'html':
                clipboard.writeHTML(item.content);
                break;
            case 'rtf':
                clipboard.writeRTF(item.content);
                break;
            case 'image':
                this.writeImage(item.content);
                break;
        }
        return true;
    }

    /**
     * Start watching clipboard for changes
     */
    startWatch(callback: (item: ClipboardItem) => void, intervalMs: number = 500): void {
        if (this.watchInterval) {
            this.stopWatch();
        }

        this.lastContent = clipboard.readText();

        this.watchInterval = setInterval(() => {
            const currentText = clipboard.readText();

            if (currentText !== this.lastContent && currentText.length > 0) {
                this.lastContent = currentText;
                const item: ClipboardItem = {
                    type: 'text',
                    content: currentText,
                    timestamp: Date.now(),
                };
                this.addToHistory(item);
                callback(item);
            }

            // Also check for images
            if (!clipboard.readImage().isEmpty()) {
                const imageData = this.readImage();
                if (imageData && imageData !== this.history[0]?.content) {
                    const item: ClipboardItem = {
                        type: 'image',
                        content: imageData,
                        timestamp: Date.now(),
                    };
                    this.addToHistory(item);
                    callback(item);
                }
            }
        }, intervalMs);
    }

    /**
     * Stop watching clipboard
     */
    stopWatch(): void {
        if (this.watchInterval) {
            clearInterval(this.watchInterval);
            this.watchInterval = null;
        }
    }

    /**
     * Add item to history
     */
    private addToHistory(item: ClipboardItem): void {
        // Don't add duplicates
        if (this.history[0]?.content === item.content) {
            return;
        }

        this.history.unshift(item);

        // Trim history
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(0, this.maxHistory);
        }
    }

    /**
     * Search history
     */
    searchHistory(query: string): ClipboardItem[] {
        const lowerQuery = query.toLowerCase();
        return this.history.filter((item) =>
            item.type === 'text' && item.content.toLowerCase().includes(lowerQuery)
        );
    }
}
