/**
 * Retry Handler - Manages action retries with exponential backoff
 */

export interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    exponentialBase: number;
    jitter: boolean;
}

export interface RetryResult<T> {
    success: boolean;
    result?: T;
    error?: string;
    attempts: number;
    totalTime: number;
}

const DEFAULT_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    exponentialBase: 2,
    jitter: true,
};

export class RetryHandler {
    private config: RetryConfig;
    private retryHistory: Array<{
        operation: string;
        attempts: number;
        success: boolean;
        timestamp: number;
    }> = [];

    constructor(maxRetries: number = 3, config?: Partial<RetryConfig>) {
        this.config = {
            ...DEFAULT_CONFIG,
            maxRetries,
            ...config,
        };
    }

    /**
     * Execute an operation with retry logic
     */
    async execute<T>(
        operation: () => Promise<T>,
        operationName: string = 'operation',
        shouldRetry?: (error: Error, attempt: number) => boolean,
    ): Promise<RetryResult<T>> {
        const startTime = Date.now();
        let lastError: Error | null = null;
        let attempts = 0;

        while (attempts <= this.config.maxRetries) {
            attempts++;

            try {
                const result = await operation();

                this.logRetry(operationName, attempts, true);

                return {
                    success: true,
                    result,
                    attempts,
                    totalTime: Date.now() - startTime,
                };
            } catch (error) {
                lastError = error as Error;

                // Check if we should retry
                if (attempts > this.config.maxRetries) {
                    break;
                }

                // Custom retry decision
                if (shouldRetry && !shouldRetry(lastError, attempts)) {
                    break;
                }

                // Default: don't retry certain errors
                if (this.isNonRetryableError(lastError)) {
                    break;
                }

                // Wait before retry
                const delay = this.calculateDelay(attempts);
                await this.sleep(delay);
            }
        }

        this.logRetry(operationName, attempts, false);

        return {
            success: false,
            error: lastError?.message || 'Unknown error',
            attempts,
            totalTime: Date.now() - startTime,
        };
    }

    /**
     * Execute with circuit breaker pattern
     */
    async executeWithCircuitBreaker<T>(
        operation: () => Promise<T>,
        operationName: string,
        circuitKey: string,
    ): Promise<RetryResult<T>> {
        // Check circuit breaker state
        if (this.isCircuitOpen(circuitKey)) {
            return {
                success: false,
                error: 'Circuit breaker is open - too many recent failures',
                attempts: 0,
                totalTime: 0,
            };
        }

        const result = await this.execute(operation, operationName);

        // Update circuit breaker
        this.updateCircuitBreaker(circuitKey, result.success);

        return result;
    }

    /**
     * Calculate delay with exponential backoff
     */
    private calculateDelay(attempt: number): number {
        let delay = this.config.baseDelay * Math.pow(this.config.exponentialBase, attempt - 1);

        // Cap at max delay
        delay = Math.min(delay, this.config.maxDelay);

        // Add jitter to prevent thundering herd
        if (this.config.jitter) {
            delay = delay * (0.5 + Math.random() * 0.5);
        }

        return Math.floor(delay);
    }

    /**
     * Check if error is non-retryable
     */
    private isNonRetryableError(error: Error): boolean {
        const nonRetryablePatterns = [
            /permission denied/i,
            /access denied/i,
            /not found/i,
            /invalid/i,
            /unauthorized/i,
            /forbidden/i,
            /aborted/i,
            /cancelled/i,
        ];

        return nonRetryablePatterns.some((pattern) => pattern.test(error.message));
    }

    /**
     * Circuit breaker state tracking
     */
    private circuitBreakers: Map<string, {
        failures: number;
        lastFailure: number;
        isOpen: boolean;
    }> = new Map();

    private circuitThreshold = 5;
    private circuitResetTime = 30000; // 30 seconds

    private isCircuitOpen(key: string): boolean {
        const breaker = this.circuitBreakers.get(key);
        if (!breaker) return false;

        // Reset circuit if enough time has passed
        if (breaker.isOpen && Date.now() - breaker.lastFailure > this.circuitResetTime) {
            breaker.isOpen = false;
            breaker.failures = 0;
        }

        return breaker.isOpen;
    }

    private updateCircuitBreaker(key: string, success: boolean): void {
        let breaker = this.circuitBreakers.get(key);

        if (!breaker) {
            breaker = { failures: 0, lastFailure: 0, isOpen: false };
            this.circuitBreakers.set(key, breaker);
        }

        if (success) {
            breaker.failures = 0;
            breaker.isOpen = false;
        } else {
            breaker.failures++;
            breaker.lastFailure = Date.now();

            if (breaker.failures >= this.circuitThreshold) {
                breaker.isOpen = true;
            }
        }
    }

    /**
     * Log retry for analytics
     */
    private logRetry(operation: string, attempts: number, success: boolean): void {
        this.retryHistory.push({
            operation,
            attempts,
            success,
            timestamp: Date.now(),
        });

        // Keep only last 100 entries
        if (this.retryHistory.length > 100) {
            this.retryHistory.shift();
        }
    }

    /**
     * Get retry statistics
     */
    getStatistics(): {
        totalOperations: number;
        successRate: number;
        averageAttempts: number;
        recentFailures: number;
    } {
        if (this.retryHistory.length === 0) {
            return {
                totalOperations: 0,
                successRate: 0,
                averageAttempts: 0,
                recentFailures: 0,
            };
        }

        const successful = this.retryHistory.filter((r) => r.success);
        const recentCutoff = Date.now() - 60000; // Last minute
        const recentFailures = this.retryHistory.filter(
            (r) => !r.success && r.timestamp > recentCutoff
        );

        return {
            totalOperations: this.retryHistory.length,
            successRate: (successful.length / this.retryHistory.length) * 100,
            averageAttempts: this.retryHistory.reduce((sum, r) => sum + r.attempts, 0) / this.retryHistory.length,
            recentFailures: recentFailures.length,
        };
    }

    /**
     * Reset retry handler state
     */
    reset(): void {
        this.retryHistory = [];
        this.circuitBreakers.clear();
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
