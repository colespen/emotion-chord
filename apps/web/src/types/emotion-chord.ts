export interface EmotionAnalysis {
  primaryEmotion: string;
  secondaryEmotions: string[];
  valence: number; // -1 (negative) to 1 (positive)
  arousal: number; // 0 (calm) to 1 (energetic)
  tension: number; // 0 (relaxed) to 1 (tense)
  complexity: number; // 0 (simple) to 1 (complex)
  musicalMode:
    | "major"
    | "minor"
    | "dorian"
    | "mixolydian"
    | "lydian"
    | "phrygian"
    | "locrian";
  suggestedTempo: number; // BPM
}

export interface ChordSuggestion {
  symbol: string;
  root: string;
  quality: string;
  notes: string[];
  intervals: string[];
  midiNotes: number[];
  voicing: number[]; // MIDI note numbers for specific voicing
  confidence: number;
  emotionalResonance: number;
  musicalJustification: string;
}

export interface EmotionChordResponse {
  emotion: EmotionAnalysis;
  primaryChord: ChordSuggestion;
  alternativeChords: ChordSuggestion[];
}

// API Request/Response types
export interface EmotionRequest {
  emotion: string;
}

export interface ApiError {
  error: string;
}
