'use client';

import { motion } from 'framer-motion';
import {
    Monitor, MousePointer, Keyboard, Bot, Shield, Zap,
    Globe, FolderOpen, MessageSquare, Eye, Clock, Plug
} from 'lucide-react';

const features = [
    {
        icon: Eye,
        title: 'Screen Understanding',
        description: 'AI sees and understands everything on your screen in real-time.',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        icon: MousePointer,
        title: 'Mouse Control',
        description: 'Click, drag, scroll, and hover with pixel-perfect precision.',
        color: 'from-purple-500 to-pink-500',
    },
    {
        icon: Keyboard,
        title: 'Keyboard Automation',
        description: 'Type text, execute shortcuts, and fill forms automatically.',
        color: 'from-green-500 to-emerald-500',
    },
    {
        icon: Globe,
        title: 'Web Browsing',
        description: 'Navigate websites, search the web, and extract information.',
        color: 'from-orange-500 to-red-500',
    },
    {
        icon: FolderOpen,
        title: 'File Management',
        description: 'Create, move, rename, and organize files and folders.',
        color: 'from-yellow-500 to-orange-500',
    },
    {
        icon: MessageSquare,
        title: 'Voice Commands',
        description: 'Speak naturally and let AI execute your instructions.',
        color: 'from-pink-500 to-rose-500',
    },
    {
        icon: Shield,
        title: 'Safe & Private',
        description: 'All AI runs locally. Your data never leaves your computer.',
        color: 'from-teal-500 to-green-500',
    },
    {
        icon: Clock,
        title: 'Workflow Recording',
        description: 'Record and replay complex multi-step workflows.',
        color: 'from-indigo-500 to-purple-500',
    },
    {
        icon: Plug,
        title: 'Plugin System',
        description: 'Extend functionality with community-built plugins.',
        color: 'from-cyan-500 to-blue-500',
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Everything You Need to <span className="gradient-text">Automate Anything</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Phantom AI gives you complete control over your computer through natural language.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl -z-10"
                                style={{ background: `linear-gradient(135deg, ${feature.color.split(' ')[0].replace('from-', '')}40, ${feature.color.split(' ')[1].replace('to-', '')}40)` }}
                            />

                            <div className="glass rounded-2xl p-6 h-full hover:border-white/20 transition-colors">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-400 text-sm">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
