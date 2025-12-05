import React, { useState, useEffect } from 'react';
import {
    PuzzlePieceIcon,
    TrashIcon,
    Cog6ToothIcon,
    ArrowDownTrayIcon,
    CheckCircleIcon,
    XCircleIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface Plugin {
    id: string;
    name: string;
    version: string;
    author: string;
    description: string;
    permissions: string[];
    enabled: boolean;
}

export function PluginManager() {
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [installing, setInstalling] = useState(false);
    const [installUrl, setInstallUrl] = useState('');
    const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

    useEffect(() => {
        loadPlugins();
    }, []);

    const loadPlugins = async () => {
        try {
            const list = await window.phantom?.getInstalledPlugins();
            setPlugins(list || []);
        } catch (error) {
            console.error('Failed to load plugins:', error);
        }
    };

    const handleInstall = async () => {
        if (!installUrl) return;

        setInstalling(true);
        try {
            await window.phantom?.installPlugin(installUrl);
            setInstallUrl('');
            loadPlugins();
        } catch (error) {
            alert('Failed to install plugin');
        } finally {
            setInstalling(false);
        }
    };

    const handleUninstall = async (id: string) => {
        if (!confirm('Uninstall this plugin?')) return;
        await window.phantom?.uninstallPlugin(id);
        loadPlugins();
    };

    const handleToggle = async (id: string, enabled: boolean) => {
        if (enabled) {
            await window.phantom?.enablePlugin(id);
        } else {
            await window.phantom?.disablePlugin(id);
        }
        loadPlugins();
    };

    const formatPermission = (perm: string) => {
        const labels: Record<string, string> = {
            'screen:read': 'Read Screen',
            'screen:capture': 'Capture Screenshots',
            'mouse:control': 'Control Mouse',
            'keyboard:control': 'Control Keyboard',
            'clipboard:read': 'Read Clipboard',
            'clipboard:write': 'Write Clipboard',
            'filesystem:read': 'Read Files',
            'filesystem:write': 'Write Files',
            'network:fetch': 'Network Access',
            'shell:execute': 'Execute Commands',
            'notifications:send': 'Send Notifications',
        };
        return labels[perm] || perm;
    };

    return (
        <div className="plugin-manager">
            {/* Header */}
            <div className="plugin-header">
                <h2>Plugins</h2>
            </div>

            {/* Install */}
            <div className="plugin-install card">
                <h3>Install Plugin</h3>
                <div className="install-form">
                    <input
                        type="text"
                        placeholder="Plugin URL or path..."
                        value={installUrl}
                        onChange={(e) => setInstallUrl(e.target.value)}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={handleInstall}
                        disabled={installing || !installUrl}
                    >
                        {installing ? 'Installing...' : 'Install'}
                    </button>
                </div>
                <p className="form-hint">
                    Enter a URL or local path to a plugin package
                </p>
            </div>

            {/* Plugin List */}
            <div className="plugin-list">
                {plugins.length === 0 ? (
                    <div className="plugin-empty card">
                        <PuzzlePieceIcon className="w-12 h-12 opacity-50" />
                        <p>No plugins installed</p>
                        <p className="text-sm text-secondary">
                            Install plugins to extend Phantom AI functionality
                        </p>
                    </div>
                ) : (
                    plugins.map((plugin) => (
                        <div key={plugin.id} className="plugin-item card">
                            <div className="plugin-main">
                                <div className="plugin-icon">
                                    <PuzzlePieceIcon className="w-6 h-6" />
                                </div>
                                <div className="plugin-info">
                                    <div className="plugin-name">
                                        {plugin.name}
                                        <span className="plugin-version">v{plugin.version}</span>
                                    </div>
                                    <div className="plugin-author">by {plugin.author}</div>
                                    <div className="plugin-description">{plugin.description}</div>
                                </div>
                                <div className="plugin-toggle">
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={plugin.enabled}
                                            onChange={(e) => handleToggle(plugin.id, e.target.checked)}
                                        />
                                        <span className="slider" />
                                    </label>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="plugin-permissions">
                                <div className="permissions-label">
                                    <ShieldCheckIcon className="w-4 h-4" />
                                    Permissions
                                </div>
                                <div className="permissions-list">
                                    {plugin.permissions.map((perm) => (
                                        <span key={perm} className="permission-badge">
                                            {formatPermission(perm)}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="plugin-actions">
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setSelectedPlugin(plugin)}
                                >
                                    <Cog6ToothIcon className="w-4 h-4" />
                                    Settings
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm text-error"
                                    onClick={() => handleUninstall(plugin.id)}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    Uninstall
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
        .plugin-manager {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .plugin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .plugin-install .install-form {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .plugin-install input {
          flex: 1;
        }

        .plugin-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .plugin-empty {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
        }

        .plugin-item {
          padding: 16px;
        }

        .plugin-main {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .plugin-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: var(--accent-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .plugin-info {
          flex: 1;
        }

        .plugin-name {
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .plugin-version {
          font-size: 12px;
          color: var(--text-tertiary);
          font-weight: normal;
        }

        .plugin-author {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .plugin-description {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .plugin-permissions {
          padding: 12px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          margin-bottom: 12px;
        }

        .permissions-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--text-secondary);
        }

        .permissions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .permission-badge {
          font-size: 11px;
          padding: 2px 8px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
        }

        .plugin-actions {
          display: flex;
          gap: 8px;
        }

        .switch {
          position: relative;
          width: 44px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: var(--bg-tertiary);
          border-radius: 24px;
          transition: 0.3s;
        }

        .slider:before {
          content: "";
          position: absolute;
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.3s;
        }

        input:checked + .slider {
          background: var(--accent-primary);
        }

        input:checked + .slider:before {
          transform: translateX(20px);
        }
      `}</style>
        </div>
    );
}
