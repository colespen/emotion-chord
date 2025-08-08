/**
 * chord selection logic
 * pure functions for selecting chords based on emotions
 */

import { Chord, Note } from "tonal";
import type { AdvancedEmotionAnalysis } from "@/types/emotionChord";
import type { GEMSEmotions } from "@/types/common";
import type { ChordOptions, ChordData } from "@/types/chords";
import { ADVANCED_EMOTION_MAPPINGS } from "../config/musicalMappings";
import { BRIGHT_ROOTS, DARK_ROOTS, AMBIGUOUS_ROOTS } from "../constants/music";
import { MODAL_INTERCHANGE_BORROWINGS, POLYCHORD_MAP } from "../constants/harmony";

// interface for tonal.js chord object
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
 * normalize chord symbols to be compatible with tonal.js
 * based on tonal.js documentation and testing
 */
function normalizeChordSymbol(symbol: string): string {
  // replace chord notation variations that tonal.js doesn't recognize
  return symbol
    .replace(/maj6/g, "6") // maj6 -> 6 (cmaj6 -> c6)
    .replace(/Maj6/g, "6") // maj6 -> 6
    .replace(/MAJ6/g, "6"); // maj6 -> 6
  // note: maj9, maj13 are valid in tonal.js, only maj6 needs normalization
}

/**
 * safe chord creation with fallback
 */
function safeGetChord(symbol: string): TonalChord {
  const normalizedSymbol = normalizeChordSymbol(symbol);
  const chord = Chord.get(normalizedSymbol) as TonalChord;

  // if chord is empty, try to fallback to a simpler version
  if (chord.empty) {
    console.warn(`Invalid chord symbol: ${symbol}, trying fallback`);

    // extract root and try basic major chord as fallback
    const root = symbol.match(/^[A-G][#b]?/)?.[0] || "C";
    const fallbackChord = Chord.get(root) as TonalChord;

    return {
      ...fallbackChord,
      symbol: normalizedSymbol, // keep the intended symbol
    };
  }

  return {
    ...chord,
    symbol: normalizedSymbol,
  };
}

/**
 * select a chord based on emotion analysis
 */
export function selectFromEmotion(
  emotion: AdvancedEmotionAnalysis,
  options?: ChordOptions
): ChordData {
  // check for specific gems emotions first
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

      // handle special chord types
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

  // check for high tension/complexity emotions
  if (emotion.tension > 0.7 && emotion.complexity > 0.6) {
    return generateAdvancedHarmony(emotion, options);
  }

  // default to sophisticated selection based on valence/arousal
  return selectFromValenceArousal(emotion, options);
}

/**
 * get the dominant gems emotion
 */
export function getDominantGEMS(gems: GEMSEmotions | undefined): string | null {
  if (!gems) return null;

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
 * select root note based on emotion and cultural context
 */
export function selectRoot(emotion: AdvancedEmotionAnalysis): string {
  // cultural context influences root selection
  if (emotion.culturalContext === "indian") {
    // indian music often centers on sa (c) or pa (g)
    return emotion.valence > 0 ? "C" : "G";
  } else if (emotion.culturalContext === "arabic") {
    // arabic music often uses d as tonic
    return "D";
  }

  // western root selection based on emotion
  if (emotion.valence > 0.5) {
    return BRIGHT_ROOTS[Math.floor(Math.random() * BRIGHT_ROOTS.length)];
  } else if (emotion.valence < -0.5) {
    return DARK_ROOTS[Math.floor(Math.random() * DARK_ROOTS.length)];
  } else {
    return AMBIGUOUS_ROOTS[Math.floor(Math.random() * AMBIGUOUS_ROOTS.length)];
  }
}

// helper functions for special chord types
function generateQuartalChord(root: string): ChordData {
  const notes: string[] = [root];
  const intervals = ["1P", "4P", "4P", "4P"];

  // build quartal stack
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

function generateSpectralChord(
  root: string,
  emotion: AdvancedEmotionAnalysis
): ChordData {
  // generate based on harmonic series
  const fundamentalMidi = Note.midi(root + "2") || 36;
  const harmonics = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13];
  const notes: string[] = [];

  // select harmonics based on emotion
  const selectedHarmonics =
    (emotion.gems?.transcendence ?? 0) > 0.7
      ? harmonics.slice(6) // higher harmonics for transcendence
      : harmonics.slice(2, 8); // middle harmonics for general use

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
      notes: notes.slice(0, 6), // limit to 6 notes
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
  const type =
    emotion.tension > 0.7
      ? "dramatic"
      : (emotion.gems?.wonder ?? 0) > 0.7
        ? "mystical"
        : "expansive";

  const options = POLYCHORD_MAP[type];
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

function generateAdvancedHarmony(
  emotion: AdvancedEmotionAnalysis,
  options?: ChordOptions
): ChordData {
  const root = options?.preferredRoot || selectRoot(emotion);

  // for high tension, use altered dominants or diminished
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

  // for complex emotions, use modal interchange
  if (emotion.complexity > 0.7) {
    return generateModalInterchange(root, emotion);
  }

  // default to extended harmony
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

function buildAlteredChord(
  root: string,
  quality: string
): {
  root: string;
  notes: string[];
  intervals: string[];
  quality: string;
} {
  const baseChord = safeGetChord(root + "7");
  const notes = [...baseChord.notes];
  const intervals = [...baseChord.intervals];

  // add alterations based on quality
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

function generateModalInterchange(
  root: string,
  emotion: AdvancedEmotionAnalysis
): ChordData {
  const emotionType =
    (emotion.gems?.sadness ?? 0) > 0.7
      ? "melancholic"
      : (emotion.gems?.nostalgia ?? 0) > 0.7
        ? "nostalgic"
        : emotion.tension > 0.7
          ? "dark"
          : "mystical";

  const borrowed = MODAL_INTERCHANGE_BORROWINGS[emotionType];

  return {
    symbol: root + borrowed.chord,
    chord: safeGetChord(root + borrowed.chord),
    context: {
      harmonic: "modal_interchange",
    },
    culturalReference: borrowed.description,
  };
}

function selectFromValenceArousal(
  emotion: AdvancedEmotionAnalysis,
  options?: ChordOptions
): ChordData {
  const root = options?.preferredRoot || selectRoot(emotion);
  let quality = "";

  // quadrant-based selection
  if (emotion.valence > 0.5 && emotion.arousal > 0.5) {
    // happy, excited
    const qualities = ["maj7", "maj9", "6/9", "maj13"];
    quality = qualities[Math.floor(Math.random() * qualities.length)];
  } else if (emotion.valence > 0.5 && emotion.arousal < 0.5) {
    // peaceful, content
    const qualities = ["maj7", "add9", "sus2", "6"]; // changed maj6 to 6
    quality = qualities[Math.floor(Math.random() * qualities.length)];
  } else if (emotion.valence < -0.5 && emotion.arousal > 0.5) {
    // angry, anxious
    const qualities = ["7b9", "m7b5", "dim7", "7alt"];
    quality = qualities[Math.floor(Math.random() * qualities.length)];
  } else {
    // sad, melancholic
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
