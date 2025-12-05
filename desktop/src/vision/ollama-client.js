"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaClient = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Ollama Client - Interface with local Ollama AI server
 */
class OllamaClient {
    client;
    baseUrl;
    defaultModel;
    timeout = 120000; // 2 minutes
    constructor(baseUrl = 'http://localhost:11434', defaultModel = 'llava:13b') {
        this.baseUrl = baseUrl;
        this.defaultModel = defaultModel;
        this.client = axios_1.default.create({
            baseURL: baseUrl,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    /**
     * Check if Ollama server is running
     */
    async getStatus() {
        try {
            const response = await this.client.get('/api/version');
            const models = await this.listModels();
            return {
                isRunning: true,
                version: response.data?.version || 'unknown',
                modelsLoaded: models,
            };
        }
        catch (error) {
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
    async listModels() {
        try {
            const response = await this.client.get('/api/tags');
            return (response.data?.models || []).map((m) => m.name);
        }
        catch (error) {
            return [];
        }
    }
    /**
     * Get detailed model info
     */
    async getModelInfo(modelName) {
        try {
            const response = await this.client.post('/api/show', {
                name: modelName,
            });
            return response.data;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Pull (download) a model
     */
    async pullModel(modelName, onProgress) {
        try {
            const response = await this.client.post('/api/pull', {
                name: modelName,
                stream: true,
            }, {
                responseType: 'stream',
                timeout: 0, // No timeout for downloads
            });
            return new Promise((resolve, reject) => {
                let lastProgress = 0;
                response.data.on('data', (chunk) => {
                    const lines = chunk.toString().split('\n').filter(Boolean);
                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);
                            if (data.completed && data.total) {
                                const progress = Math.round((data.completed / data.total) * 100);
                                if (progress !== lastProgress) {
                                    lastProgress = progress;
                                    onProgress?.(progress);
                                }
                            }
                            if (data.status === 'success') {
                                resolve(true);
                            }
                        }
                        catch {
                            // Ignore parse errors
                        }
                    }
                });
                response.data.on('end', () => resolve(true));
                response.data.on('error', reject);
            });
        }
        catch (error) {
            throw new Error(`Failed to pull model: ${error.message}`);
        }
    }
    /**
     * Delete a model
     */
    async deleteModel(modelName) {
        try {
            await this.client.delete('/api/delete', {
                data: { name: modelName },
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Analyze an image with vision model
     */
    async analyze(imageBase64, prompt, model) {
        const modelName = model || this.defaultModel;
        // Ensure model supports vision
        const visionModels = ['llava', 'bakllava', 'qwen-vl', 'qwen2-vl', 'llava-llama3', 'moondream'];
        const isVisionModel = visionModels.some((vm) => modelName.toLowerCase().includes(vm));
        if (!isVisionModel) {
            console.warn(`Model ${modelName} may not support vision. Consider using llava or similar.`);
        }
        // Remove data URL prefix if present
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        try {
            const response = await this.client.post('/api/generate', {
                model: modelName,
                prompt,
                images: [cleanBase64],
                stream: false,
                options: {
                    temperature: 0.3,
                    num_predict: 1024,
                },
            });
            return response.data?.response || '';
        }
        catch (error) {
            const err = error;
            if (err.code === 'ECONNREFUSED') {
                throw new Error('Ollama server is not running. Please start Ollama.');
            }
            throw new Error(`Vision analysis failed: ${err.message}`);
        }
    }
    /**
     * Generate text completion
     */
    async complete(prompt, model, options) {
        const modelName = model || this.defaultModel;
        try {
            const response = await this.client.post('/api/generate', {
                model: modelName,
                prompt,
                stream: false,
                options: {
                    temperature: options?.temperature ?? 0.7,
                    top_p: options?.top_p ?? 0.9,
                    top_k: options?.top_k ?? 40,
                    num_predict: options?.num_predict ?? 512,
                    stop: options?.stop,
                },
            });
            return response.data?.response || '';
        }
        catch (error) {
            const err = error;
            if (err.code === 'ECONNREFUSED') {
                throw new Error('Ollama server is not running. Please start Ollama.');
            }
            throw new Error(`Text completion failed: ${err.message}`);
        }
    }
    /**
     * Chat completion (multi-turn conversation)
     */
    async chat(messages, model, options) {
        const modelName = model || this.defaultModel;
        // Clean images in messages
        const cleanedMessages = messages.map((msg) => ({
            ...msg,
            images: msg.images?.map((img) => img.replace(/^data:image\/\w+;base64,/, '')),
        }));
        try {
            const response = await this.client.post('/api/chat', {
                model: modelName,
                messages: cleanedMessages,
                stream: false,
                options: {
                    temperature: options?.temperature ?? 0.7,
                    top_p: options?.top_p ?? 0.9,
                    num_predict: options?.num_predict ?? 1024,
                },
            });
            return response.data?.message?.content || '';
        }
        catch (error) {
            const err = error;
            if (err.code === 'ECONNREFUSED') {
                throw new Error('Ollama server is not running. Please start Ollama.');
            }
            throw new Error(`Chat completion failed: ${err.message}`);
        }
    }
    /**
     * Stream generation with callback
     */
    async stream(prompt, onToken, model, images) {
        const modelName = model || this.defaultModel;
        const cleanedImages = images?.map((img) => img.replace(/^data:image\/\w+;base64,/, ''));
        const response = await this.client.post('/api/generate', {
            model: modelName,
            prompt,
            images: cleanedImages,
            stream: true,
        }, {
            responseType: 'stream',
        });
        return new Promise((resolve, reject) => {
            response.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n').filter(Boolean);
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.response) {
                            onToken(data.response);
                        }
                        if (data.done) {
                            resolve();
                        }
                    }
                    catch {
                        // Ignore parse errors
                    }
                }
            });
            response.data.on('error', reject);
        });
    }
    /**
     * Get embeddings for text
     */
    async embed(text, model = 'nomic-embed-text') {
        try {
            const response = await this.client.post('/api/embeddings', {
                model,
                prompt: text,
            });
            return response.data?.embedding || [];
        }
        catch (error) {
            throw new Error(`Embedding failed: ${error.message}`);
        }
    }
    /**
     * Update base URL
     */
    setBaseUrl(url) {
        this.baseUrl = url;
        this.client = axios_1.default.create({
            baseURL: url,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    /**
     * Update default model
     */
    setDefaultModel(model) {
        this.defaultModel = model;
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return {
            baseUrl: this.baseUrl,
            defaultModel: this.defaultModel,
        };
    }
}
exports.OllamaClient = OllamaClient;
//# sourceMappingURL=ollama-client.js.map