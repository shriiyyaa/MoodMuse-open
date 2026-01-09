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

// --- 2. Keyword Dictionaries ---
const DICTIONARIES = {
    SAD: [
        'sad', 'heartbreak', 'lonely', 'alone', 'cry', 'crying', 'tears', 'rain', 'pain', 'hurt', 'sorry',
        'miss you', 'gone', 'death', 'die', 'dying', 'kill', 'suicide', 'depression', 'depressed', 'anxiety',
        'broken', 'hate', 'lie', 'liar', 'cheat', 'betray', 'betrayal', 'regret', 'mistake', 'fail', 'failure',
        'goodbye', 'leave', 'leaving', 'lost', 'loser', 'suffer', 'suffering', 'agony', 'grief', 'down', 'blue',
        'judaa', 'juda', 'judai', 'judaai', 'vichora', 'vichoda', 'dard', 'duk', 'dukh', 'zakhm', 'tadap',
        'tanhai', 'tanha', 'akela', 'akele', 'ro', 'rona', 'roye', 'aansu', 'gam', 'gham', 'khoya', 'khoye',
        'dur', 'door', 'alvida', 'bichhad', 'bichad', 'yaad', 'yaadein', 'bewafa', 'bewafai', 'dhoka',
        'saaza', 'saza', 'maut', 'mar', 'mit', 'khatam', 'fana', 'tabah', 'barbad', 'naseeb', 'kismat',
        'samjhaiye', 'kaise', 'kyu', 'kyun', 'bin', 'bina', 'soona', 'suna', 'virah', 'intzaar', 'intezaar',
        'rus', 'russ', 'roi', 'rondi', 'haye', 'haaye', 'dil tod', 'tuta', 'toota'
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
        'chah', 'chahat', 'ikraar', 'izhaar', 'mere', 'meri', 'tera', 'teri', 'tu hi', 'tum hi', 'aashiqui',
        'aashiq', 'deewana', 'deewani', 'premi', 'mastani', 'sindhoor', 'mang', 'bindiya', 'kangan', 'chudi'
    ],
    PARTY: [
        'party', 'dance', 'dancing', 'club', 'bounce', 'jump', 'shake', 'move', 'body', 'sexy', 'hot',
        'girls', 'boys', 'night', 'drink', 'drinking', 'drunk', 'wasted', 'high', 'stoned', 'shots', 'bottle',
        'alcohol', 'vodka', 'whiskey', 'tequila', 'beer', 'lit', 'fire', 'burn', 'turn up', 'loud', 'bass',
        'beat', 'dj', 'remix', 'mix', 'feat', 'ft', 'vs', 'mashup', 'weekend', 'saturday', 'friday', 'clubbing',
        'energy', 'power', 'wild', 'crazy', 'insane', 'hype', 'bang', 'banger', 'anthem', 'celebrate',
        'bhangra', 'gidha', 'nach', 'nachne', 'nache', 'thumka', 'lhkk', 'lakk', 'kudi', 'kudiye', 'munda',
        'munde', 'jatt', 'jaat', 'gu jjar', 'swag', 'tashan', 'gedi', 'gear', 'car', 'jeep', 'truck', 'speaker',
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

// --- 3. Helper Functions ---

function normalize(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

function hasMatch(text, keywords) {
    const normalizedText = normalize(text);
    return keywords.some(keyword => normalizedText.includes(normalize(keyword)));
}

function getVectorFromTags(song) {
    const rawThemes = (song.themes || []).map(normalize);
    const rawBestFor = (song.bestFor || []).map(normalize);

    // Combine all tag sources
    const allTags = [...rawThemes, ...rawBestFor];

    // Priority 1: Explicit Tags
    if (allTags.some(t => t.includes('sad') || t.includes('heartbreak') || t.includes('crying') || t.includes('breakup'))) return VECTORS.SAD;
    if (allTags.some(t => t.includes('party') || t.includes('dance') || t.includes('club') || t.includes('workout'))) return VECTORS.PARTY;
    if (allTags.some(t => t.includes('romantic') || t.includes('romance') || t.includes('love') || t.includes('date'))) return VECTORS.ROMANTIC;
    if (allTags.some(t => t.includes('happy') || t.includes('joy') || t.includes('fun'))) return VECTORS.HAPPY;
    if (allTags.some(t => t.includes('chill') || t.includes('relax') || t.includes('sleep') || t.includes('lofi'))) return VECTORS.CHILL;

    return null;
}

function getVectorFromKeywords(song) {
    const textToCheck = `${song.title} ${song.artist}`;

    if (hasMatch(textToCheck, DICTIONARIES.HEARTBREAK) || hasMatch(textToCheck, DICTIONARIES.SAD)) {
        if (hasMatch(textToCheck, ['bewafa', 'dhoka', 'cheat', 'betray', 'juda', 'breakup'])) return VECTORS.HEARTBREAK;
        return VECTORS.SAD;
    }
    if (hasMatch(textToCheck, DICTIONARIES.PARTY)) return VECTORS.PARTY;
    if (hasMatch(textToCheck, DICTIONARIES.ROMANTIC)) return VECTORS.ROMANTIC;
    if (hasMatch(textToCheck, DICTIONARIES.HAPPY)) return VECTORS.HAPPY;

    return null;
}

function processFile(filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    console.log(`Processing ${filePath}...`);

    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        let matchCount = 0;
        let updateCount = 0;

        const newLines = lines.map(line => {
            // Trim whitespace for checking, but keep original indent
            const trimmed = line.trim();
            if (!trimmed.startsWith('{') || !trimmed.includes('id:')) {
                return line;
            }

            matchCount++;

            // Extract Fields using simple regexes that handle both quote types
            const extract = (key) => {
                const regex = new RegExp(`${key}:\\s*(['"])(.*?)\\1`);
                const match = line.match(regex);
                return match ? match[2] : '';
            };

            const extractArray = (key) => {
                const regex = new RegExp(`${key}:\\s*\\[(.*?)\\]`);
                const match = line.match(regex);
                if (!match) return [];
                // Split by comma, remove quotes
                return match[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
            };

            const title = extract('title');
            const artist = extract('artist');
            const themes = extractArray('themes');
            const bestFor = extractArray('bestFor');

            const songStub = { title, artist, themes, bestFor };

            const vector = getVectorFromTags(songStub) || getVectorFromKeywords(songStub);

            if (vector) {
                updateCount++;
                // Replace emotionalProfile: { ... } with new vector
                // This regex looks for emotionalProfile: followed by an object
                // We assume the object doesn't have nested braces deeper than the profile itself, which works for these files
                return line.replace(/emotionalProfile:\s*\{[^}]+\}/, `emotionalProfile: ${JSON.stringify(vector)}`);
            }

            return line;
        });

        fs.writeFileSync(fullPath, newLines.join('\n'), 'utf8');
        console.log(`  - Scanned ${matchCount} songs.`);
        console.log(`  - Updated ${updateCount} songs.`);

    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

// --- 4. Execution ---
const FILES = [
    'src/lib/songs/hindi-fresh.ts',
    'src/lib/songs/punjabi-fresh.ts',
    'src/lib/songs/english-fresh.ts'
];

FILES.forEach(processFile);
console.log('V2 Recalibration complete.');
