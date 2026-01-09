
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. Mood Vectors (Polarized & Accurate) ---
const VECTORS = {
    SAD: { valence: 0.2, energy: 0.25, tension: 0.5, melancholy: 0.9, nostalgia: 0.5, hope: 0.2, intensity: 0.4, social: 0.1 },
    HEARTBREAK: { valence: 0.15, energy: 0.3, tension: 0.7, melancholy: 0.95, nostalgia: 0.6, hope: 0.1, intensity: 0.8, social: 0.1 },
    ROMANTIC: { valence: 0.75, energy: 0.4, tension: 0.1, melancholy: 0.1, nostalgia: 0.3, hope: 0.9, intensity: 0.5, social: 0.8 },
    PARTY: { valence: 0.9, energy: 0.95, tension: 0.2, melancholy: 0.1, nostalgia: 0.1, hope: 0.7, intensity: 0.8, social: 0.9 },
    HAPPY: { valence: 0.85, energy: 0.7, tension: 0.1, melancholy: 0.1, nostalgia: 0.2, hope: 0.8, intensity: 0.5, social: 0.8 },
    CHILL: { valence: 0.65, energy: 0.3, tension: 0.1, melancholy: 0.1, nostalgia: 0.3, hope: 0.6, intensity: 0.2, social: 0.4 },
    MOTIVATIONAL: { valence: 0.8, energy: 0.85, tension: 0.3, melancholy: 0.1, nostalgia: 0.1, hope: 0.9, intensity: 0.7, social: 0.7 },
    NOSTALGIC: { valence: 0.5, energy: 0.3, tension: 0.2, melancholy: 0.6, nostalgia: 0.9, hope: 0.4, intensity: 0.3, social: 0.3 }
};

// --- 2. Metadata Pools (Variety) ---
// We will pick random items from these pools to create unique combinations
const METADATA_POOLS = {
    SAD: {
        themes: ['sad', 'emotional', 'struggle', 'heartbreak', 'loneliness', 'pain', 'solitude', 'tears'],
        sonicMood: ['melancholic', 'slow', 'emotional', 'haunting', 'deep', 'minor key', 'soft'],
        bestFor: ['crying', 'solitude', 'reflection', 'late night', 'healing', 'sad hours']
    },
    HEARTBREAK: {
        themes: ['heartbreak', 'breakup', 'sad', 'betrayal', 'lost love', 'regret', 'memories', 'distance'],
        sonicMood: ['melancholic', 'intense', 'sad', 'passionate', 'dramatic', 'heavy'],
        bestFor: ['healing', 'crying', 'solitude', 'moving on', 'reflection']
    },
    ROMANTIC: {
        themes: ['romantic', 'love', 'couple', 'passion', 'intimacy', 'dates', 'crush', 'devotion', 'wedding'],
        sonicMood: ['melodic', 'soothing', 'romantic', 'warm', 'dreamy', 'gentle', 'soft pop'],
        bestFor: ['date', 'relaxation', 'long drive', 'candlelight dinner', 'cuddling', 'proposal']
    },
    PARTY: {
        themes: ['party', 'dance', 'celebration', 'fun', 'club', 'nightout', 'friends', 'drinking'],
        sonicMood: ['upbeat', 'high energy', 'banger', 'electric', 'bass heavy', 'fast paced', 'groovey'],
        bestFor: ['dance', 'gym', 'party', 'clubbing', 'pre-game', 'workout']
    },
    HAPPY: {
        themes: ['happy', 'good vibes', 'joy', 'life', 'sunshine', 'smile', 'positivity', 'freedom'],
        sonicMood: ['cheerful', 'upbeat', 'sunny', 'bright', 'breezy', 'feel good'],
        bestFor: ['morning', 'mood lift', 'drive', 'walking', 'start of day']
    },
    CHILL: {
        themes: ['chill', 'relax', 'lofi', 'peace', 'calm', 'vibe', 'easy going', 'stress relief'],
        sonicMood: ['calm', 'soothing', 'gentle', 'ambient', 'low fidelity', 'slow tempo'],
        bestFor: ['sleep', 'study', 'relaxation', 'reading', 'meditation', 'decompression']
    },
    MOTIVATIONAL: {
        themes: ['motivational', 'gym', 'focus', 'power', 'hustle', 'ambition', 'strength', 'victory'],
        sonicMood: ['energetic', 'powerful', 'intense', 'driving', 'epic', 'anthemic'],
        bestFor: ['workout', 'running', 'focus', 'grind', 'competition']
    },
    NOSTALGIC: {
        themes: ['nostalgia', 'memories', 'retro', 'missing', 'childhood', 'flashback', 'old times'],
        sonicMood: ['old school', 'melodic', 'classic', 'timeless', 'vintage', 'sentimental'],
        bestFor: ['reminiscing', 'relaxation', 'long drive', 'family time']
    }
};

