/**
 * MoodMuse - Mood Analyzer
 * 
 * Core logic for analyzing user input (text + emojis) and
 * generating a MoodVector representing their emotional state.
 * 
 * This module:
 * 1. Extracts emojis from text input
 * 2. Sends prompts to the LLM for analysis
 * 3. Parses and validates the response
 * 4. Returns a structured MoodResult
 */

import { getOpenAIClient, DEFAULT_MODEL, TEMPERATURE } from '@/lib/openai';
import { MoodInput, MoodResult, MoodVector, validateMoodVector } from '@/lib/mood/types';
import {
    MOOD_SYSTEM_PROMPT,
    createTextAnalysisPrompt,
    createEmojiAnalysisPrompt,
    createCombinedAnalysisPrompt,
} from '@/lib/mood/prompts';

/**
 * Regular expression to match emoji characters.
 * This covers most common emojis including compound emojis.
 */
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]|[\u{FE0F}]|[\u{200D}]/gu;

/**
 * Extracts emoji characters from a string.
 */
export function extractEmojis(text: string): string {
    const matches = text.match(EMOJI_REGEX);
    return matches ? matches.join('') : '';
}

/**
 * Removes emojis from text, leaving only the text content.
 */
export function removeEmojis(text: string): string {
    return text.replace(EMOJI_REGEX, '').trim();
}

/**
 * Main function to analyze mood from user input.
 * 
 * @param input - The user's input (text, emojis, or both)
 * @returns MoodResult with vector, primary mood, and confidence
 */
export async function analyzeMood(input: MoodInput): Promise<MoodResult> {
    // Validate we have some input
    const hasText = input.text && input.text.trim().length > 0;
    const hasEmojis = input.emojis && input.emojis.trim().length > 0;

    // If text input provided, extract emojis from it
    let textContent = '';
    let emojiContent = input.emojis || '';

    if (hasText) {
        const extractedEmojis = extractEmojis(input.text!);
        textContent = removeEmojis(input.text!);

        // Combine extracted emojis with any explicitly provided
        if (extractedEmojis) {
            emojiContent = emojiContent + extractedEmojis;
        }
    }

    // Determine which prompt to use based on available input
    let userPrompt: string;

    if (textContent && emojiContent) {
        // Both text and emojis - use combined analysis
        userPrompt = createCombinedAnalysisPrompt(textContent, emojiContent);
    } else if (textContent) {
        // Text only
        userPrompt = createTextAnalysisPrompt(textContent);
    } else if (emojiContent) {
        // Emojis only
        userPrompt = createEmojiAnalysisPrompt(emojiContent);
    } else {
        // No valid input - return a neutral mood with low confidence
        return {
            vector: validateMoodVector({}),
            primaryMood: 'undefined mood',
            confidence: 0.1,
        };
    }

    // Use the mock analyzer (no API key required)
    // This provides keyword-based mood detection
    const { analyzeMoodMock } = await import('@/lib/mood/mockAnalyzer');
    return analyzeMoodMock(textContent, emojiContent);
}

/**
 * Calculate cosine similarity between two mood vectors.
 * Used for matching songs to moods.
 */
export function calculateMoodSimilarity(a: MoodVector, b: MoodVector): number {
    const keys: (keyof MoodVector)[] = [
        'valence', 'energy', 'tension', 'melancholy',
        'nostalgia', 'hope', 'intensity', 'social'
    ];

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const key of keys) {
        dotProduct += a[key] * b[key];
        normA += a[key] * a[key];
        normB += b[key] * b[key];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);

    if (denominator === 0) {
        return 0;
    }

    // Normalize to 0-1 range (cosine similarity is -1 to 1)
    return (dotProduct / denominator + 1) / 2;
}
