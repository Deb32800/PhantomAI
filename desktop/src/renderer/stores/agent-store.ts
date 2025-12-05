import { create } from 'zustand';

interface AgentState {
    isRunning: boolean;
    currentTask: string | null;
    currentStep: string | null;
    progress: number;
    stepsCompleted: number;
    totalSteps: number;
    errors: string[];
    lastScreenshot: string | null;

    // Actions
    executeCommand: (command: string) => Promise<void>;
    stopExecution: () => Promise<void>;
    confirmAction: (confirmed: boolean) => void;
    initializeStore: () => void;
    reset: () => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
    isRunning: false,
    currentTask: null,
    currentStep: null,
    progress: 0,
    stepsCompleted: 0,
    totalSteps: 0,
    errors: [],
    lastScreenshot: null,

    executeCommand: async (command: string) => {
        set({
            isRunning: true,
            currentTask: command,
            progress: 0,
            stepsCompleted: 0,
            errors: [],
        });

        try {
            await window.phantom?.executeCommand(command);
        } catch (error: any) {
            set((state) => ({
                errors: [...state.errors, error.message],
            }));
        } finally {
            set({ isRunning: false, currentTask: null });
        }
    },

    stopExecution: async () => {
        await window.phantom?.stopExecution();
        set({
            isRunning: false,
            currentTask: null,
            currentStep: null,
        });
    },

    confirmAction: (confirmed: boolean) => {
        // This would be called from a confirmation dialog
        // The actual confirmation is handled via IPC
    },

    initializeStore: () => {
        // Listen for agent updates from main process
        const unsubscribe = window.phantom?.onAgentUpdate((update) => {
            set({
                currentStep: update.message,
                progress: update.progress ?? get().progress,
                lastScreenshot: update.screenshot ?? get().lastScreenshot,
            });

            if (update.type === 'completed' || update.type === 'error') {
                set({ isRunning: false });
            }
        });

        // Store unsubscribe for cleanup
        return unsubscribe;
    },

    reset: () => {
        set({
            isRunning: false,
            currentTask: null,
            currentStep: null,
            progress: 0,
            stepsCompleted: 0,
            totalSteps: 0,
            errors: [],
            lastScreenshot: null,
        });
    },
}));