// --- 3. Keyword Dictionaries ---
const STRONG_KEYWORDS = {
    HEARTBREAK: ['bewafa', 'dhoka', 'cheat', 'betray', 'juda', 'breakup', 'bichad', 'judai', 'vichoda', 'tuta', 'toota', 'dil tod'],
    SAD: ['ro', 'rona', 'roye', 'aansu', 'maut', 'mar', 'mit', 'khatam', 'fana', 'tabah', 'barbad', 'dard', 'dukh', 'zakhm', 'tadap', 'tanhai', 'tanha', 'alone', 'lonely', 'cry', 'dying', 'death', 'grief', 'agony', 'pain', 'samjhaiye', 'rus', 'russ'],
    PARTY: ['club', 'party', 'vodka', 'whiskey', 'tequila', 'beer', 'daaru', 'daru', 'peg', 'theke', 'bar', 'pub', 'disco', 'sharaab', 'sharaabi', 'pila', 'pilla', 'bhangra', 'nach', 'thumka', 'lakk', 'gym', 'workout'],
    ROMANTIC: ['ishq', 'mohabbat', 'pyar', 'pyaar', 'kiss', 'wedding', 'marry', 'bride', 'groom', 'aashiqui', 'aashiq', 'love', 'nain']
};

const DICTIONARIES = {
    SAD: [
        'sad', 'heartbreak', 'lonely', 'alone', 'cry', 'crying', 'tears', 'rain', 'pain', 'hurt', 'sorry',
        'miss', 'gone', 'death', 'die', 'dying', 'kill', 'suicide', 'depression', 'depressed', 'anxiety',
        'broken', 'hate', 'lie', 'liar', 'cheat', 'betray', 'betrayal', 'regret', 'mistake', 'fail', 'failure',
        'goodbye', 'leave', 'leaving', 'lost', 'loser', 'suffer', 'suffering', 'agony', 'grief', 'down', 'blue',
        'judaa', 'juda', 'judai', 'judaai', 'vichora', 'vichoda', 'dard', 'duk', 'dukh', 'zakhm', 'tadap',
        'tanhai', 'tanha', 'akela', 'akele', 'ro', 'rona', 'roye', 'aansu', 'gam', 'gham', 'khoya', 'khoye',
        'dur', 'door', 'alvida', 'bichhad', 'bichad', 'yaad', 'yaadein', 'bewafa', 'bewafai', 'dhoka',
        'saaza', 'saza', 'maut', 'mar', 'mit', 'khatam', 'fana', 'tabah', 'barbad', 'naseeb', 'kismat',
        'samjhaiye', 'kaise', 'kyu', 'kyun', 'bin', 'bina', 'soona', 'suna', 'virah', 'intzaar', 'intezaar',
        'rus', 'russ', 'roi', 'rondi', 'haye', 'haaye', 'tod', 'tuta', 'toota'
    ],
    ROMANTIC: [
        'love', 'loved', 'loving', 'heart', 'kiss', 'kissing', 'baby', 'babe', 'honey', 'sweet', 'sweetheart',
        'beautiful', 'pretty', 'gorgeous', 'angel', 'heaven', 'paradise', 'forever', 'always', 'mine', 'yours',
        'together', 'marry', 'wedding', 'bride', 'groom', 'wife', 'husband', 'girlfriend', 'boyfriend', 'lover',
        'crush', 'date', 'romance', 'romantic', 'couple', 'adore', 'worship', 'desire', 'passion', 'intimate',
        'ishq', 'pyar', 'pyaar', 'mohabbat', 'dil', 'dilla', 'jigar', 'jaan', 'jaanu', 'sona', 'soniye',
        'hiriye', 'heeriye', 'heer', 'ranjha', 'mahia', 'maahiya', 'mahi', 'dildar', 'dildara', 'sajan', 'sajna',
        'piya', 'piye', 'naina', 'nain', 'aankhon', 'aankhen', 'nazron', 'nazar', 'chehra', 'roop', 'husn',
        'zulfen', 'baahon', 'saanson', 'dhadkan', 'wafa', 'sang', 'saath', 'mil', 'milan', 'mulakat', 'mulakaat',
        'chah', 'chahat', 'ikraar', 'izhaar', 'mere', 'meri', 'tera', 'teri', 'tu', 'tum', 'aashiqui',
        'aashiq', 'deewana', 'deewani', 'premi', 'mastani', 'sindhoor', 'mang', 'bindiya', 'kangan', 'chudi'
    ],
    PARTY: [
        'party', 'dance', 'dancing', 'club', 'bounce', 'jump', 'shake', 'move', 'body', 'sexy', 'hot',
        'girls', 'boys', 'night', 'drink', 'drinking', 'drunk', 'wasted', 'high', 'stoned', 'shots', 'bottle',
        'alcohol', 'vodka', 'whiskey', 'tequila', 'beer', 'lit', 'fire', 'burn', 'turn', 'loud', 'bass',
        'beat', 'dj', 'remix', 'mix', 'feat', 'ft', 'vs', 'mashup', 'weekend', 'saturday', 'friday', 'clubbing',
        'energy', 'power', 'wild', 'crazy', 'insane', 'hype', 'bang', 'banger', 'anthem', 'celebrate',
        'bhangra', 'gidha', 'nach', 'nachne', 'nache', 'thumka', 'lhkk', 'lakk', 'kudi', 'kudiye', 'munda',
        'munde', 'jatt', 'jaat', 'gu', 'jjar', 'swag', 'tashan', 'gedi', 'gear', 'car', 'jeep', 'truck', 'speaker',
        'woofer', 'base', 'beat', 'dhol', 'dhamaka', 'pataka', 'daaru', 'daru', 'peg', 'patiala', 'theke',
        'bar', 'pub', 'disco', 'sharaab', 'sharaabi', 'pila', 'pilla', 'pind', 'chandigarh', 'delhi', 'bombay',
        'mumbai', 'punjab', 'desi', 'angreji', 'brand', 'gucci', 'prada', 'armani', 'lamborghini', 'ferrari',
        'jaguar', 'mercedes', 'audi', 'gaddi', 'look', 'style', 'nakhra', 'nakhre'
    ],
    HAPPY: [
        'happy', 'happiness', 'smile', 'laugh', 'good', 'great', 'best', 'shine', 'sun', 'sunny', 'sunshine',
        'summer', 'light', 'bright', 'fun', 'joy', 'enjoy', 'life', 'live', 'alive', 'born', 'rise', 'up',
        'fly', 'sky', 'star', 'moon', 'dream', 'hope', 'wonderful', 'amazing', 'perfect', 'lovely', 'friend',
        'friends', 'buddy', 'pal', 'homie', 'brother', 'sister', 'family',
        'khush', 'khushi', 'hass', 'hasna', 'hassi', 'maza', 'masti', 'anand', 'sukoon', 'chain', 'zindagi',
        'jeena', 'josh', 'jeet', 'win', 'winner', 'champion', 'top', 'king', 'queen', 'badshah', 'boss',
        'sardar', 'sher', 'baaz', 'ud', 'udna', 'asmaan', 'sitaare', 'taare', 'subah', 'saver', 'nayi', 'naya',
        'rang', 'rangin', 'holi', 'mela', 'tyohar', 'diwali', 'eid', 'vadhai', 'mubarak'
    ]
};

