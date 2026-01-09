/**
 * MoodMuse - Premium Language Selection Screen
 * 
 * Glassmorphism cards with neon blue accents.
 * Users select single or mixed language preferences.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMoodStore } from '@/stores/moodStore';

/**
 * Language options with categories
 */
const LANGUAGES = [
    // Single Languages
    { code: 'English', label: 'English', category: 'single' },
    { code: 'Hindi', label: 'Hindi', category: 'single' },
    { code: 'Punjabi', label: 'Punjabi', category: 'single' },

    // Mixed Languages
    { code: 'Hindi+English', label: 'Hindi + English', category: 'mixed' },
    { code: 'Hindi+Punjabi', label: 'Hindi + Punjabi', category: 'mixed' },
    { code: 'All', label: 'All Languages', category: 'all' },
];

export default function LanguagePage() {
    const router = useRouter();
    const { primaryMood, confidence, setLanguage } = useMoodStore();

    useEffect(() => {
        const state = useMoodStore.getState();
        if (!state.primaryMood) {
            router.replace('/');
        }
    }, [router]);

    function handleLanguageSelect(languageCode: string) {
        setLanguage(languageCode);
        router.push('/duration');
    }

    if (!primaryMood) {
        return null;
    }

    const singleLanguages = LANGUAGES.filter(l => l.category === 'single');
    const mixedLanguages = LANGUAGES.filter(l => l.category === 'mixed' || l.category === 'all');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">

            {/* Background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-25"
                    style={{
                        background: 'radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%)',
                        top: '-10%',
                        left: '20%',
                    }}
                />
                <div
                    className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(45, 212, 191, 0.4) 0%, transparent 70%)',
                        bottom: '0%',
                        right: '10%',
                    }}
                />
            </div>

            <div className="w-full max-w-lg relative z-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-title text-gradient mb-3">
                        Choose your language
                    </h1>
                    <p className="subtitle" style={{ color: 'var(--color-text-muted)' }}>
                        This is just for this session — you can change next time
                    </p>
                </div>

                {/* Detected Mood Badge */}
                <div className="flex justify-center mb-8">
                    <div className="glass-subtle px-5 py-2.5 inline-flex items-center gap-3">
                        <span className="text-caption">Your mood</span>
                        <span className="w-px h-4 bg-white/10" />
                        <span className="text-accent font-medium">{primaryMood}</span>
                        {confidence && (
                            <>
                                <span className="w-px h-4 bg-white/10" />
                                <span className="text-body-sm text-white/40">
                                    {Math.round(confidence * 100)}%
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Single Languages */}
                <div className="mb-6">
                    <p className="text-caption mb-3 px-1">Single Language</p>
                    <div className="grid grid-cols-4 gap-3">
                        {singleLanguages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageSelect(lang.code)}
                                className="glass glass-hover p-4 flex flex-col items-center justify-center
                                         hover:border-cyan-400/40 transition-all group"
                            >
                                <span className="text-body font-medium text-white/80 group-hover:text-accent transition-colors">
                                    {lang.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mixed Languages */}
                <div>
                    <p className="text-caption mb-3 px-1">Mix It Up</p>
                    <div className="grid grid-cols-2 gap-3">
                        {mixedLanguages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageSelect(lang.code)}
                                className={`glass glass-hover p-4 flex items-center justify-center
                                          hover:border-cyan-400/40 transition-all group
                                          ${lang.category === 'all' ? 'col-span-2' : ''}`}
                            >
                                <span className="text-body font-medium text-white/80 group-hover:text-accent transition-colors">
                                    {lang.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
