import React, { useState, useEffect, useRef } from 'react';
import {
    MicrophoneIcon,
    StopIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface Props {
    onTranscription?: (text: string) => void;
    onError?: (error: string) => void;
}

export function VoiceInput({ onTranscription, onError }: Props) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [volume, setVolume] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        // Listen for volume changes from voice system
        const unsubscribe = window.phantom?.onVolumeChange((vol: number) => {
            setVolume(vol);
        });

        return () => {
            unsubscribe?.();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    const handleStartRecording = async () => {
        try {
            await window.phantom?.startVoiceRecording();
            setIsRecording(true);
            setTranscript('');
        } catch (error) {
            onError?.('Failed to start recording');
        }
    };

    const handleStopRecording = async () => {
        setIsRecording(false);
        setIsProcessing(true);

        try {
            const text = await window.phantom?.stopVoiceRecording();
            setTranscript(text || '');
            onTranscription?.(text || '');
        } catch (error) {
            onError?.('Transcription failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        window.phantom?.setVoiceMuted(!isMuted);
    };

    // Calculate bar heights for visualization
    const getBarHeights = () => {
        const bars = 5;
        const heights = [];
        for (let i = 0; i < bars; i++) {
            // Add some variation
            const variation = Math.sin(Date.now() / 100 + i) * 0.2;
            heights.push(Math.max(0.1, volume + variation));
        }
        return heights;
    };

    return (
        <div className="voice-input">
            <div className="voice-input-container">
                {/* Volume visualization */}
                <div className={`voice-visualizer ${isRecording ? 'active' : ''}`}>
                    {getBarHeights().map((height, i) => (
                        <div
                            key={i}
                            className="voice-bar"
                            style={{
                                height: `${isRecording ? height * 100 : 20}%`,
                                animationDelay: `${i * 0.1}s`,
                            }}
                        />
                    ))}
                </div>

                {/* Main button */}
                <button
                    className={`voice-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <div className="voice-spinner" />
                    ) : isRecording ? (
                        <StopIcon className="w-8 h-8" />
                    ) : (
                        <MicrophoneIcon className="w-8 h-8" />
                    )}
                </button>

                {/* Mute button */}
                <button
                    className={`voice-mute ${isMuted ? 'muted' : ''}`}
                    onClick={toggleMute}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? (
                        <SpeakerXMarkIcon className="w-5 h-5" />
                    ) : (
                        <SpeakerWaveIcon className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Status text */}
            <div className="voice-status">
                {isProcessing ? (
                    'Transcribing...'
                ) : isRecording ? (
                    'Listening... Click to stop'
                ) : transcript ? (
                    <span className="voice-transcript">"{transcript}"</span>
                ) : (
                    'Click to speak'
                )}
            </div>

            <style>{`
        .voice-input {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .voice-input-container {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .voice-visualizer {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 40px;
          opacity: 0.5;
          transition: opacity 0.3s;
        }

        .voice-visualizer.active {
          opacity: 1;
        }

        .voice-bar {
          width: 4px;
          background: var(--accent-primary);
          border-radius: 2px;
          transition: height 0.1s ease;
        }

        .voice-button {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: none;
          background: var(--accent-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(var(--accent-primary-rgb), 0.4);
        }

        .voice-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 30px rgba(var(--accent-primary-rgb), 0.5);
        }

        .voice-button.recording {
          background: var(--error);
          animation: pulse 1.5s infinite;
        }

        .voice-button.processing {
          opacity: 0.7;
          cursor: wait;
        }

        .voice-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .voice-mute {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .voice-mute:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .voice-mute.muted {
          background: var(--error);
          border-color: var(--error);
          color: white;
        }

        .voice-status {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .voice-transcript {
          color: var(--text-primary);
          font-style: italic;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(var(--error-rgb), 0.5); }
          50% { box-shadow: 0 0 0 15px rgba(var(--error-rgb), 0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
