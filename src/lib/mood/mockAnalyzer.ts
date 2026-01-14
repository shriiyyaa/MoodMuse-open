
/**
 * MoodMuse - Enhanced Mock Mood Analyzer (V4 Recalibrated)
 * 
 * STRICTLY ALIGNED WITH V4 DATABASE VECTORS (0.0 - 1.0 SCALES)
 * 
 * Features:
 * - Direct mapping to V4 Song Archetypes (Sad, Happy, Party, etc.)
 * - 0.2 Valence = Sad (matches DB) instead of -0.6
 * - Ensures every user input lands in a valid song cluster
 */

import { MoodResult, MoodVector, validateMoodVector } from '@/lib/mood/types';

// ============================================
// V4 ARCHETYPES (Source of Truth)
// ============================================
// These exact values MUST match generate_full_songs.mjs

const V4_TARGETS = {
    SAD: { valence: 0.2, energy: 0.25, tension: 0.5, melancholy: 0.9, nostalgia: 0.5, hope: 0.2, intensity: 0.4, social: 0.1 },
    HEARTBREAK: { valence: 0.15, energy: 0.3, tension: 0.7, melancholy: 0.95, nostalgia: 0.6, hope: 0.1, intensity: 0.8, social: 0.1 },
    ROMANTIC: { valence: 0.75, energy: 0.4, tension: 0.1, melancholy: 0.1, nostalgia: 0.3, hope: 0.9, intensity: 0.5, social: 0.8 },
    PARTY: { valence: 0.9, energy: 0.95, tension: 0.2, melancholy: 0.1, nostalgia: 0.1, hope: 0.7, intensity: 0.8, social: 0.9 },
    HAPPY: { valence: 0.85, energy: 0.7, tension: 0.1, melancholy: 0.1, nostalgia: 0.2, hope: 0.8, intensity: 0.5, social: 0.8 },
    CHILL: { valence: 0.65, energy: 0.3, tension: 0.1, melancholy: 0.1, nostalgia: 0.3, hope: 0.6, intensity: 0.2, social: 0.4 },
    MOTIVATIONAL: { valence: 0.8, energy: 0.85, tension: 0.3, melancholy: 0.1, nostalgia: 0.1, hope: 0.9, intensity: 0.7, social: 0.7 },
    NOSTALGIC: { valence: 0.5, energy: 0.3, tension: 0.2, melancholy: 0.6, nostalgia: 0.9, hope: 0.4, intensity: 0.3, social: 0.3 }
};

// ============================================
// MOOD PRESETS (Mapped to V4 Targets)
// ============================================

