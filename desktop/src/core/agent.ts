import { EventEmitter } from 'events';
import { TaskPlanner, Task, TaskStep } from './planner';
import { ActionExecutor, ActionResult } from './executor';
import { AgentMemory, ConversationEntry } from './memory';
import { PromptBuilder } from './prompt-builder';
import { ActionParser, ParsedAction } from './action-parser';
import { RetryHandler } from './retry-handler';
import { VisionSystem } from '../vision/capture';
import { OllamaClient } from '../vision/ollama-client';
import { ControlSystem } from '../control/control-system';
import { SafetyManager } from '../safety/safety-manager';
import { ActivityLogger } from '../safety/activity-logger';

export interface AgentConfig {
    vision: VisionSystem;
    ollama: OllamaClient;
    control: ControlSystem;
    safety: SafetyManager;
    activity: ActivityLogger;
}

export interface AgentStatus {
    isRunning: boolean;
    currentTask: string | null;
    currentStep: string | null;
    progress: number;
    stepsCompleted: number;
    totalSteps: number;
    startTime: number | null;
    errors: string[];
}

export interface AgentUpdate {
    type: 'thinking' | 'planning' | 'executing' | 'completed' | 'error' | 'waiting';
    message: string;
    progress?: number;
    stepIndex?: number;
    totalSteps?: number;
    screenshot?: string;
}

export interface ActionPreview {
    id: string;
    type: string;
    description: string;
    screenshot: string;
    coordinates?: { x: number; y: number };
    requiresConfirmation: boolean;
}

/**
 * Core AI Agent that orchestrates task planning and execution
 */
export class Agent extends EventEmitter {
    private vision: VisionSystem;
    private ollama: OllamaClient;
    private control: ControlSystem;
    private safety: SafetyManager;
    private activity: ActivityLogger;

    private planner: TaskPlanner;
    private executor: ActionExecutor;
    private memory: AgentMemory;
    private promptBuilder: PromptBuilder;
    private actionParser: ActionParser;
    private retryHandler: RetryHandler;

    private status: AgentStatus = {
        isRunning: false,
        currentTask: null,
        currentStep: null,
        progress: 0,
        stepsCompleted: 0,
        totalSteps: 0,
        startTime: null,
        errors: [],
    };

    private abortController: AbortController | null = null;
    private maxRetries = 3;
    private maxStepsPerTask = 50;

    constructor(config: AgentConfig) {
        super();

        this.vision = config.vision;
        this.ollama = config.ollama;
        this.control = config.control;
        this.safety = config.safety;
        this.activity = config.activity;

        this.planner = new TaskPlanner(this.ollama);
        this.executor = new ActionExecutor(this.control, this.safety);
        this.memory = new AgentMemory();
        this.promptBuilder = new PromptBuilder();
        this.actionParser = new ActionParser();
        this.retryHandler = new RetryHandler(this.maxRetries);
    }

    /**
     * Execute a natural language command
     */
    async execute(command: string): Promise<void> {
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
        } as AgentUpdate);

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
            } as AgentUpdate);

            await this.activity.log({
                action: 'task_completed',
                details: command,
                status: 'success',
            });

        } catch (error: any) {
            if (error.name === 'AbortError') {
                this.emit('update', {
                    type: 'error',
                    message: 'Task was stopped by user',
                } as AgentUpdate);
            } else {
                this.status.errors.push(error.message);
                this.emit('update', {
                    type: 'error',
                    message: `Error: ${error.message}`,
                } as AgentUpdate);

                await this.activity.log({
                    action: 'task_failed',
                    details: error.message,
                    status: 'failed',
                });
            }
            throw error;
        } finally {
            this.status.isRunning = false;
            this.abortController = null;
        }
    }

    /**
     * Main execution loop - observe, plan, act
     */
    private async executeLoop(command: string): Promise<void> {
        let stepCount = 0;
        let isComplete = false;

        while (!isComplete && stepCount < this.maxStepsPerTask) {
            this.checkAbort();

            // 1. Observe - capture and analyze screen
            this.emit('update', {
                type: 'thinking',
                message: 'Analyzing screen...',
                progress: this.calculateProgress(stepCount),
            } as AgentUpdate);

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
            } as AgentUpdate);

            const nextAction = await this.planNextAction(command, screenAnalysis, screenshot);

            if (!nextAction) {
                throw new Error('Could not determine next action');
            }

            // 4. Preview action (for confirmation if needed)
            const preview: ActionPreview = {
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
                } as AgentUpdate);

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
            } as AgentUpdate);

            const result = await this.retryHandler.execute(
                () => this.executor.execute(nextAction),
                `Action: ${nextAction.type}`,
            );

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
    private async analyzeScreen(screenshot: string, command: string): Promise<{
        isTaskComplete: boolean;
        currentState: string;
        visibleElements: string[];
        suggestions: string[];
    }> {
        const prompt = this.promptBuilder.buildAnalysisPrompt(
            command,
            this.memory.getRecentHistory(5),
        );

        const response = await this.ollama.analyze(screenshot, prompt);

        return this.actionParser.parseAnalysis(response);
    }

    /**
     * Plan the next action based on current state
     */
    private async planNextAction(
        command: string,
        screenAnalysis: any,
        screenshot: string,
    ): Promise<ParsedAction | null> {
        const prompt = this.promptBuilder.buildActionPrompt(
            command,
            screenAnalysis,
            this.memory.getRecentHistory(10),
        );

        const response = await this.ollama.analyze(screenshot, prompt);

        return this.actionParser.parseAction(response);
    }

    /**
     * Wait for user confirmation of an action
     */
    private async waitForConfirmation(preview: ActionPreview): Promise<boolean> {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve(false);
            }, 30000); // 30 second timeout

            this.once('confirmAction', (confirmed: boolean) => {
                clearTimeout(timeout);
                resolve(confirmed);
            });
        });
    }

    /**
     * Stop the current execution
     */
    async stop(): Promise<void> {
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
    confirmAction(confirmed: boolean): void {
        this.emit('confirmAction', confirmed);
    }

    /**
     * Get current agent status
     */
    getStatus(): AgentStatus {
        return { ...this.status };
    }

    /**
     * Clear agent memory
     */
    clearMemory(): void {
        this.memory.clear();
    }

    // Helper methods

    private checkAbort(): void {
        if (this.abortController?.signal.aborted) {
            const error = new Error('Task aborted');
            error.name = 'AbortError';
            throw error;
        }
    }

    private calculateProgress(stepCount: number): number {
        // Estimate progress based on steps (max 50 steps = 100%)
        return Math.min(100, Math.round((stepCount / this.maxStepsPerTask) * 100));
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
