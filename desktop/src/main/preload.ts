import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Types for the exposed API
export interface PhantomAPI {
    // Agent commands
    executeCommand: (command: string) => Promise<void>;
    stopExecution: () => Promise<void>;
    getAgentStatus: () => Promise<AgentStatus>;

    // Screen capture
    captureScreen: () => Promise<string>;
    captureRegion: (x: number, y: number, width: number, height: number) => Promise<string>;

    // Settings
    getSettings: () => Promise<Settings>;
    updateSettings: (settings: Partial<Settings>) => Promise<void>;

    // License
    getLicenseStatus: () => Promise<LicenseStatus>;
    activateLicense: (key: string) => Promise<boolean>;

    // Ollama
    checkOllamaStatus: () => Promise<OllamaStatus>;
    getAvailableModels: () => Promise<string[]>;
    installModel: (modelName: string) => Promise<void>;

    // Voice
    startVoiceRecording: () => Promise<void>;
    stopVoiceRecording: () => Promise<string>;

    // Workflows
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<Workflow>;
    getWorkflows: () => Promise<Workflow[]>;
    runWorkflow: (id: string) => Promise<void>;

    // Activity
    getActivityLog: (limit?: number) => Promise<ActivityLogEntry[]>;
    clearActivityLog: () => Promise<void>;

    // Events
    onAgentUpdate: (callback: (update: AgentUpdate) => void) => () => void;
    onActionPreview: (callback: (action: ActionPreview) => void) => () => void;
    onNotification: (callback: (notification: Notification) => void) => () => void;

    // Window control
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    closeWindow: () => void;
    hideOverlay: () => void;
}

export interface AgentStatus {
    isRunning: boolean;
    currentTask: string | null;
    progress: number;
    stepsCompleted: number;
    totalSteps: number;
}

export interface Settings {
    theme: 'light' | 'dark' | 'system';
    ollamaUrl: string;
    defaultModel: string;
    voiceEnabled: boolean;
    confirmDestructiveActions: boolean;
    maxActionsPerMinute: number;
    startOnBoot: boolean;
    startMinimized: boolean;
    blockedSites: string[];
    blockedApps: string[];
}

export interface LicenseStatus {
    isValid: boolean;
    isPro: boolean;
    daysRemaining: number;
    licenseKey: string | null;
}

export interface OllamaStatus {
    isRunning: boolean;
    version: string | null;
    modelsLoaded: string[];
}

export interface Workflow {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    createdAt: string;
    lastRun: string | null;
}

export interface WorkflowStep {
    type: 'click' | 'type' | 'scroll' | 'wait' | 'screenshot';
    params: Record<string, any>;
    delay: number;
}

export interface ActivityLogEntry {
    id: string;
    timestamp: string;
    action: string;
    details: string;
    status: 'success' | 'failed' | 'cancelled';
    screenshot?: string;
}

export interface AgentUpdate {
    type: 'thinking' | 'executing' | 'completed' | 'error';
    message: string;
    progress?: number;
}

export interface ActionPreview {
    id: string;
    type: string;
    description: string;
    screenshot: string;
    requiresConfirmation: boolean;
}

export interface Notification {
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
}

// Expose protected methods
contextBridge.exposeInMainWorld('phantom', {
    // Agent commands
    executeCommand: (command: string) => ipcRenderer.invoke('agent:execute', command),
    stopExecution: () => ipcRenderer.invoke('agent:stop'),
    getAgentStatus: () => ipcRenderer.invoke('agent:status'),

    // Screen capture
    captureScreen: () => ipcRenderer.invoke('vision:captureScreen'),
    captureRegion: (x: number, y: number, width: number, height: number) =>
        ipcRenderer.invoke('vision:captureRegion', { x, y, width, height }),

    // Settings
    getSettings: () => ipcRenderer.invoke('settings:get'),
    updateSettings: (settings: Partial<Settings>) => ipcRenderer.invoke('settings:update', settings),

    // License
    getLicenseStatus: () => ipcRenderer.invoke('license:status'),
    activateLicense: (key: string) => ipcRenderer.invoke('license:activate', key),

    // Ollama
    checkOllamaStatus: () => ipcRenderer.invoke('ollama:status'),
    getAvailableModels: () => ipcRenderer.invoke('ollama:models'),
    installModel: (modelName: string) => ipcRenderer.invoke('ollama:install', modelName),

    // Voice
    startVoiceRecording: () => ipcRenderer.invoke('voice:start'),
    stopVoiceRecording: () => ipcRenderer.invoke('voice:stop'),

    // Workflows
    startRecording: () => ipcRenderer.invoke('workflow:startRecording'),
    stopRecording: () => ipcRenderer.invoke('workflow:stopRecording'),
    getWorkflows: () => ipcRenderer.invoke('workflow:list'),
    runWorkflow: (id: string) => ipcRenderer.invoke('workflow:run', id),

    // Activity
    getActivityLog: (limit?: number) => ipcRenderer.invoke('activity:log', limit),
    clearActivityLog: () => ipcRenderer.invoke('activity:clear'),

    // Events
    onAgentUpdate: (callback: (update: AgentUpdate) => void) => {
        const handler = (_event: IpcRendererEvent, update: AgentUpdate) => callback(update);
        ipcRenderer.on('agent:update', handler);
        return () => ipcRenderer.removeListener('agent:update', handler);
    },

    onActionPreview: (callback: (action: ActionPreview) => void) => {
        const handler = (_event: IpcRendererEvent, action: ActionPreview) => callback(action);
        ipcRenderer.on('agent:actionPreview', handler);
        return () => ipcRenderer.removeListener('agent:actionPreview', handler);
    },

    onNotification: (callback: (notification: Notification) => void) => {
        const handler = (_event: IpcRendererEvent, notification: Notification) => callback(notification);
        ipcRenderer.on('notification', handler);
        return () => ipcRenderer.removeListener('notification', handler);
    },

    // Window control
    minimizeWindow: () => ipcRenderer.send('window:minimize'),
    maximizeWindow: () => ipcRenderer.send('window:maximize'),
    closeWindow: () => ipcRenderer.send('window:close'),
    hideOverlay: () => ipcRenderer.send('overlay:hide'),
} as PhantomAPI);

// Type declaration for global window
declare global {
    interface Window {
        phantom: PhantomAPI;
    }
}
