/**
 * MoodMuse - Enhanced Mock Mood Analyzer
 * 
 * A sophisticated keyword and emoji-based mood analyzer.
 * Works without external APIs, providing accurate mood detection.
 * 
 * Features:
 * - 100+ emoji mappings
 * - 200+ keyword/phrase detection
 * - Negation handling ("not happy" → sad)
 * - Intensity detection (multiple emojis = stronger feeling)
 * - Mood blending for complex inputs
 * - Context-aware analysis
 */

import { MoodResult, MoodVector, validateMoodVector } from '@/lib/mood/types';

// ============================================
// MOOD PRESETS - Comprehensive emotional states
// ============================================

const MOOD_PRESETS: Record<string, { vector: Partial<MoodVector>; mood: string; weight: number }> = {
    // === POSITIVE MOODS ===
    ecstatic: {
        vector: { valence: 0.95, energy: 0.95, hope: 0.95, intensity: 0.9, tension: 0.1 },
        mood: 'pure ecstasy',
        weight: 1.2,
    },
    happy: {
        vector: { valence: 0.8, energy: 0.7, hope: 0.8, melancholy: 0.05, tension: 0.1 },
        mood: 'joyful warmth',
        weight: 1.0,
    },
    content: {
        vector: { valence: 0.6, energy: 0.4, hope: 0.65, tension: 0.1, melancholy: 0.1 },
        mood: 'gentle contentment',
        weight: 0.9,
    },
    excited: {
        vector: { valence: 0.85, energy: 0.95, hope: 0.85, intensity: 0.85, tension: 0.25 },
        mood: 'buzzing excitement',
        weight: 1.1,
    },
    peaceful: {
        vector: { valence: 0.55, energy: 0.15, tension: 0.05, hope: 0.6, intensity: 0.2 },
        mood: 'serene peace',
        weight: 0.9,
    },
    grateful: {
        vector: { valence: 0.75, energy: 0.4, hope: 0.8, social: 0.5, intensity: 0.5 },
        mood: 'deep gratitude',
        weight: 1.0,
    },
    proud: {
        vector: { valence: 0.8, energy: 0.6, hope: 0.75, intensity: 0.7, social: 0.3 },
        mood: 'quiet pride',
        weight: 1.0,
    },
    hopeful: {
        vector: { valence: 0.5, energy: 0.5, hope: 0.9, tension: 0.2, intensity: 0.55 },
        mood: 'rising hope',
        weight: 1.0,
    },
    inspired: {
        vector: { valence: 0.7, energy: 0.75, hope: 0.85, intensity: 0.7, tension: 0.15 },
        mood: 'creative inspiration',
        weight: 1.1,
    },
    playful: {
        vector: { valence: 0.75, energy: 0.8, hope: 0.7, tension: 0.1, social: 0.6 },
        mood: 'playful energy',
        weight: 1.0,
    },

    // === LOVE & CONNECTION ===
    love: {
        vector: { valence: 0.9, energy: 0.5, hope: 0.85, social: 0.95, intensity: 0.8 },
        mood: 'tender love',
        weight: 1.2,
    },
    romantic: {
        vector: { valence: 0.8, energy: 0.45, hope: 0.8, social: 0.9, intensity: 0.7, nostalgia: 0.3 },
        mood: 'romantic longing',
        weight: 1.1,
    },
    affectionate: {
        vector: { valence: 0.75, energy: 0.4, hope: 0.7, social: 0.85, intensity: 0.5 },
        mood: 'warm affection',
        weight: 1.0,
    },
    connected: {
        vector: { valence: 0.7, energy: 0.5, hope: 0.7, social: 0.9, intensity: 0.5 },
        mood: 'deep connection',
        weight: 1.0,
    },

    // === SAD MOODS ===
    sad: {
        vector: { valence: -0.6, energy: 0.25, melancholy: 0.8, hope: 0.2, tension: 0.3 },
        mood: 'quiet sadness',
        weight: 1.0,
    },
    heartbroken: {
        vector: { valence: -0.85, energy: 0.2, melancholy: 0.95, hope: 0.05, intensity: 0.9, social: -0.3 },
        mood: 'shattered heart',
        weight: 1.3,
    },
    grief: {
        vector: { valence: -0.8, energy: 0.15, melancholy: 0.95, hope: 0.1, intensity: 0.85, nostalgia: 0.6 },
        mood: 'heavy grief',
        weight: 1.3,
    },
    disappointed: {
        vector: { valence: -0.5, energy: 0.3, melancholy: 0.6, hope: 0.25, tension: 0.4 },
        mood: 'sinking disappointment',
        weight: 1.0,
    },
    melancholy: {
        vector: { valence: -0.3, energy: 0.2, melancholy: 0.85, hope: 0.3, nostalgia: 0.7, intensity: 0.5 },
        mood: 'gentle melancholy',
        weight: 1.0,
    },
    empty: {
        vector: { valence: -0.4, energy: 0.1, melancholy: 0.7, hope: 0.15, intensity: 0.3, social: -0.5 },
        mood: 'hollow emptiness',
        weight: 1.1,
    },

    // === ANXIOUS MOODS ===
    anxious: {
        vector: { valence: -0.5, energy: 0.7, tension: 0.9, hope: 0.2, intensity: 0.8 },
        mood: 'racing anxiety',
        weight: 1.1,
    },
    worried: {
        vector: { valence: -0.4, energy: 0.5, tension: 0.75, hope: 0.3, intensity: 0.6 },
        mood: 'nagging worry',
        weight: 1.0,
    },
    stressed: {
        vector: { valence: -0.5, energy: 0.65, tension: 0.85, hope: 0.25, intensity: 0.75 },
        mood: 'crushing stress',
        weight: 1.1,
    },
    overwhelmed: {
        vector: { valence: -0.6, energy: 0.4, tension: 0.9, hope: 0.15, intensity: 0.9 },
        mood: 'total overwhelm',
        weight: 1.2,
    },
    nervous: {
        vector: { valence: -0.3, energy: 0.6, tension: 0.7, hope: 0.4, intensity: 0.55 },
        mood: 'jittery nerves',
        weight: 0.9,
    },
    panic: {
        vector: { valence: -0.8, energy: 0.9, tension: 0.95, hope: 0.05, intensity: 0.95 },
        mood: 'spiraling panic',
        weight: 1.3,
    },

    // === ANGRY MOODS ===
    angry: {
        vector: { valence: -0.7, energy: 0.85, tension: 0.85, intensity: 0.85, hope: 0.15 },
        mood: 'burning anger',
        weight: 1.1,
    },
    furious: {
        vector: { valence: -0.9, energy: 0.95, tension: 0.95, intensity: 0.95, hope: 0.05 },
        mood: 'explosive rage',
        weight: 1.3,
    },
    frustrated: {
        vector: { valence: -0.55, energy: 0.7, tension: 0.75, intensity: 0.7, hope: 0.2 },
        mood: 'building frustration',
        weight: 1.0,
    },
    annoyed: {
        vector: { valence: -0.4, energy: 0.55, tension: 0.6, intensity: 0.5, hope: 0.35 },
        mood: 'mild irritation',
        weight: 0.9,
    },
    resentful: {
        vector: { valence: -0.6, energy: 0.5, tension: 0.7, intensity: 0.65, hope: 0.15, nostalgia: 0.3 },
        mood: 'simmering resentment',
        weight: 1.0,
    },

    // === LONELY MOODS ===
    lonely: {
        vector: { valence: -0.55, energy: 0.2, social: -0.9, melancholy: 0.75, hope: 0.2 },
        mood: 'aching loneliness',
        weight: 1.1,
    },
    isolated: {
        vector: { valence: -0.5, energy: 0.15, social: -0.95, melancholy: 0.6, hope: 0.15 },
        mood: 'deep isolation',
        weight: 1.1,
    },
    disconnected: {
        vector: { valence: -0.4, energy: 0.25, social: -0.8, melancholy: 0.5, tension: 0.3 },
        mood: 'feeling disconnected',
        weight: 1.0,
    },

    // === NOSTALGIC MOODS ===
    nostalgic: {
        vector: { valence: 0.1, nostalgia: 0.95, melancholy: 0.5, hope: 0.35, intensity: 0.6 },
        mood: 'bittersweet nostalgia',
        weight: 1.0,
    },
    wistful: {
        vector: { valence: 0.0, nostalgia: 0.85, melancholy: 0.6, hope: 0.3, intensity: 0.5 },
        mood: 'wistful longing',
        weight: 1.0,
    },
    reminiscent: {
        vector: { valence: 0.2, nostalgia: 0.8, melancholy: 0.4, hope: 0.4, intensity: 0.45 },
        mood: 'fond memories',
        weight: 0.9,
    },

    // === TIRED MOODS ===
    tired: {
        vector: { valence: -0.2, energy: 0.1, tension: 0.25, intensity: 0.25, hope: 0.35 },
        mood: 'bone-deep tiredness',
        weight: 1.0,
    },
    exhausted: {
        vector: { valence: -0.4, energy: 0.05, tension: 0.3, intensity: 0.2, hope: 0.2 },
        mood: 'complete exhaustion',
        weight: 1.1,
    },
    drained: {
        vector: { valence: -0.35, energy: 0.08, tension: 0.35, melancholy: 0.4, hope: 0.25 },
        mood: 'emotionally drained',
        weight: 1.0,
    },
    sleepy: {
        vector: { valence: 0.0, energy: 0.05, tension: 0.1, intensity: 0.15, hope: 0.4 },
        mood: 'sleepy haze',
        weight: 0.8,
    },

    // === CONFUSED/LOST MOODS ===
    confused: {
        vector: { valence: -0.25, energy: 0.4, tension: 0.55, hope: 0.35, intensity: 0.5 },
        mood: 'foggy confusion',
        weight: 1.0,
    },
    lost: {
        vector: { valence: -0.35, energy: 0.3, tension: 0.5, hope: 0.2, intensity: 0.6 },
        mood: 'feeling lost',
        weight: 1.0,
    },
    uncertain: {
        vector: { valence: -0.2, energy: 0.35, tension: 0.5, hope: 0.4, intensity: 0.45 },
        mood: 'wavering uncertainty',
        weight: 0.9,
    },
    stuck: {
        vector: { valence: -0.4, energy: 0.25, tension: 0.6, hope: 0.2, intensity: 0.55 },
        mood: 'feeling stuck',
        weight: 1.0,
    },

    // === BORED MOODS ===
    bored: {
        vector: { valence: -0.15, energy: 0.15, tension: 0.2, intensity: 0.2, hope: 0.3 },
        mood: 'restless boredom',
        weight: 0.9,
    },
    indifferent: {
        vector: { valence: 0.0, energy: 0.2, tension: 0.15, intensity: 0.15, hope: 0.35 },
        mood: 'detached indifference',
        weight: 0.8,
    },

    // === COMPLEX/MIXED MOODS ===
    bittersweet: {
        vector: { valence: 0.1, nostalgia: 0.8, melancholy: 0.6, hope: 0.4, intensity: 0.6 },
        mood: 'bittersweet feelings',
        weight: 1.0,
    },
    ambivalent: {
        vector: { valence: 0.0, energy: 0.4, tension: 0.5, hope: 0.4, intensity: 0.5 },
        mood: 'mixed emotions',
        weight: 0.9,
    },
    restless: {
        vector: { valence: -0.2, energy: 0.7, tension: 0.6, hope: 0.35, intensity: 0.6 },
        mood: 'restless energy',
        weight: 1.0,
    },
    numb: {
        vector: { valence: -0.3, energy: 0.1, tension: 0.2, intensity: 0.1, melancholy: 0.5 },
        mood: 'emotional numbness',
        weight: 1.0,
    },
    vulnerable: {
        vector: { valence: -0.2, energy: 0.3, tension: 0.5, intensity: 0.6, social: 0.2 },
        mood: 'raw vulnerability',
        weight: 1.0,
    },
    reflective: {
        vector: { valence: 0.1, energy: 0.25, nostalgia: 0.5, tension: 0.2, intensity: 0.4 },
        mood: 'quiet reflection',
        weight: 0.9,
    },
};

