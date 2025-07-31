/**
 * Voicing Generation Logic
 * Pure functions for generating chord voicings
 */

import { Note } from "tonal";
import type { AdvancedEmotionAnalysis, VoicingInfo } from "@/types/emotionChord";
import type { BasicChord } from "@/types/chords";

/**
 * Generate voicing for a chord based on emotion and style
 */
export function generateVoicing(
  chord: BasicChord,
  emotion: AdvancedEmotionAnalysis,
  style?: string
): VoicingInfo {
  const voicingStyle = style || selectVoicingStyle(emotion);

  switch (voicingStyle) {
    case "drop2":
      return generateDrop2Voicing(chord, emotion);
    case "rootless":
      return generateRootlessVoicing(chord, emotion);
    case "cluster":
      return generateClusterVoicing(chord, emotion);
    case "quartal":
      return generateQuartalVoicing(chord);
    case "spread":
      return generateSpreadVoicing(chord);
    default:
      return generateStandardVoicing(chord, emotion);
  }
}

/**
 * Calculate voice leading quality between two voicings
 */
export function calculateVoiceLeading(
  currentVoicing: number[],
  previousVoicing: number[] | null
): number {
  if (!previousVoicing) {
    return 1.0;
  }

  let totalMovement = 0;
  const voices = Math.min(currentVoicing.length, previousVoicing.length);

  for (let i = 0; i < voices; i++) {
    totalMovement += Math.abs(currentVoicing[i] - previousVoicing[i]);
  }

  // Convert to 0-1 score (lower movement = higher score)
  return Math.max(0, 1 - totalMovement / (voices * 12));
}

/**
 * Select appropriate voicing style based on emotion
 */
function selectVoicingStyle(emotion: AdvancedEmotionAnalysis): string {
  // Select based on GEMS emotions
  if (emotion.gems) {
    const gems = emotion.gems;
    if (gems.tension && gems.tension > 0.7) return "cluster";
    if (gems.wonder && gems.wonder > 0.7) return "quartal";
    if (gems.transcendence && gems.transcendence > 0.7) return "spread";
    if (gems.nostalgia && gems.nostalgia > 0.7) return "rootless";
  }

  // Select based on style preference
  if (emotion.harmonicStyle === "jazz") return "drop2";
  if (emotion.harmonicStyle === "contemporary") return "quartal";
  if (emotion.harmonicStyle === "experimental") return "cluster";

  // Default based on complexity
  return emotion.complexity > 0.5 ? "open" : "close";
}

function generateDrop2Voicing(
  chord: BasicChord,
  emotion: AdvancedEmotionAnalysis
): VoicingInfo {
  const notes = chord.notes || [];
  if (notes.length < 4) {
    return generateStandardVoicing(chord, emotion);
  }

  // Drop 2: take second voice from top and drop it an octave
  const closePosition = notes.map(
    (note: string, i: number) => Note.midi(note + (4 + Math.floor(i / 3))) || 60
  );
  const sorted = closePosition.sort((a: number, b: number) => a - b);

  const drop2 = [
    sorted[sorted.length - 2] - 12, // Dropped voice
    sorted[0],
    sorted[sorted.length - 1],
    sorted[sorted.length - 3],
  ].sort((a, b) => a - b);

  return {
    notes: drop2,
    voicingType: "drop2",
    density: "medium",
    register: "mid",
    voiceLeadingScore: 0.8, // Will be calculated with previous voicing context
  };
}

function generateRootlessVoicing(
  chord: BasicChord,
  emotion: AdvancedEmotionAnalysis
): VoicingInfo {
  const notes = chord.notes || [];
  if (notes.length < 4) {
    return generateStandardVoicing(chord, emotion);
  }

  // Remove root, focus on 3, 7, extensions
  const importantNotes = notes.slice(1); // Remove root
  const voicing = importantNotes.map((note: string, i: number) => {
    const octave = 3 + Math.floor(i / 2);
    return Note.midi(note + octave) || 60;
  });

  // Add bass note separately
  const bassNote = Note.midi(chord.root + "2") || 36;

  return {
    notes: voicing.sort((a: number, b: number) => a - b),
    voicingType: "rootless",
    bassNote,
    density: "sparse",
    register: "mid",
    voiceLeadingScore: 0.7,
  };
}

function generateClusterVoicing(
  chord: BasicChord,
  emotion: AdvancedEmotionAnalysis
): VoicingInfo {
  const root = chord.root || "C";
  const rootMidi = Note.midi(root + "4") || 60;

  // Create cluster based on emotion intensity
  const clusterSize = Math.floor(3 + emotion.tension * 4);
  const notes: number[] = [];

  for (let i = 0; i < clusterSize; i++) {
    notes.push(rootMidi + i);
  }

  return {
    notes,
    voicingType: "cluster",
    density: "dense",
    register: emotion.arousal > 0.5 ? "high" : "mid",
    voiceLeadingScore: 0.2, // Clusters have poor voice leading
  };
}

function generateQuartalVoicing(chord: BasicChord): VoicingInfo {
  const root = chord.root || "C";
  const rootMidi = Note.midi(root + "3") || 48;
  const notes: number[] = [rootMidi];

  // Stack fourths
  let current = rootMidi;
  for (let i = 0; i < 3; i++) {
    current += 5; // Perfect fourth
    notes.push(current);
  }

  return {
    notes,
    voicingType: "quartal",
    density: "medium",
    register: "mid",
    voiceLeadingScore: 0.9,
  };
}

function generateSpreadVoicing(chord: BasicChord): VoicingInfo {
  const notes = chord.notes || [];
  const voicing: number[] = [];

  // Spread notes across wide range
  notes.forEach((note: string, i: number) => {
    const octave = 2 + i; // Each note in different octave
    const midi = Note.midi(note + octave) || 60;
    voicing.push(midi);
  });

  return {
    notes: voicing.sort((a: number, b: number) => a - b),
    voicingType: "spread",
    density: "sparse",
    register: "full",
    voiceLeadingScore: 0.6,
  };
}

function generateStandardVoicing(
  chord: BasicChord,
  emotion: AdvancedEmotionAnalysis
): VoicingInfo {
  const notes = chord.notes || [];
  const baseOctave = emotion.arousal > 0.5 ? 4 : 3;

  const voicing = notes.map((note: string, i: number) => {
    const octave = baseOctave + Math.floor(i / 4);
    return Note.midi(note + octave) || 60;
  });

  return {
    notes: voicing.sort((a: number, b: number) => a - b),
    voicingType: emotion.complexity > 0.5 ? "open" : "close",
    density: "medium",
    register: "mid",
    voiceLeadingScore: 0.5,
  };
}
