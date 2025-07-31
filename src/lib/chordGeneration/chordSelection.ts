/**
 * Chord Selection Logic
 * Pure functions for selecting chords based on emotions
 */

import { Chord, Note } from "tonal";
import type { AdvancedEmotionAnalysis } from "../types/emotion";
import type { ChordOptions, ChordData } from "../types/chordTypes";
import { ADVANCED_EMOTION_MAPPINGS } from "../config/musicalMappings";

// Interface for Tonal.js Chord object
interface TonalChord {
  empty: boolean;
  name: string;
  symbol: string;
  root: string;
  bass: string;
  quality: string;
  notes: string[];
  intervals: string[];
  aliases: string[];
  tonic: string | null;
  type: string;
  setNum: number;
  chroma: string;
  normalized: string;
  rootDegree: number;
}

/**
 * Normalize chord symbols to be compatible with Tonal.js
 * Based on Tonal.js documentation and testing
 */
function normalizeChordSymbol(symbol: string): string {
  // Replace chord notation variations that Tonal.js doesn't recognize
  return symbol
    .replace(/maj6/g, "6")     // maj6 -> 6 (Cmaj6 -> C6)
    .replace(/Maj6/g, "6")     // Maj6 -> 6
    .replace(/MAJ6/g, "6");    // MAJ6 -> 6
  // Note: maj9, maj13 are valid in Tonal.js, only maj6 needs normalization
}

/**
 * Safe chord creation with fallback
 */
