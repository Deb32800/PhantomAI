/**
 * Parsed action from AI response
 */
export interface ParsedAction {
    type: ActionType;
    description: string;
    target?: string;
    coordinates?: { x: number; y: number };
    params?: Record<string, any>;
    confidence: number;
}

export type ActionType =
    | 'click'
    | 'double-click'
    | 'right-click'
    | 'type'
    | 'press'
    | 'hotkey'
    | 'scroll'
    | 'wait'
    | 'navigate'
    | 'drag'
    | 'hover';

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
    alternatives?: { x: number; y: number; description: string }[];
}

/**
 * Action Parser - Parses AI responses into structured actions
 */
export class ActionParser {
    private actionTypeMap: Record<string, ActionType> = {
        'click': 'click',
        'single-click': 'click',
        'left-click': 'click',
        'double-click': 'double-click',
        'doubleclick': 'double-click',
        'right-click': 'right-click',
        'rightclick': 'right-click',
        'context-menu': 'right-click',
        'type': 'type',
        'input': 'type',
        'enter': 'type',
        'write': 'type',
        'press': 'press',
        'key': 'press',
        'hotkey': 'hotkey',
        'shortcut': 'hotkey',
        'keyboard-shortcut': 'hotkey',
        'scroll': 'scroll',
        'scroll-down': 'scroll',
        'scroll-up': 'scroll',
        'wait': 'wait',
        'pause': 'wait',
        'delay': 'wait',
        'sleep': 'wait',
        'navigate': 'navigate',
        'open': 'navigate',
        'go-to': 'navigate',
        'launch': 'navigate',
        'drag': 'drag',
        'drag-drop': 'drag',
        'hover': 'hover',
        'mouseover': 'hover',
        'move-to': 'hover',
    };

    /**
     * Parse an action from AI response
     */
    parseAction(response: string): ParsedAction | null {
        const json = this.extractJson(response);

        if (!json) {
            return this.parseNaturalLanguage(response);
        }

        const type = this.normalizeActionType(json.type);
        if (!type) return null;

        return {
            type,
            description: json.description || this.generateDescription(type, json),
            target: json.target,
            coordinates: this.parseCoordinates(json),
            params: this.parseParams(type, json),
            confidence: json.confidence ?? 0.5,
        };
    }

    /**
     * Parse screen analysis from AI response
     */
    parseAnalysis(response: string): AnalysisResult {
        const json = this.extractJson(response);

        if (!json) {
            // If no JSON, try to extract information from text
            return {
                isTaskComplete: response.toLowerCase().includes('complete') ||
                    response.toLowerCase().includes('done'),
                currentState: response.slice(0, 200),
                visibleElements: [],
                suggestions: [],
            };
        }

        return {
            isTaskComplete: json.isTaskComplete ?? false,
            currentState: json.currentState || '',
            visibleElements: Array.isArray(json.visibleElements) ? json.visibleElements : [],
            suggestions: Array.isArray(json.suggestions) ? json.suggestions : [],
        };
    }

    /**
     * Parse location from AI response
     */
    parseLocation(response: string): LocationResult {
        const json = this.extractJson(response);

        if (!json) {
            return { found: false, x: 0, y: 0, confidence: 0 };
        }

        return {
            found: json.found ?? false,
            x: parseInt(json.x) || 0,
            y: parseInt(json.y) || 0,
            confidence: json.confidence ?? 0,
            alternatives: json.alternatives,
        };
    }

    /**
     * Parse multiple actions from a response
     */
    parseMultipleActions(response: string): ParsedAction[] {
        const json = this.extractJson(response);

        if (json && Array.isArray(json.actions)) {
            return json.actions
                .map((action: any) => this.parseAction(JSON.stringify(action)))
                .filter((action: ParsedAction | null): action is ParsedAction => action !== null);
        }

        // Single action
        const action = this.parseAction(response);
        return action ? [action] : [];
    }

