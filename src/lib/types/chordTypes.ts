// Comprehensive types for the chord generator
export interface ChordOptions {
  preferredRoot?: string;
  voicingStyle?: string;
  avoidNotes?: string[];
  instrumentRange?: [number, number];
}

export interface BasicChord {
  root: string;
  quality: string;
  notes: string[];
  intervals: string[];
}

export interface ChordContext {
  gems?: string;
  harmonic?: string;
}

export interface ChordData {
  symbol: string;
  chord: BasicChord;
  context?: ChordContext;
  culturalReference?: string;
}

export interface HarmonicAnalysis {
  function: string;
  complexity: number;
  dissonance: number;
}

// GEMS type for proper typing
export interface GEMSEmotions {
  joy?: number;
  sadness?: number;
  tension?: number;
  wonder?: number;
  peacefulness?: number;
  power?: number;
  tenderness?: number;
  nostalgia?: number;
  transcendence?: number;
}

// Voice leading types
export interface VoiceLeading {
  from: number;
  to: number;
  distance: number;
  quality: 'step' | 'leap' | 'jump';
}

// Cultural alternative types
export interface CulturalAlternative {
  name: string;
  emotion: string;
  notes: string[];
  characteristic: string;
}

export interface CulturalAlternatives {
  indian?: CulturalAlternative;
  arabic?: CulturalAlternative;
}