function safeGetChord(symbol: string): TonalChord {
  const normalizedSymbol = normalizeChordSymbol(symbol);
  const chord = Chord.get(normalizedSymbol) as TonalChord;
  
  // If chord is empty, try to fallback to a simpler version
  if (chord.empty) {
    console.warn(`Invalid chord symbol: ${symbol}, trying fallback`);
    
    // Extract root and try basic major chord as fallback
    const root = symbol.match(/^[A-G][#b]?/)?.[0] || "C";
    const fallbackChord = Chord.get(root) as TonalChord;
    
    return {
      ...fallbackChord,
      symbol: normalizedSymbol, // Keep the intended symbol
    };
  }
  
  return {
    ...chord,
    symbol: normalizedSymbol,
  };
}

/**
 * Select a chord based on emotion analysis
 */
export function selectFromEmotion(
  emotion: AdvancedEmotionAnalysis,
  options?: ChordOptions
): ChordData {
  // Check for specific GEMS emotions first
  if (emotion.gems) {
    const dominantGems = getDominantGEMS(emotion.gems);
    if (dominantGems && dominantGems in ADVANCED_EMOTION_MAPPINGS.gems) {
      const gemsMapping =
        ADVANCED_EMOTION_MAPPINGS.gems[
          dominantGems as keyof typeof ADVANCED_EMOTION_MAPPINGS.gems
        ];
      const qualities = gemsMapping.chordQualities;
      const quality = qualities[Math.floor(Math.random() * qualities.length)];
      const root = options?.preferredRoot || selectRoot(emotion);

      // Handle special chord types
      if (quality === "quartal") {
        return generateQuartalChord(root);
      } else if (quality === "spectral") {
        return generateSpectralChord(root, emotion);
      } else if (quality === "polychord") {
        return generatePolychord(root, emotion);
      }

      const symbol = root + quality;
      return {
        symbol,
        chord: safeGetChord(symbol),
        context: { gems: dominantGems },
      };
    }
  }

  // Check for high tension/complexity emotions
  if (emotion.tension > 0.7 && emotion.complexity > 0.6) {
    return generateAdvancedHarmony(emotion, options);
  }

  // Default to sophisticated selection based on valence/arousal
  return selectFromValenceArousal(emotion, options);
}

/**
 * Get the dominant GEMS emotion
 */
export function getDominantGEMS(gems: Record<string, number>): string | null {
  let maxValue = 0;
  let dominant = null;

  for (const [emotion, value] of Object.entries(gems)) {
    if (typeof value === "number" && value > maxValue) {
      maxValue = value;
      dominant = emotion;
    }
  }

  return dominant;
}

/**
 * Select root note based on emotion and cultural context
 */
export function selectRoot(emotion: AdvancedEmotionAnalysis): string {
  // Cultural context influences root selection
  if (emotion.culturalContext === "indian") {
    // Indian music often centers on sa (c) or pa (g)
    return emotion.valence > 0 ? "C" : "G";
  } else if (emotion.culturalContext === "arabic") {
    // Arabic music often uses d as tonic
    return "D";
  }

  // Western root selection based on emotion
  const brightRoots = ["C", "G", "D", "A", "E"];
  const darkRoots = ["F", "Bb", "Eb", "Ab", "Db"];
  const ambiguousRoots = ["B", "F#", "C#"];

  if (emotion.valence > 0.5) {
    return brightRoots[Math.floor(Math.random() * brightRoots.length)];
  } else if (emotion.valence < -0.5) {
    return darkRoots[Math.floor(Math.random() * darkRoots.length)];
  } else {
    return ambiguousRoots[Math.floor(Math.random() * ambiguousRoots.length)];
  }
}

// Helper functions for special chord types
function generateQuartalChord(root: string): ChordData {
  const notes: string[] = [root];
  const intervals = ["1P", "4P", "4P", "4P"];

  // Build quartal stack
  let currentNote = root;
  for (let i = 0; i < 3; i++) {
    currentNote = Note.transpose(currentNote, "4P");
    notes.push(currentNote);
  }

  return {
    symbol: `${root}sus4(add11)`,
    chord: {
      root,
      notes,
      intervals,
      quality: "quartal",
    },
    context: {
      harmonic: "quartal",
    },
    culturalReference: "McCoy Tyner/modern jazz quartal harmony",
  };
}

function generateSpectralChord(root: string, emotion: AdvancedEmotionAnalysis): ChordData {
  // Generate based on harmonic series
  const fundamentalMidi = Note.midi(root + "2") || 36;
  const harmonics = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13];
  const notes: string[] = [];

  // Select harmonics based on emotion
  const selectedHarmonics =
    (emotion.gems?.transcendence ?? 0) > 0.7
      ? harmonics.slice(6) // Higher harmonics for transcendence
      : harmonics.slice(2, 8); // Middle harmonics for general use

  selectedHarmonics.forEach((harmonic) => {
    const freq = 440 * Math.pow(2, (fundamentalMidi - 69) / 12) * harmonic;
    const midi = 69 + 12 * Math.log2(freq / 440);
    const note = Note.fromMidi(Math.round(midi));
    if (note && !notes.includes(note)) {
      notes.push(note);
    }
  });

  return {
    symbol: `${root}spectral`,
    chord: {
      root,
      notes: notes.slice(0, 6), // Limit to 6 notes
      intervals: ["1P", "5P", "3M", "7m", "9M", "#11"],
      quality: "spectral",
    },
    context: {
      harmonic: "spectral",
    },
    culturalReference: "Spectral music (Grisey/Murail)",
  };
}

function generatePolychord(root: string, emotion: AdvancedEmotionAnalysis): ChordData {
  // Select polychord based on emotion
  const polychordMap = {
    dramatic: ["C/F#", "D♭/C", "E♭/E"],
    mystical: ["D/E♭", "F/G♭", "E/F"],
    expansive: ["C/G", "F/C", "B♭/F"],
  };

  const type =
    emotion.tension > 0.7
      ? "dramatic"
      : (emotion.gems?.wonder ?? 0) > 0.7
        ? "mystical"
        : "expansive";

  const options = polychordMap[type];
  const selected = options[Math.floor(Math.random() * options.length)];
  const [bottom, top] = selected.split("/");

  const bottomChord = safeGetChord(bottom);
  const topChord = safeGetChord(top);

  return {
    symbol: selected,
    chord: {
      root: bottomChord.root,
      notes: [...bottomChord.notes, ...topChord.notes],
      intervals: [...bottomChord.intervals, ...topChord.intervals],
      quality: "polychord",
    },
    context: {
      harmonic: "polychord",
    },
    culturalReference:
      type === "dramatic" ? "Stravinsky Rite of Spring" : "Modern film scoring",
  };
}

function generateAdvancedHarmony(emotion: AdvancedEmotionAnalysis, options?: ChordOptions): ChordData {
  const root = options?.preferredRoot || selectRoot(emotion);

  // For high tension, use altered dominants or diminished
  if (emotion.tension > 0.8) {
    const alterations = ["7b9", "7#9", "7alt", "13b9#11"];
    const quality = alterations[Math.floor(Math.random() * alterations.length)];
    return {
      symbol: root + quality,
      chord: buildAlteredChord(root, quality),
      context: {
        harmonic: "altered",
      },
    };
  }

  // For complex emotions, use modal interchange
  if (emotion.complexity > 0.7) {
    return generateModalInterchange(root, emotion);
  }

  // Default to extended harmony
  const qualities = ["maj7#11", "m11", "maj13", "m13"];
  const quality = qualities[Math.floor(Math.random() * qualities.length)];

  return {
    symbol: root + quality,
    chord: safeGetChord(root + quality),
    context: {
      harmonic: "extended",
    },
  };
}

function buildAlteredChord(root: string, quality: string): {
  root: string;
  notes: string[];
  intervals: string[];
  quality: string;
} {
  const baseChord = safeGetChord(root + "7");
  const notes = [...baseChord.notes];
  const intervals = [...baseChord.intervals];

  // Add alterations based on quality
  if (quality.includes("b9")) {
    notes.push(Note.transpose(root, "2m"));
    intervals.push("9m");
  }
  if (quality.includes("#9")) {
    notes.push(Note.transpose(root, "2A"));
    intervals.push("9A");
  }
  if (quality.includes("#11")) {
    notes.push(Note.transpose(root, "4A"));
    intervals.push("11A");
  }
  if (quality.includes("b13")) {
    notes.push(Note.transpose(root, "6m"));
    intervals.push("13m");
  }

  return {
    root,
    notes,
    intervals,
    quality,
  };
}

function generateModalInterchange(root: string, emotion: AdvancedEmotionAnalysis): ChordData {
  // Borrow chords from parallel modes
  const borrowings = {
    melancholic: {
      chord: "m6",
      mode: "dorian",
      description: "Borrowed from dorian mode",
    },
    nostalgic: {
      chord: "mMaj7",
      mode: "melodic minor",
      description: "Borrowed from melodic minor",
    },
    dark: {
      chord: "dim7",
      mode: "locrian",
      description: "Borrowed from locrian mode",
    },
    mystical: {
      chord: "maj7#5",
      mode: "lydian augmented",
      description: "Borrowed from lydian augmented",
    },
  };

  const emotionType =
    (emotion.gems?.sadness ?? 0) > 0.7
      ? "melancholic"
      : (emotion.gems?.nostalgia ?? 0) > 0.7
        ? "nostalgic"
        : emotion.tension > 0.7
          ? "dark"
          : "mystical";

  const borrowed = borrowings[emotionType];

  return {
    symbol: root + borrowed.chord,
    chord: safeGetChord(root + borrowed.chord),
    context: {
      harmonic: "modal_interchange",
    },
    culturalReference: borrowed.description,
  };
}

function selectFromValenceArousal(emotion: AdvancedEmotionAnalysis, options?: ChordOptions): ChordData {
  const root = options?.preferredRoot || selectRoot(emotion);
  let quality = "";

  // Quadrant-based selection
  if (emotion.valence > 0.5 && emotion.arousal > 0.5) {
    // Happy, excited
    const qualities = ["maj7", "maj9", "6/9", "maj13"];
    quality = qualities[Math.floor(Math.random() * qualities.length)];
  } else if (emotion.valence > 0.5 && emotion.arousal < 0.5) {
    // Peaceful, content
    const qualities = ["maj7", "add9", "sus2", "6"]; // Changed maj6 to 6
    quality = qualities[Math.floor(Math.random() * qualities.length)];
  } else if (emotion.valence < -0.5 && emotion.arousal > 0.5) {
    // Angry, anxious
    const qualities = ["7b9", "m7b5", "dim7", "7alt"];
    quality = qualities[Math.floor(Math.random() * qualities.length)];
  } else {
    // Sad, melancholic
    const qualities = ["m7", "m9", "m6", "mMaj7"];
    quality = qualities[Math.floor(Math.random() * qualities.length)];
  }

  const symbol = root + quality;
  return {
    symbol,
    chord: safeGetChord(symbol),
    context: {},
  };
}
