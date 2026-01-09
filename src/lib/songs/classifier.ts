/**
 * MoodMuse - Song Mood Classifier
 * 
 * Classifies songs into mood categories based on title/artist keywords.
 * This provides much better mood matching than numeric vectors alone.
 */

// Mood categories for songs
export type SongMoodCategory =
    | 'sad'
    | 'heartbreak'
    | 'melancholy'
    | 'romantic'
    | 'happy'
    | 'party'
    | 'chill'
    | 'nostalgia'
    | 'motivational'
    | 'neutral';

// Keywords that indicate sad/melancholy songs
const SAD_KEYWORDS = [
    'sad', 'dard', 'dukh', 'rona', 'cry', 'tears', 'pain', 'hurt',
    'aansu', 'judai', 'alvida', 'bewafa', 'tanha', 'alone', 'lonely',
    'tanhai', 'broken', 'kho gaya', 'khoya', 'lost', 'miss', 'yaad',
    'bhula', 'bhool', 'forget', 'gone', 'left', 'chod', 'chhod',
    'dil toot', 'tuta', 'toota', 'shattered', 'empty', 'hollow',
    'tears', 'weep', 'sob', 'grief', 'mourn', 'dark', 'night',
    'raat', 'akela', 'khamoshi', 'silence', 'wait', 'intezaar',
    'maut', 'death', 'die', 'mar gaya', 'jeena nahi', 'guzaarish',
    'suffer', 'drowning', 'sinking', 'fading', 'darkness'
];

// Keywords that indicate heartbreak specifically
const HEARTBREAK_KEYWORDS = [
    'heartbreak', 'breakup', 'toot', 'toota', 'broken heart',
    'dil toot', 'bewafa', 'dhoka', 'cheat', 'betray', 'leave',
    'chhod', 'chod diya', 'goodbye', 'alvida', 'judai', 'separation',
    'ex', 'over', 'end', 'finish', 'khatam', 'pyaar khatam',
    'tadap', 'sazaa', 'punish', 'regret', 'pachtava', 'sorry',
    'moved on', 'replaced', 'cheated', 'lied'
];

// Keywords for romantic/love songs
const ROMANTIC_KEYWORDS = [
    'love', 'pyaar', 'ishq', 'mohabbat', 'dil', 'heart', 'romantic',
    'beloved', 'jaan', 'baby', 'darling', 'sweetheart', 'honey',
    'sanam', 'mehboob', 'dilbar', 'jaanu', 'soulmate', 'forever',
    'together', 'hug', 'kiss', 'embrace', 'touch', 'feel',
    'chemistry', 'connection', 'passion', 'desire', 'yearn',
    'chahun', 'chaha', 'chahat', 'tera', 'mera', 'tujhe', 'tumhe',
    'humsafar', 'saathiya', 'raabta', 'waala love', 'wala love',
    'ishq wala', 'romantic', 'couple', 'marry', 'wedding'
];

// Keywords for happy/upbeat songs
const HAPPY_KEYWORDS = [
    'happy', 'khushi', 'celebration', 'joy', 'smile', 'muskaan',
    'laugh', 'dance', 'naach', 'party', 'enjoy', 'masti', 'fun',
    'awesome', 'amazing', 'wonderful', 'beautiful', 'sundar',
    'good', 'great', 'best', 'perfect', 'lucky', 'blessed',
    'sunshine', 'dhoop', 'bright', 'light', 'radiant',
    'zinda', 'zindagi', 'jeena', 'mast', 'jhakaas', 'bindaas',
    'awesome', 'top', 'cloud 9', 'winning', 'jeet'
];

// Keywords for party/dance songs
const PARTY_KEYWORDS = [
    'party', 'dance', 'naach', 'dj', 'club', 'disco', 'beat',
    'groove', 'move', 'shake', 'pump', 'bass', 'drop', 'lit',
    'turn up', 'get up', 'hands up', 'jump', 'energy', 'fire',
    'badshah', 'yo yo', 'honey singh', 'raftaar', 'remix',
    'wedding', 'sangeet', 'shaadi', 'baraat', 'celebrate',
    'daroo', 'daru', 'sharaab', 'sharabi', 'vodka', 'tequila', 'bottle', 'peg',
    'nashe', 'nasha', 'high', 'kudi', 'munda', 'swag', 'savage',
    'proper', 'patola', 'bomb', 'bhangra', 'dhol', 'thumka',
    'latka', 'jhatka', 'nachne', 'nacho', 'desi', 'gabru',
    'hookah', 'night', 'jashn', 'vibes', 'weekend', 'saturday'
];

// Keywords for chill/relaxing songs
const CHILL_KEYWORDS = [
    'chill', 'relax', 'calm', 'peace', 'sukoon', 'soft', 'slow',
    'acoustic', 'unplugged', 'lofi', 'lo-fi', 'sleep', 'soothing',
    'gentle', 'quiet', 'mellow', 'easy', 'light', 'breeze',
    'rain', 'baarish', 'evening', 'shaam', 'sunset', 'sunrise'
];

