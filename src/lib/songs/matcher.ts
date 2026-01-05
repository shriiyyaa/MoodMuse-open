/**
 * MoodMuse - Song Matcher
 * 
 * Matches songs from our database to the user's mood vector.
 * Uses cosine similarity to find emotionally aligned songs,
 * then generates empathetic explanations.
 * 
 * This version works fully without OpenAI, generating
 * high-quality explanations from song metadata.
 */

import { MoodResult } from '@/lib/mood/types';
import { Song, SongMatch, SongMatchResponse } from '@/lib/songs/types';
import { getSongsByLanguage } from '@/lib/songs/database';
import { calculateMoodSimilarity } from '@/lib/mood/analyzer';

// ============================================
// HEADLINE TEMPLATES - Empathetic mood headlines
// ============================================

const HEADLINE_TEMPLATES: Record<string, string[]> = {
    // Positive moods
    'joyful': ['For your radiant joy ✨', 'Music for this beautiful feeling 🌟', 'For the joy in your heart 💫'],
    'happy': ['For your happy heart 💛', 'Songs for this feeling ✨', 'For your joyful energy 🌟'],
    'ecstatic': ['For this incredible high ✨', 'Music for pure bliss 🎉', 'When life feels this good 💫'],
    'excited': ['For your buzzing energy ⚡', 'Music for this anticipation 🌟', 'For the excitement in you ✨'],
    'peaceful': ['For your quiet peace 🌙', 'Music for stillness 🕊️', 'For this calm moment ✨'],
    'hopeful': ['For the hope rising in you 🌅', 'Music for brighter days 🌟', 'For that light ahead ✨'],
    'grateful': ['For grateful hearts 💜', 'Music for thankful moments ✨', 'For counting blessings 🙏'],
    'love': ['For hearts full of love 💕', 'Music for this tenderness 💖', 'For the love you feel 💗'],
    'content': ['For quiet contentment ☁️', 'Music for gentle moments ✨', 'For feeling okay 🌙'],

    // Sad moods
    'sad': ['For your quiet storm ☁️', 'Music that understands 🌧️', 'For when it hurts 💜'],
    'melancholy': ['For this gentle ache 🌙', 'Music for bittersweet hearts 🖤', 'For the melancholy 🌧️'],
    'heartbroken': ['For shattered pieces 💔', 'Music that lets you grieve 🖤', 'For broken hearts 💜'],
    'lonely': ['For lonely nights 🌙', 'Music that sits with you 🖤', 'For feeling alone 💜'],
    'grief': ['For heavy hearts 🖤', 'Music for the grief 💜', 'For loss and love 🌙'],
    'empty': ['For hollow moments 🌙', 'Music for the emptiness 🖤', 'When you feel nothing 💜'],

    // Anxious moods
    'anxious': ['For racing thoughts 🌀', 'Music to quiet the noise 🌙', 'For anxious hearts 💜'],
    'stressed': ['For overwhelming days 😮‍💨', 'Music for letting go 🌙', 'For the pressure 💜'],
    'overwhelmed': ['For the overwhelm 🌊', 'Music when it\'s too much 💜', 'For drowning feelings 🌙'],
    'worried': ['For worried minds 🌙', 'Music for uncertain times 💜', 'For the worry 😔'],

    // Angry moods
    'angry': ['For the fire inside 🔥', 'Music that screams for you 💢', 'For burning feelings 🖤'],
    'frustrated': ['For building pressure 😤', 'Music for frustration 🔥', 'When nothing works 💢'],

    // Tired moods
    'tired': ['For weary souls 🌙', 'Music for tired hearts 😴', 'For the exhaustion 💜'],
    'exhausted': ['For complete exhaustion 😮‍💨', 'Music for burnt out days 🌙', 'When you have nothing left 💜'],
    'drained': ['For empty tanks 🌙', 'Music for drained hearts 💜', 'For depleted souls ✨'],

    // Nostalgic moods
    'nostalgic': ['For bittersweet memories 🌙', 'Music for the past 🍂', 'For remembering 💜'],
    'wistful': ['For wistful longing 🌙', 'Music for what was 🍂', 'For gentle memories 💜'],

    // Complex moods
    'confused': ['For uncertain hearts 🌀', 'Music for foggy minds 🌙', 'For the confusion 💜'],
    'lost': ['For feeling lost 🌊', 'Music for wandering souls 🌙', 'When you don\'t know 💜'],
    'restless': ['For restless energy ⚡', 'Music for uneasy nights 🌙', 'For the restlessness 🌀'],
    'vulnerable': ['For raw moments 💜', 'Music for open hearts 🌙', 'For vulnerability ✨'],
    'numb': ['For feeling nothing 🌙', 'Music for numbness 🖤', 'When you can\'t feel 💜'],
    'bittersweet': ['For bittersweet feelings 🌙', 'Music for mixed hearts 💜', 'For the in-between ✨'],

    // Default
    'default': ['For this moment ✨', 'Music for you 💜', 'For how you feel 🌙'],
};

