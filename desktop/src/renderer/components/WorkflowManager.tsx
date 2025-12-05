import React, { useState, useEffect } from 'react';
import {
    PlayIcon,
    StopIcon,
    PauseIcon,
    TrashIcon,
    PencilIcon,
    ClockIcon,
    CalendarIcon,
    DocumentDuplicateIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface Workflow {
    id: string;
    name: string;
    description: string;
    steps: number;
    createdAt: string;
    lastRun?: string;
}

interface Props {
    onPlay?: (workflowId: string) => void;
    onRecord?: () => void;
}

export function WorkflowManager({ onPlay, onRecord }: Props) {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingName, setRecordingName] = useState('');
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = async () => {
        try {
            const list = await window.phantom?.listWorkflows();
            setWorkflows(list || []);
        } catch (error) {
            console.error('Failed to load workflows:', error);
        }
    };

    const handleStartRecording = async () => {
        const name = prompt('Enter workflow name:');
        if (!name) return;

        setRecordingName(name);
        setIsRecording(true);
        await window.phantom?.startWorkflowRecording(name);
        onRecord?.();
    };

    const handleStopRecording = async () => {
        const description = prompt('Enter workflow description (optional):');
        await window.phantom?.stopWorkflowRecording(recordingName, description || '');
        setIsRecording(false);
        setRecordingName('');
        loadWorkflows();
    };

    const handlePlay = async (id: string) => {
        setPlayingId(id);
        onPlay?.(id);
        try {
            await window.phantom?.playWorkflow(id);
        } finally {
            setPlayingId(null);
        }
    };

    const handleStop = async () => {
        await window.phantom?.stopWorkflow();
        setPlayingId(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this workflow?')) return;
        await window.phantom?.deleteWorkflow(id);
        loadWorkflows();
    };

    const handleDuplicate = async (id: string) => {
        const name = prompt('Enter name for duplicate:');
        if (!name) return;
        await window.phantom?.duplicateWorkflow(id, name);
        loadWorkflows();
    };

    const handleExport = async (id: string) => {
        const workflow = workflows.find((w) => w.id === id);
        if (!workflow) return;

        const path = await window.phantom?.exportWorkflow(id);
        if (path) {
            alert(`Exported to: ${path}`);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="workflow-manager">
            {/* Header */}
            <div className="workflow-header">
                <h2>Workflows</h2>
                <button
                    className={`btn ${isRecording ? 'btn-error' : 'btn-primary'}`}
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                >
                    {isRecording ? (
                        <>
                            <StopIcon className="w-5 h-5" />
                            Stop Recording
                        </>
                    ) : (
                        <>
                            <PlayIcon className="w-5 h-5" />
                            Record New
                        </>
                    )}
                </button>
            </div>

            {/* Recording indicator */}
            {isRecording && (
                <div className="recording-indicator">
                    <div className="recording-dot" />
                    <span>Recording: {recordingName}</span>
                    <span className="recording-hint">Actions are being recorded...</span>
                </div>
            )}

            {/* Workflow list */}
            <div className="workflow-list">
                {workflows.length === 0 ? (
                    <div className="workflow-empty">
                        <p>No workflows yet</p>
                        <p className="text-sm">Record your first workflow to get started</p>
                    </div>
                ) : (
                    workflows.map((workflow) => (
                        <div
                            key={workflow.id}
                            className={`workflow-item ${playingId === workflow.id ? 'playing' : ''}`}
                        >
                            <div className="workflow-info">
                                <div className="workflow-name">{workflow.name}</div>
                                <div className="workflow-meta">
                                    <span className="workflow-steps">
                                        {workflow.steps} steps
                                    </span>
                                    <span className="workflow-date">
                                        <ClockIcon className="w-4 h-4" />
                                        {formatDate(workflow.createdAt)}
                                    </span>
                                </div>
                                {workflow.description && (
                                    <div className="workflow-description">{workflow.description}</div>
                                )}
                            </div>

                            <div className="workflow-actions">
                                {playingId === workflow.id ? (
                                    <button
                                        className="btn btn-icon btn-error"
                                        onClick={handleStop}
                                        title="Stop"
                                    >
                                        <StopIcon className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-icon btn-primary"
                                        onClick={() => handlePlay(workflow.id)}
                                        title="Play"
                                        disabled={playingId !== null}
                                    >
                                        <PlayIcon className="w-5 h-5" />
                                    </button>
                                )}

                                <button
                                    className="btn btn-icon btn-ghost"
                                    onClick={() => {
                                        setSelectedWorkflow(workflow);
                                        setShowScheduleModal(true);
                                    }}
                                    title="Schedule"
                                >
                                    <CalendarIcon className="w-5 h-5" />
                                </button>

                                <button
                                    className="btn btn-icon btn-ghost"
                                    onClick={() => handleDuplicate(workflow.id)}
                                    title="Duplicate"
                                >
                                    <DocumentDuplicateIcon className="w-5 h-5" />
                                </button>

                                <button
                                    className="btn btn-icon btn-ghost"
                                    onClick={() => handleExport(workflow.id)}
                                    title="Export"
                                >
                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                </button>

                                <button
                                    className="btn btn-icon btn-ghost text-error"
                                    onClick={() => handleDelete(workflow.id)}
                                    title="Delete"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
        .workflow-manager {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .workflow-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .recording-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--error);
          color: white;
          border-radius: var(--radius-md);
        }

        .recording-dot {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          animation: blink 1s infinite;
        }

        .recording-hint {
          margin-left: auto;
          opacity: 0.8;
          font-size: 13px;
        }

        .workflow-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .workflow-empty {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
        }

        .workflow-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          transition: all 0.2s;
        }

        .workflow-item:hover {
          border-color: var(--accent-primary);
        }

        .workflow-item.playing {
          border-color: var(--success);
          background: rgba(var(--success-rgb), 0.1);
        }

        .workflow-info {
          flex: 1;
        }

        .workflow-name {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .workflow-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .workflow-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .workflow-description {
          margin-top: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .workflow-actions {
          display: flex;
          gap: 4px;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
        </div>
    );
}
