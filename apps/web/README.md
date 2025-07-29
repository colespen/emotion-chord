# 🎵 Emotion Chord UI

A Next.js application that transforms emotions into musical chords with real-time audio synthesis.

## Features

- **Emotion Input**: Natural language emotion analysis
- **Chord Visualization**: Interactive chord displays with music theory details
- **Real-time Audio**: Play chords and arpeggios using Tone.js
- **Responsive Design**: Works on all devices

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Tech Stack

- Next.js 15 with React 19
- TypeScript
- Tailwind CSS
- Tone.js for audio synthesis
- Lucide React for icons

## API Integration

Connects to the emotion-chord API for:
- Emotion analysis via OpenAI
- Musical chord generation
- Chord theory calculations

Open [http://localhost:3000](http://localhost:3000) to view the application.
