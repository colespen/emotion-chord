# Emotion Chord API 🎵

An AI-powered REST API that generates musical chords based on emotional input using OpenAI and music theory.

## Features

- **Emotion Analysis**: Uses OpenAI to analyze emotional text input
- **Musical Mapping**: Maps emotions to musical characteristics (valence, arousal, tension, etc.)
- **Chord Generation**: Generates appropriate chords using music theory principles
- **Multiple Alternatives**: Provides alternative chord suggestions
- **Chord Progressions**: Generates musical progressions based on emotional context
- **TypeScript**: Fully typed for better developer experience

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Hono (lightweight web framework)
- **AI**: OpenAI GPT for emotion analysis
- **Music Theory**: Tonal.js for chord generation
- **Validation**: Zod for request/response validation
- **Language**: TypeScript
- **Package Manager**: pnpm

## API Endpoints

### Health Check
```
GET /health
```
Returns API status and timestamp.

### Generate Chord from Emotion
```
POST /api/emotion-to-chord
Content-Type: application/json

{
  "emotion": "I'm feeling melancholic and nostalgic"
}
```

**Response:**
```json
{
  "emotionAnalysis": {
    "primaryEmotion": "melancholic",
    "secondaryEmotions": ["nostalgic", "wistful"],
    "valence": -0.3,
    "arousal": 0.2,
    "tension": 0.4,
    "complexity": 0.6,
    "musicalMode": "minor",
    "suggestedTempo": 70
  },
  "primaryChord": {
    "symbol": "Am7",
    "notes": ["A", "C", "E", "G"],
    "quality": "minor7",
    "root": "A"
  },
  "alternativeChords": [
    // ... alternative chord suggestions
  ],
  "progression": [
    // ... chord progression
  ]
}
```

### Chord Audio (Future Feature)
```
POST /api/chord-audio
```
Will generate audio data for chord playback (planned feature).

## Setup

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd emotion-chord-api
```

2. Install dependencies:
```bash
pnpm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

### Development

Start the development server:
```bash
pnpm dev
```

The API will be available at `http://localhost:3001`

### Build

Build for production:
```bash
pnpm build
```

### Production

Start the production server:
```bash
pnpm start
```

## Project Structure

```
src/
├── index.ts              # Application entry point
├── api/
│   └── routes.ts         # API routes and handlers
├── config/
│   └── musicalMappings.ts # Musical theory mappings
├── services/
│   ├── chordGenerator.ts     # Chord generation logic
│   ├── emotionAnalyzer.ts    # OpenAI emotion analysis
│   └── emotionChordService.ts # Main service orchestrator
└── types/
    └── emotion.ts        # TypeScript type definitions
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `PORT` | Server port (default: 3001) | No |

## Future Features

- [ ] Audio generation with Tone.js
- [ ] MIDI file export
- [ ] Chord progression complexity controls
- [ ] Real-time audio playback
- [ ] Integration with Next.js frontend
- [ ] Chord visualization
- [ ] Musical scale suggestions
- [ ] Rhythm pattern generation

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Related Projects

- [ ] Emotion Chord UI (Next.js frontend) - Coming soon!

---

Built with ❤️ and 🎵 by [Your Name]
