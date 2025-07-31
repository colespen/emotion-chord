/**
 * Types Index
 * Central export point for all type definitions
 */

// Common union types
export type {
  CulturalPreference,
  StylePreference,
  VoicingDensity,
  VoicingRegister,
  VoicingType,
  ProgressionType,
  TensionCurve,
  MusicalMode,
  DynamicsLevel,
  ArticulationType,
  TimbreType,
  EmotionCategory,
  ApiStatus,
} from "./common";

// Main emotion-chord types
export type {
  AdvancedEmotionAnalysis,
  VoicingInfo,
  AdvancedChordSuggestion,
  ProgressionChord,
  ChordProgression,
  VoiceLeadingInfo,
  RagaSuggestion,
  MaqamSuggestion,
  EmotionChordResponse,
  EmotionRequest,
  BatchRequest,
  BatchResponse,
  ApiError,
  HealthCheckResponse,
  EmotionAnalysis,
  ChordSuggestion,
} from "./emotionChord";
