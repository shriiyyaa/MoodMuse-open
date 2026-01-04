/**
 * MoodMuse - Emotional Intent Modifier
 * 
 * Adjusts mood vectors based on user's emotional intent.
 * Used when user signals they want the music to feel different
 * (e.g., after skipping several songs).
 * 
 * Intent Options:
 * - stay: Continue with current mood (no change)
 * - lift: Same mood + more hope/uplift
 * - distract: Higher energy, lighter emotional weight
 * - surprise: Controlled contrast without emotional whiplash
 */

import { MoodVector, validateMoodVector } from '@/lib/mood/types';

/**
 * Available emotional intents
 */
export type EmotionalIntent = 'stay' | 'lift' | 'distract' | 'surprise';

/**
 * Intent option metadata for UI
 */
export interface IntentOption {
    id: EmotionalIntent;
    label: string;
    description: string;
}

/**
 * Available intent options for the UI
 */
export const INTENT_OPTIONS: IntentOption[] = [
    {
        id: 'stay',
        label: 'Stay here',
        description: 'Keep the current feeling',
    },
    {
        id: 'lift',
        label: 'Lift me gently',
        description: 'A little more hope',
    },
    {
        id: 'distract',
        label: 'Distract me',
        description: 'Lighter, easier listening',
    },
    {
        id: 'surprise',
        label: 'Surprise me',
        description: 'Something different',
    },
];

/**
 * Apply emotional intent modifier to a mood vector.
 * 
 * Each intent shifts the mood vector in a specific direction
 * without completely overwriting the original mood.
 */
export function applyIntentModifier(
    originalVector: MoodVector,
    intent: EmotionalIntent
): MoodVector {
    switch (intent) {
        case 'stay':
            // No modification
            return originalVector;

        case 'lift':
            // Increase hope and slightly boost energy
            // Keep the core emotion but add uplift
            return validateMoodVector({
                ...originalVector,
                hope: Math.min(1, originalVector.hope + 0.35),
                energy: Math.min(1, originalVector.energy + 0.1),
                melancholy: Math.max(0, originalVector.melancholy - 0.15),
            });

        case 'distract':
            // Higher energy, lighter themes, less intensity
            // Moves toward upbeat, easy listening territory
            return validateMoodVector({
                ...originalVector,
                energy: Math.min(1, originalVector.energy + 0.4),
                intensity: Math.max(0, originalVector.intensity - 0.3),
                tension: Math.max(0, originalVector.tension - 0.2),
                melancholy: Math.max(0, originalVector.melancholy - 0.3),
                valence: Math.min(1, Math.max(-1, originalVector.valence + 0.2)),
            });

        case 'surprise':
            // Controlled contrast - different but not jarring
            // Key: Don't flip emotions completely, just shift energy and approach
            return createControlledContrast(originalVector);

        default:
            return originalVector;
    }
}

/**
 * Create a controlled contrast that feels different but not jarring.
 * 
 * Rules for avoiding emotional whiplash:
 * 1. Never flip valence from strongly negative to strongly positive (or vice versa)
 * 2. Shift energy level (from low → medium, or high → medium)
 * 3. Reduce intensity to create breathing room
 * 4. Introduce nostalgia for emotional softness
 */
function createControlledContrast(original: MoodVector): MoodVector {
    // Determine current emotional "zone"
    const isLowEnergy = original.energy < 0.4;
    const isHighEnergy = original.energy > 0.7;
    const isNegativeValence = original.valence < 0;

    // Target energy: move toward medium (0.5)
    let targetEnergy = 0.5;
    if (isLowEnergy) {
        targetEnergy = 0.55; // Slight boost
    } else if (isHighEnergy) {
        targetEnergy = 0.45; // Slight calm
    }

    // Target valence: move toward neutral without flipping
    // If very negative (-0.7), move to mildly negative (-0.2)
    // If very positive (0.7), move to mildly positive (0.3)
    let targetValence = original.valence * 0.4; // Compress toward center

    // For negative valence, add a touch of positivity
    if (isNegativeValence) {
        targetValence = Math.min(0.1, targetValence + 0.15);
    }

    return validateMoodVector({
        valence: targetValence,
        energy: targetEnergy,
        tension: Math.max(0, original.tension - 0.25),
        melancholy: original.melancholy * 0.5, // Halve melancholy
        nostalgia: Math.min(1, original.nostalgia + 0.3), // Add nostalgia for softness
        hope: Math.min(1, original.hope + 0.2),
        intensity: Math.max(0.2, original.intensity - 0.3), // Reduce intensity
        social: original.social, // Keep social dimension
    });
}

/**
 * Get a human-readable label for the modified mood
 */
export function getModifiedMoodLabel(
    originalMood: string,
    intent: EmotionalIntent
): string {
    switch (intent) {
        case 'stay':
            return originalMood;
        case 'lift':
            return `${originalMood}, with hope`;
        case 'distract':
            return 'something lighter';
        case 'surprise':
            return 'a gentle shift';
        default:
            return originalMood;
    }
}
