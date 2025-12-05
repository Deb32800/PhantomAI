import { create } from 'zustand';

interface LicenseState {
    licenseStatus: 'trial' | 'pro' | 'expired';
    daysRemaining: number;
    licenseKey: string | null;
    trialStartDate: string | null;

    // Actions
    loadLicenseStatus: () => Promise<void>;
    activateLicense: (key: string) => Promise<boolean>;
}

export const useLicenseStore = create<LicenseState>((set) => ({
    licenseStatus: 'trial',
    daysRemaining: 7,
    licenseKey: null,
    trialStartDate: null,

    loadLicenseStatus: async () => {
        try {
            const status = await window.phantom?.getLicenseStatus();
            if (status) {
                set({
                    licenseStatus: status.isPro ? 'pro' : (status.isValid ? 'trial' : 'expired'),
                    daysRemaining: status.daysRemaining,
                    licenseKey: status.licenseKey,
                });
            }
        } catch (error) {
            console.error('Failed to load license status:', error);
        }
    },

    activateLicense: async (key: string) => {
        try {
            const success = await window.phantom?.activateLicense(key);
            if (success) {
                set({
                    licenseStatus: 'pro',
                    daysRemaining: -1,
                    licenseKey: key,
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to activate license:', error);
            return false;
        }
    },
}));
