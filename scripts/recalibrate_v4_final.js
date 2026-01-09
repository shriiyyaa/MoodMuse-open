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

// --- 2. New Metadata Maps ---
const METADATA = {
    SAD: {
        themes: ['sad', 'emotional', 'struggle', 'heartbreak'],
        sonicMood: ['melancholic', 'slow', 'emotional'],
        bestFor: ['crying', 'solitude', 'reflection']
    },
    HEARTBREAK: {
        themes: ['heartbreak', 'breakup', 'sad', 'betrayal'],
        sonicMood: ['melancholic', 'intense', 'sad'],
        bestFor: ['healing', 'crying', 'solitude']
    },
    ROMANTIC: {
        themes: ['romantic', 'love', 'couple', 'passion'],
        sonicMood: ['melodic', 'soothing', 'romantic'],
        bestFor: ['date', 'relaxation', 'long drive']
    },
    PARTY: {
        themes: ['party', 'dance', 'celebration', 'fun'],
        sonicMood: ['upbeat', 'high energy', 'banger'],
        bestFor: ['dance', 'gym', 'party']
    },
    HAPPY: {
        themes: ['happy', 'good vibes', 'joy', 'life'],
        sonicMood: ['cheerful', 'upbeat', 'sunny'],
        bestFor: ['morning', 'mood lift', 'drive']
    },
    CHILL: {
        themes: ['chill', 'relax', 'lofi', 'peace'],
        sonicMood: ['calm', 'soothing', 'gentle'],
        bestFor: ['sleep', 'study', 'relaxation']
    },
    MOTIVATIONAL: {
        themes: ['motivational', 'gym', 'focus', 'power'],
        sonicMood: ['energetic', 'powerful', 'intense'],
        bestFor: ['workout', 'running', 'focus']
    },
    NOSTALGIC: {
        themes: ['nostalgia', 'memories', 'retro', 'missing'],
        sonicMood: ['old school', 'melodic', 'classic'],
        bestFor: ['reminiscing', 'relaxation']
    }
};

