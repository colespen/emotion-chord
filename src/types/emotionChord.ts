// updated types to match the advanced API structure

import type {
  CulturalPreference,
  StylePreference,
  VoicingDensity,
  VoicingRegister,
  VoicingType,
  ProgressionType,
  TensionCurve,
  // MusicalMode,
  DynamicsLevel,
  ArticulationType,
  TimbreType,
  GEMSEmotions,
} from "./common";

export interface AdvancedEmotionAnalysis {
  // core emotion data
  primaryEmotion: string;
  secondaryEmotions: string[];
  emotionalIntensity: number; // 0-1

  // russell's Circumplex Model
  valence: number; // -1 to 1
  arousal: number; // 0 to 1

  // gEMS (Geneva Emotional Music Scale) dimensions
  gems?: GEMSEmotions;

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
    valence?: number;
  };
}

export interface VoicingInfo {
  notes: number[]; // MIDI numbers
  voicingType: VoicingType;
  bassNote?: number; // Separate bass note if different from root
  voiceLeadingScore?: number; // Quality of voice leading from previous chord
  density: VoicingDensity;
  register: VoicingRegister;
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
  timbre?: TimbreType;
  dynamics?: DynamicsLevel;
  articulation?: ArticulationType;
}

export interface ProgressionChord {
  symbol: string;
  duration: number; // in beats
  tension: number; // 0-1
  function?: string; // tonic, dominant, etc.
}

export interface ChordProgression {
  chords: ProgressionChord[];
  key: string;
  mode?: string;
  tempo: number; // BPM
  totalDuration: number; // in beats
  type: ProgressionType;
  complexity: number; // 0-1
  tensionCurve: TensionCurve;
  emotionalJourney: string; // Description of emotional journey
  romanNumerals?: string[];
  features?: string[]; // e.g., ['secondary_dominants', 'modal_interchange']
  voiceLeading?: VoiceLeadingInfo[];
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

// api request/response types
export interface EmotionRequest {
  emotion: string;
  options?: {
    culturalPreference?: CulturalPreference;
    stylePreference?: StylePreference;
    includeProgression?: boolean;
    includeCulturalAlternatives?: boolean;
  };
}

export interface BatchRequest {
  emotions: string[];
}

export interface BatchResponse {
  results: EmotionChordResponse[];
}

export interface ApiError {
  error: string;
}

export interface HealthCheckResponse {
  status: string;
  version: string;
  features: {
    advancedHarmony: boolean;
    culturalMappings: boolean;
    spotifyIntegration: boolean;
    gems: boolean;
    syntheticAcousticFeatures?: boolean;
  };
}

// legacy types for backward compatibility
export type EmotionAnalysis = AdvancedEmotionAnalysis;
export type ChordSuggestion = AdvancedChordSuggestion;
