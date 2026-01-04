/**
 * MoodMuse - Premium Intent Selection Screen
 * 
 * Glassmorphism cards with beautiful hover effects.
 * Users choose how music should relate to their mood.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMoodStore } from '@/stores/moodStore';
import { EmotionalIntent } from '@/lib/mood/intentModifier';

/**
 * Intent options with rich descriptions
 */
const INTENT_CHOICES = [
    {
        id: 'stay' as EmotionalIntent,
        title: 'Sit with it',
        subtitle: 'Match my mood exactly',
        description: 'Songs that understand exactly how I feel right now',
        gradient: 'from-cyan-400/20 to-cyan-600/20',
    },
    {
        id: 'lift' as EmotionalIntent,
        title: 'Lift me slowly',
        subtitle: 'Gradually feel better',
        description: 'Start where I am, then gently add hope and energy',
        gradient: 'from-teal-400/20 to-teal-600/20',
    },
    {
        id: 'distract' as EmotionalIntent,
        title: 'Change my vibe',
        subtitle: 'Something different',
        description: 'Lighter, easier listening to shift my mood',
        gradient: 'from-sky-400/20 to-sky-600/20',
    },
    {
        id: 'surprise' as EmotionalIntent,
        title: 'Surprise me',
        subtitle: 'Take me somewhere new',
        description: 'A gentle shift to something unexpected',
        gradient: 'from-indigo-400/20 to-indigo-600/20',
    },
];

export default function IntentPage() {
    const router = useRouter();
    const { primaryMood, language, setIntent } = useMoodStore();

    useEffect(() => {
        const state = useMoodStore.getState();
        if (!state.primaryMood) {
            router.replace('/');
        } else if (!state.language) {
            router.replace('/');
        }
    }, [router]);

    function handleIntentSelect(intent: EmotionalIntent) {
        setIntent(intent);
        router.push('/processing');
    }

    if (!primaryMood || !language) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">

            {/* Background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%)',
                        top: '20%',
                        right: '-15%',
                    }}
                />
                <div
                    className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-15"
                    style={{
                        background: 'radial-gradient(circle, rgba(45, 212, 191, 0.4) 0%, transparent 70%)',
                        bottom: '10%',
                        left: '-10%',
                    }}
                />
            </div>

            <div className="w-full max-w-lg relative z-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-title text-gradient mb-3">
                        How should the music feel?
                    </h1>
                    <p className="text-body" style={{ color: 'var(--color-text-muted)' }}>
                        Choose how the songs relate to your mood
                    </p>
                </div>

                {/* Current Context Badge */}
                <div className="flex justify-center mb-8">
                    <div className="glass-subtle px-5 py-2.5 inline-flex items-center gap-3">
                        <span className="text-accent font-medium">{primaryMood}</span>
                        <span className="w-px h-4 bg-white/10" />
                        <span className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>{language}</span>
                    </div>
                </div>

                {/* Intent Options - Compact Cards */}
                <div className="space-y-2">
                    {INTENT_CHOICES.map((choice, index) => (
                        <button
                            key={choice.id}
                            onClick={() => handleIntentSelect(choice.id)}
                            className="w-full glass glass-hover px-4 py-3 text-left group
                                     animate-fade-in-up opacity-0"
                            style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
                        >
                            <div className="flex items-center gap-3">
                                {/* Small visual indicator */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                                              bg-gradient-to-br ${choice.gradient}
                                              group-hover:scale-110 transition-transform shrink-0`}>
                                    <div className="w-2 h-2 rounded-full bg-accent/60" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-body font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                            {choice.title}
                                        </h3>
                                        <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                                            {choice.subtitle}
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <svg
                                    className="w-4 h-4 text-white/20 group-hover:text-accent 
                                             group-hover:translate-x-1 transition-all shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Skip option */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => handleIntentSelect('stay')}
                        className="btn-ghost"
                    >
                        Skip — just match my mood
                    </button>
                </div>
            </div>
        </div>
    );
}