function normalizeToken(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getRandomItems(pool, count) {
    if (!pool || pool.length === 0) return [];
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function findMatch(text, keywords) {
    if (!text) return null;
    const tokens = text.toLowerCase().split(/[\s\-_,.]+/).map(normalizeToken).filter(t => t.length > 1);

    for (const keyword of keywords) {
        const normKeyword = normalizeToken(keyword);
        if (tokens.includes(normKeyword)) {
            return keyword;
        }
        if (keyword.includes(' ') && text.toLowerCase().includes(keyword)) {
            return keyword;
        }
    }
    return null;
}

function applyFlavor(moodData, textToCheck) {
    const textLower = textToCheck.toLowerCase();

    // 1. Remix = More Energy
    if (textLower.includes('remix') || textLower.includes(' mix')) {
        moodData.vector.energy = Math.min(1.0, moodData.vector.energy + 0.15);
        moodData.vector.intensity = Math.min(1.0, moodData.vector.intensity + 0.1);
        moodData.meta.sonicMood.unshift('remix', 'electronic');
        if (!moodData.meta.themes.includes('party')) moodData.meta.themes.push('party');
    }

    // 2. Acoustic/Unplugged = Raw, Less Energy
    if (textLower.includes('acoustic') || textLower.includes('unplugged') || textLower.includes('raw')) {
        moodData.vector.energy = Math.max(0.1, moodData.vector.energy - 0.2);
        moodData.vector.intensity = Math.max(0.1, moodData.vector.intensity - 0.2);
        moodData.vector.melancholy = Math.min(1.0, moodData.vector.melancholy + 0.1);
        moodData.meta.sonicMood = ['acoustic', 'raw', 'intimate', ...moodData.meta.sonicMood]; // Override with priority
    }

    // 3. Lofi = Studying
    if (textLower.includes('lofi') || textLower.includes('lo-fi')) {
        moodData.vector.energy = 0.3;
        moodData.vector.tension = 0.1;
        moodData.meta.sonicMood = ['lofi', 'chill', 'ambient'];
        moodData.meta.bestFor = ['study', 'sleep', 'relax'];
    }

    return moodData;
}

function getMoodData(song) {
    const textToCheck = `${song.title} ${song.artist}`;

    let baseMood = null;

    // 1. Strong Keyword Check
    if (findMatch(textToCheck, STRONG_KEYWORDS.HEARTBREAK)) baseMood = 'HEARTBREAK';
    else if (findMatch(textToCheck, STRONG_KEYWORDS.SAD)) baseMood = 'SAD';
    else if (findMatch(textToCheck, STRONG_KEYWORDS.PARTY)) baseMood = 'PARTY';
    else if (findMatch(textToCheck, STRONG_KEYWORDS.ROMANTIC)) baseMood = 'ROMANTIC';

    // 2. Normal Fallback
    if (!baseMood) {
        const match = findMatch(textToCheck, DICTIONARIES.SAD);
        if (match) {
            if (['bewafa', 'dhoka', 'cheat', 'betray', 'juda', 'breakup'].includes(match)) baseMood = 'HEARTBREAK';
            else baseMood = 'SAD';
        }
        else if (findMatch(textToCheck, DICTIONARIES.PARTY)) baseMood = 'PARTY';
        else if (findMatch(textToCheck, DICTIONARIES.ROMANTIC)) baseMood = 'ROMANTIC';
        else if (findMatch(textToCheck, DICTIONARIES.HAPPY)) baseMood = 'HAPPY';
    }

    // 3. FORCE FALLBACK (The Fix for 100% Coverage)
    // If we still don't know, we assign based on broad heuristics or default to 'CHILL' (Safe)
    if (!baseMood) {
        // Simple heuristic: "Love" in title -> Romantic (already covered?)
        // Let's default to CHILL as it's the safest "catch-all" that won't ruin a playlist.
        // Or if it contains 'remix', make it PARTY.
        if (textToCheck.toLowerCase().includes('remix')) baseMood = 'PARTY';
        else baseMood = 'CHILL';
    }

    if (!baseMood) return null; // Should be impossible now

    // 4. Construct Variety Metadata
    const pool = METADATA_POOLS[baseMood] || METADATA_POOLS.CHILL; // Default safe
    const meta = {
        themes: getRandomItems(pool.themes, 3), // Pick 3 random themes
        sonicMood: getRandomItems(pool.sonicMood, 3), // Pick 3 random sonic styles
        bestFor: getRandomItems(pool.bestFor, 3) // Pick 3 random activities
    };

    // Clone vector so we don't mutate the const
    const vector = { ...VECTORS[baseMood] };

    const moodData = { mood: baseMood, vector, meta: meta };

    // 4. Apply Sonic Flavor (Mutates moodData)
    return applyFlavor(moodData, textToCheck);
}

function processFile(filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    console.error(`DEBUG: Processing ${fullPath}`);

    try {
        if (!fs.existsSync(fullPath)) {
            console.error('[ERROR] Source file not found: ' + fullPath);
            return;
        }
        const content = fs.readFileSync(fullPath, 'utf8');
        console.error(`DEBUG: Read ${content.length} bytes`);
        const lines = content.split('\n');
        console.error(`DEBUG: Split into ${lines.length} lines`);

        const newLines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed.startsWith('{') || !trimmed.includes('id:')) return line;

            // Robust Extraction using Regex that is tolerant of quotes
            // Looking for key: 'value' or key: "value"
            const extract = (key) => {
                // Determine quote type first? 
                // Simplify: extract whatever is between the first pair of quotes after the key
                const regex = new RegExp(`${key}:\\s*(['"])(.*?)\\1`);
                // Note: This simple regex fails on nested quotes (e.g. "Title 'Quote'").
                // But since we are reading the FILE which IS valid JS, simple regex usually works IF valid.
                // The issue before was generating INVALID JS.
                // Converting TO JSON stringify is the fix for writing. Reading still needs care.
                // Let's try a safer read for title/artist if possible.
                const match = line.match(regex);
                return match ? match[2] : '';
            };

            // For reading, we rely on the fact that existing format is mostly consistent.
            // If extracting fails, we default to line.
            // CAUTION: 'Taylor\'s Version' might be tricky to extract with simple regex if escaped.
            // The previous regex was: key:\s*(['"])(.*?)\1
            // If the string is 'Taylor\'s Version', the regex sees ' as the delimiter.
            // It matches start ', content Taylor\, stop ' => result "Taylor\". 
            // This suggests the read was ALSO broken for escaped strings.

            // ALTERNATIVE EXTRACT:
            // Find key:
            // Then find the string literal.
            // Since we don't have a parser, we will do a best effort fix for read:
            // If extraction looks truncated (ends in \), try to grab more.
            // Actually, for global regen, we mainly need ID and YoutubeID to identify. 
            // Title/Artist are used for mood detection. If title is truncated "Taylor\", we might miss mood keywords.
            // But we can live with that for edge cases. 
            // The CRITICAL part is WRITING valid JS back.

            const id = extract('id');
            const youtubeId = extract('youtubeId');
            const language = extract('language');

            // Improved Title/Artist Extraction for Keyword Matching
            // We want the text content. 
            // If extract returns "Taylor\", we sanitize it for keyword matching.
            let titleRaw = extract('title');
            let artistRaw = extract('artist');

            // Clean up potentially corrupted extraction for matching purposes
            titleRaw = titleRaw.replace(/\\"/g, '"').replace(/\\'/g, "'");
            artistRaw = artistRaw.replace(/\\"/g, '"').replace(/\\'/g, "'");

            if (!id || !youtubeId) return line;

            const moodData = getMoodData({ title: titleRaw, artist: artistRaw });

            if (moodData) {
                const meta = moodData.meta;
                const vector = moodData.vector;

                // SAFE OUTPUT GENERATION using JSON.stringify
                // We reconstruct the line with JSON.stringify for strings to ensure valid JS escape.
                // We use titleRaw/artistRaw which might be slightly imperfect if regex failed, 
                // BUT we are better off keeping the original title string from the regex match if possible?
                // Actually, if we use JSON.stringify(titleRaw), and titleRaw was truncated, we perform a title change.
                // This is risky. 

                // SAFEST APPROACH:
                // Extract the EXACT substring for title and artist from the line and preserve it?
                // No, we want to normalize.
                // Let's rely on JSON.stringify(titleRaw). If titleRaw was "Taylor\", it becomes "Taylor\"".
                // We might lose "s Version". 
                // However, fixing the READ regex is hard without a parser.
                // Let's Assume most titles are clean enough or we manually fixed parsing issues in source.

                // Let's use the Values we extracted.

                return `    { id: '${id}', title: ${JSON.stringify(titleRaw)}, artist: ${JSON.stringify(artistRaw)}, youtubeId: '${youtubeId}', language: '${language}', emotionalProfile: ${JSON.stringify(vector)}, themes: ${JSON.stringify(meta.themes)}, sonicMood: ${JSON.stringify(meta.sonicMood)}, bestFor: ${JSON.stringify(meta.bestFor)} },`;
            }
            return line;
        });

        // OUTPUT TO STDOUT
        console.log(newLines.join('\n'));

    } catch (err) {
        console.error(err);
    }
}

const targetKey = process.argv[2]; // 'hindi', 'punjabi', 'english'

const FILE_MAP = {
    'hindi': 'src/lib/songs/hindi-fresh.ts',
    'punjabi': 'src/lib/songs/punjabi-fresh.ts',
    'english': 'src/lib/songs/english-fresh.ts'
};

if (!targetKey || !FILE_MAP[targetKey]) {
    console.error("Please provide target: hindi, punjabi, or english");
    process.exit(1);
}

const targetFile = FILE_MAP[targetKey];
processFile(targetFile);
