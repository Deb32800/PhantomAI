"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlSystem = void 0;
const mouse_1 = require("./mouse");
const keyboard_1 = require("./keyboard");
const applications_1 = require("./applications");
const clipboard_1 = require("./clipboard");
const window_manager_1 = require("./window-manager");
/**
 * Control System - Unified interface for all computer control
 */
class ControlSystem {
    mouse;
    keyboard;
    applications;
    clipboard;
    windows;
    isLocked = false;
    actionQueue = [];
    isProcessing = false;
    constructor() {
        this.mouse = new mouse_1.MouseController();
        this.keyboard = new keyboard_1.KeyboardController();
        this.applications = new applications_1.ApplicationController();
        this.clipboard = new clipboard_1.ClipboardManager();
        this.windows = new window_manager_1.WindowController();
    }
    /**
     * Lock control to prevent simultaneous actions
     */
    lock() {
        this.isLocked = true;
    }
    /**
     * Unlock control
     */
    unlock() {
        this.isLocked = false;
        this.processQueue();
    }
    /**
     * Queue an action for execution
     */
    async queueAction(action) {
        return new Promise((resolve, reject) => {
            this.actionQueue.push(async () => {
                try {
                    await action();
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            });
            if (!this.isProcessing && !this.isLocked) {
                this.processQueue();
            }
        });
    }
    /**
     * Process queued actions
     */
    async processQueue() {
        if (this.isProcessing || this.isLocked)
            return;
        this.isProcessing = true;
        while (this.actionQueue.length > 0 && !this.isLocked) {
            const action = this.actionQueue.shift();
            if (action) {
                await action();
            }
        }
        this.isProcessing = false;
    }
    /**
     * Emergency stop - clear queue and stop current action
     */
    emergencyStop() {
        this.actionQueue = [];
        this.isLocked = true;
        // Release all keys
        this.keyboard.releaseAll();
    }
    /**
     * Get current mouse position
     */
    getMousePosition() {
        return this.mouse.getPosition();
    }
    /**
     * Execute a complex action sequence
     */
    async executeSequence(actions) {
        for (const action of actions) {
            switch (action.type) {
                case 'click':
                    await this.mouse.move(action.params.x, action.params.y);
                    await this.mouse.click(action.params.button || 'left');
                    break;
                case 'type':
                    await this.keyboard.type(action.params.text, action.params.options);
                    break;
                case 'hotkey':
                    await this.keyboard.hotkey(action.params.keys);
                    break;
                case 'wait':
                    await this.sleep(action.params.duration);
                    break;
                case 'move':
                    await this.mouse.move(action.params.x, action.params.y, action.params.options);
                    break;
            }
        }
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.ControlSystem = ControlSystem;
//# sourceMappingURL=control-system.js.map