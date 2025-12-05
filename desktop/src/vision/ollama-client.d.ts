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
export declare class OllamaClient {
    private client;
    private baseUrl;
    private defaultModel;
    private timeout;
    constructor(baseUrl?: string, defaultModel?: string);
    /**
     * Check if Ollama server is running
     */
    getStatus(): Promise<OllamaStatus>;
    /**
     * List available models
     */
    listModels(): Promise<string[]>;
    /**
     * Get detailed model info
     */
    getModelInfo(modelName: string): Promise<any>;
    /**
     * Pull (download) a model
     */
    pullModel(modelName: string, onProgress?: (progress: number) => void): Promise<boolean>;
    /**
     * Delete a model
     */
    deleteModel(modelName: string): Promise<boolean>;
    /**
     * Analyze an image with vision model
     */
    analyze(imageBase64: string, prompt: string, model?: string): Promise<string>;
    /**
     * Generate text completion
     */
    complete(prompt: string, model?: string, options?: GenerateOptions): Promise<string>;
    /**
     * Chat completion (multi-turn conversation)
     */
    chat(messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
        images?: string[];
    }>, model?: string, options?: GenerateOptions): Promise<string>;
    /**
     * Stream generation with callback
     */
    stream(prompt: string, onToken: (token: string) => void, model?: string, images?: string[]): Promise<void>;
    /**
     * Get embeddings for text
     */
    embed(text: string, model?: string): Promise<number[]>;
    /**
     * Update base URL
     */
    setBaseUrl(url: string): void;
    /**
     * Update default model
     */
    setDefaultModel(model: string): void;
    /**
     * Get current configuration
     */
    getConfig(): {
        baseUrl: string;
        defaultModel: string;
    };
}
//# sourceMappingURL=ollama-client.d.ts.map