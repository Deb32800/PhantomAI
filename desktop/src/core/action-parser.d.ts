/**
 * Parsed action from AI response
 */
export interface ParsedAction {
    type: ActionType;
    description: string;
    target?: string;
    coordinates?: {
        x: number;
        y: number;
    };
    params?: Record<string, any>;
    confidence: number;
}
export type ActionType = 'click' | 'double-click' | 'right-click' | 'type' | 'press' | 'hotkey' | 'scroll' | 'wait' | 'navigate' | 'drag' | 'hover';
/**
 * Screen analysis result
 */
export interface AnalysisResult {
    isTaskComplete: boolean;
    currentState: string;
    visibleElements: string[];
    suggestions: string[];
}
/**
 * Location result
 */
export interface LocationResult {
    found: boolean;
    x: number;
    y: number;
    confidence: number;
    alternatives?: {
        x: number;
        y: number;
        description: string;
    }[];
}
/**
 * Action Parser - Parses AI responses into structured actions
 */
export declare class ActionParser {
    private actionTypeMap;
    /**
     * Parse an action from AI response
     */
    parseAction(response: string): ParsedAction | null;
    /**
     * Parse screen analysis from AI response
     */
    parseAnalysis(response: string): AnalysisResult;
    /**
     * Parse location from AI response
     */
    parseLocation(response: string): LocationResult;
    /**
     * Parse multiple actions from a response
     */
    parseMultipleActions(response: string): ParsedAction[];
    /**
     * Extract JSON from response (handles code blocks)
     */
    private extractJson;
    /**
     * Normalize action type string
     */
    private normalizeActionType;
    /**
     * Parse coordinates from response
     */
    private parseCoordinates;
    /**
     * Parse action-specific parameters
     */
    private parseParams;
    /**
     * Generate description from action
     */
    private generateDescription;
    /**
     * Parse natural language into action (fallback)
     */
    private parseNaturalLanguage;
}
//# sourceMappingURL=action-parser.d.ts.map