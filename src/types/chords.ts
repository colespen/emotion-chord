/**
 * Chord Generation Types
 * Types specific to chord generation, voicing, and harmonic analysis
 */

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

// Voice leading types
export interface VoiceLeading {
  from: number;
  to: number;
  distance: number;
  quality: "step" | "leap" | "jump";
}
