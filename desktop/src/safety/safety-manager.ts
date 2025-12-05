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

const DEFAULT_BLOCKED_SITES = [
    'bank', 'paypal', 'venmo', 'stripe',
    'password', 'credential', 'secret',
    'admin', 'root', 'sudo',
];

const DEFAULT_BLOCKED_PATTERNS = [
    /rm\s+-rf/i,
    /del\s+\/[fs]/i,
    /format\s+[a-z]:/i,
    /sudo\s+rm/i,
    /DROP\s+TABLE/i,
    /DELETE\s+FROM/i,
];

const DESTRUCTIVE_ACTION_TYPES = [
    'delete', 'remove', 'format', 'wipe',
    'uninstall', 'terminate', 'kill',
];

const HIGH_RISK_ACTION_TYPES = [
    'payment', 'purchase', 'buy', 'checkout',
    'transfer', 'send money', 'wire',
    'password', 'credential', 'login',
];

/**
 * Safety Manager - Validates and controls dangerous actions
 */
export class SafetyManager {
    private store: Store;
    private config: SafetyConfig;
    private actionCounts: Map<string, { count: number; resetAt: number }> = new Map();
    private pendingConfirmations: Map<string, { action: ParsedAction; resolve: (value: boolean) => void }> = new Map();

    constructor(store: Store) {
        this.store = store;
        this.config = this.loadConfig();
    }

    /**
     * Load safety configuration from store
     */
    private loadConfig(): SafetyConfig {
        return {
            confirmDestructiveActions: this.store.get('confirmDestructiveActions', true) as boolean,
            maxActionsPerMinute: this.store.get('maxActionsPerMinute', 60) as number,
            blockedSites: this.store.get('blockedSites', DEFAULT_BLOCKED_SITES) as string[],
            blockedApps: this.store.get('blockedApps', []) as string[],
            blockedPatterns: this.store.get('blockedPatterns', []) as string[],
            allowedDomains: this.store.get('allowedDomains', []) as string[],
            requireConfirmationFor: this.store.get('requireConfirmationFor', DESTRUCTIVE_ACTION_TYPES) as string[],
            autoConfirmTypes: this.store.get('autoConfirmTypes', ['click', 'scroll', 'wait']) as string[],
        };
    }

    /**
     * Validate an action before execution
     */
    async validateAction(action: ParsedAction): Promise<SafetyValidation> {
        // Check rate limiting
        if (!this.checkRateLimit()) {
            return {
                allowed: false,
                reason: 'Rate limit exceeded. Too many actions per minute.',
                requiresConfirmation: false,
                riskLevel: 'medium',
            };
        }

        // Check blocked patterns
        const blockedReason = this.checkBlocked(action);
        if (blockedReason) {
            return {
                allowed: false,
                reason: blockedReason,
                requiresConfirmation: false,
                riskLevel: 'critical',
            };
        }

        // Determine risk level
        const riskLevel = this.assessRisk(action);

        // Determine if confirmation needed
        const requiresConfirmation = this.needsConfirmation(action, riskLevel);

        return {
            allowed: true,
            requiresConfirmation,
            riskLevel,
        };
    }

    /**
     * Check if action requires user confirmation
     */
    async requiresConfirmation(action: ParsedAction): Promise<boolean> {
        const validation = await this.validateAction(action);
        return validation.requiresConfirmation;
    }

    /**
     * Check rate limiting
     */
    private checkRateLimit(): boolean {
        const now = Date.now();
        const key = 'global';

        let record = this.actionCounts.get(key);

        if (!record || now > record.resetAt) {
            record = { count: 0, resetAt: now + 60000 };
            this.actionCounts.set(key, record);
        }

        record.count++;

        return record.count <= this.config.maxActionsPerMinute;
    }

