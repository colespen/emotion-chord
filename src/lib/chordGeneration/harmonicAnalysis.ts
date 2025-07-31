/**
 * Harmonic Analysis Logic
 * Pure functions for analyzing chord harmony and theory
 */

import type { AdvancedEmotionAnalysis } from "../types/emotion";
import type { BasicChord, ChordData, HarmonicAnalysis } from "../types/chordTypes";

/**
 * Analyze harmonic characteristics of a chord
 */
export function analyzeChord(
  chord: BasicChord,
  emotion: AdvancedEmotionAnalysis
): HarmonicAnalysis {
  const intervals = chord.intervals || [];
  const notes = chord.notes || [];

  // Calculate dissonance based on intervals
  let dissonance = 0;
  const dissonantIntervals = ["2m", "2A", "4A", "5d", "7M", "7d"];
  intervals.forEach((interval: string) => {
    if (dissonantIntervals.includes(interval)) {
      dissonance += 0.2;
    }
  });

  // Calculate complexity
  const complexity = Math.min(1, notes.length / 7);

  // Determine harmonic function
  let harmonicFunction = "color";
  if (chord.quality?.includes("7")) harmonicFunction = "dominant";
  if (chord.quality?.includes("maj")) harmonicFunction = "tonic";
  if (chord.quality?.includes("m")) harmonicFunction = "subdominant";

  return {
    function: harmonicFunction,
    complexity: Math.min(1, complexity + emotion.complexity * 0.3),
    dissonance: Math.min(1, dissonance),
  };
}

/**
 * Build theoretical context for a chord
 */
export function buildTheoreticalContext(chordData: ChordData) {
  const context = chordData.context;
  const symbol = chordData.symbol;

  return {
    isPolychord: symbol.includes("/") || false,
    isQuartal: context?.harmonic === "quartal" || false,
    isCluster: context?.harmonic === "cluster" || false,
    isSpectral: context?.harmonic === "spectral" || false,
    modalInterchange: context?.harmonic === "modal_interchange" || false,
    chromaticMediant: false, // Could be enhanced based on chord analysis
    extendedHarmony:
      symbol.includes("7") ||
      symbol.includes("9") ||
      symbol.includes("11") ||
      symbol.includes("13") ||
      false,
  };
}

/**
 * Analyze chord function in key context
 */
export function analyzeChordFunction(
  chord: BasicChord
  // _key: string = "C" // Future: implement key-aware analysis
): {
  romanNumeral: string;
  function: "tonic" | "subdominant" | "dominant" | "secondary" | "chromatic";
  tension: number;
} {
  // Simplified chord function analysis
  // This could be expanded with more sophisticated harmonic analysis

  const root = chord.root || "C";
  const quality = chord.quality || "";

  // Basic roman numeral and function mapping
  // This is a simplified version - real implementation would be more complex
  const functionMap: Record<string, string> = {
    C: "I",
    Dm: "ii",
    Em: "iii",
    F: "IV",
    G: "V",
    Am: "vi",
    Bdim: "vii°",
  };

  const romanNumeral = functionMap[root + quality] || "?";

  let harmonicFunction:
    | "tonic"
    | "subdominant"
    | "dominant"
    | "secondary"
    | "chromatic" = "tonic";
  let tension = 0;

  if (romanNumeral.includes("V") || quality.includes("7")) {
    harmonicFunction = "dominant";
    tension = 0.8;
  } else if (romanNumeral.includes("IV") || romanNumeral.includes("ii")) {
    harmonicFunction = "subdominant";
    tension = 0.4;
  } else if (romanNumeral.includes("I") || romanNumeral.includes("vi")) {
    harmonicFunction = "tonic";
    tension = 0.1;
  } else {
    harmonicFunction = "chromatic";
    tension = 0.6;
  }

  return {
    romanNumeral,
    function: harmonicFunction,
    tension,
  };
}

/**
 * Calculate harmonic distance between two chords
 */
export function calculateHarmonicDistance(
  chord1: BasicChord,
  chord2: BasicChord
): number {
  // Simple harmonic distance calculation
  // Based on root movement and chord quality similarity

  const root1 = chord1.root || "C";
  const root2 = chord2.root || "C";
  const quality1 = chord1.quality || "";
  const quality2 = chord2.quality || "";

  // Calculate semitone distance between roots
  const noteValues: Record<string, number> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };

  const rootDistance = Math.abs((noteValues[root1] || 0) - (noteValues[root2] || 0));
  const normalizedRootDistance = Math.min(rootDistance, 12 - rootDistance) / 6;

  // Quality similarity (0 = same, 1 = completely different)
  const qualitySimilarity = quality1 === quality2 ? 0 : 0.5;

  return Math.min(1, normalizedRootDistance + qualitySimilarity);
}
