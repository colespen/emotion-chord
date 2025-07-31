/**
 * Chord-specific utility functions
 */

import type { VoicingInfo } from "@/types/emotionChord";

/**
 * Get descriptive text for different voicing types
 */
export function getVoicingDescription(voicing: VoicingInfo): string {
  const descriptions: Record<string, string> = {
    close: "Close voicing (notes within an octave)",
    open: "Open voicing (notes spread across octaves)",
    drop2: "Drop 2 voicing (second voice dropped an octave)",
    drop3: "Drop 3 voicing (third voice dropped an octave)",
    rootless: "Rootless voicing (sophisticated jazz style)",
    cluster: "Cluster voicing (adjacent tones for texture)",
    quartal: "Quartal voicing (stacked fourths)",
    spread: "Spread voicing (wide range distribution)",
  };
  return descriptions[voicing.voicingType] || voicing.voicingType;
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
