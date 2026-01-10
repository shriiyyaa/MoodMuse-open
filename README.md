# MoodMuse

> **Music Recommendations Based on Your Mood**

MoodMuse is a web application that recommends songs based on how you're feeling. Describe your mood in natural language, and MoodMuse will curate a personalized playlist that matches your emotional state.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Features

- **Natural Language Input** - Describe how you feel in your own words
- **Custom Mood Analyzer** - Our own built-in mood detection system (no external APIs)
- **Smart Song Matching** - Matches songs based on emotional profile vectors
- **Multi-Language Library** - Hindi, Punjabi, and English songs
- **Playlist Duration** - Choose 15, 30, or 60 minute playlists
- **Intent Selection** - Study, party, relax, workout, and more
- **Dark/Light Mode** - Theme support
- **Responsive** - Works on desktop and mobile

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling |
| YouTube | Song playback |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/shriiyyaa/MoodMuse-open.git
   cd MoodMuse-open
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Run the development server
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

---

## How the Mood Analyzer Works

MoodMuse uses a custom-built mood analyzer (no external APIs required). The analyzer works in three layers:

### 1. Phrase Detection
Matches full phrases and expressions:
- Song references: "all too well", "channa mereya", "tum hi ho"
- Idioms: "feeling blue", "on cloud nine", "heavy heart"
- Gen-Z slang: "down bad", "main character", "villain arc"

### 2. Keyword Detection
Matches individual mood words:
- Happy: joy, excited, fun, great
- Sad: lonely, hurt, pain, cry
- Romantic: love, crush, miss
- Chill: relax, calm, peaceful

### 3. Emoji Recognition
Understands emoji moods:
- 😊😄🥳 → Happy/Party
- 😢😭💔 → Sad/Heartbreak
- 😍🥰❤️ → Romantic
- 😌🧘☕ → Chill

The analyzer generates an 8-dimensional mood vector:
- Valence (positivity)
- Energy
- Tension
- Melancholy
- Nostalgia
- Hope
- Intensity
- Social

Songs are matched based on vector similarity.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Landing page
│   ├── mood/              # Mood input
│   ├── language/          # Language selection
│   ├── intent/            # Intent selection
│   ├── duration/          # Duration selection
│   ├── processing/        # Processing screen
│   ├── results/           # Results display
│   └── api/               # API routes
│
├── lib/
│   ├── songs/             # Song databases
│   │   ├── hindi-fresh.ts
│   │   ├── punjabi-fresh.ts
│   │   ├── english-fresh.ts
│   │   └── database.ts
│   │
│   └── mood/              # Mood logic
│       ├── mockAnalyzer.ts  # The mood analyzer
│       ├── matcher.ts       # Song matching
│       └── types.ts
│
└── components/            # React components
```

---

## Song Database

| Language | Count |
|----------|-------|
| Hindi | 1,634 |
| Punjabi | 1,100+ |
| English | 900+ |
| **Total** | **3,600+** |

Each song has:
- 8-dimensional emotional profile
- Themes (romantic, party, sad, etc.)
- Sonic mood (upbeat, melodic, chill)
- Best-for scenarios (gym, study, date)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Areas for contribution:
- UI/UX improvements
- Adding songs to the database
- New language support
- Bug fixes
- New features

---

## License

MIT License - see [LICENSE](LICENSE)
