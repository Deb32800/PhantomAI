import { OllamaClient } from './ollama-client';

export interface DetectedElement {
    type: ElementType;
    label: string;
    bounds: { x: number; y: number; width: number; height: number };
    center: { x: number; y: number };
    confidence: number;
    attributes?: Record<string, string>;
    isInteractive: boolean;
}

export type ElementType =
    | 'button'
    | 'link'
    | 'input'
    | 'checkbox'
    | 'radio'
    | 'dropdown'
    | 'menu'
    | 'tab'
    | 'icon'
    | 'text'
    | 'image'
    | 'list-item'
    | 'heading'
    | 'other';

export interface ElementQuery {
    text?: string;
    type?: ElementType | ElementType[];
    near?: { x: number; y: number; maxDistance?: number };
    inRegion?: { x: number; y: number; width: number; height: number };
}

/**
 * Element Detector - Uses AI to find UI elements on screen
 */
export class ElementDetector {
    private ollama: OllamaClient;
    private cache: Map<string, DetectedElement[]> = new Map();
    private cacheTimeout = 5000; // 5 seconds

    constructor(ollama: OllamaClient) {
        this.ollama = ollama;
    }

    /**
     * Detect all UI elements in screenshot
     */
    async detectAll(screenshot: string): Promise<DetectedElement[]> {
        // Check cache
        const cacheKey = this.hashScreenshot(screenshot);
        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const prompt = `Analyze this screenshot and list all interactive UI elements.

For each element, provide:
- Type: button, link, input, checkbox, dropdown, menu, tab, icon, text, image, or other
- Label: Text on or describing the element
- Position: Approximate x, y coordinates of the CENTER (relative to image dimensions)
- Size: Approximate width and height
- Is it clickable/interactive?

Respond in JSON format:
{
  "elements": [
    {
      "type": "button",
      "label": "Submit",
      "x": 500,
      "y": 300,
      "width": 100,
      "height": 40,
      "interactive": true
    }
  ],
  "screenWidth": <detected width>,
  "screenHeight": <detected height>
}

Focus on clearly visible, interactive elements. Prioritize buttons, links, and inputs.`;

        try {
            const response = await this.ollama.analyze(screenshot, prompt);
            const parsed = this.parseElementsResponse(response);

            // Cache results
            this.cache.set(cacheKey, parsed);
            setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

            return parsed;
        } catch (error) {
            console.error('Element detection failed:', error);
            return [];
        }
    }

    /**
     * Find a specific element by description
     */
    async findElement(screenshot: string, description: string): Promise<DetectedElement | null> {
        const prompt = `Find the "${description}" element in this screenshot.

Look for:
- Buttons, links, or icons with this text
- Labels or text matching this description
- Form fields with this placeholder/label

Respond in JSON format:
{
  "found": true/false,
  "element": {
    "type": "button|link|input|etc",
    "label": "Exact text on element",
    "x": <center x coordinate>,
    "y": <center y coordinate>,
    "width": <element width>,
    "height": <element height>,
    "confidence": 0.0-1.0
  },
  "alternatives": [
    { "label": "Similar element", "x": 0, "y": 0 }
  ]
}`;

        try {
            const response = await this.ollama.analyze(screenshot, prompt);
            const parsed = this.parseSingleElementResponse(response);
            return parsed;
        } catch (error) {
            console.error('Element find failed:', error);
            return null;
        }
    }

    /**
     * Find element by text content
     */
    async findByText(screenshot: string, text: string, exactMatch: boolean = false): Promise<DetectedElement | null> {
        const matchType = exactMatch ? 'exactly' : 'containing';
        const prompt = `Find a UI element with text ${matchType} "${text}" in this screenshot.

Look for buttons, links, labels, menu items, or any text matching "${text}".

Respond in JSON format:
{
  "found": true/false,
  "x": <center x>,
  "y": <center y>,
  "type": "button|link|text|etc",
  "actualText": "The exact text found",
  "confidence": 0.0-1.0
}`;

        try {
            const response = await this.ollama.analyze(screenshot, prompt);
            return this.parseSingleElementResponse(response);
        } catch (error) {
            return null;
        }
    }

    /**
     * Find clickable element nearest to a point
     */
    async findNearestClickable(
        screenshot: string,
        point: { x: number; y: number },
    ): Promise<DetectedElement | null> {
        const elements = await this.detectAll(screenshot);

        const clickable = elements.filter((e) => e.isInteractive);
        if (clickable.length === 0) return null;

        // Find nearest
        let nearest = clickable[0];
        let minDistance = this.distance(point, nearest.center);

        for (const element of clickable) {
            const dist = this.distance(point, element.center);
            if (dist < minDistance) {
                minDistance = dist;
                nearest = element;
            }
        }

        return nearest;
    }

