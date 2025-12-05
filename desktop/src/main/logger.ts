import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    module: string;
    message: string;
    data?: any;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

/**
 * Logger utility for file and console logging
 */
export class Logger {
    private module: string;
    private static logPath: string;
    private static minLevel: LogLevel = 'info';
    private static initialized = false;

    constructor(module: string) {
        this.module = module;

        if (!Logger.initialized) {
            Logger.initialize();
        }
    }

    /**
     * Initialize the logger (create log directory, etc)
     */
    private static initialize(): void {
        const userDataPath = app?.getPath('userData') || '/tmp/phantom-ai';
        Logger.logPath = path.join(userDataPath, 'logs');

        // Create logs directory if needed
        if (!fs.existsSync(Logger.logPath)) {
            fs.mkdirSync(Logger.logPath, { recursive: true });
        }

        // Set log level from environment
        const envLevel = process.env.LOG_LEVEL as LogLevel;
        if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
            Logger.minLevel = envLevel;
        }

        Logger.initialized = true;
    }

    /**
     * Get the current log file path
     */
    private getLogFilePath(): string {
        const date = new Date().toISOString().split('T')[0];
        return path.join(Logger.logPath, `phantom-ai-${date}.log`);
    }

    /**
     * Format and write a log entry
     */
    private log(level: LogLevel, message: string, data?: any): void {
        if (LOG_LEVELS[level] < LOG_LEVELS[Logger.minLevel]) {
            return;
        }

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            module: this.module,
            message,
            data,
        };

        // Console output with colors
        const colors = {
            debug: '\x1b[36m', // cyan
            info: '\x1b[32m',  // green
            warn: '\x1b[33m',  // yellow
            error: '\x1b[31m', // red
        };
        const reset = '\x1b[0m';

        const consoleMessage = `${colors[level]}[${entry.timestamp}] [${level.toUpperCase()}] [${this.module}]${reset} ${message}`;

        if (data) {
            console.log(consoleMessage, data);
        } else {
            console.log(consoleMessage);
        }

        // File output
        const fileMessage = JSON.stringify(entry) + '\n';
        try {
            fs.appendFileSync(this.getLogFilePath(), fileMessage);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    debug(message: string, data?: any): void {
        this.log('debug', message, data);
    }

    info(message: string, data?: any): void {
        this.log('info', message, data);
    }

    warn(message: string, data?: any): void {
        this.log('warn', message, data);
    }

    error(message: string, data?: any): void {
        this.log('error', message, data);
    }

    /**
     * Get recent log entries
     */
    static async getRecentLogs(count: number = 100): Promise<LogEntry[]> {
        const date = new Date().toISOString().split('T')[0];
        const logFile = path.join(Logger.logPath, `phantom-ai-${date}.log`);

        if (!fs.existsSync(logFile)) {
            return [];
        }

        const content = fs.readFileSync(logFile, 'utf-8');
        const lines = content.trim().split('\n');
        const entries: LogEntry[] = [];

        const startIndex = Math.max(0, lines.length - count);
        for (let i = startIndex; i < lines.length; i++) {
            try {
                entries.push(JSON.parse(lines[i]));
            } catch {
                // Skip malformed lines
            }
        }

        return entries;
    }

    /**
     * Clear old log files (older than days)
     */
    static async cleanOldLogs(days: number = 7): Promise<void> {
        const files = fs.readdirSync(Logger.logPath);
        const now = Date.now();
        const maxAge = days * 24 * 60 * 60 * 1000;

        for (const file of files) {
            const filePath = path.join(Logger.logPath, file);
            const stats = fs.statSync(filePath);

            if (now - stats.mtime.getTime() > maxAge) {
                fs.unlinkSync(filePath);
            }
        }
    }
}
