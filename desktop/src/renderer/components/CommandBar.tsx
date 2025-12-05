import React, { useState, useRef, useEffect } from 'react';
import { useAgentStore } from '../stores/agent-store';
import { MagnifyingGlassIcon, MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';

export function CommandBar() {
    const [command, setCommand] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { executeCommand, stopExecution, isRunning, currentTask, progress } = useAgentStore();

    // Focus input on Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim() || isRunning) return;

        await executeCommand(command);
        setCommand('');
    };

    const handleVoice = async () => {
        if (isRecording) {
            setIsRecording(false);
            const transcript = await window.phantom?.stopVoiceRecording();
            if (transcript) {
                setCommand(transcript);
            }
        } else {
            setIsRecording(true);
            await window.phantom?.startVoiceRecording();
        }
    };

    const handleStop = () => {
        stopExecution();
    };

    return (
        <div className="command-bar">
            <form onSubmit={handleSubmit}>
                <div className="command-input-wrapper">
                    <MagnifyingGlassIcon />
                    <input
                        ref={inputRef}
                        type="text"
                        className="command-input"
                        placeholder="What would you like me to do?"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        disabled={isRunning}
                    />
                    <button
                        type="button"
                        className={`btn-icon ${isRecording ? 'text-error' : ''}`}
                        onClick={handleVoice}
                        disabled={isRunning}
                    >
                        <MicrophoneIcon className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
                    </button>
                    <div className="command-shortcut">
                        <kbd>⌘</kbd>
                        <kbd>K</kbd>
                    </div>
                </div>
            </form>

            {isRunning && (
                <div className="agent-status running animate-fadeIn">
                    <div className="status-dot" />
                    <span className="status-text">
                        {currentTask || 'Working...'}
                    </span>
                    <div className="status-progress">
                        <div
                            className="status-progress-bar"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <button className="btn-icon" onClick={handleStop} title="Stop">
                        <StopIcon className="w-5 h-5 text-error" />
                    </button>
                </div>
            )}
        </div>
    );
}
