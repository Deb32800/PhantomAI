import React, { useState, useEffect } from 'react';
import {
    CpuChipIcon,
    CloudIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowPathIcon,
    KeyIcon,
} from '@heroicons/react/24/outline';

interface AIModel {
    id: string;
    name: string;
    vision?: boolean;
    provider: 'ollama' | 'openrouter';
}

interface Props {
    onProviderChange?: (provider: 'ollama' | 'openrouter') => void;
    onModelChange?: (model: string) => void;
}

export function AIProviderSettings({ onProviderChange, onModelChange }: Props) {
    const [provider, setProvider] = useState<'ollama' | 'openrouter'>('ollama');
    const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [openrouterKey, setOpenrouterKey] = useState('');
    const [hasOpenrouterKey, setHasOpenrouterKey] = useState(false);
    const [credits, setCredits] = useState<{ credits: number; usage: number } | null>(null);
    const [models, setModels] = useState<AIModel[]>([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [isLoadingModels, setIsLoadingModels] = useState(false);

    useEffect(() => {
        loadInitialState();
    }, []);

    const loadInitialState = async () => {
        // Check Ollama
        try {
            const status = await window.phantom?.checkOllamaStatus();
            setOllamaStatus(status?.isRunning ? 'connected' : 'error');
        } catch {
            setOllamaStatus('error');
        }

        // Check OpenRouter
        const hasKey = await window.phantom?.hasOpenRouterKey();
        setHasOpenrouterKey(hasKey);

        if (hasKey) {
            const creds = await window.phantom?.getOpenRouterCredits();
            setCredits(creds);
        }

        // Get current provider/model
        const currentProvider = await window.phantom?.getAIProvider();
        const currentModel = await window.phantom?.getAIModel();

        if (currentProvider) setProvider(currentProvider);
        if (currentModel) setSelectedModel(currentModel);

        // Load models for current provider
        loadModels(currentProvider || 'ollama');
    };

    const loadModels = async (prov: 'ollama' | 'openrouter') => {
        setIsLoadingModels(true);
        try {
            const modelList = await window.phantom?.getAvailableModels(prov);
            setModels(modelList || []);
        } catch (error) {
            console.error('Failed to load models:', error);
        }
        setIsLoadingModels(false);
    };

    const handleProviderChange = async (newProvider: 'ollama' | 'openrouter') => {
        setProvider(newProvider);
        await window.phantom?.setAIProvider(newProvider);
        onProviderChange?.(newProvider);
        loadModels(newProvider);
    };

    const handleModelChange = async (modelId: string) => {
        setSelectedModel(modelId);
        await window.phantom?.setAIModel(modelId);
        onModelChange?.(modelId);
    };

    const handleSaveApiKey = async () => {
        if (!openrouterKey.trim()) return;

        await window.phantom?.setOpenRouterKey(openrouterKey);
        setHasOpenrouterKey(true);
        setOpenrouterKey('');

        const creds = await window.phantom?.getOpenRouterCredits();
        setCredits(creds);

        loadModels('openrouter');
    };

    return (
        <div className="space-y-6">
            {/* Provider Selection */}
            <div>
                <label className="form-label">AI Provider</label>
                <div className="grid grid-cols-2 gap-4">
                    {/* Ollama */}
                    <button
                        onClick={() => handleProviderChange('ollama')}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${provider === 'ollama'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <CpuChipIcon className="w-6 h-6" />
                            <span className="font-semibold">Ollama</span>
                            {ollamaStatus === 'connected' && (
                                <CheckCircleIcon className="w-5 h-5 text-success ml-auto" />
                            )}
                            {ollamaStatus === 'error' && (
                                <ExclamationCircleIcon className="w-5 h-5 text-error ml-auto" />
                            )}
                        </div>
                        <p className="text-sm text-secondary">
                            Local AI models. Private & free.
                        </p>
                    </button>

                    {/* OpenRouter */}
                    <button
                        onClick={() => handleProviderChange('openrouter')}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${provider === 'openrouter'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <CloudIcon className="w-6 h-6" />
                            <span className="font-semibold">OpenRouter</span>
                            {hasOpenrouterKey && (
                                <CheckCircleIcon className="w-5 h-5 text-success ml-auto" />
                            )}
                        </div>
                        <p className="text-sm text-secondary">
                            200+ cloud models including GPT-4, Claude, Gemini.
                        </p>
                    </button>
                </div>
            </div>

            {/* Provider-specific settings */}
            {provider === 'ollama' && (
                <div className="card">
                    <h3 className="font-semibold mb-4">Ollama Settings</h3>

                    {ollamaStatus === 'connected' ? (
                        <div className="flex items-center gap-2 text-success mb-4">
                            <CheckCircleIcon className="w-5 h-5" />
                            <span>Ollama is running</span>
                        </div>
                    ) : (
                        <div className="bg-warning/10 text-warning rounded-lg p-4 mb-4">
                            <p className="font-medium">Ollama not detected</p>
                            <p className="text-sm mt-1">
                                Install Ollama from{' '}
                                <a
                                    href="https://ollama.ai"
                                    target="_blank"
                                    rel="noopener"
                                    className="underline"
                                >
                                    ollama.ai
                                </a>
                            </p>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Ollama URL</label>
                        <input
                            type="text"
                            defaultValue="http://localhost:11434"
                            placeholder="http://localhost:11434"
                        />
                    </div>
                </div>
            )}

            {provider === 'openrouter' && (
                <div className="card">
                    <h3 className="font-semibold mb-4">OpenRouter Settings</h3>

                    {!hasOpenrouterKey ? (
                        <div className="form-group">
                            <label className="form-label">API Key</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                                    <input
                                        type="password"
                                        value={openrouterKey}
                                        onChange={(e) => setOpenrouterKey(e.target.value)}
                                        placeholder="sk-or-..."
                                        className="pl-10"
                                    />
                                </div>
                                <button className="btn btn-primary" onClick={handleSaveApiKey}>
                                    Save
                                </button>
                            </div>
                            <p className="form-hint">
                                Get your API key from{' '}
                                <a
                                    href="https://openrouter.ai/keys"
                                    target="_blank"
                                    rel="noopener"
                                    className="text-primary"
                                >
                                    openrouter.ai/keys
                                </a>
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-success">
                                <CheckCircleIcon className="w-5 h-5" />
                                <span>API key configured</span>
                            </div>

                            {credits && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-bg-secondary rounded-lg p-3">
                                        <div className="text-sm text-secondary">Credits</div>
                                        <div className="text-lg font-semibold">${credits.credits.toFixed(2)}</div>
                                    </div>
                                    <div className="bg-bg-secondary rounded-lg p-3">
                                        <div className="text-sm text-secondary">Used</div>
                                        <div className="text-lg font-semibold">${credits.usage.toFixed(2)}</div>
                                    </div>
                                </div>
                            )}

                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setHasOpenrouterKey(false)}
                            >
                                Change API Key
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Model Selection */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Model</h3>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => loadModels(provider)}
                        disabled={isLoadingModels}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isLoadingModels ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {isLoadingModels ? (
                    <div className="text-center py-8 text-secondary">
                        Loading models...
                    </div>
                ) : models.length === 0 ? (
                    <div className="text-center py-8 text-secondary">
                        No models available
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {models.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => handleModelChange(model.id)}
                                className={`w-full p-3 rounded-lg border text-left transition-all ${selectedModel === model.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{model.name}</div>
                                        <div className="text-xs text-secondary">{model.id}</div>
                                    </div>
                                    {model.vision && (
                                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                                            Vision
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
