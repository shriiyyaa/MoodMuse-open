'use client';

import { useState, useEffect, useCallback } from 'react';
import { hindiFreshSongs } from '@/lib/songs/hindi-fresh';
// Import other language songs as needed
// import { punjabiSongs } from '@/lib/songs/punjabi';
// import { englishSongs } from '@/lib/songs/english';

interface EmotionalProfile {
    valence: number;       // 0-1: Negative to Positive
    energy: number;        // 0-1: Calm to Energetic
    tension: number;       // 0-1: Relaxed to Tense
    melancholy: number;    // 0-1: Happy to Melancholic
    nostalgia: number;     // 0-1: Present to Nostalgic
    hope: number;          // 0-1: Hopeless to Hopeful
    intensity: number;     // 0-1: Soft to Intense
    social: number;        // 0-1: Solitary to Social
}

interface Song {
    id: string;
    title: string;
    artist: string;
    youtubeId: string;
    language: string;
    emotionalProfile: EmotionalProfile;
}

// Vector dimension labels with descriptions
const VECTOR_LABELS: { key: keyof EmotionalProfile; label: string; lowLabel: string; highLabel: string }[] = [
    { key: 'valence', label: 'Valence (Mood)', lowLabel: '😢 Sad', highLabel: '😊 Happy' },
    { key: 'energy', label: 'Energy Level', lowLabel: '😴 Calm', highLabel: '⚡ Energetic' },
    { key: 'tension', label: 'Tension', lowLabel: '😌 Relaxed', highLabel: '😰 Tense' },
    { key: 'melancholy', label: 'Melancholy', lowLabel: '☀️ Light', highLabel: '🌧️ Heavy' },
    { key: 'nostalgia', label: 'Nostalgia', lowLabel: '🔮 Present', highLabel: '📷 Nostalgic' },
    { key: 'hope', label: 'Hope', lowLabel: '😞 Hopeless', highLabel: '🌈 Hopeful' },
    { key: 'intensity', label: 'Intensity', lowLabel: '🎵 Soft', highLabel: '🔥 Intense' },
    { key: 'social', label: 'Social Vibe', lowLabel: '🧘 Solo', highLabel: '🎉 Party' },
];