// ============================================
// EMOJI MAPPINGS - Comprehensive emoji detection
// ============================================

const EMOJI_MOODS: Record<string, { mood: string; intensity: number }> = {
    // Happy/Positive
    '😀': { mood: 'happy', intensity: 1.0 },
    '😃': { mood: 'happy', intensity: 1.0 },
    '😄': { mood: 'happy', intensity: 1.1 },
    '😁': { mood: 'excited', intensity: 1.0 },
    '😆': { mood: 'excited', intensity: 1.1 },
    '😅': { mood: 'nervous', intensity: 0.8 },
    '🤣': { mood: 'ecstatic', intensity: 1.2 },
    '😂': { mood: 'happy', intensity: 1.1 },
    '🙂': { mood: 'content', intensity: 0.7 },
    '😊': { mood: 'happy', intensity: 1.0 },
    '😇': { mood: 'peaceful', intensity: 0.9 },
    '🥰': { mood: 'love', intensity: 1.2 },
    '😍': { mood: 'love', intensity: 1.3 },
    '🤩': { mood: 'excited', intensity: 1.3 },
    '😋': { mood: 'playful', intensity: 0.9 },
    '😎': { mood: 'content', intensity: 0.9 },
    '🤗': { mood: 'affectionate', intensity: 1.0 },
    '🤭': { mood: 'playful', intensity: 0.8 },
    '😌': { mood: 'peaceful', intensity: 1.0 },
    '😏': { mood: 'playful', intensity: 0.7 },
    '🥳': { mood: 'ecstatic', intensity: 1.3 },
    '🎉': { mood: 'excited', intensity: 1.2 },
    '✨': { mood: 'hopeful', intensity: 0.9 },
    '🌟': { mood: 'inspired', intensity: 1.0 },
    '💫': { mood: 'hopeful', intensity: 0.9 },
    '⭐': { mood: 'happy', intensity: 0.8 },

    // Love/Heart
    '❤️': { mood: 'love', intensity: 1.2 },
    '🧡': { mood: 'affectionate', intensity: 1.0 },
    '💛': { mood: 'happy', intensity: 0.9 },
    '💚': { mood: 'peaceful', intensity: 0.9 },
    '💙': { mood: 'peaceful', intensity: 0.9 },
    '💜': { mood: 'love', intensity: 1.0 },
    '🖤': { mood: 'melancholy', intensity: 0.9 },
    '🤍': { mood: 'peaceful', intensity: 0.8 },
    '💕': { mood: 'love', intensity: 1.1 },
    '💖': { mood: 'love', intensity: 1.2 },
    '💗': { mood: 'love', intensity: 1.1 },
    '💘': { mood: 'romantic', intensity: 1.2 },
    '💝': { mood: 'love', intensity: 1.1 },
    '💔': { mood: 'heartbroken', intensity: 1.4 },
    '❣️': { mood: 'love', intensity: 1.0 },

    // Sad
    '😢': { mood: 'sad', intensity: 1.1 },
    '😭': { mood: 'heartbroken', intensity: 1.3 },
    '😿': { mood: 'sad', intensity: 1.0 },
    '😥': { mood: 'sad', intensity: 0.9 },
    '😰': { mood: 'anxious', intensity: 1.1 },
    '😓': { mood: 'stressed', intensity: 0.9 },
    '🥺': { mood: 'sad', intensity: 1.0 },
    '😔': { mood: 'sad', intensity: 1.0 },
    '😞': { mood: 'disappointed', intensity: 1.0 },
    '😟': { mood: 'worried', intensity: 0.9 },
    '🙁': { mood: 'sad', intensity: 0.8 },
    '☹️': { mood: 'sad', intensity: 0.9 },
    '😣': { mood: 'frustrated', intensity: 1.0 },
    '😖': { mood: 'frustrated', intensity: 1.1 },
    '😫': { mood: 'exhausted', intensity: 1.1 },
    '😩': { mood: 'exhausted', intensity: 1.0 },
    '🥲': { mood: 'bittersweet', intensity: 1.0 },
    '😪': { mood: 'tired', intensity: 0.9 },

    // Anxious/Worried
    '😨': { mood: 'panic', intensity: 1.2 },
    '😱': { mood: 'panic', intensity: 1.4 },
    '😬': { mood: 'nervous', intensity: 0.9 },
    '🫠': { mood: 'overwhelmed', intensity: 1.1 },
    '🫣': { mood: 'nervous', intensity: 0.8 },
    '🫨': { mood: 'anxious', intensity: 1.0 },
    '😵': { mood: 'overwhelmed', intensity: 1.2 },
    '😵‍💫': { mood: 'confused', intensity: 1.1 },
    '🤯': { mood: 'overwhelmed', intensity: 1.3 },

    // Angry
    '😤': { mood: 'frustrated', intensity: 1.0 },
    '😠': { mood: 'angry', intensity: 1.1 },
    '😡': { mood: 'furious', intensity: 1.3 },
    '🤬': { mood: 'furious', intensity: 1.4 },
    '👿': { mood: 'angry', intensity: 1.2 },
    '💢': { mood: 'angry', intensity: 1.1 },

    // Tired/Bored
    '😴': { mood: 'sleepy', intensity: 1.0 },
    '🥱': { mood: 'tired', intensity: 0.9 },
    '😑': { mood: 'bored', intensity: 0.8 },
    '😐': { mood: 'indifferent', intensity: 0.7 },
    '😶': { mood: 'numb', intensity: 0.8 },
    '🫥': { mood: 'numb', intensity: 0.9 },

    // Confused
    '😕': { mood: 'confused', intensity: 0.9 },
    '🤔': { mood: 'reflective', intensity: 0.8 },
    '🤨': { mood: 'confused', intensity: 0.8 },
    '🧐': { mood: 'reflective', intensity: 0.7 },
    '❓': { mood: 'confused', intensity: 0.7 },

    // Nostalgic/Wistful
    '🌙': { mood: 'nostalgic', intensity: 0.9 },
    '🌧️': { mood: 'melancholy', intensity: 1.0 },
    '🍂': { mood: 'nostalgic', intensity: 0.9 },
    '🎭': { mood: 'ambivalent', intensity: 0.9 },

    // Misc positive signals
    '👍': { mood: 'content', intensity: 0.6 },
    '👏': { mood: 'proud', intensity: 0.8 },
    '🙏': { mood: 'grateful', intensity: 1.0 },
    '💪': { mood: 'proud', intensity: 1.0 },
    '🔥': { mood: 'excited', intensity: 1.1 },
    '💯': { mood: 'excited', intensity: 1.0 },
    '🫶': { mood: 'love', intensity: 1.0 },
    '🤝': { mood: 'connected', intensity: 0.9 },

    // Text emoticons
    ':)': { mood: 'happy', intensity: 0.8 },
    ':D': { mood: 'excited', intensity: 1.0 },
    ':(': { mood: 'sad', intensity: 0.9 },
    ":'(": { mood: 'sad', intensity: 1.1 },
    ':P': { mood: 'playful', intensity: 0.7 },
    ';)': { mood: 'playful', intensity: 0.7 },
    ':/': { mood: 'confused', intensity: 0.7 },
    ':O': { mood: 'excited', intensity: 0.8 },
    'xD': { mood: 'happy', intensity: 1.0 },
    '<3': { mood: 'love', intensity: 1.0 },
    '</3': { mood: 'heartbroken', intensity: 1.2 },
    '🙃': { mood: 'bittersweet', intensity: 0.9 }, // Often indicates "dying inside"
};

