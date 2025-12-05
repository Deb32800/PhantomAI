import { ControlSystem } from '../control/control-system';
import { SafetyManager } from '../safety/safety-manager';
import { ParsedAction } from './action-parser';
export interface ActionResult {
    success: boolean;
    error?: string;
    data?: any;
    duration: number;
    screenshot?: string;
}
export interface ExecutionContext {
    timeout: number;
    retryCount: number;
    dryRun: boolean;
}
/**
 * Action Executor - Translates parsed actions into actual computer control
 */
export declare class ActionExecutor {
    private control;
    private safety;
    private defaultTimeout;
    constructor(control: ControlSystem, safety: SafetyManager);
    /**
     * Execute a parsed action
     */
    execute(action: ParsedAction, context?: Partial<ExecutionContext>): Promise<ActionResult>;
    /**
     * Execute a click action
     */
    private executeClick;
    /**
     * Execute a double-click action
     */
    private executeDoubleClick;
    /**
     * Execute a right-click action
     */
    private executeRightClick;
    /**
     * Execute a typing action
     */
    private executeType;
    /**
     * Execute a key press action
     */
    private executeKeyPress;
    /**
     * Execute a hotkey combination
     */
    private executeHotkey;
    /**
     * Execute a scroll action
     */
    private executeScroll;
    /**
     * Execute a wait action
     */
    private executeWait;
    /**
     * Execute a navigation action (open URL/app)
     */
    private executeNavigate;
    /**
     * Execute a drag action
     */
    private executeDrag;
    /**
     * Execute a hover action
     */
    private executeHover;
    /**
     * Execute multiple actions in sequence
     */
    executeSequence(actions: ParsedAction[]): Promise<ActionResult[]>;
    /**
     * Execute actions in parallel (for independent actions)
     */
    executeParallel(actions: ParsedAction[]): Promise<ActionResult[]>;
    /**
     * Undo the last action if possible
     */
    undo(): Promise<ActionResult>;
    private sleep;
}
//# sourceMappingURL=executor.d.ts.map