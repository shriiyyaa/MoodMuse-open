// YouTube ID Validator Script
// Checks all YouTube IDs in song databases using oEmbed endpoint

import fs from 'fs';
import path from 'path';

const SONGS_DIR = './src/lib/songs';

// Extract YouTube IDs from TypeScript files
function extractYouTubeIds(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /youtubeId:\s*['"]([^'"]+)['"]/g;
    const idRegex = /id:\s*['"]([^'"]+)['"]/g;

    const songs = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const ytMatch = line.match(/youtubeId:\s*['"]([^'"]+)['"]/);
        const idMatch = line.match(/id:\s*['"]([^'"]+)['"]/);
        const titleMatch = line.match(/title:\s*["']([^"']+)["']/);

        if (ytMatch && idMatch) {
            songs.push({
                id: idMatch[1],
                youtubeId: ytMatch[1],
                title: titleMatch ? titleMatch[1] : 'Unknown',
                file: path.basename(filePath),
                line: i + 1
            });
        }
    }

    return songs;
}

// Check if YouTube video is available
async function checkYouTubeId(youtubeId) {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`;
    try {
        const response = await fetch(url);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Main function
async function main() {
    console.log('YouTube ID Validator\n');
    console.log('Scanning song databases...\n');

    const files = ['hindi-fresh.ts', 'punjabi-fresh.ts', 'english-fresh.ts'];
    const allSongs = [];

    for (const file of files) {
        const filePath = path.join(SONGS_DIR, file);
        if (fs.existsSync(filePath)) {
            const songs = extractYouTubeIds(filePath);
            allSongs.push(...songs);
            console.log(`Found ${songs.length} songs in ${file}`);
        }
    }

    console.log(`\nTotal songs to check: ${allSongs.length}`);
    console.log('Checking YouTube IDs (this may take a while)...\n');

    const brokenSongs = [];
    const batchSize = 20; // Check 20 at a time

    for (let i = 0; i < allSongs.length; i += batchSize) {
        const batch = allSongs.slice(i, i + batchSize);
        const results = await Promise.all(
            batch.map(async (song) => {
                const isValid = await checkYouTubeId(song.youtubeId);
                return { ...song, isValid };
            })
        );

        for (const result of results) {
            if (!result.isValid) {
                brokenSongs.push(result);
                console.log(`BROKEN: ${result.title} (${result.id}) - ${result.youtubeId}`);
            }
        }

        // Progress update
        const progress = Math.min(i + batchSize, allSongs.length);
        process.stdout.write(`\rProgress: ${progress}/${allSongs.length} checked, ${brokenSongs.length} broken found`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n\n=== SUMMARY ===');
    console.log(`Total songs checked: ${allSongs.length}`);
    console.log(`Broken YouTube IDs: ${brokenSongs.length}`);

    if (brokenSongs.length > 0) {
        console.log('\n=== BROKEN SONGS ===');
        for (const song of brokenSongs) {
            console.log(`${song.file}:${song.line} - ${song.id} - "${song.title}" - ${song.youtubeId}`);
        }

        // Save to file
        fs.writeFileSync('broken_youtube_ids.json', JSON.stringify(brokenSongs, null, 2));
        console.log('\nBroken IDs saved to broken_youtube_ids.json');
    } else {
        console.log('\nNo broken YouTube IDs found!');
    }
}

main().catch(console.error);
