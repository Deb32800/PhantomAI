import Store from 'electron-store';

export interface OllamaModel {
    name: string;
    size: number;
    digest: string;
    modified_at: string;
}

export interface OllamaStatus {
    isRunning: boolean;
    version: string | null;
    modelsLoaded: string[];
}

export interface GenerateOptions {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    stop?: string[];
    stream?: boolean;
}

/**
 * Ollama Client - Interface with local Ollama AI server
 */
export class OllamaClient {
    private baseUrl: string;
    private defaultModel: string;

    constructor(storeOrUrl?: Store | string, defaultModel: string = 'llava:13b') {
        if (typeof storeOrUrl === 'string') {
            this.baseUrl = storeOrUrl;
        } else if (storeOrUrl) {
            this.baseUrl = (storeOrUrl.get('ollamaUrl', 'http://localhost:11434') as string);
        } else {
            this.baseUrl = 'http://localhost:11434';
        }
        this.defaultModel = defaultModel;
    }

    /**
     * Check if Ollama server is running
     */
    async isRunning(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/version`);
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Get Ollama status
     */
    async getStatus(): Promise<OllamaStatus> {
        try {
            const response = await fetch(`${this.baseUrl}/api/version`);
            const data = await response.json();
            const models = await this.listModels();

            return {
                isRunning: true,
                version: data?.version || 'unknown',
                modelsLoaded: models.map(m => m.name),
            };
        } catch {
            return {
                isRunning: false,
                version: null,
                modelsLoaded: [],
            };
        }
    }

    /**
     * List available models
     */
    async listModels(): Promise<OllamaModel[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            const data = await response.json();
            return data?.models || [];
        } catch {
            return [];
        }
    }

    /**
     * Chat completion
     */
    async chat(
        messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
        options?: { model?: string; temperature?: number }
    ): Promise<string> {
        const model = options?.model || this.defaultModel;

        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    messages,
                    stream: false,
                    options: {
                        temperature: options?.temperature ?? 0.7,
                    },
                }),
            });

            const data = await response.json();
            return data?.message?.content || '';
        } catch (error) {
            throw new Error(`Chat failed: ${(error as Error).message}`);
        }
    }

    /**
     * Analyze image with vision model (alias for compatibility)
     */
    async analyze(imageBase64: string, prompt: string, model?: string): Promise<string> {
        return this.analyzeImage(imageBase64, prompt, { model });
    }

    /**
     * Analyze image with vision model
     */
    async analyzeImage(
        imageBase64: string,
        prompt: string,
        options?: { model?: string }
    ): Promise<string> {
        const model = options?.model || this.defaultModel;
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        try {
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    prompt,
                    images: [cleanBase64],
                    stream: false,
                    options: {
                        temperature: 0.3,
                        num_predict: 1024,
                    },
                }),
            });

            const data = await response.json();
            return data?.response || '';
        } catch (error) {
            throw new Error(`Vision analysis failed: ${(error as Error).message}`);
        }
    }

    /**
     * Stream chat responses
     */
    async *streamChat(
        messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
        options?: { model?: string }
    ): AsyncGenerator<string> {
        const model = options?.model || this.defaultModel;

        const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages,
                stream: true,
            }),
        });

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(Boolean);

            for (const line of lines) {
                try {
                    const data = JSON.parse(line);
                    if (data.message?.content) {
                        yield data.message.content;
                    }
                } catch {
                    // Skip invalid JSON
                }
            }
        }
    }

    /**
     * Text completion (alias for generate)
     */
    async complete(prompt: string, options?: GenerateOptions & { model?: string }): Promise<string> {
        return this.generate(prompt, options);
    }

    /**
     * Generate text
     */
    async generate(prompt: string, options?: GenerateOptions & { model?: string }): Promise<string> {
        const model = options?.model || this.defaultModel;

        try {
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    prompt,
                    stream: false,
                    options: {
                        temperature: options?.temperature ?? 0.7,
                        top_p: options?.top_p ?? 0.9,
                        num_predict: options?.num_predict ?? 512,
                    },
                }),
            });

            const data = await response.json();
            return data?.response || '';
        } catch (error) {
            throw new Error(`Generation failed: ${(error as Error).message}`);
        }
    }

    /**
     * Update base URL
     */
    setBaseUrl(url: string): void {
        this.baseUrl = url;
    }

    /**
     * Update default model
     */
    setDefaultModel(model: string): void {
        this.defaultModel = model;
    }
}
