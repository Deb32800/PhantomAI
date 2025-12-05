'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Eye, MousePointer, Check } from 'lucide-react';

const steps = [
    {
        number: '01',
        icon: MessageSquare,
        title: 'Describe What You Want',
        description: 'Type or speak a natural language command like "Open Chrome and search for restaurants nearby"',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        number: '02',
        icon: Eye,
        title: 'AI Analyzes Your Screen',
        description: 'Phantom AI captures and understands your screen, identifying buttons, text, and interactive elements.',
        color: 'from-purple-500 to-pink-500',
    },
    {
        number: '03',
        icon: MousePointer,
        title: 'Automated Execution',
        description: 'The AI controls your mouse and keyboard to complete the task, step by step.',
        color: 'from-orange-500 to-red-500',
    },
    {
        number: '04',
        icon: Check,
        title: 'Task Complete',
        description: 'Your task is done! Review the activity log to see exactly what happened.',
        color: 'from-green-500 to-emerald-500',
    },
];

export function HowItWorks() {
    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        How <span className="gradient-text">Phantom AI</span> Works
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        From command to completion in seconds. No technical skills required.
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            className="relative"
                        >
                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-white/20 to-transparent" />
                            )}

                            <div className="text-center">
                                {/* Number */}
                                <div className="text-6xl font-bold text-white/5 mb-4">{step.number}</div>

                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mx-auto mb-4 -mt-12`}>
                                    <step.icon className="w-8 h-8 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-400">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
