import Store from 'electron-store';
import { ParsedAction } from '../core/action-parser';
export interface SafetyConfig {
    confirmDestructiveActions: boolean;
    maxActionsPerMinute: number;
    blockedSites: string[];
    blockedApps: string[];
    blockedPatterns: string[];
    allowedDomains: string[];
    requireConfirmationFor: string[];
    autoConfirmTypes: string[];
}
export interface SafetyValidation {
    allowed: boolean;
    reason?: string;
    requiresConfirmation: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}
/**
 * Safety Manager - Validates and controls dangerous actions
 */
export declare class SafetyManager {
    private store;
    private config;
    private actionCounts;
    private pendingConfirmations;
    constructor(store: Store);
    /**
     * Load safety configuration from store
     */
    private loadConfig;
    /**
     * Validate an action before execution
     */
    validateAction(action: ParsedAction): Promise<SafetyValidation>;
    /**
     * Check if action requires user confirmation
     */
    requiresConfirmation(action: ParsedAction): Promise<boolean>;
    /**
     * Check rate limiting
     */
    private checkRateLimit;
    /**
     * Check if action matches blocked patterns
     */
    private checkBlocked;
    /**
     * Assess risk level of an action
     */
    private assessRisk;
    /**
     * Determine if confirmation is needed
     */
    private needsConfirmation;
    /**
     * Request confirmation for an action
     */
    requestConfirmation(actionId: string, action: ParsedAction): Promise<boolean>;
    /**
     * Confirm or reject a pending action
     */
    confirmAction(actionId: string, confirmed: boolean): void;
    /**
     * Update safety configuration
     */
    updateConfig(updates: Partial<SafetyConfig>): void;
    /**
     * Get current safety configuration
     */
    getConfig(): SafetyConfig;
    /**
     * Add a site to blocked list
     */
    blockSite(site: string): void;
    /**
     * Remove a site from blocked list
     */
    unblockSite(site: string): void;
    /**
     * Reset rate limit counters
     */
    resetRateLimits(): void;
}
//# sourceMappingURL=safety-manager.d.ts.map