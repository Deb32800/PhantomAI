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
exports.VisionSystem = void 0;
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Vision System - Screen capture and analysis
 */
class VisionSystem {
    captureQuality = 80;
    cacheDir;
    constructor() {
        this.cacheDir = path.join(process.cwd(), '.cache', 'screenshots');
        this.ensureCacheDir();
    }
    /**
     * Capture the entire primary screen
     */
    async captureScreen(options) {
        const sources = await electron_1.desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: this.getScreenSize(),
        });
        if (sources.length === 0) {
            throw new Error('No screens available for capture');
        }
        // Get the requested display or primary display
        const displayId = options?.displayId ?? electron_1.screen.getPrimaryDisplay().id;
        const source = sources.find((s) => s.display_id === displayId.toString()) || sources[0];
        // Get the thumbnail as base64
        const image = source.thumbnail;
        const format = options?.format || 'png';
        const quality = options?.quality || this.captureQuality;
        let base64;
        if (format === 'jpeg') {
            base64 = image.toJPEG(quality).toString('base64');
        }
        else {
            base64 = image.toPNG().toString('base64');
        }
        return `data:image/${format};base64,${base64}`;
    }
    /**
     * Capture a specific region of the screen
     */
    async captureRegion(region) {
        // Capture full screen first
        const sources = await electron_1.desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: this.getScreenSize(),
        });
        if (sources.length === 0) {
            throw new Error('No screens available for capture');
        }
        const image = sources[0].thumbnail;
        // Crop to region
        const cropped = image.crop({
            x: Math.round(region.x),
            y: Math.round(region.y),
            width: Math.round(region.width),
            height: Math.round(region.height),
        });
        return `data:image/png;base64,${cropped.toPNG().toString('base64')}`;
    }
    /**
     * Capture a specific window
     */
    async captureWindow(windowName) {
        const sources = await electron_1.desktopCapturer.getSources({
            types: ['window'],
            thumbnailSize: { width: 1920, height: 1080 },
        });
        const source = sources.find((s) => s.name.toLowerCase().includes(windowName.toLowerCase()));
        if (!source) {
            throw new Error(`Window "${windowName}" not found`);
        }
        const image = source.thumbnail;
        return `data:image/png;base64,${image.toPNG().toString('base64')}`;
    }
    /**
     * Get list of all available screens
     */
    getScreens() {
        return electron_1.screen.getAllDisplays().map((display) => ({
            id: display.id,
            name: `Display ${display.id}`,
            bounds: display.bounds,
            scaleFactor: display.scaleFactor,
        }));
    }
    /**
     * Get list of all windows
     */
    async getWindows() {
        const sources = await electron_1.desktopCapturer.getSources({
            types: ['window'],
            thumbnailSize: { width: 128, height: 128 },
        });
        return sources.map((source) => ({
            id: source.id,
            name: source.name,
        }));
    }
    /**
     * Save screenshot to file
     */
    async saveScreenshot(filename) {
        const screenshot = await this.captureScreen();
        const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, '');
        const fileName = filename || `screenshot-${Date.now()}.png`;
        const filePath = path.join(this.cacheDir, fileName);
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        return filePath;
    }
    /**
     * Compare two screenshots for differences
     */
    async compareScreenshots(before, after) {
        // Simple pixel comparison
        // In production, use a proper image diff library
        // Extract base64 data
        const beforeData = before.replace(/^data:image\/\w+;base64,/, '');
        const afterData = after.replace(/^data:image\/\w+;base64,/, '');
        // Simple hash comparison
        const beforeHash = this.simpleHash(beforeData);
        const afterHash = this.simpleHash(afterData);
        const different = beforeHash !== afterHash;
        // Calculate rough similarity based on hash difference
        const similarity = this.calculateHashSimilarity(beforeHash, afterHash);
        return {
            different,
            similarityScore: similarity,
        };
    }
    /**
     * Get mouse cursor position
     */
    getCursorPosition() {
        return electron_1.screen.getCursorScreenPoint();
    }
    /**
     * Check if a point is within screen bounds
     */
    isPointOnScreen(x, y) {
        const displays = electron_1.screen.getAllDisplays();
        return displays.some((display) => {
            const { bounds } = display;
            return (x >= bounds.x &&
                x < bounds.x + bounds.width &&
                y >= bounds.y &&
                y < bounds.y + bounds.height);
        });
    }
    /**
     * Get screen containing a point
     */
    getScreenAtPoint(x, y) {
        const display = electron_1.screen.getDisplayNearestPoint({ x, y });
        if (!display)
            return null;
        return {
            id: display.id,
            name: `Display ${display.id}`,
            bounds: display.bounds,
            scaleFactor: display.scaleFactor,
        };
    }
    // Private helper methods
    getScreenSize() {
        const primaryDisplay = electron_1.screen.getPrimaryDisplay();
        return {
            width: primaryDisplay.size.width * primaryDisplay.scaleFactor,
            height: primaryDisplay.size.height * primaryDisplay.scaleFactor,
        };
    }
    ensureCacheDir() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
    calculateHashSimilarity(hash1, hash2) {
        if (hash1 === hash2)
            return 1;
        // Simple character comparison for similarity
        let matches = 0;
        const maxLen = Math.max(hash1.length, hash2.length);
        for (let i = 0; i < Math.min(hash1.length, hash2.length); i++) {
            if (hash1[i] === hash2[i])
                matches++;
        }
        return matches / maxLen;
    }
    /**
     * Clear screenshot cache
     */
    clearCache() {
        if (fs.existsSync(this.cacheDir)) {
            const files = fs.readdirSync(this.cacheDir);
            files.forEach((file) => {
                fs.unlinkSync(path.join(this.cacheDir, file));
            });
        }
    }
}
exports.VisionSystem = VisionSystem;
//# sourceMappingURL=capture.js.map