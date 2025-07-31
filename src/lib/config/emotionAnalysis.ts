/**
 * Emotion Analysis Configuration
 * Default settings and options for emotion-to-chord analysis
 */

import type { CulturalPreference, StylePreference } from "@/types/common";

export interface EmotionAnalysisConfig {
  culturalPreference: CulturalPreference;
  stylePreference: StylePreference;
  includeProgression: boolean;
  includeCulturalAlternatives: boolean;
}

export const DEFAULT_EMOTION_ANALYSIS_CONFIG: Omit<
  EmotionAnalysisConfig,
  "stylePreference"
> = {
  culturalPreference: "universal",
  includeProgression: true,
  includeCulturalAlternatives: true,
} as const;

export const DEFAULT_STYLE_PREFERENCE: StylePreference = "contemporary";

export const ANALYSIS_LIMITS = {
  MAX_EMOTION_LENGTH: 500,
  MIN_EMOTION_LENGTH: 3,
  MAX_ALTERNATIVES: 5,
} as const;
