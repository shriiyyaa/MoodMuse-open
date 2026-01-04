/**
 * MoodMuse - Mood Analysis API
 * 
 * POST /api/mood/analyze
 * Analyzes text and emoji input to generate a MoodVector.
 * 
 * This endpoint:
 * 1. Validates the session
 * 2. Analyzes the mood input using LLM
 * 3. Stores the result in the session
 * 4. Returns the mood analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session/store';
import { analyzeMood } from '@/lib/mood/analyzer';
import { MoodInput } from '@/lib/mood/types';

/**
 * Request body schema
 */
interface AnalyzeRequest {
    // Session ID from /api/session
    sessionId: string;

    // User's text input (may contain emojis)
    text?: string;

    // Separate emoji input (optional)
    emojis?: string;

    // Base64 image (mocked in v1)
    imageBase64?: string;
}

/**
 * POST /api/mood/analyze
 * 
 * Analyze user input and generate a mood vector.
 */
export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body: AnalyzeRequest = await request.json();

        // Validate session ID
        if (!body.sessionId) {
            return NextResponse.json({
                success: false,
                error: 'Session ID is required',
            }, { status: 400 });
        }

        // Check session exists
        const session = sessionStore.get(body.sessionId);
        if (!session) {
            return NextResponse.json({
                success: false,
                error: 'Session not found or expired',
            }, { status: 404 });
        }

        // Validate we have some input
        const hasInput = body.text?.trim() || body.emojis?.trim();
        if (!hasInput) {
            return NextResponse.json({
                success: false,
                error: 'Please share how you\'re feeling (text or emojis)',
            }, { status: 400 });
        }

        // Prepare mood input
        const moodInput: MoodInput = {
            text: body.text,
            emojis: body.emojis,
            // imageBase64 is ignored in v1 (mocked)
        };

        // Analyze the mood
        const moodResult = await analyzeMood(moodInput);

        // Update session with mood result
        sessionStore.update(body.sessionId, {
            moodResult,
            step: 'language', // Move to next step
        });

        // Return the analysis
        return NextResponse.json({
            success: true,
            data: {
                primaryMood: moodResult.primaryMood,
                confidence: moodResult.confidence,
                // Include vector for debugging/visualization
                vector: moodResult.vector,
                // Next step in the flow
                nextStep: '/language',
            },
        });

    } catch (error) {
        console.error('Mood analysis API error:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to analyze mood. Please try again.',
        }, { status: 500 });
    }
}
