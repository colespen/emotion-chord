import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function formatEmotionalResonance(resonance: number): string {
  return `${Math.round(resonance * 100)}%`;
}

export function getEmotionColor(valence: number): string {
  if (valence > 0.5) return "text-green-600";
  if (valence > 0) return "text-yellow-600";
  if (valence > -0.5) return "text-orange-600";
  return "text-red-600";
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
