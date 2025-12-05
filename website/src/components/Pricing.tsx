'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

const plans = [
    {
        name: 'Free Trial',
        price: '$0',
        period: '7 days',
        description: 'Try Phantom AI free for a week',
        features: [
            'Full AI capabilities',
            'Up to 100 actions/day',
            'Basic workflows',
            'Community support',
        ],
        cta: 'Start Free Trial',
        ctaLink: '/download',
        popular: false,
    },
    {
        name: 'Pro Monthly',
        price: '$9.99',
        period: '/month',
        description: 'For power users and professionals',
        features: [
            'Unlimited actions',
            'Advanced workflows',
            'Voice commands',
            'Plugin system',
            'Priority support',
            'Early access features',
        ],
        cta: 'Get Pro Monthly',
        ctaLink: '/checkout?plan=monthly',
        popular: true,
    },
    {
        name: 'Pro Lifetime',
        price: '$49',
        period: 'one-time',
        description: 'Best value - pay once, own forever',
        features: [
            'Everything in Pro',
            'Lifetime updates',
            'No recurring fees',
            'Premium support',
            'Beta program access',
        ],
        cta: 'Get Lifetime Access',
        ctaLink: '/checkout?plan=lifetime',
        popular: false,
        badge: 'Best Value',
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="py-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />

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
                        Simple, <span className="gradient-text">Transparent Pricing</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Start free, upgrade when you need more. No hidden fees.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative rounded-2xl ${plan.popular
                                    ? 'bg-gradient-to-b from-primary-500/20 to-purple-500/20 border-primary-500/50'
                                    : 'glass'
                                } border p-6 flex flex-col`}
                        >
                            {/* Badge */}
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 text-xs font-medium">
                                        {plan.badge}
                                    </span>
                                </div>
                            )}

                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 text-xs font-medium flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Most Popular
                                    </span>
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-gray-400">{plan.period}</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">{plan.description}</p>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm">
                                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <Link
                                href={plan.ctaLink}
                                className={plan.popular ? 'btn-primary text-center' : 'btn-secondary text-center'}
                            >
                                {plan.cta}
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Guarantee */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center text-sm text-gray-500 mt-12"
                >
                    30-day money-back guarantee. No questions asked.
                </motion.p>
            </div>
        </section>
    );
}