// --- 3. Keyword Dictionaries ---
const STRONG_KEYWORDS = {
    HEARTBREAK: ['bewafa', 'dhoka', 'cheat', 'betray', 'juda', 'breakup', 'bichad', 'judai', 'vichoda', 'tuta', 'toota', 'dil tod'],
    SAD: ['ro', 'rona', 'roye', 'aansu', 'maut', 'mar', 'mit', 'khatam', 'fana', 'tabah', 'barbad', 'dard', 'dukh', 'zakhm', 'tadap', 'tanhai', 'tanha', 'alone', 'lonely', 'cry', 'dying', 'death', 'grief', 'agony', 'pain', 'samjhaiye', 'rus', 'russ'],
    PARTY: ['club', 'party', 'vodka', 'whiskey', 'tequila', 'beer', 'daaru', 'daru', 'peg', 'theke', 'bar', 'pub', 'disco', 'sharaab', 'sharaabi', 'pila', 'pilla', 'bhangra', 'nach', 'thumka', 'lakk', 'gym', 'workout'],
    ROMANTIC: ['ishq', 'mohabbat', 'pyar', 'pyaar', 'kiss', 'wedding', 'marry', 'bride', 'groom', 'aashiqui', 'aashiq', 'love']
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
        'rus', 'russ', 'roi', 'rondi', 'haye', 'haaye', 'dil', 'tod', 'tuta', 'toota'
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

// --- 4. Helper Functions ---
function normalizeToken(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
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

function getMoodData(song) {
    const textToCheck = `${song.title} ${song.artist}`;

    // 1. Strong Keyword Check
    let match = findMatch(textToCheck, STRONG_KEYWORDS.HEARTBREAK);
    if (match) return { mood: 'HEARTBREAK', vector: VECTORS.HEARTBREAK, meta: METADATA.HEARTBREAK, match };

    match = findMatch(textToCheck, STRONG_KEYWORDS.SAD);
    if (match) return { mood: 'SAD', vector: VECTORS.SAD, meta: METADATA.SAD, match };

    match = findMatch(textToCheck, STRONG_KEYWORDS.PARTY);
    if (match) return { mood: 'PARTY', vector: VECTORS.PARTY, meta: METADATA.PARTY, match };

    match = findMatch(textToCheck, STRONG_KEYWORDS.ROMANTIC);
    if (match) return { mood: 'ROMANTIC', vector: VECTORS.ROMANTIC, meta: METADATA.ROMANTIC, match };

    // 2. Normal Dictionary Fallback
    match = findMatch(textToCheck, DICTIONARIES.HEARTBREAK) || findMatch(textToCheck, DICTIONARIES.SAD);
    if (match) {
        if (['bewafa', 'dhoka', 'cheat', 'betray', 'juda', 'breakup'].includes(match))
            return { mood: 'HEARTBREAK', vector: VECTORS.HEARTBREAK, meta: METADATA.HEARTBREAK, match };
        return { mood: 'SAD', vector: VECTORS.SAD, meta: METADATA.SAD, match };
    }

    match = findMatch(textToCheck, DICTIONARIES.PARTY);
    if (match) return { mood: 'PARTY', vector: VECTORS.PARTY, meta: METADATA.PARTY, match };

    match = findMatch(textToCheck, DICTIONARIES.ROMANTIC);
    if (match) return { mood: 'ROMANTIC', vector: VECTORS.ROMANTIC, meta: METADATA.ROMANTIC, match };

    match = findMatch(textToCheck, DICTIONARIES.HAPPY);
    if (match) return { mood: 'HAPPY', vector: VECTORS.HAPPY, meta: METADATA.HAPPY, match };

    return null;
}

function processFile(filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    console.log(`\n\n=== Processing ${filePath} ===`);

    try {
        if (!fs.existsSync(fullPath)) {
            console.error(`ERROR: File not found at ${fullPath}`);
            return;
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        let matchCount = 0;
        let updateCount = 0;
        let changeDetected = false;

        const newLines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed.startsWith('{') || !trimmed.includes('id:')) {
                return line;
            }

            matchCount++;

            const extract = (key) => {
                const regex = new RegExp(`${key}:\\s*(['"])(.*?)\\1`);
                const match = line.match(regex);
                return match ? match[2] : '';
            };

            const id = extract('id');
            const title = extract('title');
            const artist = extract('artist');
            const youtubeId = extract('youtubeId');
            const language = extract('language');

            if (!id || !title || !artist || !youtubeId) return line;

            const songStub = { title, artist };
            const moodData = getMoodData(songStub);

            // SPECIAL DEBUG FOR KI SAMJHAIYE
            if (id === 'pf-0100') {
                console.log(`[DEBUG pf-0100] Found line. Title: "${title}". Match result: ${JSON.stringify(moodData)}`);
            }

            if (moodData) {
                const meta = moodData.meta;
                const vector = moodData.vector;
                const safeTitle = title.replace(/"/g, '\\"');
                const safeArtist = artist.replace(/"/g, '\\"');

                // Construct the NEW line
                const newLine = `    { id: '${id}', title: "${safeTitle}", artist: "${safeArtist}", youtubeId: '${youtubeId}', language: '${language}', emotionalProfile: ${JSON.stringify(vector)}, themes: ${JSON.stringify(meta.themes)}, sonicMood: ${JSON.stringify(meta.sonicMood)}, bestFor: ${JSON.stringify(meta.bestFor)} },`;

                // FORCE UPDATE - Always return new line
                updateCount++;
                return newLine;
            }
            return line;
        });

        // Always write to _updated file
        const newPath = fullPath.replace('.ts', '_updated.ts');
        console.log(`[DEBUG] Attempting to write to: ${newPath}`);
        fs.writeFileSync(newPath, newLines.join('\n'), 'utf8');
        if (fs.existsSync(newPath)) {
            console.log(`[SUCCESS] File verified at: ${newPath}`);
        } else {
            console.log(`[ERROR] File write appeared to succeed but file is missing: ${newPath}`);
        }
        console.log(`=== Result: Wrote ${lines.length} lines to ${newPath} (Updated ${updateCount} songs) ===`);

    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

// --- 5. Execution ---
const FILES = [
    'src/lib/songs/hindi-fresh.ts',
    'src/lib/songs/punjabi-fresh.ts',
    'src/lib/songs/english-fresh.ts'
];

FILES.forEach(processFile);
console.log('Script execution finished.');
