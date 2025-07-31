// Form and Business Logic Constants
import type { StylePreference, CulturalPreference } from "@/types/common";

export const STYLE_PREFERENCES: readonly { value: StylePreference; label: string }[] = [
  { value: "contemporary", label: "Contemporary" },
  { value: "classical", label: "Classical" },
  { value: "jazz", label: "Jazz" },
  { value: "experimental", label: "Experimental" },
] as const;

export const CULTURAL_PREFERENCES: readonly {
  value: CulturalPreference;
  label: string;
}[] = [
  { value: "universal", label: "Universal" },
  { value: "western", label: "Western" },
  { value: "indian", label: "Indian (Raga)" },
  { value: "arabic", label: "Arabic (Maqam)" },
] as const;

export const INPUT_LIMITS = {
  EMOTION_MAX_LENGTH: 500,
} as const;

export const PLACEHOLDER_TEXT = {
  EMOTION_INPUT: "e.g., transcendent wonder with a touch of melancholy...",
} as const;

export const BUTTON_TEXT = {
  ADVANCED_OPTIONS: "Advanced Options",
  GENERATE_CHORD: "Generate Chord",
  ANALYZING: "Analyzing Emotion...",
  RANDOM_EXAMPLE: "Random example",
} as const;
