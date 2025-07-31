/**
 * Common Union Types
 * Reusable type definitions to avoid repetition across the codebase
 */

// Cultural preference types
export type CulturalPreference = "western" | "indian" | "arabic" | "universal";

// Musical style types
export type StylePreference = "classical" | "jazz" | "contemporary" | "experimental";

// Voicing density types
export type VoicingDensity = "sparse" | "medium" | "dense";

// Voicing register types
export type VoicingRegister = "low" | "mid" | "high" | "full";

// Voicing types
export type VoicingType =
  | "close"
  | "open"
  | "drop2"
  | "drop3"
  | "rootless"
  | "cluster"
  | "quartal"
  | "spread";

// Progression types
export type ProgressionType =
  | "ascending"
  | "descending"
  | "circular"
  | "static"
  | "modal"
  | "chromatic";

// Tension curve types
export type TensionCurve = "rising" | "falling" | "arch" | "valley" | "plateau";

// Musical modes
export type MusicalMode =
  | "major"
  | "minor"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian"
  | "aeolian"
  | "locrian";

// Dynamics levels
export type DynamicsLevel = "pp" | "p" | "mp" | "mf" | "f" | "ff";

// Articulation types
export type ArticulationType = "legato" | "staccato" | "tenuto" | "marcato" | "accent";

// Timbre types
export type TimbreType =
  | "piano"
  | "strings"
  | "synth"
  | "brass"
  | "woodwinds"
  | "percussion"
  | "voice";

// Emotion categories for examples
export type EmotionCategory = "basic" | "complex" | "cultural" | "sophisticated";

// API status types
export type ApiStatus = "healthy" | "degraded" | "down";
