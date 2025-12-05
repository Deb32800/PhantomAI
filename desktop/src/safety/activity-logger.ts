import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

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
export class ActivityLogger {
    private logDir: string;
    private currentLogFile: string;
    private screenshotDir: string;
    private maxLogAge = 30; // days
    private maxEntriesPerFile = 10000;

    constructor() {
        const userDataPath = app?.getPath('userData') || '/tmp/phantom-ai';
        this.logDir = path.join(userDataPath, 'activity-logs');
        this.screenshotDir = path.join(userDataPath, 'activity-screenshots');

        this.ensureDirectories();
        this.currentLogFile = this.getLogFilePath();
    }

    /**
     * Log an action
     */
    async log(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>): Promise<string> {
        const id = this.generateId();
        const timestamp = new Date().toISOString();

        const fullEntry: ActivityLogEntry = {
            id,
            timestamp,
            ...entry,
        };

        // Save screenshot if provided
        if (entry.screenshot) {
            fullEntry.screenshot = await this.saveScreenshot(id, entry.screenshot);
        }

        // Append to log file
        await this.appendToLog(fullEntry);

        return id;
    }

    /**
     * Get log entries with optional filtering
     */
    async getLog(limit?: number): Promise<ActivityLogEntry[]> {
        return this.query({ limit: limit || 100 });
    }

    /**
     * Query log entries with filters
     */
    async query(options: LogQuery = {}): Promise<ActivityLogEntry[]> {
        const entries: ActivityLogEntry[] = [];
        const limit = options.limit || 100;
        const offset = options.offset || 0;

        // Get all log files sorted by date (newest first)
        const logFiles = this.getLogFiles().reverse();

        let skip = offset;
        let collected = 0;

        for (const file of logFiles) {
            if (collected >= limit) break;

            const fileEntries = await this.readLogFile(file);

            // Filter entries
            const filtered = fileEntries.filter((entry) => {
                if (options.status && entry.status !== options.status) return false;
                if (options.action && !entry.action.includes(options.action)) return false;
                if (options.startDate && new Date(entry.timestamp) < options.startDate) return false;
                if (options.endDate && new Date(entry.timestamp) > options.endDate) return false;
                return true;
            });

            // Handle pagination
            for (const entry of filtered.reverse()) { // newest first
                if (skip > 0) {
                    skip--;
                    continue;
                }

                if (collected >= limit) break;
                entries.push(entry);
                collected++;
            }
        }

        return entries;
    }

    /**
     * Get a specific entry by ID
     */
    async getEntry(id: string): Promise<ActivityLogEntry | null> {
        const logFiles = this.getLogFiles().reverse();

        for (const file of logFiles) {
            const entries = await this.readLogFile(file);
            const entry = entries.find((e) => e.id === id);
            if (entry) return entry;
        }

        return null;
    }

    /**
     * Get entry with screenshot
     */
    async getEntryWithScreenshot(id: string): Promise<{ entry: ActivityLogEntry; screenshot?: string } | null> {
        const entry = await this.getEntry(id);
        if (!entry) return null;

        let screenshot: string | undefined;
        if (entry.screenshot) {
            try {
                const screenshotPath = path.join(this.screenshotDir, entry.screenshot);
                if (fs.existsSync(screenshotPath)) {
                    const data = fs.readFileSync(screenshotPath);
                    screenshot = `data:image/png;base64,${data.toString('base64')}`;
                }
            } catch {
                // Screenshot not available
            }
        }

        return { entry, screenshot };
    }

    /**
     * Clear all logs
     */
    async clear(): Promise<void> {
        // Clear log files
        const logFiles = this.getLogFiles();
        for (const file of logFiles) {
            fs.unlinkSync(file);
        }

        // Clear screenshots
        if (fs.existsSync(this.screenshotDir)) {
            const screenshots = fs.readdirSync(this.screenshotDir);
            for (const file of screenshots) {
                fs.unlinkSync(path.join(this.screenshotDir, file));
            }
        }
    }

