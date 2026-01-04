/**
 * MoodMuse - Session API
 * 
 * POST /api/session
 * Creates a new session for the user's mood journey.
 * 
 * Returns a session ID that tracks their progress through:
 * mood input → language selection → processing → results
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sessionStore } from '@/lib/session/store';

/**
 * POST /api/session
 * 
 * Creates a new session and returns the session ID.
 * No authentication required - sessions are anonymous.
 */
export async function POST(request: NextRequest) {
    try {
        // Generate a unique session ID
        const sessionId = uuidv4();

        // Create the session in our store
        const session = sessionStore.create(sessionId);

        // Return the session info
        return NextResponse.json({
            success: true,
            data: {
                sessionId: session.id,
                expiresAt: session.expiresAt.toISOString(),
                step: session.step,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Session creation error:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to create session',
        }, { status: 500 });
    }
}

/**
 * GET /api/session?id=<sessionId>
 * 
 * Retrieves the current state of a session.
 * Useful for resuming a session or checking status.
 */
export async function GET(request: NextRequest) {
    try {
        const sessionId = request.nextUrl.searchParams.get('id');

        if (!sessionId) {
            return NextResponse.json({
                success: false,
                error: 'Session ID is required',
            }, { status: 400 });
        }

        const session = sessionStore.get(sessionId);

        if (!session) {
            return NextResponse.json({
                success: false,
                error: 'Session not found or expired',
            }, { status: 404 });
        }

        // Return session state (excluding internal details)
        return NextResponse.json({
            success: true,
            data: {
                sessionId: session.id,
                step: session.step,
                hasMood: !!session.moodResult,
                hasLanguage: !!session.language,
                hasSongs: !!session.songs,
                expiresAt: session.expiresAt.toISOString(),
            },
        });

    } catch (error) {
        console.error('Session retrieval error:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve session',
        }, { status: 500 });
    }
}
