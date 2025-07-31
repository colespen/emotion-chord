import { clsx, type ClassValue } from "clsx";

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
  const colors: Record<string, string> = {
    ascending: "text-[#238636] bg-[#238636]/10",
    descending: "text-[#2563eb] bg-[#2563eb]/10",
    circular: "text-[#8b5cf6] bg-[#8b5cf6]/10",
    static: "text-[#7d8590] bg-[#7d8590]/10",
    modal: "text-[#6366f1] bg-[#6366f1]/10",
    chromatic: "text-[#da3633] bg-[#da3633]/10",
  };
  return colors[type] || "text-[#7d8590] bg-[#7d8590]/10";
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
