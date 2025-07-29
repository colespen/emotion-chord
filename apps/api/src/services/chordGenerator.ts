import { Chord, Note } from "tonal";
import type { EmotionAnalysis, ChordSuggestion } from "../types/emotion.js";
import {
  CHORD_EMOTIONAL_WEIGHTS,
  EMOTION_MUSICAL_CHARACTERISTICS,
} from "../config/musicalMappings.js";

// Cache for chord calculations to improve performance
const chordCache = new Map<string, any>();
const midiCache = new Map<string, number>();

export class ChordGenerator {
  // Static method to clear caches if needed (useful for long-running applications)
  static clearCaches(): void {
    chordCache.clear();
    midiCache.clear();
  }

  generateChord(
    emotion: EmotionAnalysis,
    overrideRoot?: string,
    overrideQuality?: string
  ): ChordSuggestion {
    const root = overrideRoot || this.selectRoot(emotion);
    const quality = overrideQuality || this.selectQuality(emotion);
    const chordSymbol = `${root}${quality}`;

    // Use cache for chord calculations
    let chord = chordCache.get(chordSymbol);
    if (!chord) {
      chord = Chord.get(chordSymbol);
      chordCache.set(chordSymbol, chord);
    }

    if (!chord.notes || chord.notes.length === 0) {
      throw new Error(`Invalid chord: ${chordSymbol}`);
    }

    // Calculate MIDI notes more efficiently
    const midiNotes = this.calculateMidiNotes(chord.notes);

    // Generate voicing - this should be DIFFERENT from midiNotes
    const voicing = this.generateVoicing(chord, emotion);

    // Round confidence and resonance to 2 decimal places
    const confidence =
      Math.round(
        this.calculateConfidence(emotion, chord.quality || quality) * 100
      ) / 100;
    const emotionalResonance =
      Math.round(
        this.calculateResonance(emotion, chord.quality || quality) * 100
      ) / 100;

    return {
      symbol: chordSymbol,
      root: chord.root || root,
      quality: chord.quality || quality,
      notes: chord.notes,
      intervals: chord.intervals,
      midiNotes: midiNotes,
      voicing: voicing,
      confidence: confidence,
      emotionalResonance: emotionalResonance,
      musicalJustification: this.generateJustification(emotion, chordSymbol),
    };
  }

  generateAlternatives(
    emotion: EmotionAnalysis,
    count: number = 3
  ): ChordSuggestion[] {
    const alternatives: ChordSuggestion[] = [];
    const usedSymbols = new Set<string>();

    // Get the primary chord to avoid duplicating it
    const primaryRoot = this.selectRoot(emotion);
    const primaryQuality = this.selectQuality(emotion);
    usedSymbols.add(`${primaryRoot}${primaryQuality}`);

    // For high tension emotions like anger, use a curated list of appropriate qualities
    let possibleQualities: string[];

    if (emotion.tension > 0.7 && emotion.valence < -0.5) {
      // Anger, fear, etc - use very tense chords
      possibleQualities = [
        "7b9",
        "7#9",
        "m7b5",
        "7alt",
        "dim7",
        "aug",
        "7#11",
        "mMaj7",
      ];
    } else if (emotion.valence < -0.3) {
      // Sad, melancholic - use minor variants
      possibleQualities = ["m7", "m9", "m11", "m6", "mMaj7", "m7b5"];
    } else if (emotion.valence > 0.3) {
      // Happy, excited - use major variants
      possibleQualities = ["maj7", "maj9", "6", "add9", "sus2", "maj7#11"];
    } else {
      // Neutral - use modal chords
      possibleQualities = ["7", "m7", "maj7", "sus4", "9", "11"];
    }

    const possibleRoots =
      emotion.valence > 0
        ? EMOTION_MUSICAL_CHARACTERISTICS.positive.preferredRoots
        : EMOTION_MUSICAL_CHARACTERISTICS.negative.preferredRoots;

    // First, try to use each different quality once
    for (
      let i = 0;
      i < possibleQualities.length && alternatives.length < count;
      i++
    ) {
      const quality = possibleQualities[i];

      // Skip if this is the same quality as primary
      if (quality === primaryQuality) continue;

      // Try different roots for this quality
      for (const root of possibleRoots) {
        const symbol = `${root}${quality}`;

        if (!usedSymbols.has(symbol)) {
          usedSymbols.add(symbol);
          try {
            const suggestion = this.generateChord(emotion, root, quality);
            alternatives.push(suggestion);
            break; // Move to next quality after finding valid root
          } catch (e) {
            // Try next root
          }
        }
      }
    }

    // If we still need more, cycle through with different root/quality combinations
    if (alternatives.length < count) {
      for (
        let rootIdx = 0;
        rootIdx < possibleRoots.length && alternatives.length < count;
        rootIdx++
      ) {
        for (
          let qualIdx = 0;
          qualIdx < possibleQualities.length && alternatives.length < count;
          qualIdx++
        ) {
          const root = possibleRoots[rootIdx];
          const quality = possibleQualities[qualIdx];
          const symbol = `${root}${quality}`;

          if (!usedSymbols.has(symbol)) {
            usedSymbols.add(symbol);
            try {
              const suggestion = this.generateChord(emotion, root, quality);
              alternatives.push(suggestion);
            } catch (e) {
              // Skip invalid chords
            }
          }
        }
      }
    }

    return alternatives.slice(0, count);
  }

