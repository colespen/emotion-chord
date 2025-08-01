/**
 * Chord Progression Generation Logic
 * Pure functions for generating chord progressions
 */

import type {
  AdvancedEmotionAnalysis,
  ChordProgression,
  VoiceLeadingInfo,
  ProgressionChord,
} from "@/types/emotionChord";
import * as chordSelection from "./chordSelection";
import * as voicing from "./voicing";
// import * as harmonic from "./harmonicAnalysis"; // Reserved for future harmonic analysis

/**
 * Generate a chord progression based on emotion
 */
export function generate(
  emotion: AdvancedEmotionAnalysis,
  length: number = 4
): ChordProgression {
  const chords: ProgressionChord[] = [];
  const romanNumerals: string[] = [];
  const voiceLeading: VoiceLeadingInfo[] = [];

  // Generate progression based on emotion
  for (let i = 0; i < length; i++) {
    // Generate chord data for this position
    const chordData = chordSelection.selectFromEmotion(emotion);
    const voicingInfo = voicing.generateVoicing(chordData.chord, emotion);

    // Create ProgressionChord object
    const progressionChord: ProgressionChord = {
      symbol: chordData.symbol,
      duration: 4, // Default to 4 beats per chord
      tension: emotion.tension,
      function: determineHarmonicFunction(i, length),
    };

    chords.push(progressionChord);

    // Generate roman numeral (simplified)
    romanNumerals.push(generateRomanNumeral(chordData.symbol, i));

    if (i > 0) {
      // Track voice leading
      voiceLeading.push({
        fromChord: chords[i - 1].symbol,
        toChord: chordData.symbol,
        voiceMovements: [], // Simplified - would need actual voice analysis
        smoothness: voicingInfo.voiceLeadingScore || 0,
      });
    }
  }

  return {
    chords,
    key: "C", // Default key - should be determined from emotion
    mode: emotion.musicalMode,
    tempo: emotion.suggestedTempo,
    totalDuration: length * 4, // 4 beats per chord
    type: "static", // Default type - should be determined from emotion
    complexity: emotion.complexity,
    tensionCurve: "plateau", // Default - should be determined from progression
    emotionalJourney: describeEmotionalArc(emotion),
    romanNumerals,
    voiceLeading,
  };
}

/**
 * Determine harmonic function based on position in progression
 */
function determineHarmonicFunction(position: number, length: number): string {
  if (position === 0) return "tonic";
  if (position === length - 1) return "tonic";
  if (position === Math.floor(length / 2)) return "dominant";
  return "subdominant";
}

/**
 * Generate appropriate progression patterns based on emotion
 */
export function getProgressionPattern(emotion: AdvancedEmotionAnalysis): string[] {
  // Classic progressions mapped to emotional qualities
  const patterns = {
    happy: ["I", "V", "vi", "IV"], // Classic pop progression
    sad: ["vi", "IV", "I", "V"], // Relative minor start
    dramatic: ["i", "bVII", "bVI", "bVII"], // Minor with borrowed chords
    peaceful: ["I", "vi", "ii", "V"], // Circle of fifths
    mysterious: ["i", "bII", "i", "V"], // Neapolitan sixth
    nostalgic: ["I", "iii", "vi", "IV"], // Doo-wop progression
    transcendent: ["I", "bVII", "IV", "I"], // Mixolydian feel
  };

  // Select pattern based on dominant emotion characteristics
  if (emotion.valence > 0.7) return patterns.happy;
  if (emotion.valence < -0.5) return patterns.sad;
  if (emotion.tension > 0.7) return patterns.dramatic;
  if (emotion.arousal < 0.3) return patterns.peaceful;
  if (emotion.complexity > 0.7) return patterns.mysterious;
  if (emotion.gems?.nostalgia && emotion.gems.nostalgia > 0.7)
    return patterns.nostalgic;
  if (emotion.gems?.transcendence && emotion.gems.transcendence > 0.7)
    return patterns.transcendent;

  // Default to peaceful progression
  return patterns.peaceful;
}

/**
 * Describe the emotional arc of a progression
 */
function describeEmotionalArc(emotion: AdvancedEmotionAnalysis): string {
  if (emotion.valence > 0.5) {
    return "Uplifting progression moving through bright harmonies";
  } else if (emotion.valence < -0.5) {
    return "Descending progression exploring darker territories";
  } else {
    return "Ambiguous progression balancing light and shadow";
  }
}

/**
 * Generate simplified roman numeral for chord in progression
 */
function generateRomanNumeral(chordSymbol: string, position: number): string {
  // Simplified mapping - in a real implementation this would be more sophisticated
  const romanNumerals = ["I", "V", "vi", "IV", "ii", "iii", "vii°"];
  return romanNumerals[position % romanNumerals.length];
}
