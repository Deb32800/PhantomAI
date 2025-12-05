import React, { useState } from 'react';
import { SparklesIcon, CheckCircleIcon, CpuChipIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface OnboardingProps {
    onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'not-found'>('checking');

    const checkOllama = async () => {
        try {
            const status = await window.phantom?.checkOllamaStatus();
            setOllamaStatus(status?.isRunning ? 'connected' : 'not-found');
        } catch {
            setOllamaStatus('not-found');
        }
    };

    React.useEffect(() => {
        if (step === 1) {
            checkOllama();
        }
    }, [step]);

    const steps = [
        // Welcome
        <div key="welcome" style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
            <SparklesIcon style={{ width: 80, height: 80, margin: '0 auto', marginBottom: 24, color: 'var(--accent-primary)' }} />
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Welcome to Phantom AI</h1>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 32 }}>
                Your AI-powered desktop assistant that can see and control your computer.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => setStep(1)}>
                Get Started
            </button>
        </div>,

        // Ollama Check
        <div key="ollama" style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
            <CpuChipIcon style={{ width: 64, height: 64, margin: '0 auto', marginBottom: 24, color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>AI Engine Setup</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                Phantom AI uses Ollama to run AI models locally on your computer.
            </p>

            <div style={{
                padding: 20,
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 24,
            }}>
                {ollamaStatus === 'checking' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        <div className="animate-spin" style={{
                            width: 20, height: 20,
                            border: '2px solid var(--border)',
                            borderTopColor: 'var(--accent-primary)',
                            borderRadius: '50%',
                        }} />
                        <span>Checking for Ollama...</span>
                    </div>
                )}
                {ollamaStatus === 'connected' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--success)' }}>
                        <CheckCircleIcon style={{ width: 24, height: 24 }} />
                        <span style={{ fontWeight: 500 }}>Ollama is running!</span>
                    </div>
                )}
                {ollamaStatus === 'not-found' && (
                    <div>
                        <p style={{ color: 'var(--warning)', marginBottom: 12 }}>Ollama not detected</p>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            Install Ollama from <a href="https://ollama.ai" target="_blank" rel="noopener">ollama.ai</a>
                        </p>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={checkOllama}>
                    Check Again
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => setStep(2)}
                    disabled={ollamaStatus === 'checking'}
                >
                    Continue
                </button>
            </div>
        </div>,

        // Permissions
        <div key="permissions" style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
            <ShieldCheckIcon style={{ width: 64, height: 64, margin: '0 auto', marginBottom: 24, color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Permissions</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                Phantom AI needs permission to control your computer.
            </p>

            <div style={{
                textAlign: 'left',
                padding: 20,
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 24,
            }}>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none' }}>
                    <li>✓ <strong>Accessibility</strong> - Control mouse and keyboard</li>
                    <li>✓ <strong>Screen Recording</strong> - Capture screen for AI analysis</li>
                    <li>✓ <strong>Microphone</strong> - Voice commands (optional)</li>
                </ul>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 24 }}>
                You may need to enable these in System Preferences → Security & Privacy
            </p>

            <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>
                Continue
            </button>
        </div>,

        // Ready
        <div key="ready" style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
            <div style={{
                width: 80,
                height: 80,
                margin: '0 auto',
                marginBottom: 24,
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <CheckCircleIcon style={{ width: 48, height: 48, color: 'white' }} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>You're All Set!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
                Try a command like "Open Chrome and search for weather" to get started.
            </p>

            <button className="btn btn-primary btn-lg" onClick={onComplete}>
                Start Using Phantom AI
            </button>
        </div>,
    ];

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: 40,
        }}>
            <div className="animate-fadeIn">
                {steps[step]}

                {/* Progress dots */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 40,
                }}>
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: i === step ? 'var(--accent-primary)' : 'var(--bg-hover)',
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
