import React, { useEffect, useState } from 'react';
import {
    CheckCircleIcon,
    XCircleIcon,
    XMarkIcon,
    ArrowPathIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline';

interface ActivityEntry {
    id: string;
    timestamp: string;
    action: string;
    details: string;
    status: 'success' | 'failed' | 'cancelled';
    screenshot?: string;
}

export function Activity() {
    const [entries, setEntries] = useState<ActivityEntry[]>([]);
    const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadActivity();
    }, []);

    const loadActivity = async () => {
        setIsLoading(true);
        try {
            const log = await window.phantom?.getActivityLog(100);
            if (log) {
                setEntries(log);
            }
        } catch (error) {
            console.error('Failed to load activity:', error);
        }
        setIsLoading(false);
    };

    const clearActivity = async () => {
        if (confirm('Are you sure you want to clear all activity history?')) {
            await window.phantom?.clearActivityLog();
            setEntries([]);
        }
    };

    const filteredEntries = entries.filter((entry) => {
        if (filter === 'all') return true;
        return entry.status === filter;
    });

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        if (isToday) {
            return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        return date.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const statusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircleIcon style={{ width: 18, height: 18, color: 'var(--success)' }} />;
            case 'failed':
                return <XCircleIcon style={{ width: 18, height: 18, color: 'var(--error)' }} />;
            default:
                return <XMarkIcon style={{ width: 18, height: 18, color: 'var(--text-tertiary)' }} />;
        }
    };

    return (
        <div className="page animate-fadeIn">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                    <h1 className="page-title">Activity Log</h1>
                    <p className="page-subtitle">View your recent actions and their results</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={loadActivity}>
                        <ArrowPathIcon style={{ width: 16, height: 16 }} />
                        Refresh
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={clearActivity}>
                        Clear All
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 20, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FunnelIcon style={{ width: 16, height: 16, color: 'var(--text-tertiary)' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Filter:</span>
                    {(['all', 'success', 'failed'] as const).map((f) => (
                        <button
                            key={f}
                            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {filteredEntries.length} entries
                    </span>
                </div>
            </div>

            {/* Activity List */}
            <div className="card">
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <div className="animate-spin" style={{
                            width: 24,
                            height: 24,
                            border: '2px solid var(--border)',
                            borderTopColor: 'var(--accent-primary)',
                            borderRadius: '50%',
                            margin: '0 auto',
                        }} />
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                        <p>No activity found</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {filteredEntries.map((entry, index) => (
                            <div
                                key={entry.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 12,
                                    padding: '16px 0',
                                    borderBottom: index < filteredEntries.length - 1 ? '1px solid var(--border)' : 'none',
                                }}
                            >
                                <div style={{ paddingTop: 2 }}>
                                    {statusIcon(entry.status)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{entry.action}</div>
                                    <div style={{
                                        fontSize: 13,
                                        color: 'var(--text-secondary)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {entry.details}
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                                    {formatTime(entry.timestamp)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
