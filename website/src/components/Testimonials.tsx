'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Sarah Chen',
        role: 'Product Designer',
        avatar: 'SC',
        content: 'Phantom AI has completely changed how I work. I can focus on design while it handles repetitive tasks like organizing files and filling forms.',
        rating: 5,
    },
    {
        name: 'Michael Roberts',
        role: 'Software Developer',
        avatar: 'MR',
        content: 'The fact that it runs completely locally sold me. No privacy concerns, no latency, and it actually understands what I need.',
        rating: 5,
    },
    {
        name: 'Emily Watson',
        role: 'Marketing Manager',
        avatar: 'EW',
        content: 'I automate my entire morning routine now. Opens my email, calendar, Slack, and even summarizes my day - all with one command.',
        rating: 5,
    },
];

export function Testimonials() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-purple-500/5" />

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
                        Loved by <span className="gradient-text">Thousands</span>
                    </h2>
                    <p className="text-lg text-gray-400">
                        See what our beta users are saying about Phantom AI.
                    </p>
                </motion.div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="glass rounded-2xl p-6"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-gray-300 mb-6">"{testimonial.content}"</p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-sm font-medium">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="font-medium">{testimonial.name}</div>
                                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