export default function SongEditorPage() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentVector, setCurrentVector] = useState<EmotionalProfile | null>(null);
    const [language, setLanguage] = useState<'hindi' | 'punjabi' | 'english'>('hindi');
    const [searchQuery, setSearchQuery] = useState('');
    const [editedSongs, setEditedSongs] = useState<Record<string, EmotionalProfile>>({});
    const [saved, setSaved] = useState(false);

    // Load songs based on language
    useEffect(() => {
        let songList: Song[] = [];
        switch (language) {
            case 'hindi':
                songList = hindiFreshSongs as Song[];
                break;
            // Add other languages here
            default:
                songList = hindiFreshSongs as Song[];
        }
        setSongs(songList);
        setCurrentIndex(0);
    }, [language]);

    // Update current vector when song changes
    useEffect(() => {
        if (songs.length > 0 && songs[currentIndex]) {
            const song = songs[currentIndex];
            // Check if we have edited this song before
            if (editedSongs[song.id]) {
                setCurrentVector(editedSongs[song.id]);
            } else {
                setCurrentVector({ ...song.emotionalProfile });
            }
            setSaved(false);
        }
    }, [currentIndex, songs, editedSongs]);

    const currentSong = songs[currentIndex];

    const handleVectorChange = (key: keyof EmotionalProfile, value: number) => {
        if (!currentVector) return;
        setCurrentVector(prev => prev ? { ...prev, [key]: value } : null);
        setSaved(false);
    };

    const handleSave = () => {
        if (!currentSong || !currentVector) return;
        setEditedSongs(prev => ({
            ...prev,
            [currentSong.id]: currentVector
        }));
        setSaved(true);
    };

    const handleNext = () => {
        if (currentIndex < songs.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query) return;

        const idx = songs.findIndex(s =>
            s.title.toLowerCase().includes(query.toLowerCase()) ||
            s.artist.toLowerCase().includes(query.toLowerCase())
        );
        if (idx !== -1) {
            setCurrentIndex(idx);
        }
    };

    const handleExport = () => {
        // Export edited songs as JSON for manual update
        const output = Object.entries(editedSongs).map(([id, profile]) => {
            const song = songs.find(s => s.id === id);
            return {
                id,
                title: song?.title,
                emotionalProfile: profile
            };
        });

        const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `song-vectors-${language}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const editedCount = Object.keys(editedSongs).length;

    if (!currentSong) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                Loading songs...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">🎵 Song Vector Editor</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">
                            Edited: {editedCount} songs
                        </span>
                        {editedCount > 0 && (
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium"
                            >
                                📥 Export Changes
                            </button>
                        )}
                    </div>
                </div>

                {/* Language & Search */}
                <div className="flex gap-4 mb-6">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'hindi' | 'punjabi' | 'english')}
                        className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    >
                        <option value="hindi">Hindi</option>
                        <option value="punjabi">Punjabi (coming soon)</option>
                        <option value="english">English (coming soon)</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search by title or artist..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2"
                    />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mb-6 bg-gray-800/50 rounded-lg p-4">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium"
                    >
                        ← Previous
                    </button>
                    <span className="text-lg">
                        Song {currentIndex + 1} of {songs.length}
                    </span>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === songs.length - 1}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium"
                    >
                        Next →
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Song Info & Player */}
                    <div className="space-y-4">
                        <div className="bg-gray-800/50 rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-1">{currentSong.title}</h2>
                            <p className="text-gray-400 mb-4">{currentSong.artist}</p>

                            {/* YouTube Player */}
                            <div className="aspect-video rounded-lg overflow-hidden">
                                <iframe
                                    key={currentSong.youtubeId}
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=0`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="bg-gray-800/50 rounded-xl p-4">
                            <h3 className="font-semibold mb-3">Quick Presets</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { name: '😢 Sad', preset: { valence: 0.2, energy: 0.3, tension: 0.5, melancholy: 0.9, nostalgia: 0.5, hope: 0.2, intensity: 0.4, social: 0.1 } },
                                    { name: '💔 Heartbreak', preset: { valence: 0.15, energy: 0.3, tension: 0.7, melancholy: 0.95, nostalgia: 0.6, hope: 0.1, intensity: 0.8, social: 0.1 } },
                                    { name: '❤️ Romantic', preset: { valence: 0.75, energy: 0.4, tension: 0.1, melancholy: 0.1, nostalgia: 0.3, hope: 0.9, intensity: 0.5, social: 0.8 } },
                                    { name: '😊 Happy', preset: { valence: 0.85, energy: 0.7, tension: 0.1, melancholy: 0.1, nostalgia: 0.2, hope: 0.8, intensity: 0.5, social: 0.8 } },
                                    { name: '🎉 Party', preset: { valence: 0.9, energy: 0.95, tension: 0.2, melancholy: 0.1, nostalgia: 0.1, hope: 0.7, intensity: 0.8, social: 0.9 } },
                                    { name: '😌 Chill', preset: { valence: 0.65, energy: 0.3, tension: 0.1, melancholy: 0.1, nostalgia: 0.3, hope: 0.6, intensity: 0.2, social: 0.4 } },
                                ].map(({ name, preset }) => (
                                    <button
                                        key={name}
                                        onClick={() => setCurrentVector(preset)}
                                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Vector Sliders */}
                    <div className="bg-gray-800/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Emotional Profile</h3>
                            <div className="flex items-center gap-2">
                                {saved && <span className="text-green-400 text-sm">✓ Saved</span>}
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium"
                                >
                                    💾 Save
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {currentVector && VECTOR_LABELS.map(({ key, label, lowLabel, highLabel }) => (
                                <div key={key} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">{lowLabel}</span>
                                        <span className="font-medium">{label}: {currentVector[key].toFixed(2)}</span>
                                        <span className="text-gray-400">{highLabel}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={currentVector[key]}
                                        onChange={(e) => handleVectorChange(key, parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 bg-gray-800/30 rounded-xl p-4 text-sm text-gray-400">
                    <p><strong>How to use:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 mt-2">
                        <li>Listen to the song using the YouTube player</li>
                        <li>Adjust the sliders based on how the song FEELS to you</li>
                        <li>Use Quick Presets for common moods, then fine-tune</li>
                        <li>Click Save to store your changes</li>
                        <li>Use Export to download all changes as JSON</li>
                        <li>Apply JSON changes to song database files</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
