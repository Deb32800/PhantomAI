import { ConversationEntry } from './memory';

/**
 * Prompt Builder - Constructs prompts for the AI agent
 */
export class PromptBuilder {
    private systemPrompt: string;

    constructor() {
        this.systemPrompt = this.buildSystemPrompt();
    }

    /**
     * Build the core system prompt
     */
    private buildSystemPrompt(): string {
        return `You are Phantom AI, an intelligent desktop assistant that can see and control the user's computer.

CAPABILITIES:
- See the screen through screenshots
- Move and click the mouse
- Type on the keyboard
- Open applications and websites
- Scroll, drag, and interact with UI elements
- Execute keyboard shortcuts

RULES:
1. Always analyze the screen before acting
2. Be precise with click locations
3. Use the simplest approach to complete tasks
4. Verify actions completed successfully
5. Never perform dangerous actions without confirmation
6. Report errors clearly

SAFETY:
- Never delete important files
- Never make purchases without confirmation
- Never share sensitive information
- Never run unknown scripts
- Always respect user privacy

When you see the screen, describe what you observe and decide on the next action.`;
    }

    /**
     * Build prompt for screen analysis
     */
    buildAnalysisPrompt(command: string, history: ConversationEntry[]): string {
        const historyText = this.formatHistory(history);

        return `${this.systemPrompt}

CURRENT TASK: ${command}

PREVIOUS ACTIONS:
${historyText || 'None yet'}

Look at the screenshot and answer:
1. What do you see on the screen?
2. What is the current state relevant to the task?
3. Is the task complete? If yes, explain why.
4. What visible elements can be interacted with?

Respond in JSON format:
{
  "isTaskComplete": boolean,
  "currentState": "Description of relevant screen state",
  "visibleElements": ["element1", "element2", ...],
  "suggestions": ["possible next action 1", "possible next action 2"]
}`;
    }

    /**
     * Build prompt for deciding next action
     */
    buildActionPrompt(
        command: string,
        screenAnalysis: any,
        history: ConversationEntry[],
    ): string {
        const historyText = this.formatHistory(history);

        return `${this.systemPrompt}

CURRENT TASK: ${command}

SCREEN ANALYSIS:
${JSON.stringify(screenAnalysis, null, 2)}

PREVIOUS ACTIONS:
${historyText || 'None yet'}

Based on the current screen state, decide the SINGLE next action to take.
Be specific about:
- Exact text to click on
- Exact text to type
- Exact location (describe element)

Respond in JSON format:
{
  "type": "click|double-click|right-click|type|press|hotkey|scroll|wait|navigate|drag|hover",
  "description": "Human readable description of action",
  "target": "Description of element to interact with",
  "params": {
    "text": "text to type (for type action)",
    "key": "key name (for press action)",
    "keys": ["key1", "key2"] (for hotkey action),
    "direction": "up|down|left|right" (for scroll),
    "amount": number (for scroll),
    "url": "url to navigate",
    "duration": milliseconds (for wait)
  },
  "confidence": 0.0-1.0
}`;
    }

    /**
     * Build prompt for element location
     */
    buildLocationPrompt(target: string): string {
        return `Find the ${target} element in this screenshot.

Provide the exact pixel coordinates (x, y) of where to click.
Look for the CENTER of the element.

Respond in JSON format:
{
  "found": boolean,
  "x": number,
  "y": number,
  "confidence": 0.0-1.0,
  "alternatives": [{"x": number, "y": number, "description": "string"}]
}`;
    }

    /**
     * Build prompt for verification
     */
    buildVerificationPrompt(expectedOutcome: string): string {
        return `Verify if the following expected outcome has been achieved:
Expected: ${expectedOutcome}

Look at the screenshot and determine:
1. Has the expected change occurred?
2. Are there any error messages visible?
3. Is the screen in an expected state?

Respond in JSON format:
{
  "success": boolean,
  "reason": "Why you believe the outcome was/wasn't achieved",
  "errors": ["Any error messages seen"],
  "currentState": "Brief description of current state"
}`;
    }

    /**
     * Build prompt for error recovery
     */
    buildRecoveryPrompt(error: string, context: string): string {
        return `An error occurred while executing a task:
Error: ${error}
Context: ${context}

Look at the screenshot and suggest:
1. What went wrong
2. How to recover
3. Alternative approaches

Respond in JSON format:
{
  "diagnosis": "What likely caused the error",
  "recoverySteps": ["step1", "step2"],
  "shouldRetry": boolean,
  "alternativeApproach": "A different way to accomplish the goal"
}`;
    }

    /**
     * Build prompt for element extraction
     */
    buildExtractionPrompt(target: string): string {
        return `Extract information about ${target} from this screenshot.

Look for:
- Text content
- Values/numbers
- Status indicators
- Relevant details

Respond in JSON format:
{
  "found": boolean,
  "data": {
    "text": "extracted text",
    "value": "any numeric value",
    "additional": {}
  },
  "confidence": 0.0-1.0
}`;
    }

    /**
     * Build prompt for UI element listing
     */
    buildUIMapPrompt(): string {
        return `Map all interactive UI elements visible in this screenshot.

For each element, identify:
- Type (button, link, input, checkbox, etc.)
- Text/label
- Approximate position (describe location)
- Whether it appears clickable/enabled

Respond in JSON format:
{
  "elements": [
    {
      "type": "button|link|input|checkbox|dropdown|menu|tab|other",
      "label": "Button text or description",
      "position": "top-left corner|center of screen|etc.",
      "enabled": boolean
    }
  ]
}`;
    }

    /**
     * Format conversation history
     */
    private formatHistory(history: ConversationEntry[]): string {
        if (!history || history.length === 0) return '';

        return history
            .filter((entry) => entry.role !== 'system')
            .slice(-5) // Last 5 entries
            .map((entry) => {
                if (entry.role === 'user') {
                    return `User: ${entry.content}`;
                } else {
                    const action = entry.metadata?.action || entry.content;
                    const result = entry.metadata?.result || '';
                    return `Agent: ${action}${result ? ` → ${result}` : ''}`;
                }
            })
            .join('\n');
    }

    /**
     * Get the system prompt
     */
    getSystemPrompt(): string {
        return this.systemPrompt;
    }

    /**
     * Append custom instructions to system prompt
     */
    appendInstructions(instructions: string): void {
        this.systemPrompt += `\n\nADDITIONAL INSTRUCTIONS:\n${instructions}`;
    }
}