// ============================================
// KEYWORD/PHRASE MAPPINGS
// ============================================

interface KeywordMapping {
    mood: string;
    intensity: number;
    priority: number; // Higher = more important
}

const KEYWORD_MAPPINGS: Record<string, KeywordMapping> = {
    // === POSITIVE ===
    // Ecstatic
    'ecstatic': { mood: 'ecstatic', intensity: 1.2, priority: 3 },
    'over the moon': { mood: 'ecstatic', intensity: 1.3, priority: 3 },
    'on cloud nine': { mood: 'ecstatic', intensity: 1.3, priority: 3 },
    'best day ever': { mood: 'ecstatic', intensity: 1.2, priority: 3 },
    'so happy': { mood: 'ecstatic', intensity: 1.2, priority: 2 },
    'incredibly happy': { mood: 'ecstatic', intensity: 1.3, priority: 3 },

    // Happy
    'happy': { mood: 'happy', intensity: 1.0, priority: 2 },
    'joy': { mood: 'happy', intensity: 1.0, priority: 2 },
    'joyful': { mood: 'happy', intensity: 1.0, priority: 2 },
    'great': { mood: 'happy', intensity: 0.9, priority: 1 },
    'amazing': { mood: 'happy', intensity: 1.1, priority: 2 },
    'wonderful': { mood: 'happy', intensity: 1.1, priority: 2 },
    'fantastic': { mood: 'happy', intensity: 1.1, priority: 2 },
    'awesome': { mood: 'excited', intensity: 1.0, priority: 2 },
    'good': { mood: 'content', intensity: 0.7, priority: 1 },
    'nice': { mood: 'content', intensity: 0.6, priority: 1 },
    'yay': { mood: 'excited', intensity: 1.0, priority: 2 },
    'woohoo': { mood: 'excited', intensity: 1.2, priority: 2 },
    'blessed': { mood: 'grateful', intensity: 1.0, priority: 2 },
    'smile': { mood: 'happy', intensity: 0.8, priority: 1 },
    'smiling': { mood: 'happy', intensity: 0.8, priority: 1 },
    'laugh': { mood: 'happy', intensity: 1.0, priority: 2 },

    // Excited
    'excited': { mood: 'excited', intensity: 1.1, priority: 2 },
    'thrilled': { mood: 'excited', intensity: 1.2, priority: 2 },
    'pumped': { mood: 'excited', intensity: 1.1, priority: 2 },
    'hyped': { mood: 'excited', intensity: 1.1, priority: 2 },
    'stoked': { mood: 'excited', intensity: 1.1, priority: 2 },
    'party': { mood: 'ecstatic', intensity: 1.1, priority: 2 },
    'dance': { mood: 'excited', intensity: 1.0, priority: 2 },
    'dancing': { mood: 'excited', intensity: 1.1, priority: 2 },
    'energetic': { mood: 'excited', intensity: 1.1, priority: 2 },
    'energy': { mood: 'excited', intensity: 1.0, priority: 2 },
    'cant wait': { mood: 'excited', intensity: 1.0, priority: 2 },
    "can't wait": { mood: 'excited', intensity: 1.0, priority: 2 },
    'looking forward': { mood: 'hopeful', intensity: 0.9, priority: 2 },

    // Peaceful
    'peaceful': { mood: 'peaceful', intensity: 1.0, priority: 2 },
    'calm': { mood: 'peaceful', intensity: 1.0, priority: 2 },
    'serene': { mood: 'peaceful', intensity: 1.1, priority: 2 },
    'relaxed': { mood: 'peaceful', intensity: 0.9, priority: 2 },
    'chill': { mood: 'peaceful', intensity: 0.8, priority: 1 },
    'tranquil': { mood: 'peaceful', intensity: 1.1, priority: 2 },
    'at peace': { mood: 'peaceful', intensity: 1.1, priority: 3 },
    'zen': { mood: 'peaceful', intensity: 1.0, priority: 2 },

    // Grateful
    'grateful': { mood: 'grateful', intensity: 1.0, priority: 2 },
    'thankful': { mood: 'grateful', intensity: 1.0, priority: 2 },
    'appreciate': { mood: 'grateful', intensity: 0.9, priority: 2 },
    'lucky': { mood: 'grateful', intensity: 0.9, priority: 2 },

    // Content
    'fine': { mood: 'content', intensity: 0.5, priority: 1 },
    'okay': { mood: 'content', intensity: 0.4, priority: 1 },
    'ok': { mood: 'content', intensity: 0.4, priority: 1 },
    'alright': { mood: 'content', intensity: 0.5, priority: 1 },
    'meh': { mood: 'bored', intensity: 0.7, priority: 1 },

    // === LOVE ===
    'love': { mood: 'love', intensity: 1.1, priority: 2 },
    'loving': { mood: 'love', intensity: 1.0, priority: 2 },
    'adore': { mood: 'love', intensity: 1.2, priority: 2 },
    'in love': { mood: 'love', intensity: 1.3, priority: 3 },
    'romantic': { mood: 'romantic', intensity: 1.1, priority: 2 },
    'romance': { mood: 'romantic', intensity: 1.1, priority: 2 },
    'smitten': { mood: 'romantic', intensity: 1.1, priority: 2 },
    'crush': { mood: 'romantic', intensity: 1.0, priority: 2 },
    'butterflies': { mood: 'romantic', intensity: 1.1, priority: 2 },
    'heart': { mood: 'love', intensity: 0.8, priority: 1 },

    // === SAD ===
    'sad': { mood: 'sad', intensity: 1.0, priority: 2 },
    'unhappy': { mood: 'sad', intensity: 1.0, priority: 2 },
    'depressed': { mood: 'sad', intensity: 1.3, priority: 3 },
    'depression': { mood: 'sad', intensity: 1.3, priority: 3 },
    'down': { mood: 'sad', intensity: 0.9, priority: 2 },
    'blue': { mood: 'sad', intensity: 0.8, priority: 2 },
    'crying': { mood: 'sad', intensity: 1.2, priority: 2 },
    'tears': { mood: 'sad', intensity: 1.1, priority: 2 },
    'cry': { mood: 'sad', intensity: 1.1, priority: 2 },
    'heartbroken': { mood: 'heartbroken', intensity: 1.4, priority: 3 },
    'heart broken': { mood: 'heartbroken', intensity: 1.4, priority: 3 },
    'broken heart': { mood: 'heartbroken', intensity: 1.4, priority: 3 },
    'devastated': { mood: 'heartbroken', intensity: 1.4, priority: 3 },
    'grief': { mood: 'grief', intensity: 1.3, priority: 3 },
    'grieving': { mood: 'grief', intensity: 1.3, priority: 3 },
    'mourning': { mood: 'grief', intensity: 1.3, priority: 3 },
    'loss': { mood: 'grief', intensity: 1.2, priority: 2 },
    'lost someone': { mood: 'grief', intensity: 1.4, priority: 3 },
    'hurts': { mood: 'sad', intensity: 1.1, priority: 2 },
    'pain': { mood: 'sad', intensity: 1.1, priority: 2 },
    'aching': { mood: 'sad', intensity: 1.0, priority: 2 },
    'empty': { mood: 'empty', intensity: 1.1, priority: 2 },
    'hollow': { mood: 'empty', intensity: 1.1, priority: 2 },
    'numb': { mood: 'numb', intensity: 1.0, priority: 2 },

    // === ANXIOUS ===
    'anxious': { mood: 'anxious', intensity: 1.1, priority: 2 },
    'anxiety': { mood: 'anxious', intensity: 1.2, priority: 3 },
    'worried': { mood: 'worried', intensity: 1.0, priority: 2 },
    'worry': { mood: 'worried', intensity: 0.9, priority: 2 },
    'nervous': { mood: 'nervous', intensity: 1.0, priority: 2 },
    'stressed': { mood: 'stressed', intensity: 1.1, priority: 2 },
    'stress': { mood: 'stressed', intensity: 1.0, priority: 2 },
    'overwhelmed': { mood: 'overwhelmed', intensity: 1.2, priority: 3 },
    'overthinking': { mood: 'anxious', intensity: 1.0, priority: 2 },
    'panic': { mood: 'panic', intensity: 1.3, priority: 3 },
    'panicking': { mood: 'panic', intensity: 1.3, priority: 3 },
    'freaking out': { mood: 'panic', intensity: 1.2, priority: 3 },
    'scared': { mood: 'anxious', intensity: 1.1, priority: 2 },
    'afraid': { mood: 'anxious', intensity: 1.0, priority: 2 },
    'fear': { mood: 'anxious', intensity: 1.1, priority: 2 },
    'terrified': { mood: 'panic', intensity: 1.3, priority: 3 },
    "can't breathe": { mood: 'panic', intensity: 1.4, priority: 3 },
    'racing thoughts': { mood: 'anxious', intensity: 1.2, priority: 3 },
    "can't stop thinking": { mood: 'anxious', intensity: 1.1, priority: 3 },
    'brain wont stop': { mood: 'anxious', intensity: 1.1, priority: 3 },
    "brain won't stop": { mood: 'anxious', intensity: 1.1, priority: 3 },
    "can't sleep": { mood: 'anxious', intensity: 1.0, priority: 2 },
    'insomnia': { mood: 'anxious', intensity: 1.0, priority: 2 },

    // === ANGRY ===
    'angry': { mood: 'angry', intensity: 1.1, priority: 2 },
    'mad': { mood: 'angry', intensity: 1.0, priority: 2 },
    'furious': { mood: 'furious', intensity: 1.3, priority: 3 },
    'rage': { mood: 'furious', intensity: 1.4, priority: 3 },
    'frustrated': { mood: 'frustrated', intensity: 1.0, priority: 2 },
    'frustrating': { mood: 'frustrated', intensity: 0.9, priority: 2 },
    'annoyed': { mood: 'annoyed', intensity: 0.9, priority: 2 },
    'irritated': { mood: 'annoyed', intensity: 0.9, priority: 2 },
    'pissed': { mood: 'angry', intensity: 1.1, priority: 2 },
    'pissed off': { mood: 'angry', intensity: 1.2, priority: 3 },
    'hate': { mood: 'angry', intensity: 1.2, priority: 2 },
    'ugh': { mood: 'frustrated', intensity: 0.8, priority: 1 },
    'infuriating': { mood: 'furious', intensity: 1.2, priority: 2 },

    // === LONELY ===
    'lonely': { mood: 'lonely', intensity: 1.1, priority: 2 },
    'alone': { mood: 'lonely', intensity: 1.0, priority: 2 },
    'isolated': { mood: 'isolated', intensity: 1.1, priority: 2 },
    'no one': { mood: 'lonely', intensity: 1.0, priority: 2 },
    'nobody': { mood: 'lonely', intensity: 1.0, priority: 2 },
    'abandoned': { mood: 'lonely', intensity: 1.2, priority: 3 },
    'forgotten': { mood: 'lonely', intensity: 1.1, priority: 2 },

    // === NOSTALGIC ===
    'nostalgic': { mood: 'nostalgic', intensity: 1.0, priority: 2 },
    'nostalgia': { mood: 'nostalgic', intensity: 1.0, priority: 2 },
    'miss': { mood: 'nostalgic', intensity: 0.9, priority: 2 },
    'missing': { mood: 'nostalgic', intensity: 0.9, priority: 2 },
    'remember': { mood: 'nostalgic', intensity: 0.8, priority: 1 },
    'memories': { mood: 'nostalgic', intensity: 0.9, priority: 2 },
    'past': { mood: 'nostalgic', intensity: 0.7, priority: 1 },
    'used to': { mood: 'nostalgic', intensity: 0.8, priority: 2 },
    'back then': { mood: 'nostalgic', intensity: 0.9, priority: 2 },
    'those days': { mood: 'nostalgic', intensity: 0.9, priority: 2 },
    'wish things were': { mood: 'nostalgic', intensity: 1.0, priority: 3 },

    // === TIRED ===
    'tired': { mood: 'tired', intensity: 1.0, priority: 2 },
    'exhausted': { mood: 'exhausted', intensity: 1.2, priority: 3 },
    'sleepy': { mood: 'sleepy', intensity: 0.8, priority: 1 },
    'drained': { mood: 'drained', intensity: 1.1, priority: 2 },
    'burnt out': { mood: 'exhausted', intensity: 1.2, priority: 3 },
    'burned out': { mood: 'exhausted', intensity: 1.2, priority: 3 },
    'burnout': { mood: 'exhausted', intensity: 1.2, priority: 3 },
    'no energy': { mood: 'drained', intensity: 1.1, priority: 2 },
    'fatigue': { mood: 'tired', intensity: 1.0, priority: 2 },
    'weary': { mood: 'tired', intensity: 1.0, priority: 2 },
    "can't anymore": { mood: 'exhausted', intensity: 1.2, priority: 3 },
    'done': { mood: 'exhausted', intensity: 0.9, priority: 2 },
    'over it': { mood: 'drained', intensity: 1.0, priority: 2 },

    // === CONFUSED/LOST ===
    'confused': { mood: 'confused', intensity: 1.0, priority: 2 },
    'lost': { mood: 'lost', intensity: 1.0, priority: 2 },
    'uncertain': { mood: 'uncertain', intensity: 0.9, priority: 2 },
    'unsure': { mood: 'uncertain', intensity: 0.8, priority: 1 },
    'stuck': { mood: 'stuck', intensity: 1.0, priority: 2 },
    "don't know": { mood: 'confused', intensity: 0.9, priority: 2 },
    'what do i do': { mood: 'confused', intensity: 1.0, priority: 3 },
    'no idea': { mood: 'confused', intensity: 0.9, priority: 2 },
    'torn': { mood: 'ambivalent', intensity: 1.0, priority: 2 },

    // === BORED ===
    'bored': { mood: 'bored', intensity: 1.0, priority: 2 },
    'boring': { mood: 'bored', intensity: 0.8, priority: 1 },
    'nothing to do': { mood: 'bored', intensity: 0.9, priority: 2 },

    // === COMPLEX ===
    'complicated': { mood: 'ambivalent', intensity: 0.9, priority: 2 },
    'mixed feelings': { mood: 'ambivalent', intensity: 1.0, priority: 3 },
    "don't know how i feel": { mood: 'ambivalent', intensity: 1.0, priority: 3 },
    'weird': { mood: 'confused', intensity: 0.7, priority: 1 },
    'off': { mood: 'confused', intensity: 0.6, priority: 1 },
    'restless': { mood: 'restless', intensity: 1.0, priority: 2 },
    'vulnerable': { mood: 'vulnerable', intensity: 1.0, priority: 2 },
    'raw': { mood: 'vulnerable', intensity: 1.1, priority: 2 },

    // === HOPEFUL ===
    'hope': { mood: 'hopeful', intensity: 1.0, priority: 2 },
    'hopeful': { mood: 'hopeful', intensity: 1.0, priority: 2 },
    'optimistic': { mood: 'hopeful', intensity: 1.0, priority: 2 },
    'better': { mood: 'hopeful', intensity: 0.7, priority: 1 },
    'things will be': { mood: 'hopeful', intensity: 0.9, priority: 2 },
    'light at the end': { mood: 'hopeful', intensity: 1.0, priority: 3 },

    // === PROUD/ACCOMPLISHED ===
    'proud': { mood: 'proud', intensity: 1.0, priority: 2 },
    'accomplished': { mood: 'proud', intensity: 1.0, priority: 2 },
    'achieved': { mood: 'proud', intensity: 1.0, priority: 2 },
    'did it': { mood: 'proud', intensity: 1.0, priority: 2 },

    // === INSPIRED ===
    'inspired': { mood: 'inspired', intensity: 1.0, priority: 2 },
    'motivated': { mood: 'inspired', intensity: 1.0, priority: 2 },
    'creative': { mood: 'inspired', intensity: 0.9, priority: 2 },
    'ideas': { mood: 'inspired', intensity: 0.7, priority: 1 },

    // === NUANCED CONVERSATIONAL PHRASES (High sensitivity) ===
    // Casual positive
    'vibing': { mood: 'peaceful', intensity: 1.0, priority: 2 },
    'vibes': { mood: 'peaceful', intensity: 0.8, priority: 1 },
    'good vibes': { mood: 'happy', intensity: 1.0, priority: 2 },
    'feeling myself': { mood: 'proud', intensity: 1.1, priority: 2 },
    'feeling good': { mood: 'happy', intensity: 1.0, priority: 2 },
    'feeling great': { mood: 'ecstatic', intensity: 1.1, priority: 2 },
    'on fire': { mood: 'excited', intensity: 1.2, priority: 2 },
    'killing it': { mood: 'proud', intensity: 1.1, priority: 2 },
    'living my best life': { mood: 'ecstatic', intensity: 1.2, priority: 3 },
    'life is good': { mood: 'content', intensity: 1.0, priority: 2 },
    'so blessed': { mood: 'grateful', intensity: 1.1, priority: 2 },
    'so grateful': { mood: 'grateful', intensity: 1.2, priority: 2 },
    'in my feels': { mood: 'melancholy', intensity: 1.1, priority: 3 },
    'catching feels': { mood: 'romantic', intensity: 1.0, priority: 2 },
    'super hyped': { mood: 'excited', intensity: 1.2, priority: 2 },
    'hyped up': { mood: 'excited', intensity: 1.3, priority: 2 },
    'lit': { mood: 'excited', intensity: 1.1, priority: 2 },

    // Casual negative
    'feeling low': { mood: 'sad', intensity: 1.1, priority: 2 },
    'feeling down': { mood: 'sad', intensity: 1.1, priority: 2 },
    'feeling off': { mood: 'confused', intensity: 0.9, priority: 2 },
    'not myself': { mood: 'confused', intensity: 1.0, priority: 2 },
    'off today': { mood: 'confused', intensity: 0.9, priority: 2 },
    'rough day': { mood: 'stressed', intensity: 1.1, priority: 2 },
    'bad day': { mood: 'sad', intensity: 1.0, priority: 2 },
    'worst day': { mood: 'heartbroken', intensity: 1.2, priority: 2 },
    'feeling meh': { mood: 'bored', intensity: 0.7, priority: 1 },
    'blah': { mood: 'bored', intensity: 0.7, priority: 1 },
    'whatever': { mood: 'indifferent', intensity: 0.7, priority: 1 },
    'i give up': { mood: 'exhausted', intensity: 1.2, priority: 3 },
    'cant deal': { mood: 'overwhelmed', intensity: 1.2, priority: 2 },
    "can't deal": { mood: 'overwhelmed', intensity: 1.2, priority: 2 },
    'so over it': { mood: 'exhausted', intensity: 1.1, priority: 2 },
    'need a break': { mood: 'tired', intensity: 1.0, priority: 2 },
    'need to escape': { mood: 'stressed', intensity: 1.1, priority: 2 },

    // Relationship/Social
    'miss you': { mood: 'nostalgic', intensity: 1.2, priority: 2 },
    'miss them': { mood: 'nostalgic', intensity: 1.1, priority: 2 },
    'miss her': { mood: 'nostalgic', intensity: 1.1, priority: 2 },
    'miss him': { mood: 'nostalgic', intensity: 1.1, priority: 2 },
    'wish you were here': { mood: 'nostalgic', intensity: 1.2, priority: 3 },
    'thinking about you': { mood: 'romantic', intensity: 1.0, priority: 2 },
    'thinking of you': { mood: 'romantic', intensity: 1.0, priority: 2 },
    'cant stop thinking': { mood: 'romantic', intensity: 1.1, priority: 2 },
    "can't stop thinking about": { mood: 'romantic', intensity: 1.1, priority: 2 },
    'falling for': { mood: 'romantic', intensity: 1.2, priority: 2 },
    'fallen for': { mood: 'love', intensity: 1.3, priority: 2 },
    'getting over': { mood: 'melancholy', intensity: 1.0, priority: 2 },
    'moved on': { mood: 'hopeful', intensity: 0.9, priority: 2 },
    'breakup': { mood: 'heartbroken', intensity: 1.3, priority: 3 },
    'broke up': { mood: 'heartbroken', intensity: 1.3, priority: 3 },
    'single': { mood: 'lonely', intensity: 0.8, priority: 1 },

    // Work/Life situations
    'monday blues': { mood: 'sad', intensity: 0.9, priority: 2 },
    'sunday scaries': { mood: 'anxious', intensity: 1.0, priority: 2 },
    'friday feeling': { mood: 'excited', intensity: 1.0, priority: 2 },
    'weekend vibes': { mood: 'excited', intensity: 0.9, priority: 2 },
    'late night': { mood: 'melancholy', intensity: 0.8, priority: 1 },
    'late nights': { mood: 'melancholy', intensity: 0.8, priority: 1 },
    '3am': { mood: 'melancholy', intensity: 1.0, priority: 2 },
    '2am': { mood: 'melancholy', intensity: 1.0, priority: 2 },
    'midnight': { mood: 'nostalgic', intensity: 0.9, priority: 1 },
    'rainy day': { mood: 'melancholy', intensity: 0.9, priority: 2 },
    'sunny day': { mood: 'happy', intensity: 0.9, priority: 1 },

    // Intensity modifiers (will boost other moods)
    'so': { mood: 'content', intensity: 0.3, priority: 0 },
    'very': { mood: 'content', intensity: 0.3, priority: 0 },
    'really': { mood: 'content', intensity: 0.3, priority: 0 },
    'super': { mood: 'content', intensity: 0.4, priority: 0 },
    'extremely': { mood: 'content', intensity: 0.5, priority: 0 },

    // Hinglish/Indian English expressions
    'dil': { mood: 'love', intensity: 0.9, priority: 2 },
    'pyaar': { mood: 'love', intensity: 1.1, priority: 2 },
    'dukh': { mood: 'sad', intensity: 1.1, priority: 2 },
    'khushi': { mood: 'happy', intensity: 1.1, priority: 2 },
    'masti': { mood: 'playful', intensity: 1.0, priority: 2 },
    'chill maar': { mood: 'peaceful', intensity: 0.9, priority: 2 },
    'tension': { mood: 'stressed', intensity: 1.0, priority: 2 },
    'tension mat le': { mood: 'peaceful', intensity: 0.8, priority: 2 },
    'yaad': { mood: 'nostalgic', intensity: 1.0, priority: 2 },
    'yaad aa rahi': { mood: 'nostalgic', intensity: 1.2, priority: 3 },
    'dard': { mood: 'sad', intensity: 1.1, priority: 2 },
    'akela': { mood: 'lonely', intensity: 1.1, priority: 2 },
    'majboori': { mood: 'sad', intensity: 1.0, priority: 2 },
    'josh': { mood: 'excited', intensity: 1.1, priority: 2 },
    'maza': { mood: 'playful', intensity: 0.9, priority: 2 },

    // === GEN-Z SLANG & INTERNET SPEAK ===
    'slay': { mood: 'proud', intensity: 1.2, priority: 2 },
    'slaying': { mood: 'proud', intensity: 1.2, priority: 2 },
    'slayed': { mood: 'proud', intensity: 1.2, priority: 2 },
    'ate': { mood: 'proud', intensity: 1.1, priority: 2 },
    'ate that': { mood: 'proud', intensity: 1.2, priority: 3 },
    'served': { mood: 'proud', intensity: 1.1, priority: 2 },
    'ded': { mood: 'ecstatic', intensity: 1.1, priority: 2 },
    'dead': { mood: 'ecstatic', intensity: 1.0, priority: 1 },
    'im dead': { mood: 'ecstatic', intensity: 1.2, priority: 3 },
    "i'm dead": { mood: 'ecstatic', intensity: 1.2, priority: 3 },
    'dead inside': { mood: 'numb', intensity: 1.3, priority: 3 },
    'lowkey': { mood: 'content', intensity: 0.7, priority: 1 },
    'highkey': { mood: 'excited', intensity: 1.0, priority: 2 },
    'lowkey sad': { mood: 'sad', intensity: 0.9, priority: 3 },
    'highkey sad': { mood: 'sad', intensity: 1.2, priority: 3 },
    'lowkey stressed': { mood: 'stressed', intensity: 0.9, priority: 3 },
    'highkey stressed': { mood: 'stressed', intensity: 1.2, priority: 3 },
    'lowkey happy': { mood: 'happy', intensity: 0.9, priority: 3 },
    'highkey happy': { mood: 'happy', intensity: 1.2, priority: 3 },
    'no cap': { mood: 'excited', intensity: 1.0, priority: 2 },
    'fr': { mood: 'excited', intensity: 0.8, priority: 1 },
    'fr fr': { mood: 'excited', intensity: 1.0, priority: 2 },
    'frfr': { mood: 'excited', intensity: 1.0, priority: 2 },
    'on god': { mood: 'excited', intensity: 1.1, priority: 2 },
    'ong': { mood: 'excited', intensity: 1.0, priority: 2 },
    'bussin': { mood: 'excited', intensity: 1.1, priority: 2 },
    'fire': { mood: 'excited', intensity: 1.0, priority: 2 },
    'mid': { mood: 'bored', intensity: 0.8, priority: 2 },
    'sus': { mood: 'confused', intensity: 0.7, priority: 1 },
    'cap': { mood: 'annoyed', intensity: 0.7, priority: 1 },
    'bet': { mood: 'excited', intensity: 0.9, priority: 2 },
    'facts': { mood: 'content', intensity: 0.8, priority: 1 },
    'valid': { mood: 'content', intensity: 0.8, priority: 2 },
    'vibe check': { mood: 'reflective', intensity: 0.9, priority: 2 },
    'main character': { mood: 'proud', intensity: 1.1, priority: 2 },
    'understood the assignment': { mood: 'proud', intensity: 1.2, priority: 3 },
    'periodt': { mood: 'proud', intensity: 1.1, priority: 2 },
    'period': { mood: 'proud', intensity: 1.0, priority: 1 },
    'rent free': { mood: 'romantic', intensity: 1.0, priority: 2 },
    'hits different': { mood: 'nostalgic', intensity: 1.1, priority: 3 },
    'hit different': { mood: 'nostalgic', intensity: 1.1, priority: 3 },
    "it's giving": { mood: 'excited', intensity: 0.9, priority: 2 },
    'its giving': { mood: 'excited', intensity: 0.9, priority: 2 },
    'giving': { mood: 'excited', intensity: 0.8, priority: 1 },
    'core': { mood: 'content', intensity: 0.6, priority: 1 },
    'era': { mood: 'proud', intensity: 0.8, priority: 1 },
    'villain era': { mood: 'angry', intensity: 1.0, priority: 3 },
    'healing era': { mood: 'hopeful', intensity: 1.0, priority: 3 },
    'soft era': { mood: 'peaceful', intensity: 1.0, priority: 3 },
    'romanticize': { mood: 'romantic', intensity: 0.9, priority: 2 },
    'unhinged': { mood: 'restless', intensity: 1.1, priority: 2 },
    'chaotic': { mood: 'restless', intensity: 1.0, priority: 2 },
    'iconic': { mood: 'proud', intensity: 1.1, priority: 2 },
    'legendary': { mood: 'proud', intensity: 1.2, priority: 2 },
    'queen': { mood: 'proud', intensity: 1.0, priority: 2 },
    'king': { mood: 'proud', intensity: 1.0, priority: 2 },
    'girlboss': { mood: 'proud', intensity: 1.1, priority: 2 },
    'simp': { mood: 'romantic', intensity: 0.9, priority: 2 },
    'simping': { mood: 'romantic', intensity: 1.0, priority: 2 },
    'crushing hard': { mood: 'romantic', intensity: 1.2, priority: 3 },
    'down bad': { mood: 'romantic', intensity: 1.1, priority: 2 },
    'pookie': { mood: 'affectionate', intensity: 1.0, priority: 2 },
    'bestie': { mood: 'connected', intensity: 0.9, priority: 2 },
    'wholesome': { mood: 'grateful', intensity: 1.0, priority: 2 },
    'sheesh': { mood: 'excited', intensity: 1.0, priority: 2 },
    'bruh': { mood: 'frustrated', intensity: 0.8, priority: 1 },
    'bro': { mood: 'content', intensity: 0.5, priority: 0 },
    'sus af': { mood: 'confused', intensity: 0.9, priority: 3 },
    'basic': { mood: 'bored', intensity: 0.7, priority: 1 },
    'extra': { mood: 'excited', intensity: 0.9, priority: 1 },
    'salty': { mood: 'annoyed', intensity: 0.9, priority: 2 },
    'ghosted': { mood: 'lonely', intensity: 1.2, priority: 2 },
    'left on read': { mood: 'lonely', intensity: 1.1, priority: 3 },
    'left me on read': { mood: 'lonely', intensity: 1.2, priority: 3 },
    'toxic': { mood: 'angry', intensity: 1.0, priority: 2 },
    'red flag': { mood: 'anxious', intensity: 0.9, priority: 2 },
    'green flag': { mood: 'happy', intensity: 0.9, priority: 2 },
    'ick': { mood: 'annoyed', intensity: 0.9, priority: 2 },
    'situationship': { mood: 'confused', intensity: 1.0, priority: 2 },
    'talking stage': { mood: 'nervous', intensity: 0.9, priority: 2 },
    'delulu': { mood: 'playful', intensity: 0.9, priority: 2 },
    'solulu': { mood: 'hopeful', intensity: 0.9, priority: 2 },
    'touch grass': { mood: 'stressed', intensity: 0.8, priority: 2 },
    'chronically online': { mood: 'tired', intensity: 0.8, priority: 2 },
    'brain rot': { mood: 'tired', intensity: 0.9, priority: 2 },

    // === INTERNET ABBREVIATIONS ===
    'ngl': { mood: 'content', intensity: 0.7, priority: 1 },
    'tbh': { mood: 'content', intensity: 0.6, priority: 1 },
    'tbf': { mood: 'content', intensity: 0.6, priority: 1 },
    'imo': { mood: 'content', intensity: 0.5, priority: 0 },
    'imho': { mood: 'content', intensity: 0.5, priority: 0 },
    'idk': { mood: 'confused', intensity: 0.8, priority: 2 },
    'idek': { mood: 'confused', intensity: 0.9, priority: 2 },
    'idc': { mood: 'indifferent', intensity: 0.9, priority: 2 },
    'idgaf': { mood: 'angry', intensity: 1.0, priority: 2 },
    'rn': { mood: 'content', intensity: 0.4, priority: 0 },
    'af': { mood: 'content', intensity: 0.4, priority: 0 },
    'asf': { mood: 'content', intensity: 0.4, priority: 0 },
    'nvm': { mood: 'indifferent', intensity: 0.7, priority: 1 },
    'omg': { mood: 'excited', intensity: 1.0, priority: 2 },
    'omfg': { mood: 'excited', intensity: 1.2, priority: 2 },
    'wtf': { mood: 'angry', intensity: 1.0, priority: 2 },
    'wth': { mood: 'frustrated', intensity: 0.9, priority: 2 },
    'smh': { mood: 'frustrated', intensity: 0.9, priority: 2 },
    'fml': { mood: 'frustrated', intensity: 1.2, priority: 3 },
    'lol': { mood: 'playful', intensity: 0.7, priority: 1 },
    'lmao': { mood: 'happy', intensity: 0.9, priority: 2 },
    'lmfao': { mood: 'ecstatic', intensity: 1.1, priority: 2 },
    'rofl': { mood: 'ecstatic', intensity: 1.1, priority: 2 },
    'tysm': { mood: 'grateful', intensity: 1.0, priority: 2 },
    'tyvm': { mood: 'grateful', intensity: 0.9, priority: 2 },
    'ty': { mood: 'grateful', intensity: 0.7, priority: 1 },
    'thx': { mood: 'grateful', intensity: 0.6, priority: 1 },
    'ily': { mood: 'love', intensity: 1.2, priority: 2 },
    'ilysm': { mood: 'love', intensity: 1.4, priority: 3 },
    'btw': { mood: 'content', intensity: 0.4, priority: 0 },
    'fyi': { mood: 'content', intensity: 0.4, priority: 0 },
    'brb': { mood: 'content', intensity: 0.4, priority: 0 },
    'gtg': { mood: 'content', intensity: 0.5, priority: 0 },
    'hbu': { mood: 'content', intensity: 0.5, priority: 0 },
    'wbu': { mood: 'content', intensity: 0.5, priority: 0 },
    'hmu': { mood: 'connected', intensity: 0.8, priority: 1 },
    'dm': { mood: 'connected', intensity: 0.6, priority: 1 },
    'jk': { mood: 'playful', intensity: 0.7, priority: 1 },
    'srsly': { mood: 'content', intensity: 0.7, priority: 1 },
    'pls': { mood: 'content', intensity: 0.6, priority: 0 },
    'plz': { mood: 'content', intensity: 0.6, priority: 0 },
    'thru': { mood: 'content', intensity: 0.4, priority: 0 },
    'tho': { mood: 'content', intensity: 0.4, priority: 0 },
    'thnx': { mood: 'grateful', intensity: 0.6, priority: 1 },

    // === INFORMAL SPELLING & TYPOS ===
    'gonna': { mood: 'content', intensity: 0.5, priority: 0 },
    'wanna': { mood: 'content', intensity: 0.5, priority: 0 },
    'gotta': { mood: 'content', intensity: 0.5, priority: 0 },
    'kinda': { mood: 'content', intensity: 0.5, priority: 0 },
    'sorta': { mood: 'content', intensity: 0.5, priority: 0 },
    'dunno': { mood: 'confused', intensity: 0.7, priority: 1 },
    'prolly': { mood: 'content', intensity: 0.5, priority: 0 },
    'tryna': { mood: 'content', intensity: 0.5, priority: 0 },
    'lemme': { mood: 'content', intensity: 0.5, priority: 0 },
    'gimme': { mood: 'content', intensity: 0.6, priority: 0 },
    'ur': { mood: 'content', intensity: 0.3, priority: 0 },
    'u': { mood: 'content', intensity: 0.2, priority: 0 },
    'r': { mood: 'content', intensity: 0.2, priority: 0 },
    'ppl': { mood: 'content', intensity: 0.3, priority: 0 },
    'bc': { mood: 'content', intensity: 0.3, priority: 0 },
    'b4': { mood: 'content', intensity: 0.3, priority: 0 },
    '2day': { mood: 'content', intensity: 0.3, priority: 0 },
    '2morrow': { mood: 'content', intensity: 0.3, priority: 0 },
    '2nite': { mood: 'content', intensity: 0.3, priority: 0 },
    'luv': { mood: 'love', intensity: 0.9, priority: 2 },
    'luv u': { mood: 'love', intensity: 1.1, priority: 3 },
    'luv ya': { mood: 'love', intensity: 1.0, priority: 3 },
    'happi': { mood: 'happy', intensity: 0.9, priority: 2 },
    'happiii': { mood: 'happy', intensity: 1.1, priority: 2 },
    'saddd': { mood: 'sad', intensity: 1.1, priority: 2 },
    'soooo': { mood: 'content', intensity: 0.4, priority: 0 },
    'sooo': { mood: 'content', intensity: 0.4, priority: 0 },
    'yesss': { mood: 'excited', intensity: 1.1, priority: 2 },
    'nooo': { mood: 'sad', intensity: 1.0, priority: 2 },
    'okayy': { mood: 'content', intensity: 0.6, priority: 1 },
    'okayyy': { mood: 'playful', intensity: 0.7, priority: 1 },
    'hiii': { mood: 'excited', intensity: 0.9, priority: 2 },
    'hiiii': { mood: 'excited', intensity: 1.0, priority: 2 },
    'heyyy': { mood: 'excited', intensity: 0.9, priority: 2 },
    'byeee': { mood: 'playful', intensity: 0.7, priority: 1 },
    'ughhh': { mood: 'frustrated', intensity: 1.0, priority: 2 },
    'ahh': { mood: 'content', intensity: 0.6, priority: 0 },
    'ahhh': { mood: 'excited', intensity: 0.8, priority: 1 },
    'aww': { mood: 'affectionate', intensity: 0.9, priority: 2 },
    'awww': { mood: 'affectionate', intensity: 1.1, priority: 2 },
    'awwww': { mood: 'affectionate', intensity: 1.2, priority: 2 },
    'hmm': { mood: 'reflective', intensity: 0.6, priority: 1 },
    'hmmm': { mood: 'reflective', intensity: 0.7, priority: 1 },
    'hmmmm': { mood: 'confused', intensity: 0.8, priority: 2 },
    'ehh': { mood: 'bored', intensity: 0.7, priority: 1 },
    'mhm': { mood: 'content', intensity: 0.5, priority: 0 },
    'yea': { mood: 'content', intensity: 0.5, priority: 0 },
    'yeh': { mood: 'content', intensity: 0.5, priority: 0 },
    'yup': { mood: 'content', intensity: 0.6, priority: 0 },
    'nah': { mood: 'indifferent', intensity: 0.6, priority: 1 },
    'nope': { mood: 'indifferent', intensity: 0.7, priority: 1 },

    // === EXPANDED HINGLISH & INDIAN EXPRESSIONS ===
    'bahut': { mood: 'content', intensity: 0.4, priority: 0 },
    'bohot': { mood: 'content', intensity: 0.4, priority: 0 },
    'bahut khush': { mood: 'happy', intensity: 1.1, priority: 3 },
    'bahut sad': { mood: 'sad', intensity: 1.1, priority: 3 },
    'bahut tension': { mood: 'stressed', intensity: 1.1, priority: 3 },
    'yaar': { mood: 'content', intensity: 0.5, priority: 0 },
    'bhai': { mood: 'content', intensity: 0.5, priority: 0 },
    'kya': { mood: 'content', intensity: 0.3, priority: 0 },
    'kya haal': { mood: 'content', intensity: 0.5, priority: 1 },
    'achha': { mood: 'content', intensity: 0.6, priority: 1 },
    'acha': { mood: 'content', intensity: 0.6, priority: 1 },
    'theek': { mood: 'content', intensity: 0.5, priority: 1 },
    'theek hai': { mood: 'content', intensity: 0.5, priority: 2 },
    'sahi': { mood: 'happy', intensity: 0.8, priority: 1 },
    'sahi hai': { mood: 'happy', intensity: 0.9, priority: 2 },
    'mast': { mood: 'happy', intensity: 0.9, priority: 2 },
    'ekdum mast': { mood: 'happy', intensity: 1.1, priority: 3 },
    'bindaas': { mood: 'peaceful', intensity: 1.0, priority: 2 },
    'faltu': { mood: 'bored', intensity: 0.8, priority: 2 },
    'bakwas': { mood: 'annoyed', intensity: 0.9, priority: 2 },
    'chu': { mood: 'annoyed', intensity: 0.9, priority: 2 },
    'bewakoof': { mood: 'annoyed', intensity: 0.8, priority: 2 },
    'pagal': { mood: 'playful', intensity: 0.7, priority: 1 },
    'pata nahi': { mood: 'confused', intensity: 0.8, priority: 2 },
    'samajh nahi': { mood: 'confused', intensity: 0.9, priority: 2 },
    'kuch nahi': { mood: 'indifferent', intensity: 0.7, priority: 2 },
    'koi baat nahi': { mood: 'peaceful', intensity: 0.7, priority: 2 },
    'tang': { mood: 'annoyed', intensity: 1.0, priority: 2 },
    'tang aa gaya': { mood: 'frustrated', intensity: 1.1, priority: 3 },
    'thak gaya': { mood: 'tired', intensity: 1.0, priority: 2 },
    'thak gayi': { mood: 'tired', intensity: 1.0, priority: 2 },
    'neend': { mood: 'sleepy', intensity: 0.9, priority: 2 },
    'neend aa rahi': { mood: 'sleepy', intensity: 1.0, priority: 3 },
    'bore ho raha': { mood: 'bored', intensity: 1.0, priority: 3 },
    'bore ho rahi': { mood: 'bored', intensity: 1.0, priority: 3 },
    'gussa': { mood: 'angry', intensity: 1.1, priority: 2 },
    'gussa aa raha': { mood: 'angry', intensity: 1.2, priority: 3 },
    'dar lag raha': { mood: 'anxious', intensity: 1.1, priority: 3 },
    'darr lag raha': { mood: 'anxious', intensity: 1.1, priority: 3 },
    'rona': { mood: 'sad', intensity: 1.1, priority: 2 },
    'rona aa raha': { mood: 'sad', intensity: 1.2, priority: 3 },
    'dil toot gaya': { mood: 'heartbroken', intensity: 1.4, priority: 3 },
    'dil dukhta': { mood: 'sad', intensity: 1.1, priority: 3 },
    'pyaar ho gaya': { mood: 'love', intensity: 1.3, priority: 3 },
    'ishq': { mood: 'love', intensity: 1.2, priority: 2 },
    'mohabbat': { mood: 'love', intensity: 1.1, priority: 2 },
    'nafrat': { mood: 'angry', intensity: 1.1, priority: 2 },
    'hassi': { mood: 'happy', intensity: 1.0, priority: 2 },
    'muskaan': { mood: 'happy', intensity: 1.0, priority: 2 },
    'udaas': { mood: 'sad', intensity: 1.0, priority: 2 },
    'tanha': { mood: 'lonely', intensity: 1.1, priority: 2 },
    'pareshan': { mood: 'stressed', intensity: 1.0, priority: 2 },
    'fikar': { mood: 'worried', intensity: 1.0, priority: 2 },
    'chinta': { mood: 'worried', intensity: 1.0, priority: 2 },
    'sukoon': { mood: 'peaceful', intensity: 1.1, priority: 2 },
    'chain': { mood: 'peaceful', intensity: 1.0, priority: 2 },
    'bechain': { mood: 'restless', intensity: 1.1, priority: 2 },
    'umeed': { mood: 'hopeful', intensity: 1.0, priority: 2 },
    'asha': { mood: 'hopeful', intensity: 1.0, priority: 2 },
    'niraasha': { mood: 'hopeful', intensity: 0.0, priority: 2 },
    'thoda': { mood: 'content', intensity: 0.4, priority: 0 },
    'zyada': { mood: 'content', intensity: 0.5, priority: 0 },
    'bohot zyada': { mood: 'content', intensity: 0.6, priority: 1 },

    // === CASUAL EXPRESSIONS & PHRASES ===
    'just vibing': { mood: 'peaceful', intensity: 1.0, priority: 3 },
    'good day': { mood: 'happy', intensity: 0.9, priority: 2 },
    'great day': { mood: 'happy', intensity: 1.1, priority: 2 },
    'awful day': { mood: 'sad', intensity: 1.1, priority: 2 },
    'terrible day': { mood: 'sad', intensity: 1.2, priority: 2 },
    'long day': { mood: 'tired', intensity: 0.9, priority: 2 },
    'hard day': { mood: 'exhausted', intensity: 1.0, priority: 2 },
    'rough night': { mood: 'tired', intensity: 1.0, priority: 2 },
    'cant even': { mood: 'overwhelmed', intensity: 1.1, priority: 2 },
    "can't even": { mood: 'overwhelmed', intensity: 1.1, priority: 2 },
    "i can't": { mood: 'overwhelmed', intensity: 1.0, priority: 2 },
    'cant rn': { mood: 'overwhelmed', intensity: 1.0, priority: 2 },
    "struggling rn": { mood: 'stressed', intensity: 1.1, priority: 3 },
    "going through it": { mood: 'overwhelmed', intensity: 1.2, priority: 3 },
    "been through a lot": { mood: 'exhausted', intensity: 1.1, priority: 3 },
    "its been hard": { mood: 'sad', intensity: 1.0, priority: 3 },
    "it's been hard": { mood: 'sad', intensity: 1.0, priority: 3 },
    'need a hug': { mood: 'sad', intensity: 1.1, priority: 3 },
    'send help': { mood: 'stressed', intensity: 1.0, priority: 2 },
    'help me': { mood: 'stressed', intensity: 1.1, priority: 2 },
    "i'm fine": { mood: 'sad', intensity: 0.7, priority: 2 },
    'im fine': { mood: 'sad', intensity: 0.7, priority: 2 },
    "totally fine": { mood: 'stressed', intensity: 0.8, priority: 2 },
    'everything is fine': { mood: 'stressed', intensity: 0.9, priority: 3 },
    'this is fine': { mood: 'stressed', intensity: 1.0, priority: 3 },
    'its whatever': { mood: 'indifferent', intensity: 0.8, priority: 2 },
    "it's whatever": { mood: 'indifferent', intensity: 0.8, priority: 2 },
    'mood': { mood: 'content', intensity: 0.7, priority: 1 },
    'big mood': { mood: 'excited', intensity: 1.0, priority: 2 },
    'whole mood': { mood: 'excited', intensity: 1.0, priority: 2 },
    'same': { mood: 'connected', intensity: 0.7, priority: 1 },
    'literally same': { mood: 'connected', intensity: 0.9, priority: 2 },
    'felt that': { mood: 'connected', intensity: 0.9, priority: 2 },
    'feel that': { mood: 'connected', intensity: 0.9, priority: 2 },
    'real': { mood: 'content', intensity: 0.7, priority: 1 },
    'so real': { mood: 'connected', intensity: 0.9, priority: 2 },
    'relatable': { mood: 'connected', intensity: 0.8, priority: 2 },
    'too relatable': { mood: 'connected', intensity: 1.0, priority: 2 },
    'living': { mood: 'happy', intensity: 0.9, priority: 1 },
    'thriving': { mood: 'happy', intensity: 1.1, priority: 2 },
    'surviving': { mood: 'tired', intensity: 0.8, priority: 2 },
    'barely surviving': { mood: 'exhausted', intensity: 1.1, priority: 3 },
    'just existing': { mood: 'numb', intensity: 1.0, priority: 3 },
    'existing': { mood: 'indifferent', intensity: 0.7, priority: 1 },
    'crying in the club': { mood: 'bittersweet', intensity: 1.1, priority: 3 },
    'screaming': { mood: 'excited', intensity: 1.2, priority: 2 },
    "i'm screaming": { mood: 'ecstatic', intensity: 1.3, priority: 3 },
    'sobbing': { mood: 'sad', intensity: 1.3, priority: 2 },
    "i'm sobbing": { mood: 'sad', intensity: 1.4, priority: 3 },
    'obsessed': { mood: 'excited', intensity: 1.2, priority: 2 },
    "i'm obsessed": { mood: 'ecstatic', intensity: 1.3, priority: 3 },
    'in awe': { mood: 'inspired', intensity: 1.1, priority: 2 },
    'shook': { mood: 'excited', intensity: 1.1, priority: 2 },
    'speechless': { mood: 'overwhelmed', intensity: 1.0, priority: 2 },
    'mind blown': { mood: 'excited', intensity: 1.2, priority: 2 },
};