// ============================================
// EXPLANATION TEMPLATES
// ============================================

const EXPLANATION_TEMPLATES = {
    connection: [
        "This one understands without needing words.",
        "Sometimes a song just gets it. This is that song.",
        "This one knows exactly where you are right now.",
        "A song that meets you where you are.",
    ],
    release: [
        "Let this one do the feeling for you.",
        "Sometimes you need music that feels it so you don't have to.",
        "This one carries what you can't.",
        "Let go with this one.",
    ],
    comfort: [
        "A familiar embrace in musical form.",
        "This one wraps around you like a blanket.",
        "For when you need something that doesn't demand anything.",
        "Comfort in three-minute form.",
    ],
    energy: [
        "Let this one lift you up.",
        "Sometimes you need music that moves you.",
        "For the energy you didn't know you had.",
        "This one brings the spark.",
    ],
    reflection: [
        "For sitting with your thoughts.",
        "A companion for introspection.",
        "This one lets you think.",
        "For the quiet moments of understanding.",
    ],
    catharsis: [
        "This one screams so you don't have to.",
        "Sometimes you need to break things. This song does it for you.",
        "For letting it all out.",
        "Catharsis in musical form.",
    ],
    nostalgia: [
        "For remembering while moving forward.",
        "A bridge between then and now.",
        "For the ache of beautiful memories.",
        "This one knows about time passing.",
    ],
};

/**
 * Generate a headline for the mood
 */
