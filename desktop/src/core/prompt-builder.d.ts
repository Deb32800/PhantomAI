import { ConversationEntry } from './memory';
/**
 * Prompt Builder - Constructs prompts for the AI agent
 */
export declare class PromptBuilder {
    private systemPrompt;
    constructor();
    /**
     * Build the core system prompt
     */
    private buildSystemPrompt;
    /**
     * Build prompt for screen analysis
     */
    buildAnalysisPrompt(command: string, history: ConversationEntry[]): string;
    /**
     * Build prompt for deciding next action
     */
    buildActionPrompt(command: string, screenAnalysis: any, history: ConversationEntry[]): string;
    /**
     * Build prompt for element location
     */
    buildLocationPrompt(target: string): string;
    /**
     * Build prompt for verification
     */
    buildVerificationPrompt(expectedOutcome: string): string;
    /**
     * Build prompt for error recovery
     */
    buildRecoveryPrompt(error: string, context: string): string;
    /**
     * Build prompt for element extraction
     */
    buildExtractionPrompt(target: string): string;
    /**
     * Build prompt for UI element listing
     */
    buildUIMapPrompt(): string;
    /**
     * Format conversation history
     */
    private formatHistory;
    /**
     * Get the system prompt
     */
    getSystemPrompt(): string;
    /**
     * Append custom instructions to system prompt
     */
    appendInstructions(instructions: string): void;
}
//# sourceMappingURL=prompt-builder.d.ts.map