// Keywords for nostalgic songs
const NOSTALGIA_KEYWORDS = [
    'purana', 'old', 'classic', 'retro', 'vintage', 'yaadein',
    'memories', 'remember', 'past', 'childhood', 'bachpan',
    'those days', 'woh din', 'once upon', 'long ago', 'back then',
    '90s', '80s', '70s', 'golden', 'timeless', 'evergreen'
];

// Keywords for motivational/pump-up songs
const MOTIVATIONAL_KEYWORDS = [
    'motivation', 'inspire', 'power', 'strength', 'strong',
    'fight', 'winner', 'champion', 'victory', 'success',
    'rise', 'up', 'overcome', 'conquer', 'believe', 'dream',
    'goal', 'achieve', 'hustle', 'grind', 'work', 'struggle',
    'never give up', 'keep going', 'ziddi', 'apna time'
];

/**
 * Classify a song into mood categories based on its title
 */
export function classifySongMood(title: string, artist: string = ''): SongMoodCategory[] {
    const searchText = `${title} ${artist}`.toLowerCase();
    const categories: SongMoodCategory[] = [];

    // Check each category
    if (matchesKeywords(searchText, HEARTBREAK_KEYWORDS)) {
        categories.push('heartbreak');
    }
    if (matchesKeywords(searchText, SAD_KEYWORDS)) {
        categories.push('sad');
    }
    if (matchesKeywords(searchText, ROMANTIC_KEYWORDS)) {
        categories.push('romantic');
    }
    if (matchesKeywords(searchText, HAPPY_KEYWORDS)) {
        categories.push('happy');
    }
    if (matchesKeywords(searchText, PARTY_KEYWORDS)) {
        categories.push('party');
    }
    if (matchesKeywords(searchText, CHILL_KEYWORDS)) {
        categories.push('chill');
    }
    if (matchesKeywords(searchText, NOSTALGIA_KEYWORDS)) {
        categories.push('nostalgia');
    }
    if (matchesKeywords(searchText, MOTIVATIONAL_KEYWORDS)) {
        categories.push('motivational');
    }

    // If no category matched, mark as neutral
    if (categories.length === 0) {
        categories.push('neutral');
    }

    return categories;
}

function matchesKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
}

/**
 * Map user mood to preferred song categories
 */
export function getMoodPreferences(primaryMood: string, intent: string): SongMoodCategory[] {
    const moodLower = primaryMood.toLowerCase();

    // For "stay" intent (sit with it) - match the actual mood
    if (intent === 'stay') {
        if (moodLower.includes('sad') || moodLower.includes('melancholy') || moodLower.includes('grief') || moodLower.includes('lonely')) {
            return ['sad', 'heartbreak', 'melancholy'];
        }
        if (moodLower.includes('heartbroken') || moodLower.includes('broken') || moodLower.includes('shattered') || moodLower.includes('heartbreak')) {
            return ['heartbreak', 'sad'];
        }
        if (moodLower.includes('nostalgic') || moodLower.includes('wistful')) {
            return ['nostalgia', 'sad', 'chill'];
        }
        if (moodLower.includes('anxious') || moodLower.includes('stressed')) {
            return ['chill', 'sad'];
        }
        if (moodLower.includes('happy') || moodLower.includes('joy')) {
            return ['happy', 'party', 'romantic'];
        }
        if (moodLower.includes('love') || moodLower.includes('romantic')) {
            return ['romantic', 'chill'];
        }
        if (moodLower.includes('excited') || moodLower.includes('energetic')) {
            return ['party', 'happy', 'motivational'];
        }
        if (moodLower.includes('peaceful') || moodLower.includes('calm')) {
            return ['chill', 'romantic'];
        }
        if (moodLower.includes('tired') || moodLower.includes('exhausted') || moodLower.includes('drained') || moodLower.includes('sleepy')) {
            return ['chill', 'sad'];
        }
    }

    // For "lift" intent - songs with hope but acknowledging the mood
    if (intent === 'lift') {
        if (moodLower.includes('sad') || moodLower.includes('heartbroken')) {
            return ['romantic', 'chill', 'nostalgia']; // Softer, hopeful
        }
        return ['motivational', 'happy', 'romantic'];
    }

    // For "distract" intent - upbeat, energy
    if (intent === 'distract') {
        return ['party', 'happy', 'motivational'];
    }

    // For "surprise" intent - variety
    if (intent === 'surprise') {
        return ['chill', 'nostalgia', 'romantic', 'neutral'];
    }

    // Default based on mood alone
    if (moodLower.includes('sad') || moodLower.includes('melancholy')) {
        return ['sad', 'heartbreak', 'chill'];
    }
    if (moodLower.includes('happy') || moodLower.includes('excited')) {
        return ['happy', 'party', 'romantic'];
    }

    return ['neutral', 'romantic', 'chill'];
}
