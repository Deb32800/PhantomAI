/**
 * Agent Memory - Manages conversation history and context
 */
export interface ConversationEntry {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    metadata?: {
        action?: string;
        screenshot?: string;
        result?: string;
    };
}
export interface MemorySnapshot {
    screenState: string;
    activeWindow: string;
    timestamp: number;
}
export interface ContextEntry {
    key: string;
    value: any;
    expiresAt?: number;
}
export declare class AgentMemory {
    private conversationHistory;
    private shortTermMemory;
    private longTermMemory;
    private snapshots;
    private maxConversationLength;
    private maxSnapshots;
    constructor();
    /**
     * Add an entry to conversation history
     */
    addEntry(entry: ConversationEntry): void;
    /**
     * Get recent conversation history
     */
    getRecentHistory(count?: number): ConversationEntry[];
    /**
     * Get full conversation as formatted string
     */
    getFormattedHistory(count?: number): string;
    /**
     * Search conversation history
     */
    searchHistory(query: string): ConversationEntry[];
    /**
     * Clear conversation history
     */
    clearHistory(): void;
    /**
     * Set a context value (automatically expires)
     */
    setContext(key: string, value: any, ttlSeconds?: number): void;
    /**
     * Get a context value
     */
    getContext(key: string): any;
    /**
     * Get all current context
     */
    getAllContext(): Record<string, any>;
    /**
     * Remove expired context entries
     */
    private cleanExpiredContext;
    /**
     * Store persistent memory
     */
    remember(key: string, value: any): void;
    /**
     * Retrieve persistent memory
     */
    recall(key: string): any;
    /**
     * Check if memory exists
     */
    hasMemory(key: string): boolean;
    /**
     * Forget a memory
     */
    forget(key: string): void;
    /**
     * Save long-term memory to storage
     */
    private saveLongTermMemory;
    /**
     * Load long-term memory from storage
     */
    private loadLongTermMemory;
    /**
     * Save a screen snapshot
     */
    addSnapshot(snapshot: MemorySnapshot): void;
    /**
     * Get recent snapshots
     */
    getRecentSnapshots(count?: number): MemorySnapshot[];
    /**
     * Find snapshot closest to timestamp
     */
    findSnapshotNear(timestamp: number): MemorySnapshot | null;
    /**
     * Generate a summary of recent activity
     */
    getSummary(): string;
    /**
     * Clear all memory
     */
    clear(): void;
    /**
     * Export memory for debugging
     */
    export(): object;
}
//# sourceMappingURL=memory.d.ts.map