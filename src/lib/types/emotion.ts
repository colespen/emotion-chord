import type {
  CulturalPreference,
  StylePreference,
  VoicingDensity,
  VoicingRegister,
  VoicingType,
} from "@/types/common";

export interface AdvancedEmotionAnalysis {
  // core emotion data
  primaryEmotion: string;
  secondaryEmotions: string[];
  emotionalIntensity: number; // 0-1

  // russell's Circumplex Model
  valence: number; // -1 to 1
  arousal: number; // 0 to 1

  // gEMS (Geneva Emotional Music Scale) dimensions
  gems?: {
    joy?: number;
    sadness?: number;
    tension?: number;
    wonder?: number;
    peacefulness?: number;
    power?: number;
    tenderness?: number;
    nostalgia?: number;
    transcendence?: number;
  };

  // musical characteristics
  tension: number; // 0 to 1
  complexity: number; // 0 to 1
  musicalMode: string;
  suggestedTempo: number;

  // cultural/stylistic preferences
  culturalContext?: CulturalPreference;
  harmonicStyle?: StylePreference;

  // acoustic features (from Spotify/Essentia analysis if available)
  acousticFeatures?: {
    energy?: number;
    danceability?: number;
    acousticness?: number;
    instrumentalness?: number;
    speechiness?: number;
    liveness?: number;
  };
}

export interface AdvancedChordSuggestion {
  // basic chord info
  symbol: string;
  root: string;
  quality: string;
  notes: string[];
  intervals: string[];

  // mIDI representation
  midiNotes: number[];

  // advanced voicing with voice leading
  voicing: VoicingInfo;

  // harmonic characteristics
  harmonicFunction?: string; // tonic, dominant, subdominant, etc.
  harmonicComplexity: number; // 0-1
  dissonanceLevel: number; // 0-1

  // cultural/theoretical context
  theoreticalContext?: {
    isPolychord?: boolean;
    isQuartal?: boolean;
    isCluster?: boolean;
    isSpectral?: boolean;
    modalInterchange?: boolean;
    chromaticMediant?: boolean;
    extendedHarmony?: boolean;
  };

  // emotional mapping
  emotionalResonance: number; // 0-1
  emotionalJustification: string;
  culturalReference?: string; // e.g., "Similar to Raga Bhairav's austere quality"

  // audio generation hints
  timbre?: string; // piano, strings, synth, etc.
  dynamics?: string; // pp, p, mf, f, ff
  articulation?: string; // legato, staccato, etc.
}

export interface VoicingInfo {
  notes: number[]; // MIDI numbers
  voicingType: VoicingType;
  bassNote?: number; // Separate bass note if different from root
  voiceLeadingScore?: number; // Quality of voice leading from previous chord
  density: VoicingDensity;
  register: VoicingRegister;
}

export interface EmotionChordResponse {
  emotion: AdvancedEmotionAnalysis;
  primaryChord: AdvancedChordSuggestion;
  alternativeChords: AdvancedChordSuggestion[];
  chordProgression?: ChordProgression;
  culturalAlternatives?: {
    indian?: RagaSuggestion;
    arabic?: MaqamSuggestion;
  };
}

export interface ChordProgression {
  chords: string[];
  romanNumerals: string[];
  emotionalArc: string; // Description of emotional journey
  voiceLeading: VoiceLeadingInfo[];
}

export interface VoiceLeadingInfo {
  fromChord: string;
  toChord: string;
  voiceMovements: Array<{
    voice: number;
    from: number;
    to: number;
    interval: number;
  }>;
  smoothness: number; // 0-1
}

export interface RagaSuggestion {
  name: string;
  emotion: string;
  notes: string[];
  characteristic: string;
}

export interface MaqamSuggestion {
  name: string;
  emotion: string;
  notes: string[];
  quarterTones?: string[];
  characteristic: string;
}
