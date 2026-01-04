/**
 * MoodMuse - Premium Mood Input Screen
 * 
 * Glassmorphism design with neon blue accents.
 * Users express their mood through text and/or emojis.
 */

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMoodStore } from '@/stores/moodStore';

export default function MoodInputPage() {
    const router = useRouter();

    // Local form state
    const [input, setInput] = useState('');

    // Global state from Zustand
    const {
        setSessionId,
        setUserInput,
        setMoodResult,
        isAnalyzing,
        setAnalyzing,
        error,
        setError,
    } = useMoodStore();

    /**
     * Create a new session if one doesn't exist.
     */
    async function ensureSession(): Promise<string> {
        const currentSessionId = useMoodStore.getState().sessionId;

        if (currentSessionId) {
            return currentSessionId;
        }

        const response = await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Failed to create session');
        }

        const data = await response.json();
        const newSessionId = data.data.sessionId;
        setSessionId(newSessionId);
        return newSessionId;
    }

    /**
     * Handle form submission
     */
    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        const trimmedInput = input.trim();
        if (!trimmedInput) {
            setError('Please share how you\'re feeling');
            return;
        }

        setError(null);
        setAnalyzing(true);

        try {
            let currentSessionId = await ensureSession();
            setUserInput(trimmedInput);

            let response = await fetch('/api/mood/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: currentSessionId,
                    text: trimmedInput,
                }),
            });

            // Handle session expiration
            if (response.status === 404) {
                setSessionId('');
                const newResponse = await fetch('/api/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!newResponse.ok) {
                    throw new Error('Failed to create new session');
                }

                const sessionData = await newResponse.json();
                currentSessionId = sessionData.data.sessionId;
                setSessionId(currentSessionId);

                response = await fetch('/api/mood/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: currentSessionId,
                        text: trimmedInput,
                    }),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze mood');
            }

            const data = await response.json();

            setMoodResult(
                data.data.vector,
                data.data.primaryMood,
                data.data.confidence
            );

            router.push('/language');

        } catch (err) {
            console.error('Mood analysis error:', err);
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setAnalyzing(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">

            {/* Background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-30"
                    style={{
                        background: 'radial-gradient(circle, rgba(0,212,255,0.5) 0%, transparent 70%)',
                        top: '10%',
                        right: '-10%',
                    }}
                />
                <div
                    className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(45, 212, 191, 0.5) 0%, transparent 70%)',
                        bottom: '20%',
                        left: '-5%',
                    }}
                />
            </div>

            <div className="w-full max-w-lg relative z-10">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-title text-gradient mb-3">
                        How are you feeling?
                    </h1>
                    <p className="text-body" style={{ color: 'var(--color-text-muted)' }}>
                        Type anything that describes how you feel
                    </p>
                </div>

                {/* Glass card with expand animation */}
                <div className="glass p-8 animate-scale-from-center">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Text Input */}
                        <div>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="I'm feeling..."
                                rows={4}
                                className="glass-input w-full px-5 py-4 text-lg resize-none"
                                disabled={isAnalyzing}
                            />

                            {/* Emoji suggestions */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {['😊', '😢', '😤', '🥰', '😴', '🎉', '😔', '✨'].map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setInput(prev => prev + emoji)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full
                                                   bg-white/5 hover:bg-white/10 border border-white/10
                                                   hover:border-cyan-400/30 transition-all text-lg
                                                   hover:scale-110"
                                        disabled={isAnalyzing}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>


                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-body-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button - consistent style, only functional disable */}
                        <button
                            type="submit"
                            disabled={isAnalyzing || !input.trim()}
                            className="btn-mood-cta w-full"
                        >
                            {isAnalyzing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Feeling your mood...
                                </span>
                            ) : (
                                'Find My Music →'
                            )}
                        </button>
                    </form>
                </div>

                {/* Hint */}
                <p className="text-center text-caption mt-6">
                    Your mood is analyzed with AI for the perfect playlist
                </p>
            </div>
        </div>
    );
}
