'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Monitor, MousePointer, Zap } from 'lucide-react';

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Effects */}
            <div className="absolute inset-0 hero-gradient" />
            <div className="absolute inset-0 grid-bg opacity-50" />

            {/* Floating Elements */}
            <motion.div
                className="absolute top-1/4 left-[15%] w-12 h-12 rounded-xl bg-primary-500/20 backdrop-blur-sm border border-primary-500/30"
                animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
                <Monitor className="w-6 h-6 text-primary-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </motion.div>

            <motion.div
                className="absolute top-1/3 right-[20%] w-10 h-10 rounded-lg bg-purple-500/20 backdrop-blur-sm border border-purple-500/30"
                animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
                <MousePointer className="w-5 h-5 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </motion.div>

            <motion.div
                className="absolute bottom-1/3 left-[20%] w-8 h-8 rounded-lg bg-pink-500/20 backdrop-blur-sm border border-pink-500/30"
                animate={{ y: [-15, 15, -15], rotate: [0, 10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            >
                <Zap className="w-4 h-4 text-pink-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </motion.div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
                >
                    <Sparkles className="w-4 h-4 text-primary-400" />
                    <span className="text-sm text-gray-300">Powered by local AI - Your data stays private</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6"
                >
                    Control Your Computer<br />
                    <span className="gradient-text">With Just Words</span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
                >
                    Phantom AI sees your screen and executes tasks using natural language.
                    Automate anything from web browsing to file management — no coding required.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                >
                    <Link href="/download" className="btn-primary btn-large group">
                        Download Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button className="btn-secondary btn-large">
                        <Play className="w-5 h-5" />
                        Watch Demo
                    </button>
                </motion.div>

                {/* App Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="relative max-w-4xl mx-auto"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur-3xl opacity-50" />
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-dark-50 shadow-2xl">
                        {/* Window Chrome */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-dark-100 border-b border-white/10">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <div className="flex-1 text-center text-sm text-gray-500">Phantom AI</div>
                        </div>

                        {/* App Content Placeholder */}
                        <div className="p-8 min-h-[400px] flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-8 h-8 text-primary-400" />
                                </div>
                                <div className="glass rounded-xl px-6 py-4 max-w-md mx-auto">
                                    <p className="text-gray-400">Try: "Open Chrome and search for the weather"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-wrap justify-center gap-8 sm:gap-16 mt-16"
                >
                    {[
                        { value: '100%', label: 'Local & Private' },
                        { value: '50+', label: 'Automation Actions' },
                        { value: '10K+', label: 'Beta Users' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
