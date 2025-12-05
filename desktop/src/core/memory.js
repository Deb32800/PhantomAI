"use strict";
/**
 * Agent Memory - Manages conversation history and context
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentMemory = void 0;
class AgentMemory {
    conversationHistory = [];
    shortTermMemory = [];
    longTermMemory = new Map();
    snapshots = [];
    maxConversationLength = 100;
    maxSnapshots = 20;
    constructor() {
        this.loadLongTermMemory();
    }
    // ==========================================
    // Conversation History
    // ==========================================
    /**
     * Add an entry to conversation history
     */
    addEntry(entry) {
        this.conversationHistory.push(entry);
        // Trim if too long
        if (this.conversationHistory.length > this.maxConversationLength) {
            // Keep system messages and recent messages
            const systemMessages = this.conversationHistory.filter((e) => e.role === 'system');
            const recentMessages = this.conversationHistory.slice(-50);
            this.conversationHistory = [...systemMessages, ...recentMessages];
        }
    }
    /**
     * Get recent conversation history
     */
    getRecentHistory(count = 10) {
        return this.conversationHistory.slice(-count);
    }
    /**
     * Get full conversation as formatted string
     */
    getFormattedHistory(count) {
        const entries = count ? this.getRecentHistory(count) : this.conversationHistory;
        return entries
            .map((entry) => {
            const role = entry.role.charAt(0).toUpperCase() + entry.role.slice(1);
            return `[${role}]: ${entry.content}`;
        })
            .join('\n');
    }
    /**
     * Search conversation history
     */
    searchHistory(query) {
        const lowerQuery = query.toLowerCase();
        return this.conversationHistory.filter((entry) => entry.content.toLowerCase().includes(lowerQuery));
    }
    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
    }
    // ==========================================
    // Short-term Context
    // ==========================================
    /**
     * Set a context value (automatically expires)
     */
    setContext(key, value, ttlSeconds = 300) {
        const expiresAt = Date.now() + ttlSeconds * 1000;
        const existingIndex = this.shortTermMemory.findIndex((e) => e.key === key);
        if (existingIndex >= 0) {
            this.shortTermMemory[existingIndex] = { key, value, expiresAt };
        }
        else {
            this.shortTermMemory.push({ key, value, expiresAt });
        }
    }
    /**
     * Get a context value
     */
    getContext(key) {
        this.cleanExpiredContext();
        const entry = this.shortTermMemory.find((e) => e.key === key);
        return entry?.value;
    }
    /**
     * Get all current context
     */
    getAllContext() {
        this.cleanExpiredContext();
        const context = {};
        for (const entry of this.shortTermMemory) {
            context[entry.key] = entry.value;
        }
        return context;
    }
    /**
     * Remove expired context entries
     */
    cleanExpiredContext() {
        const now = Date.now();
        this.shortTermMemory = this.shortTermMemory.filter((entry) => !entry.expiresAt || entry.expiresAt > now);
    }
    // ==========================================
    // Long-term Memory
    // ==========================================
    /**
     * Store persistent memory
     */
    remember(key, value) {
        this.longTermMemory.set(key, value);
        this.saveLongTermMemory();
    }
    /**
     * Retrieve persistent memory
     */
    recall(key) {
        return this.longTermMemory.get(key);
    }
    /**
     * Check if memory exists
     */
    hasMemory(key) {
        return this.longTermMemory.has(key);
    }
    /**
     * Forget a memory
     */
    forget(key) {
        this.longTermMemory.delete(key);
        this.saveLongTermMemory();
    }
    /**
     * Save long-term memory to storage
     */
    saveLongTermMemory() {
        try {
            const data = JSON.stringify(Array.from(this.longTermMemory.entries()));
            // In production, use electron-store or similar
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('phantom-ai-memory', data);
            }
        }
        catch (error) {
            console.error('Failed to save long-term memory:', error);
        }
    }
    /**
     * Load long-term memory from storage
     */
    loadLongTermMemory() {
        try {
            if (typeof localStorage !== 'undefined') {
                const data = localStorage.getItem('phantom-ai-memory');
                if (data) {
                    this.longTermMemory = new Map(JSON.parse(data));
                }
            }
        }
        catch (error) {
            console.error('Failed to load long-term memory:', error);
        }
    }
    // ==========================================
    // Screen Snapshots
    // ==========================================
    /**
     * Save a screen snapshot
     */
    addSnapshot(snapshot) {
        this.snapshots.push(snapshot);
        if (this.snapshots.length > this.maxSnapshots) {
            this.snapshots.shift();
        }
    }
    /**
     * Get recent snapshots
     */
    getRecentSnapshots(count = 5) {
        return this.snapshots.slice(-count);
    }
    /**
     * Find snapshot closest to timestamp
     */
    findSnapshotNear(timestamp) {
        if (this.snapshots.length === 0)
            return null;
        return this.snapshots.reduce((closest, snapshot) => {
            const closestDiff = Math.abs(closest.timestamp - timestamp);
            const snapshotDiff = Math.abs(snapshot.timestamp - timestamp);
            return snapshotDiff < closestDiff ? snapshot : closest;
        });
    }
    // ==========================================
    // Summarization
    // ==========================================
    /**
     * Generate a summary of recent activity
     */
    getSummary() {
        const recentHistory = this.getRecentHistory(10);
        const currentContext = this.getAllContext();
        let summary = 'Recent Activity:\n';
        for (const entry of recentHistory) {
            if (entry.role === 'user') {
                summary += `- User requested: ${entry.content.slice(0, 100)}\n`;
            }
            else if (entry.metadata?.action) {
                summary += `- Executed: ${entry.metadata.action}\n`;
            }
        }
        if (Object.keys(currentContext).length > 0) {
            summary += '\nCurrent Context:\n';
            for (const [key, value] of Object.entries(currentContext)) {
                summary += `- ${key}: ${JSON.stringify(value).slice(0, 50)}\n`;
            }
        }
        return summary;
    }
    /**
     * Clear all memory
     */
    clear() {
        this.conversationHistory = [];
        this.shortTermMemory = [];
        this.snapshots = [];
        // Optionally clear long-term memory
        // this.longTermMemory.clear();
        // this.saveLongTermMemory();
    }
    /**
     * Export memory for debugging
     */
    export() {
        return {
            conversationHistory: this.conversationHistory,
            shortTermMemory: this.shortTermMemory,
            longTermMemory: Array.from(this.longTermMemory.entries()),
            snapshots: this.snapshots,
        };
    }
}
exports.AgentMemory = AgentMemory;
//# sourceMappingURL=memory.js.map