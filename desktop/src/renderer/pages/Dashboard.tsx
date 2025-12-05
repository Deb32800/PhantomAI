import React, { useEffect, useState } from 'react';
import { useAgentStore } from '../stores/agent-store';
import { useLicenseStore } from '../stores/license-store';
import {
    SparklesIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ComputerDesktopIcon,
    CpuChipIcon,
} from '@heroicons/react/24/outline';

interface StatCard {
    label: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
}

interface RecentAction {
    id: string;
    description: string;
    status: 'success' | 'failed';
    time: string;
}

export function Dashboard() {
    const [ollamaStatus, setOllamaStatus] = useState<{ isRunning: boolean; version: string | null }>({
        isRunning: false,
        version: null,
    });
    const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
    const { licenseStatus, daysRemaining } = useLicenseStore();

    useEffect(() => {
        loadOllamaStatus();
        loadRecentActions();
    }, []);

    const loadOllamaStatus = async () => {
        try {
            const status = await window.phantom?.checkOllamaStatus();
            if (status) {
                setOllamaStatus(status);
            }
        } catch (error) {
            console.error('Failed to check Ollama status:', error);
        }
    };

    const loadRecentActions = async () => {
        try {
            const log = await window.phantom?.getActivityLog(5);
            if (log) {
                setRecentActions(log.map((entry: any) => ({
                    id: entry.id,
                    description: entry.details,
                    status: entry.status,
                    time: new Date(entry.timestamp).toLocaleTimeString(),
                })));
            }
        } catch (error) {
            console.error('Failed to load recent actions:', error);
        }
    };

    const stats: StatCard[] = [
        {
            label: 'AI Status',
            value: ollamaStatus.isRunning ? 'Connected' : 'Offline',
            icon: CpuChipIcon,
            color: ollamaStatus.isRunning ? 'var(--success)' : 'var(--error)',
        },
        {
            label: 'Tasks Today',
            value: recentActions.length,
            icon: CheckCircleIcon,
            color: 'var(--accent-primary)',
        },
        {
            label: 'License',
            value: licenseStatus === 'pro' ? 'Pro' : `${daysRemaining} days`,
            icon: SparklesIcon,
            color: licenseStatus === 'pro' ? 'var(--success)' : 'var(--warning)',
        },
    ];

    return (
        <div className="page animate-fadeIn">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Control your computer with AI</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-3" style={{ marginBottom: 24 }}>
                {stats.map((stat) => (
                    <div key={stat.label} className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                padding: 10,
                                background: `${stat.color}20`,
                                borderRadius: 'var(--radius-md)'
                            }}>
                                <stat.icon style={{ width: 24, height: 24, color: stat.color }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{stat.label}</div>
                                <div style={{ fontSize: 20, fontWeight: 600 }}>{stat.value}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Start */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <h2 className="card-title">Quick Start</h2>
                </div>
                <div className="grid grid-2" style={{ gap: 12 }}>
                    {[
                        { cmd: 'Open Chrome and search for weather', desc: 'Web browsing' },
                        { cmd: 'Take a screenshot of my desktop', desc: 'Screen capture' },
                        { cmd: 'Open Finder and create a new folder called "Projects"', desc: 'File management' },
                        { cmd: 'Open System Preferences', desc: 'System settings' },
                    ].map((example) => (
                        <button
                            key={example.cmd}
                            className="btn btn-secondary"
                            style={{
                                justifyContent: 'flex-start',
                                textAlign: 'left',
                                height: 'auto',
                                padding: 16,
                            }}
                            onClick={() => {
                                // Would trigger command execution
                                window.phantom?.executeCommand(example.cmd);
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 500, marginBottom: 4 }}>{example.desc}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                                    "{example.cmd}"
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Recent Activity</h2>
                    <a href="#/activity" className="btn btn-ghost btn-sm">View All</a>
                </div>
                {recentActions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {recentActions.map((action) => (
                            <div
                                key={action.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '8px 12px',
                                    background: 'var(--bg-hover)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                {action.status === 'success' ? (
                                    <CheckCircleIcon style={{ width: 18, height: 18, color: 'var(--success)' }} />
                                ) : (
                                    <ExclamationTriangleIcon style={{ width: 18, height: 18, color: 'var(--error)' }} />
                                )}
                                <span style={{ flex: 1 }}>{action.description}</span>
                                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{action.time}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                        <ComputerDesktopIcon style={{ width: 48, height: 48, margin: '0 auto', marginBottom: 16, opacity: 0.5 }} />
                        <p>No recent activity</p>
                        <p style={{ fontSize: 12 }}>Run a command to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
