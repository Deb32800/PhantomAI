import React from 'react';
import { useSettingsStore } from '../stores/settings-store';
import { useLicenseStore } from '../stores/license-store';

export function Settings() {
    const settings = useSettingsStore();
    const { licenseStatus, daysRemaining, activateLicense } = useLicenseStore();
    const [licenseKey, setLicenseKey] = React.useState('');

    const handleActivate = async () => {
        const success = await activateLicense(licenseKey);
        if (success) {
            setLicenseKey('');
        } else {
            alert('Invalid license key');
        }
    };

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Configure Phantom AI</p>
            </div>

            {/* License Section */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h2 className="card-title" style={{ marginBottom: 16 }}>License</h2>

                {licenseStatus === 'pro' ? (
                    <div style={{
                        padding: 16,
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        borderRadius: 'var(--radius-md)',
                        color: 'white',
                    }}>
                        <div style={{ fontWeight: 600, fontSize: 18 }}>✨ Pro License Active</div>
                        <div style={{ opacity: 0.9, marginTop: 4 }}>Thank you for supporting Phantom AI!</div>
                    </div>
                ) : (
                    <>
                        <div style={{
                            padding: 16,
                            background: 'var(--bg-hover)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 16,
                        }}>
                            <div style={{ fontWeight: 500 }}>Free Trial</div>
                            <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                                {daysRemaining} days remaining
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Activate License</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="text"
                                    placeholder="PH-XXXX-XXXX-XXXX"
                                    value={licenseKey}
                                    onChange={(e) => setLicenseKey(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <button className="btn btn-primary" onClick={handleActivate}>
                                    Activate
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* AI Settings */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h2 className="card-title" style={{ marginBottom: 16 }}>AI Configuration</h2>

                <div className="form-group">
                    <label className="form-label">Ollama URL</label>
                    <input
                        type="text"
                        value={settings.ollamaUrl}
                        onChange={(e) => settings.updateSettings({ ollamaUrl: e.target.value })}
                        placeholder="http://localhost:11434"
                    />
                    <p className="form-hint">The URL where Ollama is running</p>
                </div>

                <div className="form-group">
                    <label className="form-label">Default Model</label>
                    <input
                        type="text"
                        value={settings.defaultModel}
                        onChange={(e) => settings.updateSettings({ defaultModel: e.target.value })}
                        placeholder="llava:13b"
                    />
                    <p className="form-hint">Vision model to use for screen analysis</p>
                </div>
            </div>

            {/* Safety Settings */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h2 className="card-title" style={{ marginBottom: 16 }}>Safety</h2>

                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={settings.confirmDestructiveActions}
                            onChange={(e) => settings.updateSettings({ confirmDestructiveActions: e.target.checked })}
                        />
                        <span>Confirm destructive actions</span>
                    </label>
                    <p className="form-hint">Ask for confirmation before delete, format, etc.</p>
                </div>

                <div className="form-group">
                    <label className="form-label">Max actions per minute</label>
                    <input
                        type="number"
                        value={settings.maxActionsPerMinute}
                        onChange={(e) => settings.updateSettings({ maxActionsPerMinute: parseInt(e.target.value) })}
                        min={1}
                        max={200}
                    />
                    <p className="form-hint">Rate limit to prevent runaway automation</p>
                </div>
            </div>

            {/* Appearance */}
            <div className="card">
                <h2 className="card-title" style={{ marginBottom: 16 }}>Appearance</h2>

                <div className="form-group">
                    <label className="form-label">Theme</label>
                    <select
                        value={settings.theme}
                        onChange={(e) => settings.updateSettings({ theme: e.target.value as any })}
                    >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="system">System</option>
                    </select>
                </div>

                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={settings.startMinimized}
                            onChange={(e) => settings.updateSettings({ startMinimized: e.target.checked })}
                        />
                        <span>Start minimized to tray</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
