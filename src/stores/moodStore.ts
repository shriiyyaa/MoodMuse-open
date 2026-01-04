/**
 * MoodMuse - Mood Store (Zustand)
 * 
 * Client-side state management for the mood flow.
 * Stores session ID, mood analysis results, user preferences,
 * and emotional intent tracking.
 */

import { create } from 'zustand';
import { MoodVector } from '@/lib/mood/types';
import { EmotionalIntent } from '@/lib/mood/intentModifier';

/**
 * Shape of a song in the results
 */
export interface SongResult {
    id: string;
    title: string;
    artist: string;
    youtubeId: string;
    thumbnail?: string;
    explanation: string;
    score: number;
}

/**
 * Mood store state
 */
interface MoodState {
    // Session
    sessionId: string | null;

    // Mood analysis results
    moodVector: MoodVector | null;
    primaryMood: string | null;
    confidence: number | null;

    // User input (for display/reference)
    userInput: string;

    // Language preference
    language: string | null;

    // Listening duration (in minutes)
    listeningDuration: number;
    totalPlayedMinutes: number;

    // Song results
    headline: string | null;
    songs: SongResult[];
    playedSongIds: string[]; // Track which songs have been played to avoid duplicates

    // Loading states
    isAnalyzing: boolean;
    isFetchingSongs: boolean;

    // Error state
    error: string | null;

    // Emotional Intent Tracking
    skipCount: number;
    hasShownIntentPrompt: boolean;  // Only show once per session per mood
    currentIntent: EmotionalIntent;
}

/**
 * Mood store actions
 */
interface MoodActions {
    // Session
    setSessionId: (id: string) => void;

    // Mood
    setUserInput: (input: string) => void;
    setMoodResult: (vector: MoodVector, primaryMood: string, confidence: number) => void;

    // Language
    setLanguage: (language: string) => void;

    // Duration
    setListeningDuration: (minutes: number) => void;
    addPlayedMinutes: (minutes: number) => void;
    addSongsToPlaylist: (newSongs: SongResult[]) => void;
    markSongPlayed: (songId: string) => void;

    // Songs
    setSongResults: (headline: string, songs: SongResult[]) => void;

    // Loading
    setAnalyzing: (isAnalyzing: boolean) => void;
    setFetchingSongs: (isFetching: boolean) => void;

    // Error
    setError: (error: string | null) => void;

    // Emotional Intent
    incrementSkipCount: () => void;
    resetSkipCount: () => void;
    setIntent: (intent: EmotionalIntent) => void;
    markIntentPromptShown: () => void;

    // History replay helpers
    setMood: (mood: string, input: string) => void;
    setDuration: (minutes: number) => void;
    setSongs: (songs: SongResult[]) => void;

    // Reset
    reset: () => void;
}

/**
 * Initial state
 */
const initialState: MoodState = {
    sessionId: null,
    moodVector: null,
    primaryMood: null,
    confidence: null,
    userInput: '',
    language: null,
    // Duration tracking
    listeningDuration: 30, // Default 30 minutes
    totalPlayedMinutes: 0,
    headline: null,
    songs: [],
    playedSongIds: [],
    isAnalyzing: false,
    isFetchingSongs: false,
    error: null,
    // Intent tracking
    skipCount: 0,
    hasShownIntentPrompt: false,
    currentIntent: 'stay',
};

/**
 * Create the mood store (simple, no persistence)
 */
export const useMoodStore = create<MoodState & MoodActions>((set) => ({
    ...initialState,

    // Session
    setSessionId: (id) => set({ sessionId: id }),

    // Mood
    setUserInput: (input) => set({ userInput: input }),
    setMoodResult: (vector, primaryMood, confidence) => set({
        moodVector: vector,
        primaryMood,
        confidence,
        error: null,
        // Reset intent tracking for new mood
        skipCount: 0,
        hasShownIntentPrompt: false,
        currentIntent: 'stay',
    }),

    // Language
    setLanguage: (language) => set({ language }),

    // Duration
    setListeningDuration: (minutes) => set({ listeningDuration: minutes }),
    addPlayedMinutes: (minutes) => set((state) => ({
        totalPlayedMinutes: state.totalPlayedMinutes + minutes
    })),
    addSongsToPlaylist: (newSongs) => set((state) => ({
        songs: [...state.songs, ...newSongs],
    })),
    markSongPlayed: (songId) => set((state) => ({
        playedSongIds: [...state.playedSongIds, songId],
    })),

    // Songs
    setSongResults: (headline, songs) => set({
        headline,
        songs,
        playedSongIds: [],
        totalPlayedMinutes: 0,
        error: null,
    }),

    // Loading
    setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
    setFetchingSongs: (isFetching) => set({ isFetchingSongs: isFetching }),

    // Error
    setError: (error) => set({ error }),

    // Emotional Intent
    incrementSkipCount: () => set((state) => ({ skipCount: state.skipCount + 1 })),
    resetSkipCount: () => set({ skipCount: 0 }),
    setIntent: (intent) => set({
        currentIntent: intent,
        skipCount: 0,  // Reset skips when intent is set
    }),
    markIntentPromptShown: () => set({ hasShownIntentPrompt: true }),

    // History replay helpers
    setMood: (mood, input) => set({
        primaryMood: mood,
        userInput: input,
    }),
    setDuration: (minutes) => set({ listeningDuration: minutes }),
    setSongs: (songs) => set({
        songs: songs,
        headline: 'Your Previous Playlist',
    }),

    // Reset
    reset: () => set(initialState),
}));
