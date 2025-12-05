// Note: This uses robotjs or nut.js in production

export interface TypeOptions {
    delay?: number; // Delay between keystrokes
    humanize?: boolean; // Randomize typing speed
}

export type ModifierKey = 'command' | 'cmd' | 'control' | 'ctrl' | 'shift' | 'alt' | 'option';
export type SpecialKey =
    | 'enter' | 'return' | 'tab' | 'escape' | 'esc' | 'backspace' | 'delete'
    | 'up' | 'down' | 'left' | 'right'
    | 'home' | 'end' | 'pageup' | 'pagedown'
    | 'space' | 'capslock'
    | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8' | 'f9' | 'f10' | 'f11' | 'f12';

/**
 * Keyboard Controller - Control keyboard input
 */
export class KeyboardController {
    private robot: any = null;
    private heldKeys: Set<string> = new Set();

    constructor() {
        this.initializeRobot();
    }

    private async initializeRobot(): Promise<void> {
        try {
            // In production, use robotjs or nut.js
            // this.robot = require('robotjs');
        } catch (error) {
            console.warn('Robot module not available, keyboard control will be simulated');
        }
    }

    /**
     * Type a string of text
     */
    async type(text: string, options?: TypeOptions): Promise<void> {
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
    private async typeChar(char: string): Promise<void> {
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
    async typeInstant(text: string): Promise<void> {
        if (this.robot) {
            this.robot.typeString(text);
        }
    }

    /**
     * Press a single key
     */
    async press(key: string | SpecialKey): Promise<void> {
        const normalizedKey = this.normalizeKey(key);

        if (this.robot) {
            this.robot.keyTap(normalizedKey);
        }

        await this.sleep(30);
    }

    /**
     * Execute a keyboard shortcut (hotkey)
     */
    async hotkey(keys: (string | ModifierKey | SpecialKey)[]): Promise<void> {
        if (keys.length === 0) return;

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
    async copy(): Promise<void> {
        await this.hotkey(['cmd', 'c']);
    }

    async paste(): Promise<void> {
        await this.hotkey(['cmd', 'v']);
    }

    async cut(): Promise<void> {
        await this.hotkey(['cmd', 'x']);
    }

    async undo(): Promise<void> {
        await this.hotkey(['cmd', 'z']);
    }

    async redo(): Promise<void> {
        await this.hotkey(['cmd', 'shift', 'z']);
    }

    async selectAll(): Promise<void> {
        await this.hotkey(['cmd', 'a']);
    }

    async save(): Promise<void> {
        await this.hotkey(['cmd', 's']);
    }

    async find(): Promise<void> {
        await this.hotkey(['cmd', 'f']);
    }

    async newTab(): Promise<void> {
        await this.hotkey(['cmd', 't']);
    }

    async closeTab(): Promise<void> {
        await this.hotkey(['cmd', 'w']);
    }

    async switchTab(direction: 'next' | 'prev' = 'next'): Promise<void> {
        if (direction === 'next') {
            await this.hotkey(['cmd', 'shift', ']']);
        } else {
            await this.hotkey(['cmd', 'shift', '[']);
        }
    }

    /**
     * Hold a key down
     */
    async hold(key: string | ModifierKey): Promise<void> {
        const normalizedKey = this.normalizeKey(key);

        if (this.robot) {
            this.robot.keyToggle(normalizedKey, 'down');
        }

        this.heldKeys.add(normalizedKey);
    }

    /**
     * Release a held key
     */
    async release(key: string | ModifierKey): Promise<void> {
        const normalizedKey = this.normalizeKey(key);

        if (this.robot) {
            this.robot.keyToggle(normalizedKey, 'up');
        }

        this.heldKeys.delete(normalizedKey);
    }

    /**
     * Release all held keys
     */
    releaseAll(): void {
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
    async inputText(text: string): Promise<void> {
        // Select all existing text
        await this.selectAll();
        await this.sleep(50);
        // Type new text (replaces selection)
        await this.type(text);
    }

    /**
     * Enter text and press enter
     */
    async submitText(text: string): Promise<void> {
        await this.type(text);
        await this.sleep(100);
        await this.press('enter');
    }

    /**
     * Normalize key names for robotjs
     */
    private normalizeKey(key: string): string {
        const keyMap: Record<string, string> = {
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

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
