/**
 * MoodMuse - Songs API
 * 
 * POST /api/songs
 * Fetches emotionally matched songs for the user's mood.
 * Supports emotional intent modifiers for song re-matching.
 * 
 * Flow:
 * 1. Validate session has mood data
 * 2. Apply intent modifier if provided
 * 3. Match songs using mood vector similarity
 * 4. Generate explanations for each song
 * 5. Return results with empathetic headline
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session/store';
import { matchSongs, matchSongsGradient } from '@/lib/songs/matcher';
import { EmotionalIntent, applyIntentModifier } from '@/lib/mood/intentModifier';

/**
 * Request body schema
 */
interface SongsRequest {
    // Session ID (required - contains mood data)
    sessionId: string;

    // Language preference (optional - uses session default if not provided)
    language?: string;

    // Number of songs to return (optional, default: 15)
    limit?: number;

    // Emotional intent modifier (optional)
    // When user signals they want music to feel different
    intent?: EmotionalIntent;

    // Song IDs to exclude (already played songs)
    excludeIds?: string[];
}

/**
 * POST /api/songs
 * 
 * Get emotionally matched songs for the user's current mood.
 * Optionally applies intent modifiers for emotional resistance handling.
 */
export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body: SongsRequest = await request.json();

        // Validate session ID
        if (!body.sessionId) {
            return NextResponse.json({
                success: false,
                error: 'Session ID is required',
            }, { status: 400 });
        }

        // Get session
        const session = sessionStore.get(body.sessionId);
        if (!session) {
            return NextResponse.json({
                success: false,
                error: 'Session not found or expired',
            }, { status: 404 });
        }

        // Check that mood analysis has been completed
        if (!session.moodResult) {
            return NextResponse.json({
                success: false,
                error: 'Mood analysis not completed. Please analyze mood first.',
            }, { status: 400 });
        }

        // Get language (from request, or from session, or default to English)
        const language = body.language || session.language || 'English';

        // Update session with language if provided
        if (body.language && body.language !== session.language) {
            sessionStore.update(body.sessionId, { language: body.language });
        }

        // Apply intent modifier if provided
        // Match songs to mood
        const limit = Math.min(body.limit || 15, 100);
        const excludeIds = body.excludeIds || [];

        // Apply intent modifier to get the TARGET vector
        // For 'stay', this returns the original vector (gradient A -> A)
        // For others, it returns the shifted vector (gradient A -> B)
        const targetVector = applyIntentModifier(
            session.moodResult.vector,
            body.intent || 'stay'
        );

        // ALWAYS use gradient matching to ensure a smooth journey
        // User request: "resemble the mood and gradually came to a slightlier higher level"
        // This applies to all intents now.
        const result = await matchSongsGradient(
            session.moodResult,
            targetVector,
            language,
            limit,
            excludeIds
        );

        // Store songs in session and update step
        sessionStore.update(body.sessionId, {
            songs: result.songs,
            step: 'results',
        });

        // Return the results
        return NextResponse.json({
            success: true,
            data: {
                headline: result.headline,
                primaryMood: session.moodResult.primaryMood,
                intent: body.intent,
                songs: result.songs.map(match => ({
                    id: match.song.id,
                    title: match.song.title,
                    artist: match.song.artist,
                    youtubeId: match.song.youtubeId ? match.song.youtubeId.trim() : '',
                    thumbnail: match.song.thumbnail,
                    explanation: match.explanation,
                    score: Math.round(match.score * 100) / 100,
                })),
            },
        });

    } catch (error) {
        console.error('Songs API error:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to fetch songs. Please try again.',
        }, { status: 500 });
    }
}

/**
 * PATCH /api/songs
 * 
 * Update language preference for the session.
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.sessionId) {
            return NextResponse.json({
                success: false,
                error: 'Session ID is required',
            }, { status: 400 });
        }

        if (!body.language) {
            return NextResponse.json({
                success: false,
                error: 'Language is required',
            }, { status: 400 });
        }

        const session = sessionStore.get(body.sessionId);
        if (!session) {
            return NextResponse.json({
                success: false,
                error: 'Session not found or expired',
            }, { status: 404 });
        }

        // Update language
        sessionStore.update(body.sessionId, {
            language: body.language,
            step: 'processing',
        });

        return NextResponse.json({
            success: true,
            data: {
                language: body.language,
                nextStep: '/processing',
            },
        });

    } catch (error) {
        console.error('Language update error:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to update language',
        }, { status: 500 });
    }
}
