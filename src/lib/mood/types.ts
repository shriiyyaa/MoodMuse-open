/**
 * MoodMuse - Mood Types
 * 
 * Core type definitions for the mood analysis system.
 * The Mood Vector is an 8-dimensional emotional fingerprint.
 */

/**
 * MoodVector represents the emotional state across 8 dimensions.
 * Each dimension captures a different aspect of emotion.
 * 
 * Design Decision: We use 8 dimensions instead of simpler happy/sad
 * because emotions are nuanced. Someone can be nostalgic but hopeful,
 * or energetic but anxious. This allows for richer music matching.
 */
export interface MoodVector {
    // Valence: Overall emotional positivity/negativity
    // -1 = very negative, 0 = neutral, 1 = very positive
    valence: number;

    // Energy: Physical and mental arousal level
    // 0 = calm/low energy, 1 = highly energetic
    energy: number;

    // Tension: Stress, anxiety, or restlessness
    // 0 = relaxed, 1 = very tense/anxious
    tension: number;

    // Melancholy: Sadness, grief, or sorrow
    // 0 = no sadness, 1 = deep melancholy
    melancholy: number;

    // Nostalgia: Longing for the past, wistfulness
    // 0 = present-focused, 1 = deeply nostalgic
    nostalgia: number;

    // Hope: Optimism about the future
    // 0 = hopeless/resigned, 1 = highly optimistic
    hope: number;

    // Intensity: How strongly the emotion is felt
    // 0 = subtle feeling, 1 = overwhelming emotion
    intensity: number;

    // Social: Desire for connection vs solitude
    // -1 = seeking solitude, 0 = neutral, 1 = seeking connection
    social: number;
}

/**
 * The result of mood analysis from user inputs.
 */
export interface MoodResult {
    // The 8-dimensional mood vector
    vector: MoodVector;

    // A human-readable summary of the detected mood (2-4 words)
    // Examples: "quiet melancholy", "restless energy", "bittersweet nostalgia"
    primaryMood: string;

    // Confidence score from 0-1 indicating how certain the analysis is
    // Lower confidence might occur with very short or ambiguous input
    confidence: number;

    // Optional: Analysis breakdown showing contribution from each input type
    breakdown?: {
        textContribution?: number;
        emojiContribution?: number;
        imageContribution?: number;
    };
}

/**
 * Input types accepted by the mood analyzer.
 */
export interface MoodInput {
    // Free-form text expressing the user's feelings
    text?: string;

    // Emojis (extracted separately or as part of text)
    emojis?: string;

    // Base64-encoded image (for v1, this is mocked)
    imageBase64?: string;
}

/**
 * Creates a default/neutral mood vector.
 * Useful for initializing state or handling edge cases.
 */
export function createNeutralMoodVector(): MoodVector {
    return {
        valence: 0,
        energy: 0.5,
        tension: 0.2,
        melancholy: 0.2,
        nostalgia: 0.2,
        hope: 0.5,
        intensity: 0.3,
        social: 0,
    };
}

/**
 * Validates that a mood vector has all required properties
 * and values are within valid ranges.
 */
export function validateMoodVector(vector: Partial<MoodVector>): MoodVector {
    const clamp = (val: number, min: number, max: number) =>
        Math.max(min, Math.min(max, val));

    return {
        valence: clamp(vector.valence ?? 0, -1, 1),
        energy: clamp(vector.energy ?? 0.5, 0, 1),
        tension: clamp(vector.tension ?? 0.2, 0, 1),
        melancholy: clamp(vector.melancholy ?? 0.2, 0, 1),
        nostalgia: clamp(vector.nostalgia ?? 0.2, 0, 1),
        hope: clamp(vector.hope ?? 0.5, 0, 1),
        intensity: clamp(vector.intensity ?? 0.3, 0, 1),
        social: clamp(vector.social ?? 0, -1, 1),
    };
}
