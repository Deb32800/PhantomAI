"use strict";
// Note: This uses robotjs or nut.js in production
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardController = void 0;
/**
 * Keyboard Controller - Control keyboard input
 */
class KeyboardController {
    robot = null;
    heldKeys = new Set();
    constructor() {
        this.initializeRobot();
    }
    async initializeRobot() {
        try {
            // In production, use robotjs or nut.js
            // this.robot = require('robotjs');
        }
        catch (error) {
            console.warn('Robot module not available, keyboard control will be simulated');
        }
    }
    /**
     * Type a string of text
     */
    async type(text, options) {
        const delay = options?.delay || 50;
        const humanize = options?.humanize ?? true;
        for (const char of text) {
            await this.typeChar(char);
            let waitTime = delay;
            if (humanize) {
                // Add some randomness to simulate human typing
                waitTime = delay + Math.random() * delay * 0.5;
            }
            await this.sleep(waitTime);
        }
    }
    /**
     * Type a single character
     */
    async typeChar(char) {
        if (this.robot) {
            // Handle special characters that need shift
            const needsShift = /[A-Z!@#$%^&*()_+{}|:"<>?~]/.test(char);
            if (needsShift) {
                this.robot.keyToggle('shift', 'down');
            }
            this.robot.typeString(char);
            if (needsShift) {
                this.robot.keyToggle('shift', 'up');
            }
        }
    }
    /**
     * Type text instantly (paste-like speed)
     */
    async typeInstant(text) {
        if (this.robot) {
            this.robot.typeString(text);
        }
    }
    /**
     * Press a single key
     */
    async press(key) {
        const normalizedKey = this.normalizeKey(key);
        if (this.robot) {
            this.robot.keyTap(normalizedKey);
        }
        await this.sleep(30);
    }
    /**
     * Execute a keyboard shortcut (hotkey)
     */
    async hotkey(keys) {
        if (keys.length === 0)
            return;
        const normalizedKeys = keys.map((k) => this.normalizeKey(k));
        if (this.robot) {
            const modifiers = normalizedKeys.slice(0, -1);
            const mainKey = normalizedKeys[normalizedKeys.length - 1];
            this.robot.keyTap(mainKey, modifiers);
        }
        await this.sleep(50);
    }
    /**
     * Common shortcuts
     */
    async copy() {
        await this.hotkey(['cmd', 'c']);
    }
    async paste() {
        await this.hotkey(['cmd', 'v']);
    }
    async cut() {
        await this.hotkey(['cmd', 'x']);
    }
    async undo() {
        await this.hotkey(['cmd', 'z']);
    }
    async redo() {
        await this.hotkey(['cmd', 'shift', 'z']);
    }
    async selectAll() {
        await this.hotkey(['cmd', 'a']);
    }
    async save() {
        await this.hotkey(['cmd', 's']);
    }
    async find() {
        await this.hotkey(['cmd', 'f']);
    }
    async newTab() {
        await this.hotkey(['cmd', 't']);
    }
    async closeTab() {
        await this.hotkey(['cmd', 'w']);
    }
    async switchTab(direction = 'next') {
        if (direction === 'next') {
            await this.hotkey(['cmd', 'shift', ']']);
        }
        else {
            await this.hotkey(['cmd', 'shift', '[']);
        }
    }
    /**
     * Hold a key down
     */
    async hold(key) {
        const normalizedKey = this.normalizeKey(key);
        if (this.robot) {
            this.robot.keyToggle(normalizedKey, 'down');
        }
        this.heldKeys.add(normalizedKey);
    }
    /**
     * Release a held key
     */
    async release(key) {
        const normalizedKey = this.normalizeKey(key);
        if (this.robot) {
            this.robot.keyToggle(normalizedKey, 'up');
        }
        this.heldKeys.delete(normalizedKey);
    }
    /**
     * Release all held keys
     */
    releaseAll() {
        for (const key of this.heldKeys) {
            if (this.robot) {
                this.robot.keyToggle(key, 'up');
            }
        }
        this.heldKeys.clear();
    }
    /**
     * Input text into a field (click, clear, type)
     */
    async inputText(text) {
        // Select all existing text
        await this.selectAll();
        await this.sleep(50);
        // Type new text (replaces selection)
        await this.type(text);
    }
    /**
     * Enter text and press enter
     */
    async submitText(text) {
        await this.type(text);
        await this.sleep(100);
        await this.press('enter');
    }
    /**
     * Normalize key names for robotjs
     */
    normalizeKey(key) {
        const keyMap = {
            'cmd': 'command',
            'ctrl': 'control',
            'opt': 'alt',
            'option': 'alt',
            'esc': 'escape',
            'return': 'enter',
            'del': 'delete',
            'ins': 'insert',
        };
        return keyMap[key.toLowerCase()] || key.toLowerCase();
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.KeyboardController = KeyboardController;
//# sourceMappingURL=keyboard.js.map