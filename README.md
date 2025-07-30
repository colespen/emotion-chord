# 🎵 Emotion Chord

Transform emotions into musical chords using AI-powered emotion analysis, advanced music theory, and real-time audio synthesis.

## Overview

Emotion Chord is a full-stack application that analyzes emotional text input and generates corresponding musical chords with sophisticated harmonic progressions. The system combines OpenAI's emotion analysis with music theory principles to create meaningful musical expressions.

## Architecture

**Monorepo Structure:**

- `apps/api/` - Hono-based REST API with OpenAI integration
- `apps/web/` - Next.js 15 frontend with Tone.js audio synthesis

## Features

### 🧠 Emotion Analysis

- Natural language emotion processing via OpenAI
- GEMS framework integration (Geneva Emotional Music Scale)
- Valence, arousal, tension, and complexity mapping

### 🎼 Musical Intelligence

- Advanced chord generation with voice leading
- Multiple voicing types (close, open, drop2, quartal, etc.)
- Harmonic progression analysis with Roman numeral notation
- Cultural musical alternatives (Indian raga, Arabic maqam)

### 🔊 Real-time Audio

- Interactive chord playback with Tone.js
- Arpeggio patterns with emotion-based tempo
- Chord progression sequencing and looping
- Professional audio effects chain (reverb, compression, filtering)

### 🎨 Modern UI

- GitHub-inspired dark theme
- Responsive design for all devices
- Real-time chord visualization
- Interactive music theory displays

## Quick Start

```bash
# Clone repository
git clone git@github.com:colespen/emotion-chord.git
cd emotion-chord

# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Add your OpenAI API key to apps/api/.env
OPENAI_API_KEY=your_openai_api_key_here

# Start development servers
pnpm dev
```

**Access:**

- Web App: http://localhost:3000
- API: http://localhost:3001

## API Usage

### Generate Chord from Emotion

```bash
POST http://localhost:3001/api/emotion-to-chord
Content-Type: application/json

{
  "emotion": "transcendent wonder with a touch of melancholy",
  "options": {
    "culturalPreference": "western",
    "stylePreference": "contemporary",
    "includeProgression": true,
    "includeCulturalAlternatives": true
  }
}
```

### Response Structure

```json
{
  "emotion": {
    "primaryEmotion": "wonder",
    "valence": 0.3,
    "arousal": 0.7,
    "tension": 0.4,
    "musicalMode": "major",
    "suggestedTempo": 85
  },
  "primaryChord": {
    "symbol": "Cmaj9",
    "notes": ["C", "E", "G", "B", "D"],
    "midiNotes": [60, 64, 67, 71, 74],
    "voicing": { "voicingType": "open", "density": "sparse" },
    "harmonicComplexity": 0.65,
    "emotionalResonance": 0.82
  },
  "chordProgression": {
    "chords": [...],
    "key": "C major",
    "tempo": 85,
    "emotionalJourney": "..."
  },
  "culturalAlternatives": {
    "indian": { "name": "Raga Yaman", "notes": [...] },
    "arabic": { "name": "Maqam Ajam", "notes": [...] }
  }
}
```

## Tech Stack

### Backend (API)

- **Runtime**: Node.js 18+
- **Framework**: Hono (lightweight, fast)
- **AI**: OpenAI GPT-4 for emotion analysis
- **Music Theory**: Tonal.js for chord calculations
- **Validation**: Zod schemas
- **Language**: TypeScript

### Frontend (Web)

- **Framework**: Next.js 15 with React 19
- **Audio**: Tone.js synthesis engine
- **Styling**: Tailwind CSS with GitHub theme
- **Icons**: Lucide React
- **Language**: TypeScript

## Environment Variables

### API (`apps/api/.env`)

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

### Web (`apps/web/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Development

```bash
# Start both apps in development mode
pnpm dev

# Start API only
pnpm --filter api dev

# Start web only
pnpm --filter web dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## Deployment

```bash
# Build all apps
pnpm build

# Start production servers
pnpm start
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ and 🎵 using AI-powered emotion analysis and modern web technologies.
