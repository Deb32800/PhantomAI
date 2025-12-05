"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionExecutor = void 0;
/**
 * Action Executor - Translates parsed actions into actual computer control
 */
class ActionExecutor {
    control;
    safety;
    defaultTimeout = 30000; // 30 seconds
    constructor(control, safety) {
        this.control = control;
        this.safety = safety;
    }
    /**
     * Execute a parsed action
     */
    async execute(action, context) {
        const startTime = Date.now();
        const ctx = {
            timeout: context?.timeout || this.defaultTimeout,
            retryCount: context?.retryCount || 0,
            dryRun: context?.dryRun || false,
        };
        try {
            // Safety check before execution
            const safetyCheck = await this.safety.validateAction(action);
            if (!safetyCheck.allowed) {
                return {
                    success: false,
                    error: `Action blocked: ${safetyCheck.reason}`,
                    duration: Date.now() - startTime,
                };
            }
            // Dry run mode - just log what would happen
            if (ctx.dryRun) {
                return {
                    success: true,
                    data: { dryRun: true, action },
                    duration: Date.now() - startTime,
                };
            }
            // Execute based on action type
            let result;
            switch (action.type) {
                case 'click':
                    result = await this.executeClick(action);
                    break;
                case 'double-click':
                    result = await this.executeDoubleClick(action);
                    break;
                case 'right-click':
                    result = await this.executeRightClick(action);
                    break;
                case 'type':
                    result = await this.executeType(action);
                    break;
                case 'press':
                    result = await this.executeKeyPress(action);
                    break;
                case 'hotkey':
                    result = await this.executeHotkey(action);
                    break;
                case 'scroll':
                    result = await this.executeScroll(action);
                    break;
                case 'wait':
                    result = await this.executeWait(action);
                    break;
                case 'navigate':
                    result = await this.executeNavigate(action);
                    break;
                case 'drag':
                    result = await this.executeDrag(action);
                    break;
                case 'hover':
                    result = await this.executeHover(action);
                    break;
                default:
                    result = {
                        success: false,
                        error: `Unknown action type: ${action.type}`,
                        duration: Date.now() - startTime,
                    };
            }
            return {
                ...result,
                duration: Date.now() - startTime,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                duration: Date.now() - startTime,
            };
        }
    }
    /**
     * Execute a click action
     */
    async executeClick(action) {
        if (!action.coordinates) {
            return { success: false, error: 'No coordinates provided for click', duration: 0 };
        }
        await this.control.mouse.move(action.coordinates.x, action.coordinates.y);
        await this.sleep(100); // Small delay for visual feedback
        await this.control.mouse.click('left');
        return { success: true, duration: 0 };
    }
    /**
     * Execute a double-click action
     */
    async executeDoubleClick(action) {
        if (!action.coordinates) {
            return { success: false, error: 'No coordinates provided', duration: 0 };
        }
        await this.control.mouse.move(action.coordinates.x, action.coordinates.y);
        await this.sleep(50);
        await this.control.mouse.doubleClick();
        return { success: true, duration: 0 };
    }
    /**
     * Execute a right-click action
     */
    async executeRightClick(action) {
        if (!action.coordinates) {
            return { success: false, error: 'No coordinates provided', duration: 0 };
        }
        await this.control.mouse.move(action.coordinates.x, action.coordinates.y);
        await this.sleep(50);
        await this.control.mouse.click('right');
        return { success: true, duration: 0 };
    }
    /**
     * Execute a typing action
     */
    async executeType(action) {
        const text = action.params?.text;
        if (!text) {
            return { success: false, error: 'No text provided for type action', duration: 0 };
        }
        await this.control.keyboard.type(text, { delay: 50 });
        return { success: true, duration: 0 };
    }
    /**
     * Execute a key press action
     */
    async executeKeyPress(action) {
        const key = action.params?.key;
        if (!key) {
            return { success: false, error: 'No key provided', duration: 0 };
        }
        await this.control.keyboard.press(key);
        return { success: true, duration: 0 };
    }
    /**
     * Execute a hotkey combination
     */
    async executeHotkey(action) {
        const keys = action.params?.keys;
        if (!keys || !Array.isArray(keys)) {
            return { success: false, error: 'No keys provided for hotkey', duration: 0 };
        }
        await this.control.keyboard.hotkey(keys);
        return { success: true, duration: 0 };
    }
    /**
     * Execute a scroll action
     */
    async executeScroll(action) {
        const direction = action.params?.direction || 'down';
        const amount = action.params?.amount || 3;
        // Move to position if provided
        if (action.coordinates) {
            await this.control.mouse.move(action.coordinates.x, action.coordinates.y);
        }
        await this.control.mouse.scroll(direction, amount);
        return { success: true, duration: 0 };
    }
    /**
     * Execute a wait action
     */
    async executeWait(action) {
        const duration = action.params?.duration || 1000;
        await this.sleep(duration);
        return { success: true, duration: 0 };
    }
    /**
     * Execute a navigation action (open URL/app)
     */
    async executeNavigate(action) {
        const target = action.params?.url || action.params?.app;
        if (!target) {
            return { success: false, error: 'No navigation target provided', duration: 0 };
        }
        if (target.startsWith('http://') || target.startsWith('https://')) {
            // Open URL in browser
            await this.control.applications.openUrl(target);
        }
        else {
            // Open application
            await this.control.applications.launch(target);
        }
        // Wait for navigation/app to load
        await this.sleep(2000);
        return { success: true, duration: 0 };
    }
    /**
     * Execute a drag action
     */
    async executeDrag(action) {
        const start = action.coordinates;
        const end = action.params?.endCoordinates;
        if (!start || !end) {
            return { success: false, error: 'Start and end coordinates required for drag', duration: 0 };
        }
        await this.control.mouse.drag(start.x, start.y, end.x, end.y);
        return { success: true, duration: 0 };
    }
    /**
     * Execute a hover action
     */
    async executeHover(action) {
        if (!action.coordinates) {
            return { success: false, error: 'No coordinates provided for hover', duration: 0 };
        }
        await this.control.mouse.move(action.coordinates.x, action.coordinates.y, { smooth: true });
        await this.sleep(300); // Hover delay
        return { success: true, duration: 0 };
    }
    /**
     * Execute multiple actions in sequence
     */
    async executeSequence(actions) {
        const results = [];
        for (const action of actions) {
            const result = await this.execute(action);
            results.push(result);
            // Stop if an action fails
            if (!result.success) {
                break;
            }
            // Small delay between actions
            await this.sleep(200);
        }
        return results;
    }
    /**
     * Execute actions in parallel (for independent actions)
     */
    async executeParallel(actions) {
        return Promise.all(actions.map((action) => this.execute(action)));
    }
    /**
     * Undo the last action if possible
     */
    async undo() {
        // Try Cmd/Ctrl+Z
        await this.control.keyboard.hotkey(['cmd', 'z']);
        return { success: true, duration: 0 };
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.ActionExecutor = ActionExecutor;
//# sourceMappingURL=executor.js.map