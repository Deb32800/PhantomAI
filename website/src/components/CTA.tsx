'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-pink-500/20" />
            <div className="absolute inset-0 grid-bg opacity-30" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-primary-500 to-purple-500 mb-6">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-bold mb-6">
                        Ready to Automate<br />
                        <span className="gradient-text">Your Computer?</span>
                    </h2>

                    <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
                        Download Phantom AI today and start controlling your computer with natural language.
                        Free 7-day trial, no credit card required.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/download" className="btn-primary btn-large group">
                            Download Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/#pricing" className="btn-secondary btn-large">
                            View Pricing
                        </Link>
                    </div>

                    <p className="text-sm text-gray-500 mt-6">
                        Works on macOS, Windows, and Linux
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