    /**
     * Extract JSON from response (handles code blocks)
     */
    private extractJson(response: string): any {
        try {
            // Try direct parse first
            return JSON.parse(response);
        } catch {
            // Try to extract from code block
            const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[1].trim());
                } catch {
                    // Fall through
                }
            }

            // Try to find JSON object in response
            const objectMatch = response.match(/\{[\s\S]*?\}/);
            if (objectMatch) {
                try {
                    return JSON.parse(objectMatch[0]);
                } catch {
                    // Fall through
                }
            }

            return null;
        }
    }

    /**
     * Normalize action type string
     */
    private normalizeActionType(type: string): ActionType | null {
        if (!type) return null;
        const normalized = type.toLowerCase().trim().replace(/\s+/g, '-');
        return this.actionTypeMap[normalized] || null;
    }

    /**
     * Parse coordinates from response
     */
    private parseCoordinates(json: any): { x: number; y: number } | undefined {
        if (json.coordinates) {
            return {
                x: parseInt(json.coordinates.x) || 0,
                y: parseInt(json.coordinates.y) || 0,
            };
        }
        if (json.x !== undefined && json.y !== undefined) {
            return {
                x: parseInt(json.x) || 0,
                y: parseInt(json.y) || 0,
            };
        }
        if (json.params?.x !== undefined && json.params?.y !== undefined) {
            return {
                x: parseInt(json.params.x) || 0,
                y: parseInt(json.params.y) || 0,
            };
        }
        return undefined;
    }

    /**
     * Parse action-specific parameters
     */
    private parseParams(type: ActionType, json: any): Record<string, any> {
        const params: Record<string, any> = json.params || {};

        switch (type) {
            case 'type':
                return { text: json.text || params.text || '' };
            case 'press':
                return { key: json.key || params.key || '' };
            case 'hotkey':
                return { keys: json.keys || params.keys || [] };
            case 'scroll':
                return {
                    direction: json.direction || params.direction || 'down',
                    amount: parseInt(json.amount || params.amount) || 3,
                };
            case 'wait':
                return { duration: parseInt(json.duration || params.duration) || 1000 };
            case 'navigate':
                return { url: json.url || params.url || '', app: json.app || params.app || '' };
            case 'drag':
                return {
                    endCoordinates: json.endCoordinates || params.endCoordinates,
                };
            default:
                return params;
        }
    }

    /**
     * Generate description from action
     */
    private generateDescription(type: ActionType, json: any): string {
        switch (type) {
            case 'click':
                return `Click on ${json.target || 'element'}`;
            case 'double-click':
                return `Double-click on ${json.target || 'element'}`;
            case 'right-click':
                return `Right-click on ${json.target || 'element'}`;
            case 'type':
                return `Type "${json.text || json.params?.text || ''}"`;
            case 'press':
                return `Press ${json.key || json.params?.key || 'key'}`;
            case 'hotkey':
                const keys = json.keys || json.params?.keys || [];
                return `Press ${keys.join('+')}`;
            case 'scroll':
                return `Scroll ${json.direction || json.params?.direction || 'down'}`;
            case 'wait':
                return `Wait ${json.duration || json.params?.duration || 1000}ms`;
            case 'navigate':
                return `Navigate to ${json.url || json.app || json.params?.url || 'target'}`;
            case 'drag':
                return `Drag from ${json.target || 'start'} to ${json.params?.endCoordinates ? 'end' : 'destination'}`;
            case 'hover':
                return `Hover over ${json.target || 'element'}`;
            default:
                return `Perform ${type} action`;
        }
    }

    /**
     * Parse natural language into action (fallback)
     */
    private parseNaturalLanguage(text: string): ParsedAction | null {
        const lowerText = text.toLowerCase();

        // Click patterns
        if (lowerText.includes('click') || lowerText.includes('press') || lowerText.includes('tap')) {
            const target = text.match(/(?:click|press|tap)\s+(?:on\s+)?[""']?(.+?)[""']?(?:\s|$)/i)?.[1];
            return {
                type: 'click',
                description: `Click on ${target || 'element'}`,
                target: target || undefined,
                confidence: 0.3,
            };
        }

        // Type patterns
        if (lowerText.includes('type') || lowerText.includes('enter') || lowerText.includes('input')) {
            const textMatch = text.match(/(?:type|enter|input)\s+[""'](.+?)[""']/i);
            return {
                type: 'type',
                description: `Type "${textMatch?.[1] || ''}"`,
                params: { text: textMatch?.[1] || '' },
                confidence: 0.3,
            };
        }

        // Scroll patterns
        if (lowerText.includes('scroll')) {
            const direction = lowerText.includes('up') ? 'up' : 'down';
            return {
                type: 'scroll',
                description: `Scroll ${direction}`,
                params: { direction, amount: 3 },
                confidence: 0.3,
            };
        }

        // Open/navigate patterns
        if (lowerText.includes('open') || lowerText.includes('go to') || lowerText.includes('navigate')) {
            const target = text.match(/(?:open|go to|navigate to?)\s+(.+?)(?:\s|$)/i)?.[1];
            return {
                type: 'navigate',
                description: `Navigate to ${target || 'target'}`,
                params: { url: target?.startsWith('http') ? target : '', app: target },
                confidence: 0.3,
            };
        }

        return null;
    }
}
