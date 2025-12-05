import React from 'react';
import { PlayIcon, PlusIcon, FolderIcon } from '@heroicons/react/24/outline';

export function Workflows() {
    const workflows = [
        {
            id: '1',
            name: 'Morning Routine',
            description: 'Open email, calendar, and Slack',
            lastRun: '2 hours ago',
            steps: 5,
        },
        {
            id: '2',
            name: 'Screenshot & Share',
            description: 'Take screenshot and copy to clipboard',
            lastRun: 'Yesterday',
            steps: 3,
        },
    ];

    return (
        <div className="page animate-fadeIn">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                    <h1 className="page-title">Workflows</h1>
                    <p className="page-subtitle">Automate repetitive tasks</p>
                </div>
                <button className="btn btn-primary">
                    <PlusIcon style={{ width: 18, height: 18 }} />
                    New Workflow
                </button>
            </div>

            {workflows.length > 0 ? (
                <div className="grid grid-2">
                    {workflows.map((workflow) => (
                        <div key={workflow.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div>
                                    <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{workflow.name}</h3>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{workflow.description}</p>
                                </div>
                                <button className="btn btn-primary btn-icon">
                                    <PlayIcon style={{ width: 18, height: 18 }} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-tertiary)' }}>
                                <span>{workflow.steps} steps</span>
                                <span>Last run: {workflow.lastRun}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                    <FolderIcon style={{ width: 48, height: 48, margin: '0 auto', marginBottom: 16, opacity: 0.5 }} />
                    <h3 style={{ marginBottom: 8 }}>No workflows yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                        Create your first workflow to automate repetitive tasks
                    </p>
                    <button className="btn btn-primary">
                        <PlusIcon style={{ width: 18, height: 18 }} />
                        Create Workflow
                    </button>
                </div>
            )}
        </div>
    );
}
