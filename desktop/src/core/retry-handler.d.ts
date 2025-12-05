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
export declare class RetryHandler {
    private config;
    private retryHistory;
    constructor(maxRetries?: number, config?: Partial<RetryConfig>);
    /**
     * Execute an operation with retry logic
     */
    execute<T>(operation: () => Promise<T>, operationName?: string, shouldRetry?: (error: Error, attempt: number) => boolean): Promise<RetryResult<T>>;
    /**
     * Execute with circuit breaker pattern
     */
    executeWithCircuitBreaker<T>(operation: () => Promise<T>, operationName: string, circuitKey: string): Promise<RetryResult<T>>;
    /**
     * Calculate delay with exponential backoff
     */
    private calculateDelay;
    /**
     * Check if error is non-retryable
     */
    private isNonRetryableError;
    /**
     * Circuit breaker state tracking
     */
    private circuitBreakers;
    private circuitThreshold;
    private circuitResetTime;
    private isCircuitOpen;
    private updateCircuitBreaker;
    /**
     * Log retry for analytics
     */
    private logRetry;
    /**
     * Get retry statistics
     */
    getStatistics(): {
        totalOperations: number;
        successRate: number;
        averageAttempts: number;
        recentFailures: number;
    };
    /**
     * Reset retry handler state
     */
    reset(): void;
    private sleep;
}
//# sourceMappingURL=retry-handler.d.ts.map