// ============================================
// NEGATION PATTERNS
// ============================================

const NEGATION_WORDS = ['not', "n't", 'no', 'never', 'without', "don't", "doesn't", "didn't", "won't", "wouldn't", "can't", "couldn't", "shouldn't"];

const NEGATION_FLIP: Record<string, string> = {
    happy: 'sad',
    sad: 'happy',
    excited: 'bored',
    bored: 'excited',
    peaceful: 'anxious',
    anxious: 'peaceful',
    love: 'lonely',
    hopeful: 'sad',
    content: 'sad',
    grateful: 'resentful',
    angry: 'peaceful',
};

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

/**
 * Check if a word is negated based on context
 */
function isNegated(text: string, keyword: string): boolean {
    const index = text.indexOf(keyword);
    if (index === -1) return false;

    // Check the 4 words before the keyword
    const before = text.substring(Math.max(0, index - 30), index).toLowerCase();
    return NEGATION_WORDS.some(neg => before.includes(neg));
}

/**
 * Extract all emojis from text
 */
function extractEmojis(text: string): string[] {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]/gu;
    return text.match(emojiRegex) || [];
}

/**
 * Blend multiple mood vectors with weights
 */
function blendMoodVectors(moods: { preset: typeof MOOD_PRESETS[string]; weight: number }[]): MoodVector {
    if (moods.length === 0) {
        return validateMoodVector({});
    }

    const totalWeight = moods.reduce((sum, m) => sum + m.weight, 0);

    const blended: Partial<MoodVector> = {
        valence: 0,
        energy: 0,
        tension: 0,
        melancholy: 0,
        nostalgia: 0,
        hope: 0,
        intensity: 0,
        social: 0,
    };

    for (const { preset, weight } of moods) {
        const normalizedWeight = weight / totalWeight;
        for (const key of Object.keys(blended) as (keyof MoodVector)[]) {
            blended[key]! += (preset.vector[key] ?? 0) * normalizedWeight;
        }
    }

    return validateMoodVector(blended);
}