const MOOD_PRESETS: Record<string, { vector: Partial<MoodVector>; mood: string; weight: number }> = {
    // === HAPPY & PARTY ===
    ecstatic: { vector: V4_TARGETS.PARTY, mood: 'pure ecstasy', weight: 1.2 }, // High energy happy
    happy: { vector: V4_TARGETS.HAPPY, mood: 'joyful warmth', weight: 1.0 },
    excited: { vector: { ...V4_TARGETS.PARTY, tension: 0.3 }, mood: 'buzzing excitement', weight: 1.1 },
    playful: { vector: V4_TARGETS.HAPPY, mood: 'playful energy', weight: 1.0 },
    proud: { vector: V4_TARGETS.MOTIVATIONAL, mood: 'quiet pride', weight: 1.0 },
    inspired: { vector: V4_TARGETS.MOTIVATIONAL, mood: 'creative inspiration', weight: 1.1 },

    // === CHILL & PEACE ===
    content: { vector: V4_TARGETS.CHILL, mood: 'gentle contentment', weight: 0.9 },
    peaceful: { vector: { ...V4_TARGETS.CHILL, energy: 0.2 }, mood: 'serene peace', weight: 1.0 },
    grateful: { vector: V4_TARGETS.CHILL, mood: 'deep gratitude', weight: 1.0 },
    calm: { vector: V4_TARGETS.CHILL, mood: 'calm vibes', weight: 1.0 },

    // === ROMANTIC ===
    love: { vector: V4_TARGETS.ROMANTIC, mood: 'tender love', weight: 1.2 },
    romantic: { vector: V4_TARGETS.ROMANTIC, mood: 'romantic longing', weight: 1.1 },
    affectionate: { vector: V4_TARGETS.ROMANTIC, mood: 'warm affection', weight: 1.0 },

    // === SAD & HEARTBREAK ===
    sad: { vector: V4_TARGETS.SAD, mood: 'quiet sadness', weight: 1.0 },
    heartbroken: { vector: V4_TARGETS.HEARTBREAK, mood: 'shattered heart', weight: 1.3 },
    grief: { vector: { ...V4_TARGETS.HEARTBREAK, energy: 0.2 }, mood: 'heavy grief', weight: 1.3 },
    lonely: { vector: { ...V4_TARGETS.SAD, social: -0.5 }, mood: 'aching loneliness', weight: 1.1 },
    depressed: { vector: { ...V4_TARGETS.SAD, energy: 0.1 }, mood: 'deep depression', weight: 1.2 },
    cry: { vector: V4_TARGETS.SAD, mood: 'need to cry', weight: 1.2 },

    // === ANXIOUS (Maps to SAD/HEARTBREAK with high Tension) ===
    anxious: { vector: { ...V4_TARGETS.SAD, tension: 0.8, energy: 0.6 }, mood: 'racing anxiety', weight: 1.1 },
    stressed: { vector: { ...V4_TARGETS.SAD, tension: 0.9, energy: 0.7 }, mood: 'crushing stress', weight: 1.1 },
    worried: { vector: { ...V4_TARGETS.SAD, tension: 0.7 }, mood: 'nagging worry', weight: 1.0 },
    overwhelmed: { vector: { ...V4_TARGETS.HEARTBREAK, tension: 0.9 }, mood: 'total overwhelm', weight: 1.2 },

    // === ANGRY (Maps to HEARTBREAK/MOTIVATIONAL hybrid) ===
    angry: { vector: { ...V4_TARGETS.HEARTBREAK, energy: 0.8, tension: 0.9 }, mood: 'burning anger', weight: 1.1 },
    frustrated: { vector: { ...V4_TARGETS.HEARTBREAK, energy: 0.7, tension: 0.8 }, mood: 'building frustration', weight: 1.0 },

    // === NOSTALGIC ===
    nostalgic: { vector: V4_TARGETS.NOSTALGIC, mood: 'nostalgia', weight: 1.0 },
    miss: { vector: V4_TARGETS.NOSTALGIC, mood: 'missing someone', weight: 1.0 },

    // === TIRED (Maps to CHILL or SAD) ===
    tired: { vector: { ...V4_TARGETS.CHILL, energy: 0.1 }, mood: 'deep tiredness', weight: 1.0 },
    exhausted: { vector: { ...V4_TARGETS.SAD, energy: 0.1 }, mood: 'complete exhaustion', weight: 1.1 },
    bored: { vector: { ...V4_TARGETS.CHILL, energy: 0.2, valence: 0.4 }, mood: 'boredom', weight: 0.9 },

    // === MISSING PRESETS (Referenced in PHRASE_MAPPINGS) ===
    empty: { vector: { ...V4_TARGETS.SAD, melancholy: 0.8 }, mood: 'feeling empty', weight: 1.1 },
    serious: { vector: V4_TARGETS.CHILL, mood: 'serious focus', weight: 0.9 },
    focused: { vector: V4_TARGETS.MOTIVATIONAL, mood: 'laser focus', weight: 1.0 },
    melancholic: { vector: V4_TARGETS.NOSTALGIC, mood: 'melancholic thoughts', weight: 1.0 },
};

// ============================================
// EMOJI MAPPINGS
// ============================================
const EMOJI_MOODS: Record<string, string> = {
    // Happy
    '😀': 'happy', '😃': 'happy', '😄': 'happy', '😁': 'excited', '😆': 'excited',
    '😍': 'love', '🥰': 'love', '😘': 'romantic', '😊': 'happy', '🙂': 'content',
    '🥳': 'ecstatic', '🎉': 'excited', '✨': 'inspired', '🌟': 'inspired',

    // Sad
    '😢': 'sad', '😭': 'heartbroken', '🥺': 'sad', '😔': 'sad', '😞': 'sad',
    '☹️': 'sad', '🙁': 'sad', '💔': 'heartbroken', '🥀': 'sad', '🌧️': 'sad',

    // Angry
    '😠': 'angry', '😡': 'angry', '🤬': 'angry', '😤': 'frustrated',

    // Anxious
    '😰': 'anxious', '😨': 'anxious', '😱': 'overwhelmed', '😬': 'anxious',

    // Chill/Tired
    '😌': 'peaceful', '😴': 'tired', '🥱': 'tired', '☕': 'content',
    '🍃': 'peaceful', '🧘': 'peaceful',

    // Love
    '❤️': 'love', '💕': 'romantic', '💞': 'romantic', '💗': 'love',
};

