import React, { useState, useEffect } from 'react';

export function Overlay() {
    const [command, setCommand] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                window.phantom?.hideOverlay();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim() || isProcessing) return;

        setIsProcessing(true);
        try {
            await window.phantom?.executeCommand(command);
            window.phantom?.hideOverlay();
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="overlay">
            <form className="overlay-content animate-slideUp" onSubmit={handleSubmit}>
                <input
                    className="overlay-input"
                    type="text"
                    placeholder="What would you like me to do?"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    autoFocus
                    disabled={isProcessing}
                />
                <div className="overlay-hints">
                    <span>⏎ to run</span>
                    <span>⎋ to close</span>
                </div>
            </form>
        </div>
    );
}