/**
 * Main analysis function
 */
export function analyzeMoodMock(text: string, emojis: string): MoodResult {
    const fullInput = (text + ' ' + emojis).toLowerCase();
    const detectedMoods: { preset: typeof MOOD_PRESETS[string]; weight: number }[] = [];

    // Track what we've detected for the primary mood description
    const moodCounts: Record<string, number> = {};

    // 1. EMOJI ANALYSIS
    const allEmojis = [...extractEmojis(fullInput), ...emojis.split('')];
    for (const emoji of allEmojis) {
        const mapping = EMOJI_MOODS[emoji];
        if (mapping) {
            const preset = MOOD_PRESETS[mapping.mood];
            if (preset) {
                detectedMoods.push({ preset, weight: mapping.intensity * preset.weight });
                moodCounts[mapping.mood] = (moodCounts[mapping.mood] || 0) + mapping.intensity;
            }
        }
    }

    // Check text emoticons
    for (const [emoticon, mapping] of Object.entries(EMOJI_MOODS)) {
        if (emoticon.length > 1 && fullInput.includes(emoticon.toLowerCase())) {
            const preset = MOOD_PRESETS[mapping.mood];
            if (preset) {
                detectedMoods.push({ preset, weight: mapping.intensity * preset.weight });
                moodCounts[mapping.mood] = (moodCounts[mapping.mood] || 0) + mapping.intensity;
            }
        }
    }

    // 2. KEYWORD ANALYSIS (prioritize longer phrases first)
    const sortedKeywords = Object.entries(KEYWORD_MAPPINGS)
        .sort((a, b) => b[0].length - a[0].length);

    const matchedKeywords = new Set<string>();

    for (const [keyword, mapping] of sortedKeywords) {
        // Skip if a longer phrase containing this word was already matched
        let alreadyMatched = false;
        for (const matched of matchedKeywords) {
            if (matched.includes(keyword) || keyword.includes(matched)) {
                alreadyMatched = true;
                break;
            }
        }
        if (alreadyMatched) continue;

        if (fullInput.includes(keyword)) {
            matchedKeywords.add(keyword);

            let mood = mapping.mood;
            let intensityMod = 1.0;

            // Check for negation
            if (isNegated(fullInput, keyword)) {
                const flipped = NEGATION_FLIP[mood];
                if (flipped) {
                    mood = flipped;
                    intensityMod = 0.8; // Negated moods are slightly less intense
                }
            }

            const preset = MOOD_PRESETS[mood];
            if (preset) {
                const weight = mapping.intensity * mapping.priority * preset.weight * intensityMod;
                detectedMoods.push({ preset, weight });
                moodCounts[mood] = (moodCounts[mood] || 0) + mapping.intensity * mapping.priority;
            }
        }
    }

    // 3. INTENSITY MODIFIERS
    // Multiple exclamation marks increase intensity
    const exclamationCount = (fullInput.match(/!/g) || []).length;
    const intensityBoost = 1 + Math.min(exclamationCount * 0.1, 0.3);

    // All caps indicates intensity
    const capsRatio = text.replace(/[^A-Z]/g, '').length / Math.max(text.replace(/[^a-zA-Z]/g, '').length, 1);
    const capsBoost = capsRatio > 0.5 ? 1.2 : 1.0;

    // Apply boosts
    for (const mood of detectedMoods) {
        mood.weight *= intensityBoost * capsBoost;
    }

    // 4. DEFAULT FALLBACK
    if (detectedMoods.length === 0) {
        // Try to infer something from the text
        if (fullInput.match(/\?+$/)) {
            detectedMoods.push({ preset: MOOD_PRESETS.confused, weight: 0.8 });
            moodCounts['confused'] = 0.8;
        } else if (fullInput.match(/!+$/)) {
            detectedMoods.push({ preset: MOOD_PRESETS.excited, weight: 0.8 });
            moodCounts['excited'] = 0.8;
        } else {
            detectedMoods.push({ preset: MOOD_PRESETS.reflective, weight: 0.7 });
            moodCounts['reflective'] = 0.7;
        }
    }

    // 5. FIND PRIMARY MOOD
    let primaryMoodKey = 'reflective';
    let maxScore = 0;
    for (const [mood, score] of Object.entries(moodCounts)) {
        if (score > maxScore) {
            maxScore = score;
            primaryMoodKey = mood;
        }
    }

    const primaryPreset = MOOD_PRESETS[primaryMoodKey] || MOOD_PRESETS.reflective;

    // 6. BLEND VECTORS
    const blendedVector = blendMoodVectors(detectedMoods);

    // 7. CALCULATE CONFIDENCE
    const signalStrength = detectedMoods.reduce((sum, m) => sum + m.weight, 0);
    const confidence = Math.min(0.95, 0.4 + signalStrength * 0.15);

    return {
        vector: blendedVector,
        primaryMood: primaryPreset.mood,
        confidence: Math.round(confidence * 100) / 100,
    };
}
