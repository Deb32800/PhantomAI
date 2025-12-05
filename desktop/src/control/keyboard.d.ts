export interface TypeOptions {
    delay?: number;
    humanize?: boolean;
}
export type ModifierKey = 'command' | 'cmd' | 'control' | 'ctrl' | 'shift' | 'alt' | 'option';
export type SpecialKey = 'enter' | 'return' | 'tab' | 'escape' | 'esc' | 'backspace' | 'delete' | 'up' | 'down' | 'left' | 'right' | 'home' | 'end' | 'pageup' | 'pagedown' | 'space' | 'capslock' | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8' | 'f9' | 'f10' | 'f11' | 'f12';
/**
 * Keyboard Controller - Control keyboard input
 */
export declare class KeyboardController {
    private robot;
    private heldKeys;
    constructor();
    private initializeRobot;
    /**
     * Type a string of text
     */
    type(text: string, options?: TypeOptions): Promise<void>;
    /**
     * Type a single character
     */
    private typeChar;
    /**
     * Type text instantly (paste-like speed)
     */
    typeInstant(text: string): Promise<void>;
    /**
     * Press a single key
     */
    press(key: string | SpecialKey): Promise<void>;
    /**
     * Execute a keyboard shortcut (hotkey)
     */
    hotkey(keys: (string | ModifierKey | SpecialKey)[]): Promise<void>;
    /**
     * Common shortcuts
     */
    copy(): Promise<void>;
    paste(): Promise<void>;
    cut(): Promise<void>;
    undo(): Promise<void>;
    redo(): Promise<void>;
    selectAll(): Promise<void>;
    save(): Promise<void>;
    find(): Promise<void>;
    newTab(): Promise<void>;
    closeTab(): Promise<void>;
    switchTab(direction?: 'next' | 'prev'): Promise<void>;
    /**
     * Hold a key down
     */
    hold(key: string | ModifierKey): Promise<void>;
    /**
     * Release a held key
     */
    release(key: string | ModifierKey): Promise<void>;
    /**
     * Release all held keys
     */
    releaseAll(): void;
    /**
     * Input text into a field (click, clear, type)
     */
    inputText(text: string): Promise<void>;
    /**
     * Enter text and press enter
     */
    submitText(text: string): Promise<void>;
    /**
     * Normalize key names for robotjs
     */
    private normalizeKey;
    private sleep;
}
//# sourceMappingURL=keyboard.d.ts.map