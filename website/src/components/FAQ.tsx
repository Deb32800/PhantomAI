'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        question: 'Is my data safe with Phantom AI?',
        answer: 'Absolutely. Phantom AI runs 100% locally on your computer using Ollama. Your screen data, commands, and activity never leave your device. We have no servers that collect your data.',
    },
    {
        question: 'What AI models does it use?',
        answer: 'Phantom AI uses vision-capable models from Ollama like LLaVA and Qwen-VL. These run entirely on your computer, so you don\'t need an internet connection or API keys.',
    },
    {
        question: 'What operating systems are supported?',
        answer: 'Phantom AI supports macOS (11+), Windows (10+), and Linux (Ubuntu 20.04+). Our installers are available for all platforms on the download page.',
    },
    {
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes! You can cancel your Pro subscription at any time. You\'ll continue to have access until the end of your billing period. Lifetime licenses never expire.',
    },
    {
        question: 'What if I need help?',
        answer: 'We offer community support via Discord for free users, and priority email support for Pro users. Check our documentation for guides and tutorials.',
    },
    {
        question: 'How is this different from other automation tools?',
        answer: 'Unlike traditional automation tools, Phantom AI uses vision AI to understand your screen like a human would. You don\'t need to write scripts or learn complex workflows - just describe what you want in plain English.',
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24 relative">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Frequently Asked <span className="gradient-text">Questions</span>
                    </h2>
                    <p className="text-lg text-gray-400">
                        Got questions? We've got answers.
                    </p>
                </motion.div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className="glass rounded-xl overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-5 text-left"
                            >
                                <span className="font-medium pr-4">{faq.question}</span>
                                <ChevronDown
                                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 text-gray-400">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
