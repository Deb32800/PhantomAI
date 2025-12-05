"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const events_1 = require("events");
const planner_1 = require("./planner");
const executor_1 = require("./executor");
const memory_1 = require("./memory");
const prompt_builder_1 = require("./prompt-builder");
const action_parser_1 = require("./action-parser");
const retry_handler_1 = require("./retry-handler");
/**
 * Core AI Agent that orchestrates task planning and execution
 */
class Agent extends events_1.EventEmitter {
    vision;
    ollama;
    control;
    safety;
    activity;
    planner;
    executor;
    memory;
    promptBuilder;
    actionParser;
    retryHandler;
    status = {
        isRunning: false,
        currentTask: null,
        currentStep: null,
        progress: 0,
        stepsCompleted: 0,
        totalSteps: 0,
        startTime: null,
        errors: [],
    };
    abortController = null;
    maxRetries = 3;
    maxStepsPerTask = 50;
    constructor(config) {
        super();
        this.vision = config.vision;
        this.ollama = config.ollama;
        this.control = config.control;
        this.safety = config.safety;
        this.activity = config.activity;
        this.planner = new planner_1.TaskPlanner(this.ollama);
        this.executor = new executor_1.ActionExecutor(this.control, this.safety);
        this.memory = new memory_1.AgentMemory();
        this.promptBuilder = new prompt_builder_1.PromptBuilder();
        this.actionParser = new action_parser_1.ActionParser();
        this.retryHandler = new retry_handler_1.RetryHandler(this.maxRetries);
    }
    /**
     * Execute a natural language command
     */
    async execute(command) {
        if (this.status.isRunning) {
            throw new Error('Agent is already running a task');
        }
        this.abortController = new AbortController();
        this.status = {
            isRunning: true,
            currentTask: command,
            currentStep: null,
            progress: 0,
            stepsCompleted: 0,
            totalSteps: 0,
            startTime: Date.now(),
            errors: [],
        };
        this.emit('update', {
            type: 'thinking',
            message: 'Understanding your request...',
        });
        // Log the command
        await this.activity.log({
            action: 'command_received',
            details: command,
            status: 'success',
        });
        try {
            // Add command to conversation memory
            this.memory.addEntry({
                role: 'user',
                content: command,
                timestamp: Date.now(),
            });
            // Main execution loop
            await this.executeLoop(command);
            this.emit('update', {
                type: 'completed',
                message: 'Task completed successfully!',
                progress: 100,
            });
            await this.activity.log({
                action: 'task_completed',
                details: command,
                status: 'success',
            });
        }
        catch (error) {
            if (error.name === 'AbortError') {
                this.emit('update', {
                    type: 'error',
                    message: 'Task was stopped by user',
                });
            }
            else {
                this.status.errors.push(error.message);
                this.emit('update', {
                    type: 'error',
                    message: `Error: ${error.message}`,
                });
                await this.activity.log({
                    action: 'task_failed',
                    details: error.message,
                    status: 'failed',
                });
            }
            throw error;
        }
        finally {
            this.status.isRunning = false;
            this.abortController = null;
        }
    }
    /**
     * Main execution loop - observe, plan, act
     */
    async executeLoop(command) {
        let stepCount = 0;
        let isComplete = false;
        while (!isComplete && stepCount < this.maxStepsPerTask) {
            this.checkAbort();
            // 1. Observe - capture and analyze screen
            this.emit('update', {
                type: 'thinking',
                message: 'Analyzing screen...',
                progress: this.calculateProgress(stepCount),
            });
            const screenshot = await this.vision.captureScreen();
            const screenAnalysis = await this.analyzeScreen(screenshot, command);
            // 2. Check if task is complete
            if (screenAnalysis.isTaskComplete) {
                isComplete = true;
                break;
            }
            // 3. Plan next action
            this.emit('update', {
                type: 'planning',
                message: 'Deciding next action...',
                progress: this.calculateProgress(stepCount),
            });
            const nextAction = await this.planNextAction(command, screenAnalysis, screenshot);
            if (!nextAction) {
                throw new Error('Could not determine next action');
            }
            // 4. Preview action (for confirmation if needed)
            const preview = {
                id: `action-${stepCount}`,
                type: nextAction.type,
                description: nextAction.description,
                screenshot: screenshot,
                coordinates: nextAction.coordinates,
                requiresConfirmation: await this.safety.requiresConfirmation(nextAction),
            };
            this.emit('actionPreview', preview);
            // 5. Wait for confirmation if needed
            if (preview.requiresConfirmation) {
                this.emit('update', {
                    type: 'waiting',
                    message: 'Waiting for confirmation...',
                });
                const confirmed = await this.waitForConfirmation(preview);
                if (!confirmed) {
                    throw new Error('Action was rejected by user');
                }
            }
            // 6. Execute action with retry logic
            this.emit('update', {
                type: 'executing',
                message: nextAction.description,
                progress: this.calculateProgress(stepCount),
                stepIndex: stepCount + 1,
            });
            const result = await this.retryHandler.execute(() => this.executor.execute(nextAction), `Action: ${nextAction.type}`);
            if (!result.success) {
                this.status.errors.push(result.error || 'Action failed');
            }
            // 7. Log action
            await this.activity.log({
                action: nextAction.type,
                details: nextAction.description,
                status: result.success ? 'success' : 'failed',
                screenshot: screenshot,
            });
            // 8. Update memory with action result
            this.memory.addEntry({
                role: 'assistant',
                content: `Executed: ${nextAction.description}. Result: ${result.success ? 'success' : result.error}`,
                timestamp: Date.now(),
            });
            // Small delay between actions to let UI update
            await this.sleep(500);
            stepCount++;
            this.status.stepsCompleted = stepCount;
        }
        if (stepCount >= this.maxStepsPerTask) {
            throw new Error(`Task exceeded maximum steps (${this.maxStepsPerTask})`);
        }
    }
    /**
     * Analyze the current screen with AI
     */
    async analyzeScreen(screenshot, command) {
        const prompt = this.promptBuilder.buildAnalysisPrompt(command, this.memory.getRecentHistory(5));
        const response = await this.ollama.analyze(screenshot, prompt);
        return this.actionParser.parseAnalysis(response);
    }
    /**
     * Plan the next action based on current state
     */
    async planNextAction(command, screenAnalysis, screenshot) {
        const prompt = this.promptBuilder.buildActionPrompt(command, screenAnalysis, this.memory.getRecentHistory(10));
        const response = await this.ollama.analyze(screenshot, prompt);
        return this.actionParser.parseAction(response);
    }
    /**
     * Wait for user confirmation of an action
     */
    async waitForConfirmation(preview) {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve(false);
            }, 30000); // 30 second timeout
            this.once('confirmAction', (confirmed) => {
                clearTimeout(timeout);
                resolve(confirmed);
            });
        });
    }
    /**
     * Stop the current execution
     */
    async stop() {
        if (this.abortController) {
            this.abortController.abort();
        }
        this.status.isRunning = false;
        await this.activity.log({
            action: 'task_stopped',
            details: 'Stopped by user',
            status: 'cancelled',
        });
    }
    /**
     * Confirm or reject a pending action
     */
    confirmAction(confirmed) {
        this.emit('confirmAction', confirmed);
    }
    /**
     * Get current agent status
     */
    getStatus() {
        return { ...this.status };
    }
    /**
     * Clear agent memory
     */
    clearMemory() {
        this.memory.clear();
    }
    // Helper methods
    checkAbort() {
        if (this.abortController?.signal.aborted) {
            const error = new Error('Task aborted');
            error.name = 'AbortError';
            throw error;
        }
    }
    calculateProgress(stepCount) {
        // Estimate progress based on steps (max 50 steps = 100%)
        return Math.min(100, Math.round((stepCount / this.maxStepsPerTask) * 100));
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.Agent = Agent;
//# sourceMappingURL=agent.js.map