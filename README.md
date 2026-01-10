# MoodMuse

> **Music Recommendations Based on Your Mood**

MoodMuse is a web application that recommends songs based on how you're feeling. Simply describe your mood in natural language, and MoodMuse will curate a personalized playlist that matches your emotional state.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Features

- **Natural Language Mood Input** - Describe how you feel in your own words
- **Built-in Mood Analyzer** - Custom keyword, phrase, and emoji detection system
- **Smart Recommendations** - Matches songs to your emotional profile
- **Multi-Language Support** - Hindi, Punjabi, and English song libraries
- **Duration Control** - Choose playlist length (15, 30, 60 minutes)
- **Intent Selection** - Select what you want to do (study, party, relax, etc.)
- **Dark/Light Mode** - Beautiful UI with theme support
- **Responsive Design** - Works on desktop and mobile

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **YouTube** | Song playback integration |

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shriiyyaa/MoodMuse-open.git
   cd MoodMuse-open
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## Project Structure

```
MoodMuse/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── mood/               # Mood input page
│   │   ├── language/           # Language selection
│   │   ├── intent/             # Intent selection (study, party, etc.)
│   │   ├── duration/           # Playlist duration selection
│   │   ├── processing/         # Processing screen
│   │   ├── results/            # Song recommendations display
│   │   └── api/                # API routes
│   │       ├── mood/analyze/   # Mood analysis endpoint
│   │       ├── session/        # Session management
│   │       └── songs/          # Song data endpoints
│   │
│   ├── lib/                    # Core logic
│   │   ├── songs/              # Song databases
│   │   │   ├── hindi-fresh.ts  # Hindi songs (1600+)
│   │   │   ├── punjabi-fresh.ts # Punjabi songs (1100+)
│   │   │   ├── english-fresh.ts # English songs (900+)
│   │   │   └── database.ts     # Database aggregation
│   │   │
│   │   └── mood/               # Mood analysis logic
│   │       ├── mockAnalyzer.ts # Built-in mood analyzer
│   │       └── matcher.ts      # Song matching algorithm
│   │
│   └── components/             # React components
│
├── CONTRIBUTING.md             # Contribution guidelines
├── LICENSE                     # MIT License
└── package.json
```

---

## How It Works

1. **User Input** - User describes their mood in natural language
2. **Language Selection** - Choose preferred music language(s)
3. **Intent Selection** - What activity? (study, workout, chill, etc.)
4. **Duration** - How long should the playlist be?
5. **Mood Analysis** - Built-in analyzer extracts emotional profile using:
   - Keyword detection (happy, sad, love, angry, etc.)
   - Phrase matching (Taylor Swift lyrics, Bollywood references, Gen-Z slang)
   - Emoji recognition
   - Generates 8-dimensional mood vector:
     - Valence, Energy, Tension, Melancholy, Nostalgia, Hope, Intensity, Social
6. **Matching** - Algorithm matches songs with similar emotional profiles
7. **Results** - Personalized playlist with YouTube integration

---

## Song Database

| Language | Songs | 
|----------|-------|
| Hindi | 1,634 |
| Punjabi | 1,100+ |
| English | 900+ |
| **Total** | **3,600+** |

Each song includes:
- Emotional profile (8 dimensions)
- Themes (e.g., romantic, party, sad)
- Sonic mood (e.g., upbeat, melodic, chill)
- Best-for scenarios (e.g., gym, study, date)

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Areas for Contribution

- **UI/UX Improvements** - Animations, responsiveness, accessibility
- **Song Database** - Add more songs with proper emotional profiling
- **New Languages** - Add support for more music languages
- **Bug Fixes** - Check Issues tab
- **New Features** - Playlist saving, sharing, etc.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- All the amazing artists whose music powers this app
- Contributors who help improve MoodMuse
