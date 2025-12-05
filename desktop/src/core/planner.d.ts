import { OllamaClient } from '../vision/ollama-client';
export interface Task {
    id: string;
    description: string;
    steps: TaskStep[];
    priority: 'high' | 'medium' | 'low';
    estimatedDuration: number;
    dependencies: string[];
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
}
export interface TaskStep {
    id: string;
    description: string;
    type: 'navigate' | 'click' | 'type' | 'scroll' | 'wait' | 'verify' | 'extract';
    params: Record<string, any>;
    expectedOutcome: string;
    fallbackActions: TaskStep[];
}
export interface PlanningContext {
    originalCommand: string;
    currentScreen: string;
    previousActions: string[];
    errorHistory: string[];
}
/**
 * Task Planner - Breaks down complex commands into executable steps
 */
export declare class TaskPlanner {
    private ollama;
    private taskHistory;
    constructor(ollama: OllamaClient);
    /**
     * Create a high-level execution plan from a natural language command
     */
    createPlan(command: string, context: PlanningContext): Promise<Task>;
    /**
     * Refine a plan based on execution feedback
     */
    refinePlan(task: Task, feedback: {
        stepIndex: number;
        error?: string;
        observation?: string;
    }): Promise<Task>;
    /**
     * Decompose complex tasks into subtasks
     */
    decompose(command: string): Promise<string[]>;
    /**
     * Estimate time for task completion
     */
    estimateTime(task: Task): number;
    /**
     * Build the planning prompt
     */
    private buildPlanningPrompt;
    /**
     * Parse the AI response into a structured plan
     */
    private parsePlanResponse;
    /**
     * Normalize step type string
     */
    private normalizeStepType;
    /**
     * Parse JSON from AI response (handles code blocks)
     */
    private parseJsonResponse;
    /**
     * Get planning history
     */
    getHistory(): Task[];
    /**
     * Clear planning history
     */
    clearHistory(): void;
}
//# sourceMappingURL=planner.d.ts.map