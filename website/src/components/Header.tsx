'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';

const navLinks = [
    { href: '/#features', label: 'Features' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/docs', label: 'Docs' },
    { href: '/blog', label: 'Blog' },
];

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-dark/80 backdrop-blur-lg border-b border-white/10' : ''
                }`}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Sparkles className="w-8 h-8 text-primary-500" />
                        <span className="text-xl font-bold gradient-text">Phantom AI</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden lg:flex items-center gap-4">
                        <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                            Log in
                        </Link>
                        <Link href="/download" className="btn-primary">
                            Download Free
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-dark-50 border-b border-white/10"
                    >
                        <div className="px-4 py-6 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block text-lg text-gray-300 hover:text-white"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                                <Link href="/login" className="btn-secondary text-center">
                                    Log in
                                </Link>
                                <Link href="/download" className="btn-primary text-center">
                                    Download Free
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
