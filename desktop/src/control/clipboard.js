"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClipboardManager = void 0;
const electron_1 = require("electron");
/**
 * Clipboard Manager - Read and write to system clipboard
 */
class ClipboardManager {
    history = [];
    maxHistory = 50;
    watchInterval = null;
    lastContent = '';
    /**
     * Read text from clipboard
     */
    readText() {
        return electron_1.clipboard.readText();
    }
    /**
     * Write text to clipboard
     */
    writeText(text) {
        electron_1.clipboard.writeText(text);
        this.addToHistory({ type: 'text', content: text, timestamp: Date.now() });
    }
    /**
     * Read HTML from clipboard
     */
    readHtml() {
        return electron_1.clipboard.readHTML();
    }
    /**
     * Write HTML to clipboard
     */
    writeHtml(html) {
        electron_1.clipboard.writeHTML(html);
        this.addToHistory({ type: 'html', content: html, timestamp: Date.now() });
    }
    /**
     * Read RTF from clipboard
     */
    readRtf() {
        return electron_1.clipboard.readRTF();
    }
    /**
     * Write RTF to clipboard
     */
    writeRtf(rtf) {
        electron_1.clipboard.writeRTF(rtf);
        this.addToHistory({ type: 'rtf', content: rtf, timestamp: Date.now() });
    }
    /**
     * Read image from clipboard as base64
     */
    readImage() {
        const image = electron_1.clipboard.readImage();
        if (image.isEmpty())
            return null;
        return image.toDataURL();
    }
    /**
     * Write image to clipboard from base64
     */
    writeImage(base64) {
        const { nativeImage } = require('electron');
        const image = nativeImage.createFromDataURL(base64);
        electron_1.clipboard.writeImage(image);
        this.addToHistory({ type: 'image', content: base64, timestamp: Date.now() });
    }
    /**
     * Check if clipboard has text
     */
    hasText() {
        return electron_1.clipboard.readText().length > 0;
    }
    /**
     * Check if clipboard has image
     */
    hasImage() {
        return !electron_1.clipboard.readImage().isEmpty();
    }
    /**
     * Clear clipboard
     */
    clear() {
        electron_1.clipboard.clear();
    }
    /**
     * Get available formats in clipboard
     */
    getFormats() {
        return electron_1.clipboard.availableFormats();
    }
    /**
     * Get clipboard history
     */
    getHistory() {
        return [...this.history];
    }
    /**
     * Clear history
     */
    clearHistory() {
        this.history = [];
    }
    /**
     * Get item from history by index
     */
    getFromHistory(index) {
        return this.history[index] || null;
    }
    /**
     * Restore item from history to clipboard
     */
    restoreFromHistory(index) {
        const item = this.history[index];
        if (!item)
            return false;
        switch (item.type) {
            case 'text':
                electron_1.clipboard.writeText(item.content);
                break;
            case 'html':
                electron_1.clipboard.writeHTML(item.content);
                break;
            case 'rtf':
                electron_1.clipboard.writeRTF(item.content);
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
    startWatch(callback, intervalMs = 500) {
        if (this.watchInterval) {
            this.stopWatch();
        }
        this.lastContent = electron_1.clipboard.readText();
        this.watchInterval = setInterval(() => {
            const currentText = electron_1.clipboard.readText();
            if (currentText !== this.lastContent && currentText.length > 0) {
                this.lastContent = currentText;
                const item = {
                    type: 'text',
                    content: currentText,
                    timestamp: Date.now(),
                };
                this.addToHistory(item);
                callback(item);
            }
            // Also check for images
            if (!electron_1.clipboard.readImage().isEmpty()) {
                const imageData = this.readImage();
                if (imageData && imageData !== this.history[0]?.content) {
                    const item = {
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
    stopWatch() {
        if (this.watchInterval) {
            clearInterval(this.watchInterval);
            this.watchInterval = null;
        }
    }
    /**
     * Add item to history
     */
    addToHistory(item) {
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
    searchHistory(query) {
        const lowerQuery = query.toLowerCase();
        return this.history.filter((item) => item.type === 'text' && item.content.toLowerCase().includes(lowerQuery));
    }
}
exports.ClipboardManager = ClipboardManager;
//# sourceMappingURL=clipboard.js.map