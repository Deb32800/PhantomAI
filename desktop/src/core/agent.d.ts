import { EventEmitter } from 'events';
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
    coordinates?: {
        x: number;
        y: number;
    };
    requiresConfirmation: boolean;
}
/**
 * Core AI Agent that orchestrates task planning and execution
 */
export declare class Agent extends EventEmitter {
    private vision;
    private ollama;
    private control;
    private safety;
    private activity;
    private planner;
    private executor;
    private memory;
    private promptBuilder;
    private actionParser;
    private retryHandler;
    private status;
    private abortController;
    private maxRetries;
    private maxStepsPerTask;
    constructor(config: AgentConfig);
    /**
     * Execute a natural language command
     */
    execute(command: string): Promise<void>;
    /**
     * Main execution loop - observe, plan, act
     */
    private executeLoop;
    /**
     * Analyze the current screen with AI
     */
    private analyzeScreen;
    /**
     * Plan the next action based on current state
     */
    private planNextAction;
    /**
     * Wait for user confirmation of an action
     */
    private waitForConfirmation;
    /**
     * Stop the current execution
     */
    stop(): Promise<void>;
    /**
     * Confirm or reject a pending action
     */
    confirmAction(confirmed: boolean): void;
    /**
     * Get current agent status
     */
    getStatus(): AgentStatus;
    /**
     * Clear agent memory
     */
    clearMemory(): void;
    private checkAbort;
    private calculateProgress;
    private sleep;
}
//# sourceMappingURL=agent.d.ts.map