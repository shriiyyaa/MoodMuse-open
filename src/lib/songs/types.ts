/**
 * MoodMuse - Song Types
 * 
 * Type definitions for the music matching system.
 */

import { MoodVector } from '@/lib/mood/types';

/**
 * Represents a song in our database with emotional metadata.
 */
export interface Song {
    // Unique identifier
    id: string;

    // Song metadata
    title: string;
    artist: string;

    // YouTube video ID for playback (mocked for v1)
    youtubeId: string;

    // Language of the song
    language: string;

    // Thumbnail URL
    thumbnail?: string;

    // The song's emotional profile (same dimensions as MoodVector)
    emotionalProfile: MoodVector;

    // Thematic tags for additional matching
    // Examples: "heartbreak", "hope", "nostalgia", "energy"
    themes: string[];

    // Sonic/production mood descriptors
    // Examples: "acoustic", "electronic", "orchestral", "lo-fi"
    sonicMood: string[];

    // What situations this song is good for
    // Examples: "late night", "workout", "crying", "road trip"
    bestFor: string[];
}

/**
 * A matched song with explanation.
 */
export interface SongMatch {
    // The matched song
    song: Song;

    // Similarity score (0-1) between song and user's mood
    score: number;

    // Human-readable explanation of why this song fits
    explanation: string;
}

/**
 * Request payload for song matching.
 */
export interface SongMatchRequest {
    // Session ID (contains mood data)
    sessionId: string;

    // Language preference (optional, uses session default)
    language?: string;

    // Number of songs to return (default: 5)
    limit?: number;
}

/**
 * Response from song matching endpoint.
 */
export interface SongMatchResponse {
    // Empathetic headline summarizing the mood
    // Example: "For your quiet storm ☁️"
    headline: string;

    // Matched songs with explanations
    songs: SongMatch[];
}
