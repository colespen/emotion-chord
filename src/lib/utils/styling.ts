import { clsx, type ClassValue } from "clsx";
import { PROGRESSION_TYPE_COLORS } from "../constants/ui";

/**
 * Styling utility functions for colors and visual indicators
 */

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Get color class based on complexity level
 */
export function getComplexityColor(complexity: number): string {
  if (complexity < 0.3) return "text-[#238636]";
  if (complexity < 0.7) return "text-[#fb8500]";
  return "text-[#da3633]";
}

/**
 * Get color class based on resonance level
 */
export function getResonanceColor(resonance: number): string {
  if (resonance > 0.8) return "text-[#8b5cf6]";
  if (resonance > 0.6) return "text-[#2563eb]";
  if (resonance > 0.4) return "text-[#6366f1]";
  return "text-[#7d8590]";
}

/**
 * Get color class and background for progression types
 */
export function getProgressionTypeColor(type: string): string {
  return (
    PROGRESSION_TYPE_COLORS[type as keyof typeof PROGRESSION_TYPE_COLORS] ||
    "text-[#7d8590] bg-[#7d8590]/10"
  );
}

/**
 * Get background color for tension indicators
 */
export function getTensionColor(tension: number): string {
  if (tension < 0.3) return "bg-[#238636]/20";
  if (tension < 0.7) return "bg-[#fb8500]/20";
  return "bg-[#da3633]/20";
}

export function getEmotionColor(valence: number): string {
  if (valence > 0.5) return "text-green-600";
  if (valence > 0) return "text-yellow-600";
  if (valence > -0.5) return "text-orange-600";
  return "text-red-600";
}
