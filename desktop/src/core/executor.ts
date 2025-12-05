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
export class ActionExecutor {
    private control: ControlSystem;
    private safety: SafetyManager;
    private defaultTimeout = 30000;

    constructor(control: ControlSystem, safety: SafetyManager) {
        this.control = control;
        this.safety = safety;
    }

    async execute(action: ParsedAction, context?: Partial<ExecutionContext>): Promise<ActionResult> {
        const startTime = Date.now();
        const timeout = context?.timeout || this.defaultTimeout;
        const dryRun = context?.dryRun || false;

        try {
            const safetyCheck = await this.safety.validateAction(action);
            if (!safetyCheck.allowed) {
                return { success: false, error: `Blocked: ${safetyCheck.reason}`, duration: Date.now() - startTime };
            }

            if (dryRun) {
                return { success: true, data: { dryRun: true, action }, duration: Date.now() - startTime };
            }

            switch (action.type) {
                case 'click':
                    if (action.coordinates) {
                        await this.control.mouse.move(action.coordinates.x, action.coordinates.y);
                        await this.control.mouse.click('left');
                    }
                    break;
                case 'double-click':
                    if (action.coordinates) {
                        await this.control.mouse.move(action.coordinates.x, action.coordinates.y);
                        await this.control.mouse.doubleClick();
                    }
                    break;
                case 'right-click':
                    if (action.coordinates) {
                        await this.control.mouse.move(action.coordinates.x, action.coordinates.y);
                        await this.control.mouse.click('right');
                    }
                    break;
                case 'type':
                    if (action.params?.text) {
                        await this.control.keyboard.type(action.params.text, { delay: 50 });
                    }
                    break;
                case 'press':
                    if (action.params?.key) {
                        await this.control.keyboard.press(action.params.key);
                    }
                    break;
                case 'hotkey':
                    if (action.params?.keys) {
                        await this.control.keyboard.hotkey(action.params.keys);
                    }
                    break;
                case 'scroll':
                    const dir = action.params?.direction || 'down';
                    const amt = action.params?.amount || 3;
                    await this.control.mouse.scroll(dir, amt);
                    break;
                case 'wait':
                    await this.sleep(action.params?.duration || 1000);
                    break;
                case 'navigate':
                    const target = action.params?.url || action.params?.app;
                    if (target?.startsWith('http')) {
                        await this.control.applications.openUrl(target);
                    } else if (target) {
                        await this.control.applications.launch(target);
                    }
                    break;
            }

            return { success: true, duration: Date.now() - startTime };
        } catch (error: any) {
            return { success: false, error: error.message, duration: Date.now() - startTime };
        }
    }

    async undo(): Promise<ActionResult> {
        await this.control.keyboard.hotkey(['cmd', 'z']);
        return { success: true, duration: 0 };
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Alias for compatibility
export { ActionExecutor as Executor };