    /**
     * Clear old logs (older than maxLogAge days)
     */
    async cleanOldLogs(): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.maxLogAge);

        let deletedCount = 0;
        const logFiles = this.getLogFiles();

        for (const file of logFiles) {
            const stats = fs.statSync(file);
            if (stats.mtime < cutoffDate) {
                fs.unlinkSync(file);
                deletedCount++;
            }
        }

        // Clean old screenshots
        if (fs.existsSync(this.screenshotDir)) {
            const screenshots = fs.readdirSync(this.screenshotDir);
            for (const file of screenshots) {
                const filePath = path.join(this.screenshotDir, file);
                const stats = fs.statSync(filePath);
                if (stats.mtime < cutoffDate) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        return deletedCount;
    }

    /**
     * Get log statistics
     */
    async getStats(): Promise<{
        totalEntries: number;
        successCount: number;
        failedCount: number;
        cancelledCount: number;
        oldestEntry: string | null;
        newestEntry: string | null;
        logFilesCount: number;
        totalSize: number;
    }> {
        const logFiles = this.getLogFiles();
        let totalEntries = 0;
        let successCount = 0;
        let failedCount = 0;
        let cancelledCount = 0;
        let oldestEntry: string | null = null;
        let newestEntry: string | null = null;
        let totalSize = 0;

        for (const file of logFiles) {
            const stats = fs.statSync(file);
            totalSize += stats.size;

            const entries = await this.readLogFile(file);
            totalEntries += entries.length;

            for (const entry of entries) {
                if (entry.status === 'success') successCount++;
                else if (entry.status === 'failed') failedCount++;
                else if (entry.status === 'cancelled') cancelledCount++;

                if (!oldestEntry || entry.timestamp < oldestEntry) {
                    oldestEntry = entry.timestamp;
                }
                if (!newestEntry || entry.timestamp > newestEntry) {
                    newestEntry = entry.timestamp;
                }
            }
        }

        return {
            totalEntries,
            successCount,
            failedCount,
            cancelledCount,
            oldestEntry,
            newestEntry,
            logFilesCount: logFiles.length,
            totalSize,
        };
    }

    /**
     * Export logs to JSON or CSV
     */
    async export(format: 'json' | 'csv', options?: LogQuery): Promise<string> {
        const entries = await this.query({ ...options, limit: options?.limit || 10000 });

        if (format === 'json') {
            return JSON.stringify(entries, null, 2);
        }

        // CSV format
        const headers = ['id', 'timestamp', 'action', 'details', 'status'];
        const rows = entries.map((e) => [
            e.id,
            e.timestamp,
            `"${e.action.replace(/"/g, '""')}"`,
            `"${e.details.replace(/"/g, '""')}"`,
            e.status,
        ]);

        return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    // Private methods

    private ensureDirectories(): void {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }
    }

    private getLogFilePath(): string {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logDir, `activity-${date}.jsonl`);
    }

    private getLogFiles(): string[] {
        if (!fs.existsSync(this.logDir)) return [];

        const files = fs.readdirSync(this.logDir)
            .filter((f) => f.startsWith('activity-') && f.endsWith('.jsonl'))
            .map((f) => path.join(this.logDir, f))
            .sort();

        return files;
    }

    private async appendToLog(entry: ActivityLogEntry): Promise<void> {
        const logFile = this.getLogFilePath();
        const line = JSON.stringify(entry) + '\n';
        fs.appendFileSync(logFile, line);
    }

    private async readLogFile(filePath: string): Promise<ActivityLogEntry[]> {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.trim().split('\n').filter(Boolean);

            return lines.map((line) => {
                try {
                    return JSON.parse(line);
                } catch {
                    return null;
                }
            }).filter(Boolean) as ActivityLogEntry[];
        } catch {
            return [];
        }
    }

    private async saveScreenshot(id: string, base64Data: string): Promise<string> {
        const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
        const filename = `${id}.png`;
        const filePath = path.join(this.screenshotDir, filename);

        fs.writeFileSync(filePath, Buffer.from(cleanBase64, 'base64'));

        return filename;
    }

    private generateId(): string {
        return `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
}