    /**
     * Query elements with filters
     */
    async query(screenshot: string, query: ElementQuery): Promise<DetectedElement[]> {
        let elements = await this.detectAll(screenshot);

        // Filter by type
        if (query.type) {
            const types = Array.isArray(query.type) ? query.type : [query.type];
            elements = elements.filter((e) => types.includes(e.type));
        }

        // Filter by text
        if (query.text) {
            const searchText = query.text.toLowerCase();
            elements = elements.filter((e) =>
                e.label.toLowerCase().includes(searchText)
            );
        }

        // Filter by region
        if (query.inRegion) {
            const { x, y, width, height } = query.inRegion;
            elements = elements.filter((e) =>
                e.center.x >= x && e.center.x <= x + width &&
                e.center.y >= y && e.center.y <= y + height
            );
        }

        // Filter by proximity
        if (query.near) {
            const maxDist = query.near.maxDistance || 100;
            elements = elements.filter((e) =>
                this.distance(query.near!, e.center) <= maxDist
            );
            // Sort by distance
            elements.sort((a, b) =>
                this.distance(query.near!, a.center) - this.distance(query.near!, b.center)
            );
        }

        return elements;
    }

    /**
     * Get element at specific coordinates
     */
    async getElementAt(screenshot: string, x: number, y: number): Promise<DetectedElement | null> {
        const prompt = `What UI element is at approximately position (${x}, ${y}) in this screenshot?

Describe:
- Element type (button, link, text, input, etc.)
- The text or label on/near the element
- Whether it's clickable/interactive

Respond in JSON:
{
  "type": "button|link|text|etc",
  "label": "Element text",
  "interactive": true/false,
  "confidence": 0.0-1.0
}`;

        try {
            const response = await this.ollama.analyze(screenshot, prompt);
            const parsed = this.parseJsonResponse(response);

            if (!parsed) return null;

            return {
                type: parsed.type || 'other',
                label: parsed.label || '',
                bounds: { x: x - 25, y: y - 15, width: 50, height: 30 },
                center: { x, y },
                confidence: parsed.confidence || 0.5,
                isInteractive: parsed.interactive ?? true,
            };
        } catch (error) {
            return null;
        }
    }

    // Private helpers

    private parseElementsResponse(response: string): DetectedElement[] {
        const json = this.parseJsonResponse(response);
        if (!json?.elements || !Array.isArray(json.elements)) {
            return [];
        }

        return json.elements.map((e: any) => ({
            type: this.normalizeElementType(e.type),
            label: e.label || e.text || '',
            bounds: {
                x: (e.x || 0) - (e.width || 50) / 2,
                y: (e.y || 0) - (e.height || 30) / 2,
                width: e.width || 50,
                height: e.height || 30,
            },
            center: { x: e.x || 0, y: e.y || 0 },
            confidence: e.confidence || 0.5,
            isInteractive: e.interactive ?? (e.type !== 'text' && e.type !== 'image'),
        }));
    }

    private parseSingleElementResponse(response: string): DetectedElement | null {
        const json = this.parseJsonResponse(response);

        if (!json || json.found === false) {
            return null;
        }

        const element = json.element || json;

        return {
            type: this.normalizeElementType(element.type),
            label: element.label || element.actualText || '',
            bounds: {
                x: (element.x || 0) - (element.width || 50) / 2,
                y: (element.y || 0) - (element.height || 30) / 2,
                width: element.width || 50,
                height: element.height || 30,
            },
            center: { x: element.x || 0, y: element.y || 0 },
            confidence: element.confidence || 0.5,
            isInteractive: true,
        };
    }

    private parseJsonResponse(response: string): any {
        try {
            return JSON.parse(response);
        } catch {
            const match = response.match(/\{[\s\S]*\}/);
            if (match) {
                try {
                    return JSON.parse(match[0]);
                } catch {
                    return null;
                }
            }
            return null;
        }
    }

    private normalizeElementType(type: string): ElementType {
        const typeMap: Record<string, ElementType> = {
            'button': 'button',
            'btn': 'button',
            'link': 'link',
            'anchor': 'link',
            'a': 'link',
            'input': 'input',
            'textfield': 'input',
            'text-input': 'input',
            'checkbox': 'checkbox',
            'radio': 'radio',
            'dropdown': 'dropdown',
            'select': 'dropdown',
            'menu': 'menu',
            'tab': 'tab',
            'icon': 'icon',
            'text': 'text',
            'label': 'text',
            'image': 'image',
            'img': 'image',
            'list-item': 'list-item',
            'li': 'list-item',
            'heading': 'heading',
            'h1': 'heading',
            'h2': 'heading',
            'h3': 'heading',
        };

        return typeMap[type?.toLowerCase()] || 'other';
    }

    private hashScreenshot(screenshot: string): string {
        let hash = 0;
        const sample = screenshot.slice(-1000); // Use last 1000 chars
        for (let i = 0; i < sample.length; i++) {
            hash = ((hash << 5) - hash) + sample.charCodeAt(i);
            hash = hash & hash;
        }
        return hash.toString();
    }

    private distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }

    /**
     * Clear detection cache
     */
    clearCache(): void {
        this.cache.clear();
    }
}
