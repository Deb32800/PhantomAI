import { MouseController } from './mouse';
import { KeyboardController } from './keyboard';
import { ApplicationController } from './applications';
import { ClipboardManager } from './clipboard';
import { WindowController } from './window-manager';

/**
 * Control System - Unified interface for all computer control
 */
export class ControlSystem {
    public mouse: MouseController;
    public keyboard: KeyboardController;
    public applications: ApplicationController;
    public clipboard: ClipboardManager;
    public windows: WindowController;

    private isLocked = false;
    private actionQueue: Array<() => Promise<void>> = [];
    private isProcessing = false;

    constructor() {
        this.mouse = new MouseController();
        this.keyboard = new KeyboardController();
        this.applications = new ApplicationController();
        this.clipboard = new ClipboardManager();
        this.windows = new WindowController();
    }

    /**
     * Lock control to prevent simultaneous actions
     */
    lock(): void {
        this.isLocked = true;
    }

    /**
     * Unlock control
     */
    unlock(): void {
        this.isLocked = false;
        this.processQueue();
    }

    /**
     * Queue an action for execution
     */
    async queueAction(action: () => Promise<void>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.actionQueue.push(async () => {
                try {
                    await action();
                    resolve();
                } catch (error) {
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
    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.isLocked) return;

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
    emergencyStop(): void {
        this.actionQueue = [];
        this.isLocked = true;
        // Release all keys
        this.keyboard.releaseAll();
    }

    /**
     * Get current mouse position
     */
    getMousePosition(): { x: number; y: number } {
        return this.mouse.getPosition();
    }

    /**
     * Execute a complex action sequence
     */
    async executeSequence(actions: Array<{
        type: 'click' | 'type' | 'hotkey' | 'wait' | 'move';
        params: any;
    }>): Promise<void> {
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

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
