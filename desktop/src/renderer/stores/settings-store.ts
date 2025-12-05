import { create } from 'zustand';

interface SettingsState {
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

    // Actions
    loadSettings: () => Promise<void>;
    updateSettings: (settings: Partial<SettingsState>) => Promise<void>;
    resetSettings: () => Promise<void>;
}

const defaultSettings = {
    theme: 'dark' as const,
    ollamaUrl: 'http://localhost:11434',
    defaultModel: 'llava:13b',
    voiceEnabled: false,
    confirmDestructiveActions: true,
    maxActionsPerMinute: 60,
    startOnBoot: false,
    startMinimized: false,
    blockedSites: [],
    blockedApps: [],
};

export const useSettingsStore = create<SettingsState>((set) => ({
    ...defaultSettings,

    loadSettings: async () => {
        try {
            const settings = await window.phantom?.getSettings();
            if (settings) {
                set(settings);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    },

    updateSettings: async (updates) => {
        try {
            await window.phantom?.updateSettings(updates);
            set(updates);
        } catch (error) {
            console.error('Failed to update settings:', error);
        }
    },

    resetSettings: async () => {
        await window.phantom?.updateSettings(defaultSettings);
        set(defaultSettings);
    },
}));
