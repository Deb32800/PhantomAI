"use strict";
/**
 * Retry Handler - Manages action retries with exponential backoff
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryHandler = void 0;
const DEFAULT_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    exponentialBase: 2,
    jitter: true,
};
class RetryHandler {
    config;
    retryHistory = [];
    constructor(maxRetries = 3, config) {
        this.config = {
            ...DEFAULT_CONFIG,
            maxRetries,
            ...config,
        };
    }
    /**
     * Execute an operation with retry logic
     */
    async execute(operation, operationName = 'operation', shouldRetry) {
        const startTime = Date.now();
        let lastError = null;
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
            }
            catch (error) {
                lastError = error;
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
    async executeWithCircuitBreaker(operation, operationName, circuitKey) {
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
    calculateDelay(attempt) {
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
    isNonRetryableError(error) {
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
    circuitBreakers = new Map();
    circuitThreshold = 5;
    circuitResetTime = 30000; // 30 seconds
    isCircuitOpen(key) {
        const breaker = this.circuitBreakers.get(key);
        if (!breaker)
            return false;
        // Reset circuit if enough time has passed
        if (breaker.isOpen && Date.now() - breaker.lastFailure > this.circuitResetTime) {
            breaker.isOpen = false;
            breaker.failures = 0;
        }
        return breaker.isOpen;
    }
    updateCircuitBreaker(key, success) {
        let breaker = this.circuitBreakers.get(key);
        if (!breaker) {
            breaker = { failures: 0, lastFailure: 0, isOpen: false };
            this.circuitBreakers.set(key, breaker);
        }
        if (success) {
            breaker.failures = 0;
            breaker.isOpen = false;
        }
        else {
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
    logRetry(operation, attempts, success) {
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
    getStatistics() {
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
        const recentFailures = this.retryHistory.filter((r) => !r.success && r.timestamp > recentCutoff);
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
    reset() {
        this.retryHistory = [];
        this.circuitBreakers.clear();
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.RetryHandler = RetryHandler;
//# sourceMappingURL=retry-handler.js.map