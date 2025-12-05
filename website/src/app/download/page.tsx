'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Download, Apple, Monitor, Terminal,
    Check, Shield, Zap, HardDrive
} from 'lucide-react';

type Platform = 'mac' | 'windows' | 'linux' | 'unknown';

const platforms = {
    mac: {
        name: 'macOS',
        icon: Apple,
        requirement: 'macOS 11 (Big Sur) or later',
        downloadUrl: '/releases/phantom-ai-mac.dmg',
        size: '~120 MB',
    },
    windows: {
        name: 'Windows',
        icon: Monitor,
        requirement: 'Windows 10 or later',
        downloadUrl: '/releases/phantom-ai-windows.exe',
        size: '~130 MB',
    },
    linux: {
        name: 'Linux',
        icon: Terminal,
        requirement: 'Ubuntu 20.04, Fedora 35, or later',
        downloadUrl: '/releases/phantom-ai-linux.AppImage',
        size: '~125 MB',
    },
};

function detectPlatform(): Platform {
    if (typeof window === 'undefined') return 'unknown';

    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('mac')) return 'mac';
    if (userAgent.includes('win')) return 'windows';
    if (userAgent.includes('linux')) return 'linux';

    return 'unknown';
}

export default function DownloadPage() {
    const [detectedPlatform, setDetectedPlatform] = useState<Platform>('unknown');
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>('mac');

    useEffect(() => {
        const platform = detectPlatform();
        setDetectedPlatform(platform);
        if (platform !== 'unknown') {
            setSelectedPlatform(platform);
        }
    }, []);

    const currentPlatform = platforms[selectedPlatform];

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        Download <span className="gradient-text">Phantom AI</span>
                    </h1>
                    <p className="text-lg text-gray-400">
                        Free 7-day trial. No credit card required.
                    </p>
                </motion.div>

                {/* Platform Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex justify-center gap-4 mb-8"
                >
                    {(Object.keys(platforms) as Platform[]).map((platform) => {
                        const p = platforms[platform];
                        const Icon = p.icon;
                        return (
                            <button
                                key={platform}
                                onClick={() => setSelectedPlatform(platform)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedPlatform === platform
                                        ? 'bg-primary-500 text-white'
                                        : 'glass hover:bg-white/10'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {p.name}
                                {detectedPlatform === platform && (
                                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Detected</span>
                                )}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Download Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="glass rounded-2xl p-8 mb-8"
                >
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
                            <currentPlatform.icon className="w-10 h-10 text-white" />
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-2xl font-bold mb-2">
                                Phantom AI for {currentPlatform.name}
                            </h2>
                            <p className="text-gray-400 mb-1">{currentPlatform.requirement}</p>
                            <p className="text-sm text-gray-500">Download size: {currentPlatform.size}</p>
                        </div>

                        <Link
                            href={currentPlatform.downloadUrl}
                            className="btn-primary btn-large"
                        >
                            <Download className="w-5 h-5" />
                            Download
                        </Link>
                    </div>
                </motion.div>

                {/* Requirements */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="grid sm:grid-cols-3 gap-4 mb-12"
                >
                    {[
                        { icon: HardDrive, label: '8GB RAM minimum' },
                        { icon: Zap, label: 'Ollama (auto-installed)' },
                        { icon: Shield, label: 'Accessibility permissions' },
                    ].map((req) => (
                        <div key={req.label} className="glass rounded-xl p-4 flex items-center gap-3">
                            <req.icon className="w-5 h-5 text-primary-400" />
                            <span className="text-sm text-gray-300">{req.label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Installation Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="glass rounded-2xl p-8"
                >
                    <h3 className="text-xl font-semibold mb-6">Quick Start</h3>

                    <ol className="space-y-4">
                        {[
                            'Download and install Phantom AI',
                            'Grant accessibility and screen recording permissions',
                            'Ollama will be installed automatically (or use existing)',
                            'Start automating with natural language!',
                        ].map((step, index) => (
                            <li key={index} className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary-400 font-medium">{index + 1}</span>
                                </div>
                                <span className="text-gray-300 pt-1">{step}</span>
                            </li>
                        ))}
                    </ol>
                </motion.div>

                {/* Pro Upgrade Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-center mt-8"
                >
                    <p className="text-gray-400">
                        Need unlimited access?{' '}
                        <Link href="/#pricing" className="text-primary-400 hover:underline">
                            Upgrade to Pro
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
