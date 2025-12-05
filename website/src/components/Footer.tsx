import Link from 'next/link';
import { Sparkles, Github, Twitter, Mail } from 'lucide-react';

const footerLinks = {
    product: [
        { label: 'Features', href: '/#features' },
        { label: 'Pricing', href: '/#pricing' },
        { label: 'Download', href: '/download' },
        { label: 'Changelog', href: '/changelog' },
    ],
    resources: [
        { label: 'Documentation', href: '/docs' },
        { label: 'API Reference', href: '/docs/api' },
        { label: 'Blog', href: '/blog' },
        { label: 'Support', href: '/support' },
    ],
    company: [
        { label: 'About', href: '/about' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Contact', href: '/contact' },
    ],
};

export function Footer() {
    return (
        <footer className="border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-6 h-6 text-primary-500" />
                            <span className="text-lg font-bold">Phantom AI</span>
                        </Link>
                        <p className="text-sm text-gray-400 mb-4">
                            AI-powered desktop automation that runs 100% locally.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://github.com" target="_blank" rel="noopener" className="text-gray-400 hover:text-white transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="mailto:hello@phantom-ai.app" className="text-gray-400 hover:text-white transition-colors">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2">
                            {footerLinks.product.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2">
                            {footerLinks.resources.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Phantom AI. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-500">
                        Made with ❤️ for productivity enthusiasts
                    </p>
                </div>
            </div>
        </footer>
    );
}
