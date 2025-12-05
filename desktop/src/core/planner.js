"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPlanner = void 0;
/**
 * Task Planner - Breaks down complex commands into executable steps
 */
class TaskPlanner {
    ollama;
    taskHistory = [];
    constructor(ollama) {
        this.ollama = ollama;
    }
    /**
     * Create a high-level execution plan from a natural language command
     */
    async createPlan(command, context) {
        const planningPrompt = this.buildPlanningPrompt(command, context);
        // Get AI to break down the task
        const response = await this.ollama.complete(planningPrompt);
        const parsedPlan = this.parsePlanResponse(response);
        const task = {
            id: `task-${Date.now()}`,
            description: command,
            steps: parsedPlan.steps,
            priority: parsedPlan.priority || 'medium',
            estimatedDuration: parsedPlan.estimatedDuration || 60,
            dependencies: [],
            status: 'pending',
        };
        this.taskHistory.push(task);
        return task;
    }
    /**
     * Refine a plan based on execution feedback
     */
    async refinePlan(task, feedback) {
        const refinementPrompt = `
The following task step failed or needs adjustment:
Task: ${task.description}
Failed Step: ${task.steps[feedback.stepIndex]?.description}
Error: ${feedback.error || 'None'}
Observation: ${feedback.observation || 'None'}

Current steps:
${task.steps.map((s, i) => `${i + 1}. ${s.description}`).join('\n')}

Please provide an updated plan to complete the task. Consider:
1. What went wrong
2. Alternative approaches
3. Steps to recover

Respond in JSON format:
{
  "revisedSteps": [
    {
      "description": "Step description",
      "type": "click|type|navigate|scroll|wait|verify",
      "params": {},
      "expectedOutcome": "What should happen"
    }
  ],
  "explanation": "Why these changes were made"
}
`;
        const response = await this.ollama.complete(refinementPrompt);
        const parsed = this.parseJsonResponse(response);
        if (parsed.revisedSteps) {
            // Replace remaining steps
            const completedSteps = task.steps.slice(0, feedback.stepIndex);
            const newSteps = parsed.revisedSteps.map((step, idx) => ({
                id: `step-${Date.now()}-${idx}`,
                description: step.description,
                type: step.type,
                params: step.params || {},
                expectedOutcome: step.expectedOutcome || '',
                fallbackActions: [],
            }));
            task.steps = [...completedSteps, ...newSteps];
        }
        return task;
    }
    /**
     * Decompose complex tasks into subtasks
     */
    async decompose(command) {
        const decompositionPrompt = `
Break down this complex task into simple, atomic subtasks:
Task: ${command}

Rules:
1. Each subtask should be a single action
2. Order matters - list in execution order
3. Be specific about what needs to be clicked, typed, etc.
4. Include verification steps

Respond with a JSON array of subtask strings:
["subtask 1", "subtask 2", ...]
`;
        const response = await this.ollama.complete(decompositionPrompt);
        const parsed = this.parseJsonResponse(response);
        return Array.isArray(parsed) ? parsed : [command];
    }
    /**
     * Estimate time for task completion
     */
    estimateTime(task) {
        const stepTimes = {
            navigate: 3,
            click: 1,
            type: 2,
            scroll: 1,
            wait: 2,
            verify: 2,
            extract: 1,
        };
        return task.steps.reduce((total, step) => {
            return total + (stepTimes[step.type] || 2);
        }, 0);
    }
    /**
     * Build the planning prompt
     */
    buildPlanningPrompt(command, context) {
        return `
You are an AI assistant that controls a computer. Plan the steps to accomplish this task.

USER REQUEST: ${command}

CURRENT CONTEXT:
- Screen: ${context.currentScreen}
- Previous actions: ${context.previousActions.slice(-5).join(', ') || 'None'}
- Past errors: ${context.errorHistory.slice(-3).join(', ') || 'None'}

Create a detailed execution plan. For each step specify:
1. Action type (navigate, click, type, scroll, wait, verify)
2. Description of what to do
3. Expected outcome

Be specific about:
- What text to type
- What elements to click (describe by text/position)
- What URLs to navigate to
- What to verify

Respond in JSON format:
{
  "priority": "high|medium|low",
  "estimatedDuration": <seconds>,
  "steps": [
    {
      "description": "What to do",
      "type": "click|type|navigate|scroll|wait|verify",
      "params": {
        "target": "element description",
        "text": "text to type (if applicable)",
        "url": "url to navigate (if applicable)"
      },
      "expectedOutcome": "What should happen after this step"
    }
  ]
}
`;
    }
    /**
     * Parse the AI response into a structured plan
     */
    parsePlanResponse(response) {
        const parsed = this.parseJsonResponse(response);
        if (!parsed.steps || !Array.isArray(parsed.steps)) {
            return { steps: [] };
        }
        const steps = parsed.steps.map((step, idx) => ({
            id: `step-${Date.now()}-${idx}`,
            description: step.description || '',
            type: this.normalizeStepType(step.type),
            params: step.params || {},
            expectedOutcome: step.expectedOutcome || '',
            fallbackActions: [],
        }));
        return {
            steps,
            priority: parsed.priority,
            estimatedDuration: parsed.estimatedDuration,
        };
    }
    /**
     * Normalize step type string
     */
    normalizeStepType(type) {
        const typeMap = {
            'navigate': 'navigate',
            'click': 'click',
            'type': 'type',
            'input': 'type',
            'scroll': 'scroll',
            'wait': 'wait',
            'verify': 'verify',
            'check': 'verify',
            'extract': 'extract',
            'read': 'extract',
        };
        return typeMap[type?.toLowerCase()] || 'click';
    }
    /**
     * Parse JSON from AI response (handles code blocks)
     */
    parseJsonResponse(response) {
        try {
            // Try direct parse first
            return JSON.parse(response);
        }
        catch {
            // Extract from code block if present
            const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[1].trim());
                }
                catch {
                    // Fall through
                }
            }
            // Try to find JSON object in response
            const objectMatch = response.match(/\{[\s\S]*\}/);
            if (objectMatch) {
                try {
                    return JSON.parse(objectMatch[0]);
                }
                catch {
                    // Fall through
                }
            }
            return {};
        }
    }
    /**
     * Get planning history
     */
    getHistory() {
        return [...this.taskHistory];
    }
    /**
     * Clear planning history
     */
    clearHistory() {
        this.taskHistory = [];
    }
}
exports.TaskPlanner = TaskPlanner;
//# sourceMappingURL=planner.js.map