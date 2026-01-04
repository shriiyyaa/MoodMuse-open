/**
 * MoodMuse - Premium Processing Screen
 * 
 * Elegant loading animation with neon blue accents.
 * Creates an intentional pause while gathering music.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMoodStore } from '@/stores/moodStore';

/**
 * Status messages displayed during processing
 */
const STATUS_MESSAGES = [
    'Understanding your mood…',
    'Finding music that resonates…',
    'Curating your perfect playlist…',
];

export default function ProcessingPage() {
    const router = useRouter();
    const { primaryMood, language } = useMoodStore();
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const state = useMoodStore.getState();
        if (!state.primaryMood || !state.language) {
            router.replace('/');
        }
    }, [router]);

    // Rotate messages
    useEffect(() => {
        const messageInterval = setInterval(() => {
            setMessageIndex((prev) => {
                if (prev < STATUS_MESSAGES.length - 1) {
                    return prev + 1;
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(messageInterval);
    }, []);

    // Navigate after delay
    useEffect(() => {
        const navigationTimeout = setTimeout(() => {
            router.push('/results');
        }, 3000);

        return () => clearTimeout(navigationTimeout);
    }, [router]);

    if (!primaryMood || !language) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">

            {/* Background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-30 animate-pulse-glow"
                    style={{
                        background: 'radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%)',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            </div>

            <div className="text-center relative z-10">

                {/* Loading Animation - Elegant rings */}
                <div className="relative w-24 h-24 mx-auto mb-10">
                    {/* Outer ring */}
                    <div
                        className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-spin"
                        style={{ animationDuration: '3s' }}
                    />
                    {/* Middle ring */}
                    <div
                        className="absolute inset-2 rounded-full border-2 border-cyan-400/40 animate-spin"
                        style={{ animationDuration: '2s', animationDirection: 'reverse' }}
                    />
                    {/* Inner ring */}
                    <div
                        className="absolute inset-4 rounded-full border-2 border-cyan-400/60 animate-spin"
                        style={{ animationDuration: '1.5s' }}
                    />
                    {/* Center dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse glow" />
                    </div>
                </div>

                {/* Status Message */}
                <p className="text-xl text-white/80 mb-4 h-8">
                    {STATUS_MESSAGES[messageIndex]}
                </p>

                {/* Mood indicator */}
                <div className="glass-subtle px-5 py-2.5 inline-flex items-center gap-3">
                    <span className="text-body-sm text-white/40">For your</span>
                    <span className="text-accent font-medium">{primaryMood}</span>
                </div>
            </div>
        </div>
    );
}
