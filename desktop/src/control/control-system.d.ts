import { MouseController } from './mouse';
import { KeyboardController } from './keyboard';
import { ApplicationController } from './applications';
import { ClipboardManager } from './clipboard';
import { WindowController } from './window-manager';
/**
 * Control System - Unified interface for all computer control
 */
export declare class ControlSystem {
    mouse: MouseController;
    keyboard: KeyboardController;
    applications: ApplicationController;
    clipboard: ClipboardManager;
    windows: WindowController;
    private isLocked;
    private actionQueue;
    private isProcessing;
    constructor();
    /**
     * Lock control to prevent simultaneous actions
     */
    lock(): void;
    /**
     * Unlock control
     */
    unlock(): void;
    /**
     * Queue an action for execution
     */
    queueAction(action: () => Promise<void>): Promise<void>;
    /**
     * Process queued actions
     */
    private processQueue;
    /**
     * Emergency stop - clear queue and stop current action
     */
    emergencyStop(): void;
    /**
     * Get current mouse position
     */
    getMousePosition(): {
        x: number;
        y: number;
    };
    /**
     * Execute a complex action sequence
     */
    executeSequence(actions: Array<{
        type: 'click' | 'type' | 'hotkey' | 'wait' | 'move';
        params: any;
    }>): Promise<void>;
    private sleep;
}
//# sourceMappingURL=control-system.d.ts.map