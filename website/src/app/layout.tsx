import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Phantom AI - AI-Powered Desktop Automation',
    description: 'Control your computer with natural language. An AI assistant that sees your screen and automates tasks.',
    keywords: ['AI', 'desktop automation', 'screen control', 'productivity', 'artificial intelligence'],
    authors: [{ name: 'Phantom AI' }],
    openGraph: {
        title: 'Phantom AI - AI-Powered Desktop Automation',
        description: 'Control your computer with natural language.',
        url: 'https://phantom-ai.app',
        siteName: 'Phantom AI',
        images: [{ url: '/og-image.png', width: 1200, height: 630 }],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Phantom AI - AI-Powered Desktop Automation',
        description: 'Control your computer with natural language.',
        images: ['/og-image.png'],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={`${inter.className} antialiased`}>
                <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                </div>
            </body>
        </html>
    );
}
