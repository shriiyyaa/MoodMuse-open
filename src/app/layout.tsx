/**
 * MoodMuse - Root Layout
 * 
 * Premium design with:
 * - Pacifico for logo/brand (curvy, playful)
 * - Open Sans for body text (clean, readable)
 * - Dark theme only with neon accents
 */

import type { Metadata, Viewport } from 'next';
import { Pacifico, Open_Sans } from 'next/font/google';
import './globals.css';

// Pacifico for logo/headings - curvy and playful
const pacifico = Pacifico({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-logo',
    weight: '400',
});

// Open Sans for body text - clean and readable
const openSans = Open_Sans({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-body',
    weight: ['300', '400', '500', '600', '700', '800'],
});

// Viewport settings (themeColor must be here, not in metadata)
export const viewport: Viewport = {
    themeColor: '#050505',
};

// SEO Metadata
export const metadata: Metadata = {
    title: 'MoodMuse - Music for How You Feel',
    description: 'An emotion-first music companion that helps you find the right music for how you feel right now.',
    keywords: ['music', 'mood', 'emotions', 'playlist', 'recommendation', 'AI'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${pacifico.variable} ${openSans.variable}`}>
            <body className="antialiased">
                {/* Main content wrapper */}
                <main className="min-h-screen flex flex-col">
                    {children}
                </main>
            </body>
        </html>
    );
}
