/**
 * MoodMuse - OpenAI Client Configuration
 * 
 * Centralized OpenAI client setup.
 * Uses GPT-4o-mini for cost-effective mood analysis.
 * 
 * Environment variable required: OPENAI_API_KEY
 */

import OpenAI from 'openai';

// Singleton OpenAI client
// Initialized lazily to avoid issues if API key is missing
let openaiClient: OpenAI | null = null;

/**
 * Get the OpenAI client instance.
 * Creates the client on first call.
 */
export function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error(
                'OPENAI_API_KEY environment variable is not set. ' +
                'Please add it to your .env.local file.'
            );
        }

        openaiClient = new OpenAI({
            apiKey,
        });
    }

    return openaiClient;
}

/**
 * Default model configuration.
 * Using GPT-4o-mini for good quality at lower cost.
 */
export const DEFAULT_MODEL = 'gpt-4o-mini';

/**
 * Temperature settings for different use cases.
 * Lower = more deterministic, Higher = more creative
 */
export const TEMPERATURE = {
    // Mood analysis should be consistent
    MOOD_ANALYSIS: 0.3,
    // Headlines can be more creative
    HEADLINE: 0.7,
    // Song explanations should feel personal but consistent
    EXPLANATION: 0.5,
};
