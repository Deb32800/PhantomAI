import * as crypto from 'crypto';

/**
 * License key structure: PH-XXXX-XXXX-XXXX
 * - PH prefix identifies product
 * - 12 alphanumeric characters (3 groups of 4)
 * - Checksum encoded in last 4 characters
 */

const SECRET_KEY = 'phantom-ai-license-2024'; // In production, this would be more secure

export interface LicenseInfo {
    isValid: boolean;
    type: 'trial' | 'pro' | 'enterprise';
    expiresAt: Date | null;
    email: string | null;
}

export class LicenseManager {
    /**
     * Generate a new license key
     */
    generateKey(email: string, type: 'pro' | 'enterprise' = 'pro'): string {
        const data = `${email}:${type}:${Date.now()}`;
        const hash = crypto.createHmac('sha256', SECRET_KEY)
            .update(data)
            .digest('hex')
            .toUpperCase();

        // Format: PH-XXXX-XXXX-XXXX
        const key = `PH-${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}`;
        return key;
    }

    /**
     * Validate a license key format
     */
    validateKey(key: string): boolean {
        // Check format
        const pattern = /^PH-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
        if (!pattern.test(key)) {
            return false;
        }

        // In production, this would verify against a license server
        // For now, we just check the format
        return true;
    }

    /**
     * Activate a license key (would normally call license server)
     */
    async activateKey(key: string, machineId: string): Promise<LicenseInfo> {
        // Validate format first
        if (!this.validateKey(key)) {
            return {
                isValid: false,
                type: 'trial',
                expiresAt: null,
                email: null,
            };
        }

        // In production, this would:
        // 1. Call license server API
        // 2. Verify key hasn't been used on too many machines
        // 3. Return license details

        // For now, return successful activation
        return {
            isValid: true,
            type: 'pro',
            expiresAt: null, // Lifetime license
            email: null,
        };
    }

    /**
     * Deactivate a license (for machine swap)
     */
    async deactivateKey(key: string, machineId: string): Promise<boolean> {
        // Would call license server to free up an activation slot
        return true;
    }

    /**
     * Get unique machine identifier
     */
    getMachineId(): string {
        const os = require('os');
        const cpus = os.cpus();
        const networkInterfaces = os.networkInterfaces();

        // Create a hash of hardware identifiers
        const data = [
            os.hostname(),
            os.platform(),
            os.arch(),
            cpus[0]?.model || '',
            Object.values(networkInterfaces)
                .flat()
                .filter((i: any) => !i.internal && i.mac !== '00:00:00:00:00:00')
                .map((i: any) => i.mac)
                .join(','),
        ].join(':');

        return crypto.createHash('sha256').update(data).digest('hex').slice(0, 32);
    }

    /**
     * Check if license allows a specific feature
     */
    hasFeature(license: LicenseInfo, feature: string): boolean {
        const featureMatrix: Record<string, string[]> = {
            trial: ['basic-commands', 'screen-capture', 'mouse-control', 'keyboard-control'],
            pro: [
                'basic-commands', 'screen-capture', 'mouse-control', 'keyboard-control',
                'voice-commands', 'workflow-recording', 'unlimited-actions', 'priority-support',
            ],
            enterprise: [
                'basic-commands', 'screen-capture', 'mouse-control', 'keyboard-control',
                'voice-commands', 'workflow-recording', 'unlimited-actions', 'priority-support',
                'custom-models', 'team-management', 'audit-logs', 'sso', 'api-access',
            ],
        };

        return featureMatrix[license.type]?.includes(feature) || false;
    }
}

/**
 * Generate pricing plans for display
 */
export function getPricingPlans() {
    return [
        {
            id: 'trial',
            name: 'Free Trial',
            price: 0,
            period: '7 days',
            features: [
                'Basic AI commands',
                'Screen understanding',
                'Mouse & keyboard control',
                'Up to 50 actions/day',
            ],
            limitations: [
                'No voice commands',
                'No workflow recording',
                'Limited actions per day',
            ],
        },
        {
            id: 'pro-monthly',
            name: 'Pro Monthly',
            price: 9.99,
            period: 'month',
            features: [
                'Everything in Trial',
                'Voice commands',
                'Workflow recording',
                'Unlimited actions',
                'Priority support',
                'Custom AI models',
            ],
            limitations: [],
        },
        {
            id: 'pro-lifetime',
            name: 'Pro Lifetime',
            price: 49,
            period: 'one-time',
            features: [
                'Everything in Pro Monthly',
                'Lifetime updates',
                'Early access to features',
            ],
            limitations: [],
            recommended: true,
        },
    ];
}
