/**
 * Modern functional approach to chord generation
 * Pure functions for chord generation, voicing, and harmonic analysis
 */

import { Note } from "tonal";
import type {
  AdvancedEmotionAnalysis,
  AdvancedChordSuggestion,
  ChordProgression,
} from "@/types/emotionChord";
import type { TimbreType, DynamicsLevel, ArticulationType } from "@/types/common";
import type { ChordOptions, ChordData } from "@/types/chords";
import { selectFromEmotion, getDominantGEMS } from "./chordSelection";
import { generateVoicing } from "./voicing";
import { analyzeChord, buildTheoreticalContext } from "./harmonicAnalysis";
import { generate } from "./progression";

/**
 * Generate a chord suggestion based on emotion analysis
 * Pure function - no side effects
 */
export function generateChord(
  emotion: AdvancedEmotionAnalysis,
  options?: ChordOptions
): AdvancedChordSuggestion {
  // Select chord based on emotion
  const chordData = selectFromEmotion(emotion, options);

  // Generate sophisticated voicing
  const voicingInfo = generateVoicing(chordData.chord, emotion, options?.voicingStyle);

  // Calculate harmonic characteristics
  const harmonicAnalysis = analyzeChord(chordData.chord, emotion);

  // Build theoretical context
  const theoreticalContext = buildTheoreticalContext(chordData);

  return {
    symbol: chordData.symbol,
    root: chordData.chord.root || "",
    quality: chordData.chord.quality || "",
    notes: chordData.chord.notes,
    intervals: chordData.chord.intervals,
    midiNotes: chordData.chord.notes.map((n: string) => Note.midi(n + "4") || 60),
    voicing: voicingInfo,
    harmonicFunction: harmonicAnalysis.function,
    harmonicComplexity: harmonicAnalysis.complexity,
    dissonanceLevel: harmonicAnalysis.dissonance,
    theoreticalContext,
    emotionalResonance: calculateResonance(emotion, chordData),
    emotionalJustification: generateJustification(emotion, chordData),
    culturalReference: chordData.culturalReference,
    timbre: suggestTimbre(emotion),
    dynamics: suggestDynamics(emotion),
    articulation: suggestArticulation(emotion),
  };
}

/**
 * Generate multiple chord alternatives
 */
export function generateAlternatives(
  emotion: AdvancedEmotionAnalysis,
  count: number = 3
): AdvancedChordSuggestion[] {
  const alternatives: AdvancedChordSuggestion[] = [];
  const usedSymbols = new Set<string>();

  // Generate diverse alternatives
  const voicingStyles = ["drop2", "rootless", "quartal", "spread"];
  const roots = ["C", "F", "G", "D", "A", "E", "B", "Bb", "Eb", "Ab"];

  for (let i = 0; i < count; i++) {
    const voicingStyle = voicingStyles[i % voicingStyles.length];
    const root = roots[Math.floor(Math.random() * roots.length)];

    const chord = generateChord(emotion, {
      preferredRoot: root,
      voicingStyle,
    });

    if (!usedSymbols.has(chord.symbol)) {
      usedSymbols.add(chord.symbol);
      alternatives.push(chord);
    }
  }

  return alternatives;
}

/**
 * Generate a chord progression
 */
export function generateProgression(
  emotion: AdvancedEmotionAnalysis,
  length: number = 4
): ChordProgression {
  return generate(emotion, length);
}

// Helper functions (pure)
function calculateResonance(
  emotion: AdvancedEmotionAnalysis,
  chordData: ChordData
): number {
  let resonance = 0.5;

  // Check gems alignment
  if (emotion.gems && chordData.context?.gems) {
    resonance += 0.3;
  }

  // Check cultural alignment
  if (chordData.culturalReference) {
    resonance += 0.2;
  }

  return Math.min(1, resonance);
}

function generateJustification(
  emotion: AdvancedEmotionAnalysis,
  chordData: ChordData
): string {
  const parts: string[] = [];

  // Emotion-based justification
  parts.push(
    `This ${chordData.chord.quality || "chord"} reflects the ${emotion.primaryEmotion} emotion`
  );

  // Technical justification
  if (chordData.context?.harmonic === "quartal") {
    parts.push("using quartal harmony for modern, open sound");
  } else if (chordData.context?.harmonic === "polychord") {
    parts.push("through polychordal tension");
  }

  // Gems justification
  if (emotion.gems) {
    const dominant = getDominantGEMS(emotion.gems);
    if (dominant) {
      parts.push(`emphasizing the ${dominant} quality`);
    }
  }

  return parts.join(", ") + ".";
}

function suggestTimbre(emotion: AdvancedEmotionAnalysis): TimbreType {
  if (emotion.gems?.tenderness && emotion.gems.tenderness > 0.7) return "strings";
  if (emotion.gems?.power && emotion.gems.power > 0.7) return "brass";
  if (emotion.gems?.wonder && emotion.gems.wonder > 0.7) return "synth";
  if (
    emotion.acousticFeatures?.acousticness &&
    emotion.acousticFeatures.acousticness > 0.7
  )
    return "piano";
  return "piano"; // Default
}

function suggestDynamics(emotion: AdvancedEmotionAnalysis): DynamicsLevel {
  const intensity = emotion.emotionalIntensity;
  if (intensity > 0.8) return "ff";
  if (intensity > 0.6) return "f";
  if (intensity > 0.4) return "mf";
  if (intensity > 0.2) return "p";
  return "pp";
}

function suggestArticulation(emotion: AdvancedEmotionAnalysis): ArticulationType {
  if (emotion.gems?.tension && emotion.gems.tension > 0.7) return "staccato";
  if (emotion.gems?.peacefulness && emotion.gems.peacefulness > 0.7) return "legato";
  if (emotion.arousal > 0.7) return "marcato";
  return "legato"; // Default to legato instead of "normal"
}
