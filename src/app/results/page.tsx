/**
 * MoodMuse - Premium Results Screen
 * 
 * Features:
 * - Time-based playlists with auto-continue
 * - Continuous playback
 * - Mood shift detection after duration ends
 * - Glassmorphism song cards
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useMoodStore } from '@/stores/moodStore';
import MusicPlayer from '@/components/MusicPlayer';
import { EmotionalIntent, getModifiedMoodLabel } from '@/lib/mood/intentModifier';
// History removed as per user request

interface SongCard {
    id: string;
    title: string;
    artist: string;
    youtubeId: string;
    thumbnail?: string;
    explanation: string;
    score: number;
}

interface SongsResponse {
    success: boolean;
    data?: {
        headline: string;
        primaryMood: string;
        songs: SongCard[];
    };
    error?: string;
}

export default function ResultsPage() {
    const router = useRouter();

    const {
        sessionId,
        primaryMood,
        language,
        userInput,
        listeningDuration,
        skipCount,
        hasShownIntentPrompt,
        currentIntent,
        incrementSkipCount,
        resetSkipCount,
        setIntent,
        markIntentPromptShown,
        addSongsToPlaylist,
        reset,
    } = useMoodStore();

    const [headline, setHeadline] = useState<string>('');
    const [songs, setSongs] = useState<SongCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSongIndex, setSelectedSongIndex] = useState(0);
    const [showMoodShiftPrompt, setShowMoodShiftPrompt] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const loadedBatches = useRef(0);
    const usedSongIds = useRef<Set<string>>(new Set());

    // Calculate songs based on duration
    const songsNeeded = Math.ceil(listeningDuration / 3.5);

    useEffect(() => {
        const state = useMoodStore.getState();
        if (!state.primaryMood || !state.language || !state.sessionId) {
            router.replace('/');
        }
    }, [router]);

    const fetchSongs = useCallback(async (intent: EmotionalIntent = 'stay', appendMode = false) => {
        if (!sessionId || !language) return;

        if (!appendMode) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }
        setError(null);

        try {
            let response = await fetch('/api/songs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    language,
                    limit: songsNeeded,
                    intent: intent !== 'stay' ? intent : undefined,
                    excludeIds: Array.from(usedSongIds.current), // Exclude already played songs
                }),
            });

            // Handle session expiration - recreate session and retry
            if (response.status === 404) {
                console.log('Session expired, recreating...');

                // If we have client-side mood data, recreate session
                const currentState = useMoodStore.getState();
                if (currentState.moodVector && currentState.primaryMood) {
                    // Create new session
                    const sessionRes = await fetch('/api/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    });

                    if (sessionRes.ok) {
                        const sessionData = await sessionRes.json();
                        const newSessionId = sessionData.data.sessionId;
                        useMoodStore.setState({ sessionId: newSessionId });

                        // Re-analyze mood with new session
                        const analyzeRes = await fetch('/api/mood/analyze', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                sessionId: newSessionId,
                                text: currentState.userInput || currentState.primaryMood,
                            }),
                        });

                        if (analyzeRes.ok) {
                            // Update language
                            await fetch('/api/songs', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    sessionId: newSessionId,
                                    language: language,
                                }),
                            });

                            // Retry songs request with new session
                            response = await fetch('/api/songs', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    sessionId: newSessionId,
                                    language,
                                    limit: songsNeeded,
                                    intent: intent !== 'stay' ? intent : undefined,
                                    excludeIds: Array.from(usedSongIds.current),
                                }),
                            });
                        } else {
                            reset();
                            router.replace('/');
                            return;
                        }
                    } else {
                        reset();
                        router.replace('/');
                        return;
                    }
                } else {
                    reset();
                    router.replace('/');
                    return;
                }
            }

            const data: SongsResponse = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to fetch songs');
            }

            if (data.data) {
                const modifiedHeadline = intent !== 'stay'
                    ? `For ${getModifiedMoodLabel(primaryMood || '', intent)}`
                    : data.data.headline;

                // Track used song IDs
                data.data.songs.forEach(song => usedSongIds.current.add(song.id));

                if (appendMode) {
                    // Append new songs to existing list
                    setSongs(prev => [...prev, ...data.data!.songs]);
                    setToastMessage('Added more songs for you');
                    setTimeout(() => setToastMessage(null), 3000);
                } else {
                    setHeadline(modifiedHeadline);
                    setSongs(data.data.songs);
                    setSelectedSongIndex(0);

                    // Save session section removed
                }
                loadedBatches.current++;
            }
        } catch (err) {
            console.error('Failed to fetch songs:', err);
            if (!appendMode) {
                setError(err instanceof Error ? err.message : 'Failed to fetch songs');
            }
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [sessionId, language, primaryMood, reset, router, songsNeeded]);

    useEffect(() => {
        fetchSongs(currentIntent);
    }, []);

    // Auto-load more songs when approaching end of playlist
    const handlePlaylistNearEnd = useCallback(() => {
        if (!isLoadingMore) {
            fetchSongs(currentIntent, true); // Append mode
        }
    }, [fetchSongs, currentIntent, isLoadingMore]);

    const handleSkip = useCallback(() => {
        incrementSkipCount();
    }, [incrementSkipCount]);

    const handleSongPlayed = useCallback(() => {
        resetSkipCount();
    }, [resetSkipCount]);

    const handleSongChange = useCallback((index: number) => {
        setSelectedSongIndex(index);
    }, []);

    const handleIntentSelect = useCallback(async (intent: EmotionalIntent) => {
        setIntent(intent);
        if (intent !== 'stay') {
            usedSongIds.current.clear(); // Reset for new mood
            await fetchSongs(intent);
        }
    }, [setIntent, fetchSongs]);

    function handleFeelAgain() {
        reset();
        router.push('/mood');
    }

    function handleKeepVibing() {
        setShowMoodShiftPrompt(false);
        fetchSongs(currentIntent, true); // Load more songs
    }

    function handleMoodShifted() {
        reset();
        router.push('/mood');
    }

    function handleSelectSong(index: number) {
        setSelectedSongIndex(index);
    }

    if (!primaryMood || !language) return null;

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-10"
                        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                </div>
                <div className="relative z-10 w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin mb-4" />
                <p className="text-body text-white/60">Curating ~{songsNeeded} songs for you...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <p className="text-red-400 mb-6">{error}</p>
                <button onClick={handleFeelAgain} className="btn-primary">Try Again</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 relative">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
                    <div className="glass px-6 py-3 text-accent font-medium shadow-lg">
                        {toastMessage}
                    </div>
                </div>
            )}

            {/* Mood Shift Prompt */}
            {showMoodShiftPrompt && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
                    <div className="glass p-8 max-w-md w-full text-center animate-fade-in-up">
                        <h2 className="text-title text-gradient mb-4">Session Complete!</h2>
                        <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                            You&apos;ve listened for {listeningDuration} minutes. What would you like to do?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleKeepVibing}
                                className="btn-primary py-3"
                            >
                                Keep Vibing
                            </button>
                            <button
                                onClick={handleMoodShifted}
                                className="btn-ghost py-3"
                            >
                                Mood Shifted? Start Fresh
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
                {/* Orbs removed for plain theme */}
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header - Compact */}
                <header className="text-center mb-6 pt-4">
                    <h1 className="text-title text-gradient mb-1">{headline}</h1>
                    <div className="flex justify-center gap-2 text-caption" style={{ color: 'var(--color-text-muted)' }}>
                        <span>{language !== 'Any' ? language : 'All Languages'}</span>
                        <span>•</span>
                        <span>{songs.length} songs</span>
                        <span>•</span>
                        <span>~{Math.round(songs.length * 3.5)} min</span>
                    </div>
                    {isLoadingMore && (
                        <p className="text-accent text-xs mt-2 animate-pulse">Loading more songs...</p>
                    )}
                </header>

                {/* Main Layout - Player on top, playlist below */}
                <div className="space-y-6">
                    {/* Player Section */}
                    <div className="glass p-1">
                        <MusicPlayer
                            songs={songs.map(s => ({
                                id: s.id,
                                title: s.title,
                                artist: s.artist,
                                youtubeId: s.youtubeId,
                            }))}
                            initialIndex={selectedSongIndex}
                            skipCount={skipCount}
                            hasShownIntentPrompt={hasShownIntentPrompt}
                            onSkip={handleSkip}
                            onSongPlayed={handleSongPlayed}
                            onIntentSelect={handleIntentSelect}
                            onIntentPromptShown={markIntentPromptShown}
                            onSongChange={handleSongChange}
                            onPlaylistNearEnd={handlePlaylistNearEnd}
                            onFallback={() => {
                                setToastMessage('Official video restricted, playing alternative...');
                                setTimeout(() => setToastMessage(null), 4000);
                            }}
                        />
                    </div>

                    {/* Playlist Section - Compact horizontal scroll or grid */}
                    <div>
                        <div className="flex items-center justify-between px-1 mb-3">
                            <h3 className="text-body font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Up Next</h3>
                            <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                                {selectedSongIndex + 1} / {songs.length}
                            </span>
                        </div>

                        {/* Compact song list */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                            {songs.map((song, index) => (
                                <button
                                    key={song.id}
                                    onClick={() => handleSelectSong(index)}
                                    className={`text-left px-3 py-2 rounded-lg transition-all duration-200 group
                                        ${index === selectedSongIndex
                                            ? 'glass border-l-2 border-l-white bg-white/10'
                                            : 'bg-white/3 hover:bg-white/5 border-l-2 border-transparent'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                                            ${index === selectedSongIndex
                                                ? 'bg-white text-black'
                                                : 'bg-white/10 text-white/40 group-hover:bg-white/15'}`}>
                                            {index === selectedSongIndex ? '▶' : index + 1}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h4 className={`text-body-sm font-medium truncate
                                                ${index === selectedSongIndex ? 'text-accent' : ''}`}
                                                style={{ color: index === selectedSongIndex ? undefined : 'var(--color-text-primary)' }}>
                                                {song.title}
                                            </h4>
                                            <p className="text-caption truncate" style={{ color: 'var(--color-text-muted)' }}>
                                                {song.artist}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="text-center py-6">
                    <button onClick={handleFeelAgain} className="btn-ghost px-6 text-sm">
                        Start Over
                    </button>
                </div>
            </div>
        </div>
    );
}