function generateMockHeadline(primaryMood: string): string {
    // Find matching templates
    const moodKey = primaryMood.toLowerCase().split(' ')[0]; // Get first word
    const templates = HEADLINE_TEMPLATES[moodKey] || HEADLINE_TEMPLATES['default'];

    // Pick random template
    return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Generate an empathetic explanation based on song metadata
 */
function generateMockExplanation(song: Song, primaryMood: string): string {
    // Strategies based on mood and song characteristics
    const moodLower = primaryMood.toLowerCase();

    // Build explanation from song's bestFor and themes
    if (song.bestFor && song.bestFor.length > 0) {
        const bestFor = song.bestFor[Math.floor(Math.random() * song.bestFor.length)];

        // Custom explanations based on bestFor
        const explanations: Record<string, string> = {
            'crying it out': "For when you need to let the tears come. This one won't judge.",
            'feeling misunderstood': "This one knows what it's like to be too much. It sits with you in that.",
            'late nights': "For 3am thoughts and the weight of darkness. It understands.",
            'breakthrough moments': "For when something finally clicks. This one celebrates with you.",
            'heartbreak': "For the ache that won't quit. This song has been there too.",
            'quiet pain': "For the hurt that doesn't make noise. This one hears it anyway.",
            'rainy days': "For melancholy weather, inside and out.",
            'processing anger': "Sometimes you need to feel the fire. This one fans the flames safely.",
            'driving alone': "For solitude on wheels. Just you and the road.",
            'staring at ceiling': "For those moments when all you can do is look up and exist.",
            'existential moments': "For questioning everything. This one sits in the uncertainty with you.",
            'anxiety relief': "A sonic exhale. Let this one slow your breathing.",
            'missing someone': "For the space where someone used to be.",
            'love feelings': "For hearts that are full and overflowing.",
            'romantic mood': "For tender feelings and soft hearts.",
            'bittersweet moments': "For when happiness and sadness hold hands.",
            'releasing anger': "Let this one rage for you.",
            'feeling defiant': "For when you need to stand your ground.",
            'seasonal melancholy': "For the ache that comes with changing seasons.",
            'hopeful sadness': "For sadness that still believes in tomorrow.",
            'grief': "For loss that reshapes you. This one knows.",
        };

        if (explanations[bestFor]) {
            return explanations[bestFor];
        }

        return `For ${bestFor}. This one knows the feeling.`;
    }

    // Fallback: Use themes
    if (song.themes && song.themes.length > 0) {
        const theme = song.themes[0];
        return `A song about ${theme} — it matches where you are right now.`;
    }

    // Ultimate fallback: General templates based on mood
    if (moodLower.includes('sad') || moodLower.includes('melancholy') || moodLower.includes('grief')) {
        return EXPLANATION_TEMPLATES.comfort[Math.floor(Math.random() * EXPLANATION_TEMPLATES.comfort.length)];
    }
    if (moodLower.includes('angry') || moodLower.includes('frustrat')) {
        return EXPLANATION_TEMPLATES.catharsis[Math.floor(Math.random() * EXPLANATION_TEMPLATES.catharsis.length)];
    }
    if (moodLower.includes('anxious') || moodLower.includes('stress') || moodLower.includes('overwhelm')) {
        return EXPLANATION_TEMPLATES.release[Math.floor(Math.random() * EXPLANATION_TEMPLATES.release.length)];
    }
    if (moodLower.includes('nostalgic') || moodLower.includes('wistful') || moodLower.includes('memories')) {
        return EXPLANATION_TEMPLATES.nostalgia[Math.floor(Math.random() * EXPLANATION_TEMPLATES.nostalgia.length)];
    }
    if (moodLower.includes('happy') || moodLower.includes('joy') || moodLower.includes('excited')) {
        return EXPLANATION_TEMPLATES.energy[Math.floor(Math.random() * EXPLANATION_TEMPLATES.energy.length)];
    }

    return EXPLANATION_TEMPLATES.connection[Math.floor(Math.random() * EXPLANATION_TEMPLATES.connection.length)];
}

/**
 * Match songs to a mood vector and generate explanations.
 * Uses CATEGORY-BASED MATCHING for accurate mood alignment.
 * @param excludeIds - Array of song IDs to exclude (already played songs)
 * @param intent - User's emotional intent (stay, lift, distract, surprise)
 */
export async function matchSongs(
    moodResult: MoodResult,
    language: string,
    limit: number = 5,
    excludeIds: string[] = [],
    intent: string = 'stay'
): Promise<SongMatchResponse> {
    const normalizedLang = language.toLowerCase();
    const excludeSet = new Set(excludeIds);

    // Import classifier
    const { classifySongMood, getMoodPreferences } = await import('@/lib/songs/classifier');

    // Get preferred song categories based on user mood + intent
    const preferredCategories = getMoodPreferences(moodResult.primaryMood, intent);

    // Check if this is a mixed language request
    if (normalizedLang.includes('+') || normalizedLang === 'all') {
        return matchSongsBalancedWithCategories(
            moodResult, language, limit, excludeIds, intent, preferredCategories, classifySongMood
        );
    }

    // Single language matching with categories
    let candidates = getSongsByLanguage(language);

    if (candidates.length === 0) {
        candidates = getSongsByLanguage('any');
    }

    // Filter out excluded songs
    candidates = candidates.filter(song => !excludeSet.has(song.id));

    // Score songs with CATEGORY BONUS
    const scoredSongs = candidates.map(song => {
        const songCategories = classifySongMood(song.title, song.artist);

        // Check if song matches preferred categories
        const categoryMatch = preferredCategories.some(pref => songCategories.includes(pref as any));

        // Base score from vector similarity
        let score = calculateMoodSimilarity(moodResult.vector, song.emotionalProfile);

        // MAJOR BONUS for category match (this is the key fix!)
        if (categoryMatch) {
            score += 0.5; // Big boost for matching category
        }

        // Penalty for opposite category
        const isSadMood = ['sad', 'heartbreak', 'melancholy'].some(c => preferredCategories.includes(c as any));
        const isHappySong = songCategories.includes('happy') || songCategories.includes('party');
        if (isSadMood && isHappySong) {
            score -= 0.3; // Penalty for happy song when user is sad
        }

        return { song, score, categories: songCategories };
    });

    // Sort by score (highest first)
    scoredSongs.sort((a, b) => b.score - a.score);

    // Select top songs with diversity
    const selected = selectDiverseSongs(scoredSongs, limit);

    // Generate headline
    const headline = generateMockHeadline(moodResult.primaryMood);

    // Generate matches with explanations
    const matches: SongMatch[] = selected.map(item => ({
        song: item.song,
        score: Math.min(item.score, 1), // Cap at 1
        explanation: generateMockExplanation(item.song, moodResult.primaryMood),
    }));

    return {
        headline,
        songs: matches,
    };
}

/**
 * Match songs with BALANCED language distribution + categories.
 */
async function matchSongsBalancedWithCategories(
    moodResult: MoodResult,
    languageString: string,
    limit: number,
    excludeIds: string[],
    intent: string,
    preferredCategories: string[],
    classifySongMood: (title: string, artist: string) => string[]
): Promise<SongMatchResponse> {
    const excludeSet = new Set(excludeIds);

    // Parse languages
    const languages = languageString.toLowerCase() === 'all'
        ? ['english', 'hindi', 'punjabi']
        : languageString.toLowerCase().split('+').map(l => l.trim());

    // Calculate songs per language
    const songsPerLanguage = Math.ceil(limit / languages.length);

    const songsByLanguage: { song: Song; score: number; lang: string }[] = [];

    for (const lang of languages) {
        const candidates = getSongsByLanguage(lang).filter(song => !excludeSet.has(song.id));

        const scoredSongs = candidates.map(song => {
            const songCategories = classifySongMood(song.title, song.artist);
            const categoryMatch = preferredCategories.some(pref => songCategories.includes(pref));

            let score = calculateMoodSimilarity(moodResult.vector, song.emotionalProfile);
            if (categoryMatch) score += 0.5;

            const isSadMood = ['sad', 'heartbreak', 'melancholy'].some(c => preferredCategories.includes(c));
            const isHappySong = songCategories.includes('happy') || songCategories.includes('party');
            if (isSadMood && isHappySong) score -= 0.3;

            return { song, score, lang };
        });

        scoredSongs.sort((a, b) => b.score - a.score);

        const usedArtists = new Set<string>();
        let count = 0;

        for (const item of scoredSongs) {
            if (count >= songsPerLanguage) break;
            if (usedArtists.has(item.song.artist)) continue;

            songsByLanguage.push(item);
            usedArtists.add(item.song.artist);
            count++;
        }
    }

    // Interleave songs from different languages
    const interleaved: { song: Song; score: number }[] = [];
    const langQueues: Map<string, { song: Song; score: number }[]> = new Map();

    for (const item of songsByLanguage) {
        if (!langQueues.has(item.lang)) {
            langQueues.set(item.lang, []);
        }
        langQueues.get(item.lang)!.push({ song: item.song, score: item.score });
    }

    let added = 0;
    let langIndex = 0;
    const langArray = Array.from(langQueues.keys());

    while (added < limit && songsByLanguage.length > 0) {
        const currentLang = langArray[langIndex % langArray.length];
        const queue = langQueues.get(currentLang);

        if (queue && queue.length > 0) {
            interleaved.push(queue.shift()!);
            added++;
        }

        langIndex++;

        if (Array.from(langQueues.values()).every(q => q.length === 0)) break;
    }

    const finalSongs = interleaved.slice(0, limit);
    const headline = generateMockHeadline(moodResult.primaryMood);

    const matches: SongMatch[] = finalSongs.map(item => ({
        song: item.song,
        score: Math.min(item.score, 1),
        explanation: generateMockExplanation(item.song, moodResult.primaryMood),
    }));

    return {
        headline,
        songs: matches,
    };
}

/**
 * Match songs with BALANCED language distribution.
 * Ensures equal representation from each selected language.
 */
async function matchSongsBalanced(
    moodResult: MoodResult,
    languageString: string,
    limit: number,
    excludeIds: string[] = []
): Promise<SongMatchResponse> {
    const excludeSet = new Set(excludeIds);

    // Parse languages
    const languages = languageString.toLowerCase() === 'all'
        ? ['english', 'hindi', 'punjabi']
        : languageString.toLowerCase().split('+').map(l => l.trim());

    // Calculate songs per language (rounded up to ensure we have enough)
    const songsPerLanguage = Math.ceil(limit / languages.length);

    // Get top songs from each language separately
    const songsByLanguage: { song: Song; score: number; lang: string }[] = [];

    for (const lang of languages) {
        // Filter out excluded songs for each language
        const candidates = getSongsByLanguage(lang).filter(song => !excludeSet.has(song.id));
        const scoredSongs = candidates.map(song => ({
            song,
            score: calculateMoodSimilarity(moodResult.vector, song.emotionalProfile),
            lang,
        }));

        // Sort by score
        scoredSongs.sort((a, b) => b.score - a.score);

        // Select top diverse songs from this language
        const usedArtists = new Set<string>();
        let count = 0;

        for (const item of scoredSongs) {
            if (count >= songsPerLanguage) break;
            if (usedArtists.has(item.song.artist)) continue;

            songsByLanguage.push(item);
            usedArtists.add(item.song.artist);
            count++;
        }
    }

    // Interleave songs from different languages for variety
    const interleaved: { song: Song; score: number }[] = [];
    const langQueues: Map<string, { song: Song; score: number }[]> = new Map();

    // Group by language
    for (const item of songsByLanguage) {
        if (!langQueues.has(item.lang)) {
            langQueues.set(item.lang, []);
        }
        langQueues.get(item.lang)!.push({ song: item.song, score: item.score });
    }

    // Interleave: take one from each language in rotation
    let added = 0;
    let langIndex = 0;
    const langArray = Array.from(langQueues.keys());

    while (added < limit && songsByLanguage.length > 0) {
        const currentLang = langArray[langIndex % langArray.length];
        const queue = langQueues.get(currentLang);

        if (queue && queue.length > 0) {
            interleaved.push(queue.shift()!);
            added++;
        }

        langIndex++;

        // Break if all queues are empty
        if (Array.from(langQueues.values()).every(q => q.length === 0)) break;
    }

    // Trim to exact limit
    const finalSongs = interleaved.slice(0, limit);

    // Generate headline
    const headline = generateMockHeadline(moodResult.primaryMood);

    // Generate matches with explanations
    const matches: SongMatch[] = finalSongs.map(item => ({
        song: item.song,
        score: item.score,
        explanation: generateMockExplanation(item.song, moodResult.primaryMood),
    }));

    return {
        headline,
        songs: matches,
    };
}

/**
 * Select diverse songs from top matches.
 */
function selectDiverseSongs(
    scoredSongs: { song: Song; score: number }[],
    limit: number
): { song: Song; score: number }[] {
    const selected: { song: Song; score: number }[] = [];
    const usedArtists = new Set<string>();

    for (const item of scoredSongs) {
        if (selected.length >= limit) break;

        // Skip if we already have a song by this artist
        if (usedArtists.has(item.song.artist)) {
            continue;
        }

        selected.push(item);
        usedArtists.add(item.song.artist);
    }

    // Fill remaining slots if needed
    if (selected.length < limit) {
        for (const item of scoredSongs) {
            if (selected.length >= limit) break;
            if (!selected.includes(item)) {
                selected.push(item);
            }
        }
    }

    return selected;
}

/**
 * Interpolate between two mood vectors.
 * t = 0.0 (start) -> 1.0 (end)
 */
function interpolateVector(start: any, end: any, t: number): any {
    const result: any = {};
    const keys = ['valence', 'energy', 'tension', 'melancholy', 'nostalgia', 'hope', 'intensity', 'social'];

    keys.forEach(key => {
        const s = start[key] || 0;
        const e = end[key] || 0;
        result[key] = s + (e - s) * t;
    });
    return result;
}

/**
 * Match songs with a GRADUAL transition from start mood to target mood.
 * Used for "Lift Me Up" to create a journey.
 */
export async function matchSongsGradient(
    startResult: MoodResult,
    targetVector: any, // MoodVector
    language: string,
    limit: number = 5,
    excludeIds: string[] = []
): Promise<SongMatchResponse> {
    const excludeSet = new Set(excludeIds);
    const selectedMatches: SongMatch[] = [];

    // Parse languages for balanced checking
    const languages = language.toLowerCase() === 'all'
        ? ['english', 'hindi', 'punjabi']
        : language.toLowerCase().split('+').map(l => l.trim());

    // Helper to get candidates
    const getCandidates = () => {
        let all: Song[] = [];
        for (const lang of languages) {
            all = all.concat(getSongsByLanguage(lang));
        }
        if (all.length === 0) all = getSongsByLanguage('any');
        return all;
    };

    let pool = getCandidates();

    // Limit check
    const finalLimit = limit;

    for (let i = 0; i < finalLimit; i++) {
        // Calculate progress (0.0 to 1.0)
        // If limit is 1, t=1. If limit > 1, spread it.
        const t = finalLimit > 1 ? i / (finalLimit - 1) : 1;

        const currentVector = interpolateVector(startResult.vector, targetVector, t);

        // Find best match for this vector in the pool
        let bestSong: Song | null = null;
        let bestScore = -Infinity;

        for (const song of pool) {
            if (excludeSet.has(song.id)) continue;

            // Language balancing: If mixed languages, rotate through them
            if (languages.length > 1) {
                const targetLang = languages[i % languages.length];
                if (song.language.toLowerCase() !== targetLang) continue;
            }

            const score = calculateMoodSimilarity(currentVector, song.emotionalProfile);
            if (score > bestScore) {
                bestScore = score;
                bestSong = song;
            }
        }

        if (bestSong) {
            excludeSet.add((bestSong as Song).id);
            selectedMatches.push({
                song: bestSong as Song,
                score: bestScore,
                explanation: generateMockExplanation(bestSong as Song, startResult.primaryMood)
            });
        }
    }

    // Generate headline based on the start mood (context of where they are)
    const headline = generateMockHeadline(startResult.primaryMood);

    return {
        headline,
        songs: selectedMatches
    };
}
