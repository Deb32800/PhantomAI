// Type definitions for Phantom AI renderer process

export interface PhantomAPI {
    // Window controls
    closeWindow: () => void;
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    hideOverlay: () => void;

    // AI Provider
    getAIProvider: () => Promise<'ollama' | 'openrouter'>;
    setAIProvider: (provider: 'ollama' | 'openrouter') => Promise<void>;
    getAIModel: () => Promise<string>;
    setAIModel: (model: string) => Promise<void>;
    getAIStatus: () => Promise<{ provider: string; ready: boolean; model: string; details: any }>;
    getAvailableModels: (provider?: 'ollama' | 'openrouter') => Promise<Array<{ id: string; name: string; vision?: boolean }>>;
    chat: (messages: any[], options?: any) => Promise<string>;
    analyzeImage: (image: string, prompt: string, options?: any) => Promise<string>;

    // OpenRouter
    hasOpenRouterKey: () => Promise<boolean>;
    setOpenRouterKey: (apiKey: string) => Promise<void>;
    getOpenRouterCredits: () => Promise<{ credits: number; usage: number }>;

    // Ollama
    checkOllamaStatus: () => Promise<{ isRunning: boolean; version: string | null }>;
    setOllamaUrl: (url: string) => Promise<void>;

    // Voice
    initializeVoice: () => Promise<boolean>;
    startVoiceRecording: () => Promise<void>;
    stopVoiceRecording: () => Promise<string>;
    togglePushToTalk: () => Promise<string | null>;
    calibrateVoice: () => Promise<number>;
    getWhisperModels: () => Array<{ model: string; downloaded: boolean; size: string }>;
    downloadWhisperModel: (model: string) => Promise<void>;
    setVoiceMuted: (muted: boolean) => void;
    onVolumeChange: (callback: (volume: number) => void) => () => void;

    // Workflow
    listWorkflows: () => Promise<Array<{ id: string; name: string; steps: number; createdAt: string }>>;
    getWorkflow: (id: string) => Promise<any>;
    startWorkflowRecording: (name: string) => Promise<void>;
    stopWorkflowRecording: (name: string, description?: string) => Promise<any>;
    cancelWorkflowRecording: () => void;
    isWorkflowRecording: () => boolean;
    playWorkflow: (id: string, options?: any) => Promise<boolean>;
    pauseWorkflow: () => void;
    resumeWorkflow: () => void;
    stopWorkflow: () => void;
    deleteWorkflow: (id: string) => Promise<void>;
    duplicateWorkflow: (id: string, newName: string) => Promise<any>;
    exportWorkflow: (id: string) => Promise<string>;
    scheduleWorkflow: (id: string, schedule: any) => Promise<void>;

    // Plugin
    getInstalledPlugins: () => Promise<Array<any>>;
    getLoadedPlugins: () => Array<any>;
    installPlugin: (source: string) => Promise<any>;
    uninstallPlugin: (id: string) => Promise<void>;
    enablePlugin: (id: string) => Promise<void>;
    disablePlugin: (id: string) => Promise<void>;
    getPluginSettings: (id: string) => any;
    updatePluginSettings: (id: string, settings: any) => void;
    executePluginCommand: (command: string, args: any) => Promise<any>;
    getPluginCommands: () => string[];

    // Agent
    executeCommand: (command: string) => Promise<{ success: boolean; result?: any; error?: string }>;
    stopExecution: () => Promise<void>;
    confirmAction: (confirmed: boolean) => void;
    onAgentUpdate: (callback: (update: any) => void) => () => void;

    // Activity
    getActivityLog: (limit?: number) => Promise<Array<any>>;
    clearActivityLog: () => Promise<void>;
    exportActivityLog: (format: 'json' | 'csv') => Promise<string>;

    // Settings
    getSettings: () => Promise<any>;
    updateSettings: (settings: any) => Promise<void>;

    // License
    getLicenseStatus: () => Promise<{ isPro: boolean; isValid: boolean; daysRemaining: number; licenseKey: string | null }>;
    activateLicense: (key: string) => Promise<boolean>;

    // System
    showNotification: (title: string, body: string) => void;
    openExternal: (url: string) => Promise<void>;
    showOpenDialog: (options: any) => Promise<string[]>;
    showSaveDialog: (options: any) => Promise<string | undefined>;
    getAppPath: () => string;
}

declare global {
    interface Window {
        phantom?: PhantomAPI;
    }
}

export { };