  private calculateMidiNotes(notes: string[]): number[] {
    const midiNotes: number[] = [];
    let lastMidi = 0;

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const cacheKey = `${note}4`;
      
      let noteMidi = midiCache.get(cacheKey);
      if (noteMidi === undefined) {
        noteMidi = Note.midi(cacheKey) || 60;
        midiCache.set(cacheKey, noteMidi);
      }

      // Ensure ascending order for first note or move to next octave
      if (i === 0) {
        lastMidi = noteMidi;
      } else {
        while (noteMidi <= lastMidi) {
          noteMidi += 12;
        }
        lastMidi = noteMidi;
      }

      midiNotes.push(noteMidi);
    }

    return midiNotes;
  }

  private selectRoot(emotion: EmotionAnalysis, variation: number = 0): string {
    const roots =
      emotion.valence > 0
        ? EMOTION_MUSICAL_CHARACTERISTICS.positive.preferredRoots
        : EMOTION_MUSICAL_CHARACTERISTICS.negative.preferredRoots;

    // Add some randomness based on variation
    const index =
      Math.floor((emotion.complexity + variation) * roots.length) %
      roots.length;
    return roots[index];
  }

  private selectQuality(
    emotion: EmotionAnalysis,
    variation: number = 0
  ): string {
    const candidateQualities = new Set<string>();

    // Select based on valence
    if (emotion.valence > 0.3) {
      EMOTION_MUSICAL_CHARACTERISTICS.positive.chordQualities.forEach(q => 
        candidateQualities.add(q)
      );
    } else if (emotion.valence < -0.3) {
      EMOTION_MUSICAL_CHARACTERISTICS.negative.chordQualities.forEach(q => 
        candidateQualities.add(q)
      );
    }

    // Add based on arousal
    if (emotion.arousal > 0.6) {
      EMOTION_MUSICAL_CHARACTERISTICS.highEnergy.chordQualities.forEach(q => 
        candidateQualities.add(q)
      );
    } else if (emotion.arousal < 0.4) {
      EMOTION_MUSICAL_CHARACTERISTICS.lowEnergy.chordQualities.forEach(q => 
        candidateQualities.add(q)
      );
    }

    // Add based on tension
    if (emotion.tension > 0.6) {
      EMOTION_MUSICAL_CHARACTERISTICS.tense.chordQualities.forEach(q => 
        candidateQualities.add(q)
      );
    } else if (emotion.tension < 0.4) {
      EMOTION_MUSICAL_CHARACTERISTICS.relaxed.chordQualities.forEach(q => 
        candidateQualities.add(q)
      );
    }

    // Score each quality (optimized to avoid creating new arrays)
    const qualityScores = new Map<string, number>();
    
    for (const quality of candidateQualities) {
      const weight = CHORD_EMOTIONAL_WEIGHTS[
        quality as keyof typeof CHORD_EMOTIONAL_WEIGHTS
      ];
      if (weight) {
        const score =
          Math.abs(weight.valence - emotion.valence) * -1 +
          Math.abs(weight.tension - emotion.tension) * -1 +
          Math.abs(weight.complexity - emotion.complexity) * -1;

        qualityScores.set(quality, score);
      }
    }

    // Convert to array only once and sort
    const sortedQualities = Array.from(qualityScores.entries())
      .sort((a, b) => b[1] - a[1]);

    const index = Math.floor(variation * sortedQualities.length) % sortedQualities.length;
    return sortedQualities[index]?.[0] || "maj7";
  }

  private generateVoicing(chord: any, emotion: EmotionAnalysis): number[] {
    const baseOctave = emotion.arousal > 0.5 ? 3 : 2; // Start lower for voicings
    const spread = emotion.complexity > 0.5 ? "wide" : "close";

    const notes = chord.notes;
    if (!notes || notes.length === 0) {
      return [48, 52, 55, 59]; // Default C major 7 voicing (C3, E3, G3, B3)
    }

    // For extended chords (5+ notes), we might want to omit some notes for playability
    const notesToVoice =
      notes.length > 4 ? this.selectVoicingNotes(chord, emotion) : notes;

    const voicing: number[] = [];

    if (spread === "close") {
      // Close voicing - compact spacing
      let lastMidi = this.getMidiNote(notesToVoice[0], baseOctave);
      voicing.push(lastMidi);

      // Add remaining notes close together
      for (let i = 1; i < notesToVoice.length; i++) {
        let midi = this.getMidiNote(notesToVoice[i], baseOctave);

        // Ensure ascending order
        while (midi <= lastMidi) {
          midi += 12;
        }

        // Keep within one octave if possible
        if (midi - voicing[0] > 12 && i < 3) {
          midi -= 12;
          if (midi <= lastMidi) midi += 12;
        }

        voicing.push(midi);
        lastMidi = midi;
      }
    } else {
      // Wide voicing - spread across multiple octaves
      voicing.push(this.getMidiNote(notesToVoice[0], baseOctave));

      if (notesToVoice.length > 1) {
        voicing.push(this.getMidiNote(notesToVoice[1], baseOctave + 1));
      }

      if (notesToVoice.length > 2) {
        voicing.push(this.getMidiNote(notesToVoice[2], baseOctave + 1));
      }

      if (notesToVoice.length > 3) {
        voicing.push(this.getMidiNote(notesToVoice[3], baseOctave + 2));
      }

      // Any remaining extensions
      for (let i = 4; i < notesToVoice.length; i++) {
        voicing.push(this.getMidiNote(notesToVoice[i], baseOctave + 2));
      }
    }

    // Ensure voicing is sorted and within reasonable range
    return voicing
      .filter((midi) => midi >= 36 && midi <= 96) // C2 to C7
      .sort((a, b) => a - b);
  }

  private getMidiNote(note: string, octave: number): number {
    const cacheKey = `${note}${octave}`;
    let midi = midiCache.get(cacheKey);
    
    if (midi === undefined) {
      midi = Note.midi(cacheKey) || 60; // Default to middle C if note parsing fails
      midiCache.set(cacheKey, midi);
    }
    
    return midi;
  }

  private selectVoicingNotes(chord: any, emotion: EmotionAnalysis): string[] {
    const notes = chord.notes;
    if (notes.length <= 4) return notes;

    // For extended chords, prioritize: root, 3rd, 7th, then extensions
    const root = notes[0];
    const third = notes[1];
    const seventh = notes[3];

    // For high tension, include altered tones
    if (emotion.tension > 0.7) {
      // Include all notes for maximum dissonance
      return notes.slice(0, 5); // Limit to 5 notes max
    } else {
      // Standard voicing: root, 3rd, 7th, and one extension
      const extension = notes[4] || notes[2]; // 9th or 5th
      return [root, third, seventh, extension].filter(Boolean);
    }
  }

  private calculateConfidence(
    emotion: EmotionAnalysis,
    quality: string
  ): number {
    const weight =
      CHORD_EMOTIONAL_WEIGHTS[quality as keyof typeof CHORD_EMOTIONAL_WEIGHTS];
    if (!weight) return 0.5;

    const valenceDiff = Math.abs(weight.valence - emotion.valence);
    const tensionDiff = Math.abs(weight.tension - emotion.tension);

    return Math.max(0, 1 - (valenceDiff + tensionDiff) / 2);
  }

  private calculateResonance(
    emotion: EmotionAnalysis,
    quality: string
  ): number {
    const weight =
      CHORD_EMOTIONAL_WEIGHTS[quality as keyof typeof CHORD_EMOTIONAL_WEIGHTS];
    if (!weight) return 0.5;

    const resonance =
      (1 - Math.abs(weight.valence - emotion.valence)) * 0.4 +
      (1 - Math.abs(weight.tension - emotion.tension)) * 0.3 +
      (1 - Math.abs(weight.complexity - emotion.complexity)) * 0.3;

    return resonance;
  }

  private generateJustification(
    emotion: EmotionAnalysis,
    chordSymbol: string
  ): string {
    const chord = Chord.get(chordSymbol);
    const quality = chord.quality || "";

    // More efficient justification mapping
    const justificationMap: Record<string, string> = {
      major: `The major quality contrasts with the ${
        emotion.valence < 0 ? "negative" : "positive"
      } valence (${emotion.valence.toFixed(2)}), creating harmonic tension.`,
      minor: `The minor quality aligns with the ${
        emotion.valence < 0 ? "negative" : "neutral"
      } emotional valence (${emotion.valence.toFixed(2)}).`,
      dominant: `The dominant 7th quality adds tension matching the emotional intensity (tension: ${emotion.tension.toFixed(
        2
      )}).`,
      diminished: `The diminished quality reflects the high tension (${emotion.tension.toFixed(
        2
      )}) and ${emotion.valence < 0 ? "negative valence" : "complexity"}.`,
      augmented: `The augmented quality creates an unsettled feeling matching the emotional ${
        emotion.complexity > 0.5 ? "complexity" : "ambiguity"
      }.`,
      "7b9": `The 7b9 quality intensifies the ${
        emotion.valence < 0 ? "dark" : "tense"
      } emotional character with added dissonance.`,
      "7#9": `The 7#9 quality adds aggressive tension suitable for ${
        emotion.arousal > 0.7 ? "high arousal" : "complex"
      } emotions.`,
      m7b5: `The half-diminished quality balances darkness with sophistication, matching the emotional nuance.`,
    };

    // Check for specific chord types
    for (const [key, justification] of Object.entries(justificationMap)) {
      if (
        quality.toLowerCase().includes(key) ||
        chordSymbol.toLowerCase().includes(key)
      ) {
        return justification;
      }
    }

    // Default justification based on emotion characteristics
    if (emotion.tension > 0.7) {
      return `This ${quality} chord reflects the high emotional tension (${emotion.tension.toFixed(
        2
      )}) through its harmonic structure.`;
    } else if (emotion.complexity > 0.6) {
      return `The ${quality} chord captures the emotional complexity (${emotion.complexity.toFixed(
        2
      )}) with its rich harmonic content.`;
    } else {
      return `This ${quality} chord balances the emotional valence (${emotion.valence.toFixed(
        2
      )}) with appropriate harmonic tension.`;
    }
  }
}
