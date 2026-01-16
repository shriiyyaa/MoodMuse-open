
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
    motivated: { vector: V4_TARGETS.MOTIVATIONAL, mood: 'fired up', weight: 1.2 },
    confused: { vector: { ...V4_TARGETS.CHILL, tension: 0.5 }, mood: 'confused but okay', weight: 0.8 },
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
// KEYWORD DICTIONARY (MASSIVELY EXPANDED)
// Sorted by emotional category with intensity levels
// ============================================
const KEYWORD_MAPPINGS: Record<string, string> = {
    // === HAPPINESS (Mild to Intense) ===
    'okay': 'content', 'fine': 'content', 'alright': 'content', 'decent': 'content',
    'good': 'content', 'nice': 'content', 'pleasant': 'content', 'satisfied': 'content',
    'happy': 'happy', 'joy': 'happy', 'joyful': 'happy', 'cheerful': 'happy',
    'glad': 'happy', 'delighted': 'happy', 'pleased': 'happy', 'blessed': 'happy',
    'great': 'happy', 'wonderful': 'happy', 'amazing': 'excited', 'awesome': 'excited',
    'fantastic': 'excited', 'incredible': 'excited', 'thrilled': 'excited',
    'ecstatic': 'ecstatic', 'overjoyed': 'ecstatic', 'elated': 'ecstatic',
    'euphoric': 'ecstatic', 'blissful': 'ecstatic', 'exhilarated': 'ecstatic',

    // === SADNESS (Mild to Intense) ===
    'blue': 'sad', 'down': 'sad', 'low': 'sad',
    'sad': 'sad', 'unhappy': 'sad', 'upset': 'sad', 'gloomy': 'sad', 'glum': 'sad',
    'melancholy': 'melancholic', 'sorrowful': 'sad', 'miserable': 'depressed',
    'depressed': 'depressed', 'despair': 'depressed', 'hopeless': 'depressed',
    'devastated': 'heartbroken', 'shattered': 'heartbroken', 'destroyed': 'heartbroken',
    'crushed': 'heartbroken', 'wrecked': 'heartbroken', 'ruined': 'heartbroken',
    'cry': 'cry', 'crying': 'cry', 'tears': 'cry', 'weeping': 'cry', 'sobbing': 'cry',

    // === LONELINESS ===
    'lonely': 'lonely', 'alone': 'lonely', 'isolated': 'lonely', 'abandoned': 'lonely',
    'forgotten': 'lonely', 'invisible': 'lonely', 'excluded': 'lonely', 'ignored': 'lonely',
    'noone': 'lonely', 'nobody': 'lonely', 'friendless': 'lonely',

    // === HEARTBREAK & LOSS ===
    'heartbreak': 'heartbroken', 'heartbroken': 'heartbroken', 'breakup': 'heartbroken',
    'broke up': 'heartbroken', 'dumped': 'heartbroken', 'rejected': 'heartbroken',
    'cheated': 'heartbroken', 'betrayed': 'heartbroken', 'lied': 'heartbroken',
    'ghosted': 'heartbroken', 'blocked': 'heartbroken', 'left': 'heartbroken',
    'broken': 'heartbroken', 'hurt': 'sad', 'pain': 'sad', 'ache': 'sad', 'aching': 'sad',
    'loss': 'grief', 'lost': 'grief', 'died': 'grief', 'death': 'grief', 'gone': 'grief',

    // === LOVE & ROMANCE ===
    'love': 'love', 'loving': 'love', 'adore': 'love', 'cherish': 'love',
    'romantic': 'romantic', 'romance': 'romantic', 'crush': 'romantic', 'crushing': 'romantic',
    'infatuated': 'love', 'smitten': 'love', 'attracted': 'romantic', 'attraction': 'romantic',
    'couple': 'romantic', 'dating': 'romantic', 'date': 'romantic', 'relationship': 'romantic',
    'boyfriend': 'romantic', 'girlfriend': 'romantic', 'partner': 'romantic', 'bae': 'romantic',
    'sweetheart': 'romantic', 'darling': 'romantic', 'honey': 'romantic', 'baby': 'romantic',
    'cuddle': 'romantic', 'cuddling': 'romantic', 'hug': 'romantic', 'kiss': 'romantic',

    // === MISSING SOMEONE ===
    'miss': 'miss', 'missing': 'miss', 'longing': 'miss', 'yearn': 'miss', 'yearning': 'miss',
    'memories': 'nostalgic', 'remember': 'nostalgic', 'nostalgia': 'nostalgic',
    'past': 'nostalgic', 'throwback': 'nostalgic', 'reminisce': 'nostalgic',

    // === ANGER (Mild to Intense) ===
    'annoyed': 'frustrated', 'irritated': 'frustrated', 'bothered': 'frustrated',
    'frustrated': 'frustrated', 'pissed': 'angry', 'mad': 'angry',
    'angry': 'angry', 'furious': 'angry', 'rage': 'angry', 'raging': 'angry',
    'livid': 'angry', 'enraged': 'angry', 'fuming': 'angry', 'seething': 'angry',
    'hate': 'angry', 'hatred': 'angry', 'despise': 'angry', 'loathe': 'angry',

    // === ANXIETY & STRESS ===
    'nervous': 'anxious', 'anxious': 'anxious', 'anxiety': 'anxious', 'uneasy': 'anxious',
    'worried': 'worried', 'worry': 'worried', 'worrying': 'worried', 'concern': 'worried',
    'scared': 'anxious', 'afraid': 'anxious', 'fear': 'anxious', 'fearful': 'anxious',
    'terrified': 'overwhelmed', 'panic': 'anxious', 'panicking': 'anxious', 'panicked': 'anxious',
    'stressed': 'stressed', 'stress': 'stressed', 'stressful': 'stressed', 'pressure': 'stressed',
    'overwhelmed': 'overwhelmed', 'drowning': 'overwhelmed', 'suffocating': 'overwhelmed',
    'burnt': 'exhausted', 'burnout': 'exhausted', 'burned out': 'exhausted',

    // === PEACE & CALM ===
    'calm': 'peaceful', 'chill': 'content', 'chilling': 'content', 'relaxed': 'peaceful',
    'peaceful': 'peaceful', 'peace': 'peaceful', 'serene': 'peaceful', 'tranquil': 'peaceful',
    'zen': 'peaceful', 'quiet': 'peaceful', 'stillness': 'peaceful', 'centered': 'peaceful',
    'relax': 'peaceful', 'relaxing': 'peaceful', 'unwind': 'peaceful', 'unwinding': 'peaceful',

    // === TIRED & EXHAUSTED ===
    'tired': 'tired', 'sleepy': 'tired', 'drowsy': 'tired', 'fatigued': 'tired',
    'exhausted': 'exhausted', 'drained': 'exhausted', 'depleted': 'exhausted',
    'wiped': 'exhausted', 'beat': 'tired', 'weary': 'tired', 'worn': 'tired',
    'bored': 'bored', 'boring': 'bored', 'meh': 'bored', 'blah': 'bored',

    // === MOTIVATION & ENERGY ===
    'motivated': 'inspired', 'motivation': 'inspired', 'inspired': 'inspired', 'driven': 'inspired',
    'determined': 'inspired', 'focused': 'focused', 'productive': 'focused', 'ambitious': 'inspired',
    'energetic': 'excited', 'energized': 'excited', 'pumped': 'excited', 'hyped': 'excited',
    'ready': 'excited', 'workout': 'inspired', 'gym': 'inspired', 'exercise': 'inspired',
    'run': 'excited', 'running': 'excited', 'training': 'inspired', 'hustle': 'inspired',

    // === PARTY & CELEBRATION ===
    'party': 'ecstatic', 'partying': 'ecstatic', 'celebrate': 'ecstatic', 'celebration': 'ecstatic',
    'dance': 'excited', 'dancing': 'excited', 'vibing': 'excited', 'lit': 'ecstatic',
    'turnt': 'ecstatic', 'hype': 'excited', 'fun': 'happy', 'weekend': 'excited',

    // === GEN Z SLANG ===
    'slaying': 'excited', 'ate': 'proud', 'serve': 'proud',
    'iconic': 'proud', 'valid': 'content', 'based': 'content', 'goated': 'proud',
    'fire': 'excited', 'bussin': 'excited', 'lowkey': 'content', 'highkey': 'excited',
    'vibe': 'content', 'vibes': 'content', 'mood': 'content', 'same': 'content',
    'ick': 'frustrated', 'cringe': 'frustrated', 'sus': 'anxious', 'mid': 'bored',
    'understood': 'content', 'period': 'proud', 'iykyk': 'playful', 'bestie': 'happy',
    'unhinged': 'excited', 'chaotic': 'excited', 'feral': 'excited', 'unwell': 'exhausted',

    // === INTERNET/MEME CULTURE ===
    'depresso': 'depressed', 'sadge': 'sad', 'copium': 'anxious', 'hopium': 'inspired',
    'feels': 'sad', 'feelsbadman': 'sad', 'feelsgoodman': 'happy', 'poggers': 'excited',
    'bruh': 'frustrated', 'oof': 'sad', 'f': 'sad', 'rip': 'sad',

    // === HINDI/URDU EXPRESSIONS (Expanded) ===
    'dil': 'love', 'pyaar': 'love', 'ishq': 'love', 'mohabbat': 'love', 'prem': 'love',
    'dard': 'sad', 'dukh': 'sad', 'gum': 'sad', 'udaas': 'sad', 'dukhi': 'sad',
    'akela': 'lonely', 'tanha': 'lonely', 'alag': 'lonely',
    'khush': 'happy', 'khushi': 'happy', 'maza': 'happy', 'masti': 'happy',
    'nasha': 'ecstatic', 'josh': 'excited', 'junoon': 'excited',
    'sukoon': 'peaceful', 'chain': 'peaceful', 'khamosh': 'peaceful', 'shanti': 'peaceful',
    'rona': 'cry', 'aansu': 'cry', 'roona': 'cry',
    'neend': 'tired', 'thaka': 'tired', 'thaki': 'tired',
    'gussa': 'angry', 'naraz': 'angry', 'chidh': 'frustrated',
    'darr': 'anxious', 'fikar': 'worried', 'tension': 'stressed', 'pareshani': 'stressed',
    'yaad': 'nostalgic', 'yaadein': 'nostalgic', 'yadein': 'nostalgic',

    // === PUNJABI EXPRESSIONS ===
    'udaasi': 'sad', 'nachna': 'excited',
    'gabru': 'proud', 'patola': 'excited', 'sohni': 'romantic',

    // === COMMON TYPOS & VARIATIONS ===
    'happi': 'happy', 'happyy': 'happy', 'sadd': 'sad', 'saaad': 'sad',
    'angryy': 'angry', 'tiredd': 'tired', 'boreddd': 'bored', 'lonleyy': 'lonely',
    'depresed': 'depressed', 'anxiuos': 'anxious', 'stresed': 'stressed'
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

    // === COMPOUND PHRASE OVERRIDES (prevent misdetection) ===
    // ROMANTIC expressions with negative-sounding words
    'hopeless romantic': 'romantic',
    'hopelessly romantic': 'romantic',
    'hopelessly in love': 'love',
    'crazy in love': 'love',
    'madly in love': 'love',
    'stupidly in love': 'love',
    'painfully in love': 'love',
    'desperately in love': 'love',
    'helplessly in love': 'love',
    'lost in love': 'love',
    'drunk in love': 'love',
    'falling hard': 'romantic',
    'falling fast': 'romantic',
    'love sick': 'romantic',
    'lovesick': 'romantic',
    'fool for you': 'romantic',
    'fool in love': 'romantic',
    'crazy about you': 'love',
    'crazy for you': 'love',
    'mad about you': 'love',
    'insanely in love': 'love',
    'disgustingly in love': 'love',
    'sickeningly sweet': 'love',

    // TIRED expressions (not sad/depressed)
    'dead tired': 'tired',
    'dead exhausted': 'exhausted',
    'dying of sleep': 'tired',
    'dying to sleep': 'tired',
    'bone tired': 'tired',
    'dog tired': 'tired',
    'so tired': 'tired',
    'too tired': 'tired',
    'damn tired': 'tired',
    'freaking tired': 'tired',
    'dying for a nap': 'tired',
    'need sleep': 'tired',

    // HAPPY/EXCITED expressions with intense words
    'crazy happy': 'ecstatic',
    'insanely happy': 'ecstatic',
    'stupidly happy': 'ecstatic',
    'ridiculously happy': 'ecstatic',
    'dying of happiness': 'ecstatic',
    'dying of joy': 'ecstatic',
    'killing it': 'excited',
    'crushing it': 'excited',
    'slaying': 'excited',
    'on fire': 'excited',
    'fire mode': 'excited',
    'beast mode': 'motivated',
    'absolutely buzzing': 'excited',
    'so freaking happy': 'ecstatic',

    // FRUSTRATED expressions (not angry)
    'sick of this': 'frustrated',
    'sick and tired': 'frustrated',
    'tired of this': 'frustrated',
    'done with this': 'frustrated',
    'over this': 'frustrated',
    'had enough': 'frustrated',
    'cant deal': 'frustrated',
    'cant even': 'frustrated',
    'literally cannot': 'frustrated',
    'so done': 'frustrated',
    'im done': 'frustrated',

    // BORED expressions
    'bored to death': 'bored',
    'bored out of my mind': 'bored',
    'dying of boredom': 'bored',
    'so bored i could die': 'bored',
    'bored af': 'bored',

    // ANXIOUS expressions (not just sad)
    'dying inside': 'anxious',
    'freaking out': 'anxious',
    'losing my mind': 'anxious',
    'going crazy': 'anxious',
    'going insane': 'anxious',
    'driving me crazy': 'frustrated',
    'driving me insane': 'frustrated',
    'about to lose it': 'anxious',
    'on edge': 'anxious',
    'stressed af': 'stressed',
    'stressed out': 'stressed',

    // CHILL expressions
    'dead calm': 'peaceful',
    'deadly calm': 'peaceful',
    'killing time': 'bored',
    'taking it slow': 'peaceful',
    'chilling out': 'content',
    'just vibing': 'content',
    'good vibes only': 'happy',
    'vibes are immaculate': 'happy',

    // HUNGRY/FOOD (map to neutral, don't confuse with emotions)
    'dying for food': 'content',
    'starving to death': 'content',
    'could eat a horse': 'content',

    // INTENSITY without negative meaning
    'dead serious': 'focused',
    'deadly serious': 'focused',
    'dead set': 'focused',
    'dead wrong': 'confused',
    'dead right': 'proud',

    // NOSTALGIC expressions
    'take me back': 'nostalgic',
    'those were the days': 'nostalgic',
    'good old days': 'nostalgic',
    'back in the day': 'nostalgic',

    // CONFIDENT expressions
    'feeling myself': 'proud',
    'feeling like a boss': 'proud',
    'feeling good about myself': 'happy',
    'feeling great about': 'happy',

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
    'zen mode': 'peaceful',
    'vibe check': 'content',

    // === COMMON CONVERSATIONAL PHRASES ===
    // Greetings/Generic (map to positive moods)
    'feeling great': 'happy',
    'feeling good': 'happy',
    'doing great': 'happy',
    'doing good': 'content',
    'all good': 'content',
    'im good': 'content',
    'pretty good': 'content',
    'not bad': 'content',
    'so so': 'bored',
    'meh': 'bored',
    'kinda tired': 'tired',
    'bit tired': 'tired',
    'little sad': 'sad',
    'feeling down': 'sad',
    'could be better': 'sad',
    'not great': 'sad',
    'been better': 'sad',
    'rough day': 'stressed',
    'long day': 'tired',
    'hard day': 'exhausted',
    'need a break': 'exhausted',
    'need to relax': 'peaceful',
    'want to chill': 'content',
    'feeling lazy': 'bored',
    'so bored': 'bored',

    // Emotional states
    'in love': 'love',
    'crushing hard': 'romantic',
    'cant stop thinking': 'romantic',
    'really missing': 'miss',
    'so lonely': 'lonely',
    'all alone': 'lonely',
    'nobody cares': 'lonely',
    'feel empty': 'empty',
    'so angry': 'angry',
    'really mad': 'angry',
    'really sad': 'heartbroken',
    'super happy': 'ecstatic',
    'so happy': 'ecstatic',
    'extremely happy': 'ecstatic',
    'really excited': 'excited',
    'cant wait': 'excited',
    'looking forward': 'excited',

    // Hindi casual phrases
    'kya haal': 'content',
    'theek hu': 'content',
    'thik hu': 'content',
    'accha hu': 'happy',
    'mast hu': 'happy',
    'bohot khush': 'ecstatic',
    'bahut khush': 'ecstatic',
    'bohot sad': 'heartbroken',
    'bahut sad': 'heartbroken',
    'bahut tired': 'exhausted',
    'neend aa rahi': 'tired',
    'sone ka mann': 'tired',
    'party mood': 'ecstatic',
    'chill karna': 'content',
    'relax karna': 'peaceful'
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

    // 0.5. CHECK MODIFIERS (Intensity)
    const INTENSITY_MODIFIERS = ['very', 'really', 'super', 'extremely', 'so', 'too', 'totally'];
    let intensityMultiplier = 1.0;

    INTENSITY_MODIFIERS.forEach(mod => {
        if (hasWholeWord(combinedText, mod)) intensityMultiplier = 1.2;
    });

    // 0. CHECK PHRASES FIRST (High Priority)
    const sortedPhrases = Object.keys(PHRASE_MAPPINGS).sort((a, b) => b.length - a.length);

    for (const phrase of sortedPhrases) {
        if (combinedText.includes(phrase)) {
            targetMoodKey = PHRASE_MAPPINGS[phrase];
            foundPhrase = true;
            break;
        }
    }

    // 1. CHECK KEYWORDS WITH NEGATION & SCORING
    if (!foundPhrase) {
        const moodScores: Record<string, number> = {};

        Object.keys(KEYWORD_MAPPINGS).forEach(keyword => {
            if (hasWholeWord(combinedText, keyword)) {
                const detectedMood = KEYWORD_MAPPINGS[keyword];

                // Check NEGATION (e.g., "not happy")
                const negationRegex = new RegExp(`(not|don't|dont|never|no)\\s+${keyword}`, 'i');
                if (negationRegex.test(combinedText)) {
                    // Invert mood logic (primitive but effective)
                    if (['happy', 'excited', 'ecstatic', 'proud'].includes(detectedMood)) {
                        moodScores['sad'] = (moodScores['sad'] || 0) + 2; // "Not happy" -> Sad
                    } else if (['sad', 'depressed', 'lonely', 'heartbroken'].includes(detectedMood)) {
                        moodScores['happy'] = (moodScores['happy'] || 0) + 2; // "Not sad" -> Happy
                    }
                } else {
                    // Regular detection - Assign score based on intensity
                    let score = 1;

                    // Intense words get higher score
                    if (['ecstatic', 'devastated', 'furious', 'terrified', 'exhausted'].includes(keyword)) {
                        score = 3;
                    } else if (['happy', 'sad', 'angry', 'anxious'].includes(keyword)) {
                        score = 2;
                    }

                    moodScores[detectedMood] = (moodScores[detectedMood] || 0) + (score * intensityMultiplier);
                }
            }
        });

        // Find highest scored mood
        let maxScore = 0;
        let bestMood = 'content';

        Object.entries(moodScores).forEach(([mood, score]) => {
            if (score > maxScore) {
                maxScore = score;
                bestMood = mood;
            }
        });

        if (maxScore > 0) {
            targetMoodKey = bestMood;
        }
    }

    // 2. CHECK EMOJIS (Additive, doesn't override strong text)
    if (!foundPhrase) {
        for (const char of combinedText) {
            if (EMOJI_MOODS[char]) {
                const emojiMood = EMOJI_MOODS[char];
                // If we already have a text mood, only switch if it's "content" (weak)
                if (targetMoodKey === 'content') {
                    targetMoodKey = emojiMood;
                }
            }
        }
    }

    // 3. SMART FALLBACK - If still 'content', try time-based or random variety
    if (targetMoodKey === 'content') {
        const hour = new Date().getHours();
        const randomValue = Math.random();

        // Time-of-day defaults (30% chance to use time-based mood)
        if (randomValue < 0.3) {
            if (hour >= 6 && hour < 12) {
                // Morning: energetic moods
                const morningMoods = ['inspired', 'happy', 'excited'];
                targetMoodKey = morningMoods[Math.floor(Math.random() * morningMoods.length)];
            } else if (hour >= 12 && hour < 18) {
                // Afternoon: focused/productive moods
                const afternoonMoods = ['focused', 'content', 'happy'];
                targetMoodKey = afternoonMoods[Math.floor(Math.random() * afternoonMoods.length)];
            } else if (hour >= 18 && hour < 22) {
                // Evening: romantic/chill moods
                const eveningMoods = ['romantic', 'peaceful', 'nostalgic'];
                targetMoodKey = eveningMoods[Math.floor(Math.random() * eveningMoods.length)];
            } else {
                // Night: calm/sleep moods
                const nightMoods = ['peaceful', 'tired', 'melancholic'];
                targetMoodKey = nightMoods[Math.floor(Math.random() * nightMoods.length)];
            }
        } else {
            // Random variety from pleasant moods (70% chance)
            const varietyMoods = ['happy', 'romantic', 'inspired', 'peaceful', 'nostalgic', 'excited'];
            targetMoodKey = varietyMoods[Math.floor(Math.random() * varietyMoods.length)];
        }
    }

    // 4. Retrieve Vector
    const preset = MOOD_PRESETS[targetMoodKey] || MOOD_PRESETS['content'];

    // 5. Confidence based on detection quality
    let confidence = 0.9;
    if (foundPhrase) {
        confidence = 0.95; // High confidence for exact phrase match
    } else if (targetMoodKey === 'content') {
        confidence = 0.7; // Lower confidence for fallback/random
    }

    // 6. Construct Result
    return {
        vector: validateMoodVector(preset.vector),
        primaryMood: preset.mood,
        confidence,
        breakdown: {
            textContribution: 0.5,
            emojiContribution: 0.5
        }
    };
}