// ============================================
// KEYWORD DICTIONARY
// ============================================
const KEYWORD_MAPPINGS: Record<string, string> = {
    // Happy
    'happy': 'happy', 'joy': 'happy', 'good': 'content', 'great': 'happy',
    'excited': 'excited', 'party': 'ecstatic', 'dance': 'excited', 'fun': 'happy',

    // Sad
    'sad': 'sad', 'cry': 'sad', 'crying': 'sad', 'depressed': 'depressed',
    'lonely': 'lonely', 'alone': 'lonely', 'pain': 'sad', 'hurt': 'sad',
    'breakup': 'heartbroken', 'broken': 'heartbroken', 'heartbreak': 'heartbroken',

    // Love
    'love': 'love', 'romantic': 'romantic', 'crush': 'romantic', 'couple': 'romantic',
    'miss': 'miss', 'missing': 'miss',

    // Chill
    'chill': 'content', 'relax': 'peaceful', 'calm': 'peaceful', 'tired': 'tired',
    'sleepy': 'tired', 'bored': 'bored',

    // Angry/Stress
    'angry': 'angry', 'mad': 'angry', 'hate': 'angry', 'stress': 'stressed',
    'anxiety': 'anxious', 'worried': 'worried', 'nervous': 'anxious',
    'overwhelmed': 'overwhelmed', 'panic': 'anxious', 'scared': 'anxious',

    // Motivation/Energy
    'motivated': 'inspired', 'pumped': 'excited', 'energetic': 'excited',
    'workout': 'inspired', 'gym': 'inspired', 'run': 'excited',

    // Indian Context
    'dil': 'love', 'pyaar': 'love', 'ishq': 'love',
    'dard': 'sad', 'dukh': 'sad', 'gum': 'sad',
    'nasha': 'ecstatic', 'masti': 'happy', 'sukoon': 'peaceful',
    'udaas': 'sad', 'akela': 'lonely', 'khush': 'happy',
    'rona': 'cry', 'tanha': 'lonely', 'dukhi': 'sad',
    'khamosh': 'peaceful', 'chain': 'peaceful', 'neend': 'tired'
};

// ============================================
// PHRASE MAPPINGS (The "Poet" Layer)
// High-priority multi-word matching
// ============================================
const PHRASE_MAPPINGS: Record<string, string> = {
    // === METAPHORS & DEEP FEELS ===
    'plastic bag': 'lonely',
    'drifting': 'lonely',
    'invisible': 'lonely',
    'ghost': 'lonely',
    'under a cloud': 'sad',
    'grey sky': 'sad',
    'storm inside': 'anxious',
    'weight of the world': 'overwhelmed',
    'drowning': 'overwhelmed',
    'sinking': 'anxious',
    'wallflower': 'lonely',
    'black hole': 'empty',
    'void': 'empty',
    'numb': 'depressed',
    'hollow': 'empty',

    // === TAYLOR SWIFT (Swiftie Mode) ===
    'all too well': 'heartbroken',
    'remember it all': 'nostalgic',
    'crumpled up piece of paper': 'sad',
    'champagne problems': 'sad',
    'tolerate it': 'sad',
    'love story': 'love',
    'fearless': 'happy',
    'shake it off': 'ecstatic',
    'blank space': 'playful',
    'bad blood': 'angry',
    'reputation': 'angry',
    'midnight rain': 'melancholic',
    'anti-hero': 'anxious',
    'karma': 'happy',
    'cruel summer': 'excited',
    'august': 'nostalgic',
    'cardigan': 'nostalgic',
    'exile': 'heartbroken',

    // === DRAKE / HIP HOP VIBES ===
    'started from the bottom': 'proud',
    'gods plan': 'grateful',
    'in my feelings': 'sad',
    'marvins room': 'lonely',
    'too much': 'overwhelmed',
    'headlines': 'proud',
    'energy': 'excited', // Changed from 'pumped up' to 'excited' as 'pumped up' is not a direct mood preset
    'rich flex': 'excited',
    'way 2 sexy': 'playful',

    // === HINDI / BOLLYWOOD (Desi Vibes) ===
    'tum hi ho': 'love',
    'channa mereya': 'heartbroken',
    'kal ho naa ho': 'sad',
    'apna time aayega': 'inspired',
    'chak de': 'inspired',
    'jai ho': 'proud',
    'senorita': 'playful',
    'badtameez dil': 'ecstatic',
    'kabira': 'nostalgic',
    'tujhe dekha to': 'love',
    'gerua': 'love',
    'zaalima': 'love',
    'tera ghata': 'angry',
    'bekhayali': 'heartbroken',

    // === GEN Z / INTERNET SLANG ===
    'slay': 'excited',
    'ate that': 'proud',
    'main character': 'inspired',
    'villain arc': 'angry',
    'touch grass': 'frustrated',
    'down bad': 'romantic', // Desperate romantic
    'delulu': 'romantic', // Delusional romantic
    'shipping': 'romantic',
    'rizz': 'playful',
    'bet': 'happy',
    'no cap': 'serious', // Maybe neutral/content
    'dead inside': 'depressed',
    'doomscrolling': 'anxious',
    'brain rot': 'bored',
    'locked in': 'focused', // Motivational
    'let him cook': 'excited',
    'its giving': 'playful', // Changed from 'judgmental' to 'playful' as 'judgmental' is not a direct mood preset

    // === STANDARD IDIOMS & PHRASES ===
    // Happiness/Energy
    'cloud nine': 'ecstatic',
    'over the moon': 'ecstatic',
    'on top of the world': 'ecstatic',
    'walking on air': 'happy',
    'high spirits': 'happy',
    'good vibes': 'happy',
    'full of life': 'excited',
    'pumped up': 'excited',
    'fired up': 'excited',

    // Sadness/Pain
    'feeling blue': 'sad',
    'down in the dumps': 'sad',
    'heavy heart': 'sad',
    'broken heart': 'heartbroken',
    'falling apart': 'heartbroken',
    'crying eyes out': 'cry',
    'in pieces': 'heartbroken',
    'rock bottom': 'depressed',
    'end of the road': 'heartbroken',

    // Anxiety/Stress
    'butterflies in my stomach': 'anxious', // Specific phrase keeps original meaning
    'on edge': 'anxious',
    'climbing walls': 'anxious',
    'end of rope': 'stressed',
    'burned out': 'exhausted',
    'running on empty': 'exhausted',
    'burning candle': 'exhausted',

    // Love/Romantic
    'head over heels': 'love',
    'butterflies': 'romantic', // User requested: "romantic goosebumpy way"
    'goosebumps': 'romantic',
    'chills': 'inspired',
    'love struck': 'love',
    'thinking of you': 'miss',
    'missing you': 'miss',
    'sweet nothing': 'romantic',

    // Chill/Peace
    'peace and quiet': 'peaceful',
    'taking it easy': 'content',
    'chilling out': 'content',
    'zen mode': 'peaceful',
    'vibe check': 'content'
};