    /**
     * Check if action matches blocked patterns
     */
    private checkBlocked(action: ParsedAction): string | null {
        const description = action.description.toLowerCase();
        const target = action.target?.toLowerCase() || '';
        const text = action.params?.text?.toLowerCase() || '';
        const url = action.params?.url?.toLowerCase() || '';

        // Check blocked sites
        for (const site of this.config.blockedSites) {
            if (url.includes(site) || target.includes(site)) {
                return `Blocked: Actions involving "${site}" are not allowed`;
            }
        }

        // Check blocked apps
        for (const app of this.config.blockedApps) {
            if (target.includes(app.toLowerCase())) {
                return `Blocked: Actions involving "${app}" are not allowed`;
            }
        }

        // Check blocked patterns
        const allText = `${description} ${target} ${text} ${url}`;
        for (const pattern of DEFAULT_BLOCKED_PATTERNS) {
            if (pattern.test(allText)) {
                return 'Blocked: This action matches a dangerous pattern';
            }
        }

        // Check for typing passwords
        if (action.type === 'type') {
            const targetLower = target.toLowerCase();
            if (targetLower.includes('password') || targetLower.includes('credential')) {
                return 'Blocked: Automated password entry is not allowed for security';
            }
        }

        return null;
    }

    /**
     * Assess risk level of an action
     */
    private assessRisk(action: ParsedAction): 'low' | 'medium' | 'high' | 'critical' {
        const description = action.description.toLowerCase();

        // Critical risk
        for (const pattern of DEFAULT_BLOCKED_PATTERNS) {
            if (pattern.test(description)) {
                return 'critical';
            }
        }

        // High risk
        for (const keyword of HIGH_RISK_ACTION_TYPES) {
            if (description.includes(keyword)) {
                return 'high';
            }
        }

        // Medium risk
        for (const keyword of DESTRUCTIVE_ACTION_TYPES) {
            if (description.includes(keyword)) {
                return 'medium';
            }
        }

        // Navigate actions are medium risk
        if (action.type === 'navigate') {
            return 'medium';
        }

        // Type actions could be risky
        if (action.type === 'type' && action.params?.text?.length > 50) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Determine if confirmation is needed
     */
    private needsConfirmation(action: ParsedAction, riskLevel: string): boolean {
        // Always confirm high/critical risk
        if (riskLevel === 'high' || riskLevel === 'critical') {
            return true;
        }

        // Auto-confirm safe action types
        if (this.config.autoConfirmTypes.includes(action.type)) {
            return false;
        }

        // Check if action description matches confirmation triggers
        const description = action.description.toLowerCase();
        for (const trigger of this.config.requireConfirmationFor) {
            if (description.includes(trigger)) {
                return true;
            }
        }

        // Confirm based on global setting
        if (this.config.confirmDestructiveActions && riskLevel === 'medium') {
            return true;
        }

        return false;
    }

    /**
     * Request confirmation for an action
     */
    async requestConfirmation(actionId: string, action: ParsedAction): Promise<boolean> {
        return new Promise((resolve) => {
            this.pendingConfirmations.set(actionId, { action, resolve });

            // Auto-reject after 30 seconds
            setTimeout(() => {
                if (this.pendingConfirmations.has(actionId)) {
                    this.pendingConfirmations.delete(actionId);
                    resolve(false);
                }
            }, 30000);
        });
    }

    /**
     * Confirm or reject a pending action
     */
    confirmAction(actionId: string, confirmed: boolean): void {
        const pending = this.pendingConfirmations.get(actionId);
        if (pending) {
            pending.resolve(confirmed);
            this.pendingConfirmations.delete(actionId);
        }
    }

    /**
     * Update safety configuration
     */
    updateConfig(updates: Partial<SafetyConfig>): void {
        this.config = { ...this.config, ...updates };

        // Persist to store
        for (const [key, value] of Object.entries(updates)) {
            this.store.set(key, value);
        }
    }

    /**
     * Get current safety configuration
     */
    getConfig(): SafetyConfig {
        return { ...this.config };
    }

    /**
     * Add a site to blocked list
     */
    blockSite(site: string): void {
        if (!this.config.blockedSites.includes(site)) {
            this.config.blockedSites.push(site);
            this.store.set('blockedSites', this.config.blockedSites);
        }
    }

    /**
     * Remove a site from blocked list
     */
    unblockSite(site: string): void {
        this.config.blockedSites = this.config.blockedSites.filter((s) => s !== site);
        this.store.set('blockedSites', this.config.blockedSites);
    }

    /**
     * Reset rate limit counters
     */
    resetRateLimits(): void {
        this.actionCounts.clear();
    }
}
