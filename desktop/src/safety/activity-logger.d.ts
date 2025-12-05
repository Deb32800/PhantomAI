export interface ActivityLogEntry {
    id: string;
    timestamp: string;
    action: string;
    details: string;
    status: 'success' | 'failed' | 'cancelled';
    screenshot?: string;
    metadata?: Record<string, any>;
}
export interface LogQuery {
    startDate?: Date;
    endDate?: Date;
    status?: 'success' | 'failed' | 'cancelled';
    action?: string;
    limit?: number;
    offset?: number;
}
/**
 * Activity Logger - Records all agent actions for audit trail
 */
export declare class ActivityLogger {
    private logDir;
    private currentLogFile;
    private screenshotDir;
    private maxLogAge;
    private maxEntriesPerFile;
    constructor();
    /**
     * Log an action
     */
    log(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>): Promise<string>;
    /**
     * Get log entries with optional filtering
     */
    getLog(limit?: number): Promise<ActivityLogEntry[]>;
    /**
     * Query log entries with filters
     */
    query(options?: LogQuery): Promise<ActivityLogEntry[]>;
    /**
     * Get a specific entry by ID
     */
    getEntry(id: string): Promise<ActivityLogEntry | null>;
    /**
     * Get entry with screenshot
     */
    getEntryWithScreenshot(id: string): Promise<{
        entry: ActivityLogEntry;
        screenshot?: string;
    } | null>;
    /**
     * Clear all logs
     */
    clear(): Promise<void>;
    /**
     * Clear old logs (older than maxLogAge days)
     */
    cleanOldLogs(): Promise<number>;
    /**
     * Get log statistics
     */
    getStats(): Promise<{
        totalEntries: number;
        successCount: number;
        failedCount: number;
        cancelledCount: number;
        oldestEntry: string | null;
        newestEntry: string | null;
        logFilesCount: number;
        totalSize: number;
    }>;
    /**
     * Export logs to JSON or CSV
     */
    export(format: 'json' | 'csv', options?: LogQuery): Promise<string>;
    private ensureDirectories;
    private getLogFilePath;
    private getLogFiles;
    private appendToLog;
    private readLogFile;
    private saveScreenshot;
    private generateId;
}
//# sourceMappingURL=activity-logger.d.ts.map