// ============================================
// HELPERS
// ============================================

function normalizeText(text: string): string {
    return text.toLowerCase().trim();
}

/**
 * Check if a keyword exists as a whole word in text.
 * Prevents false positives like 'good' matching in 'goodbye'.
 */
function hasWholeWord(text: string, word: string): boolean {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(text);
}

/**
 * Main Mock Analysis Function
 */
export function analyzeMoodMock(text: string, emojis: string): MoodResult {
    let combinedText = `${text} ${emojis || ''}`.toLowerCase();

    // Default to Neutral/Chill if nothing found
    let targetMoodKey = 'content';
    let foundPhrase = false;

    // 0. CHECK PHRASES FIRST (Priority)
    // We check matches by length (longest match wins to avoid partials)
    // e.g. "feeling blue" (sad) matches better than "blue" (if blue was a keyword)
    const sortedPhrases = Object.keys(PHRASE_MAPPINGS).sort((a, b) => b.length - a.length);

    for (const phrase of sortedPhrases) {
        if (combinedText.includes(phrase)) {
            targetMoodKey = PHRASE_MAPPINGS[phrase];
            foundPhrase = true;
            break; // Stop at first/longest phrase match for speed & priority
        }
    }

    // 1. Check Keywords (If no phrase found) - Use word boundary matching
    if (!foundPhrase) {
        Object.keys(KEYWORD_MAPPINGS).forEach(keyword => {
            if (hasWholeWord(combinedText, keyword)) {
                targetMoodKey = KEYWORD_MAPPINGS[keyword];
            }
        });
    }

    // 2. Check Emojis - Only use emoji if no strong text match found
    // This prevents emojis from completely overriding text meaning
    const detectedFromText = targetMoodKey !== 'content';
    for (const char of combinedText) {
        if (EMOJI_MOODS[char]) {
            // If text gave us a mood, only upgrade if emoji is stronger
            // Otherwise, use the emoji mood
            if (!detectedFromText) {
                targetMoodKey = EMOJI_MOODS[char];
            }
        }
    }

    // 3. Fallback for "not happy" logic (primitive)
    if (combinedText.includes('not happy')) targetMoodKey = 'sad';
    if (combinedText.includes('not sad')) targetMoodKey = 'happy';

    // 4. Retrieve Vector
    const preset = MOOD_PRESETS[targetMoodKey] || MOOD_PRESETS['content'];

    // 5. Construct Result
    return {
        vector: validateMoodVector(preset.vector),
        primaryMood: preset.mood,
        confidence: foundPhrase ? 0.95 : 0.9, // Higher confidence for exact phrase match
        breakdown: {
            textContribution: 0.5,
            emojiContribution: 0.5
        }
    };
}
