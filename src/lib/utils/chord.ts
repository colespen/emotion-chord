/**
 * Chord-specific utility functions
 */

import type { VoicingInfo } from "@/types/emotionChord";
import { VOICING_DESCRIPTIONS } from "../constants/voicing";

/**
 * Get descriptive text for different voicing types
 */
export function getVoicingDescription(voicing: VoicingInfo): string {
  return VOICING_DESCRIPTIONS[voicing.voicingType as keyof typeof VOICING_DESCRIPTIONS] || voicing.voicingType;
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function formatEmotionalResonance(resonance: number): string {
  return `${Math.round(resonance * 100)}%`;
}

export function getArousalIntensity(arousal: number): string {
  if (arousal > 0.8) return "Very High";
  if (arousal > 0.6) return "High";
  if (arousal > 0.4) return "Medium";
  if (arousal > 0.2) return "Low";
  return "Very Low";
}

export function getTensionLevel(tension: number): string {
  if (tension > 0.8) return "Very Tense";
  if (tension > 0.6) return "Tense";
  if (tension > 0.4) return "Moderate";
  if (tension > 0.2) return "Relaxed";
  return "Very Relaxed";
}
