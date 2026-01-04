/**
 * MoodMuse - Duration Selection Page
 * 
 * Beautiful UI for selecting listening duration.
 * Clicking any duration immediately navigates to the next page.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMoodStore } from '@/stores/moodStore';

/**
 * Duration options with estimated song counts - organized in rows
 */
const DURATION_OPTIONS = [
    { minutes: 15, label: '15 min', songs: '~4 songs' },
    { minutes: 30, label: '30 min', songs: '~9 songs' },
    { minutes: 45, label: '45 min', songs: '~13 songs' },
    { minutes: 60, label: '1 hour', songs: '~17 songs' },
    { minutes: 90, label: '1.5 hr', songs: '~26 songs' },
    { minutes: 120, label: '2 hours', songs: '~34 songs' },
    { minutes: 180, label: '3 hours', songs: '~51 songs' },
    { minutes: 240, label: '4 hours', songs: '~68 songs' },
];

export default function DurationPage() {
    const router = useRouter();
    const { primaryMood, language, setListeningDuration } = useMoodStore();

    // Redirect if no mood/language
    useEffect(() => {
        const state = useMoodStore.getState();
        if (!state.primaryMood || !state.language) {
            router.replace('/');
        }
    }, [router]);

    function handleDurationSelect(minutes: number) {
        // Immediately set duration and navigate
        setListeningDuration(minutes);
        router.push('/intent');
    }

    if (!primaryMood || !language) return null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">

            {/* Background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-25"
                    style={{
                        background: 'radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%)',
                        top: '-10%',
                        right: '10%',
                    }}
                />
                <div
                    className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(45, 212, 191, 0.4) 0%, transparent 70%)',
                        bottom: '10%',
                        left: '5%',
                    }}
                />
            </div>

            <div className="w-full max-w-lg relative z-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-title text-gradient mb-3">
                        How long do you want to vibe?
                    </h1>
                    <p className="subtitle" style={{ color: 'var(--color-text-muted)' }}>
                        Tap your preferred duration to continue
                    </p>
                </div>

                {/* Mood Badge */}
                <div className="flex justify-center mb-8">
                    <div className="glass-subtle px-5 py-2.5 inline-flex items-center gap-3">
                        <span className="text-caption">Feeling</span>
                        <span className="w-px h-4 bg-white/10" />
                        <span className="text-accent font-medium">{primaryMood}</span>
                        <span className="w-px h-4 bg-white/10" />
                        <span className="text-body-sm text-white/40">{language}</span>
                    </div>
                </div>

                {/* Duration Options Grid - All as buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {DURATION_OPTIONS.map((option) => (
                        <button
                            key={option.minutes}
                            onClick={() => handleDurationSelect(option.minutes)}
                            className="glass p-4 flex flex-col items-center gap-1.5 transition-all group
                                glass-hover hover:border-cyan-400/40 hover:bg-cyan-400/10 active:scale-95"
                        >
                            <span className="text-base font-semibold transition-colors group-hover:text-accent"
                                style={{ color: 'var(--color-text-primary)' }}>
                                {option.label}
                            </span>
                            <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                                {option.songs}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Quick tip */}
                <div className="text-center">
                    <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                        💡 Just tap any option to instantly continue
                    </p>
                </div>
            </div>
        </div>
    );
}
