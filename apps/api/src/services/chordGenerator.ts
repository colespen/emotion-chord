import { Chord, Note } from "tonal";
import type {
  AdvancedEmotionAnalysis,
  AdvancedChordSuggestion,
  VoicingInfo,
  ChordProgression,
} from "../types/emotion.js";
import { ADVANCED_EMOTION_MAPPINGS } from "../config/musicalMappings.js";

export class AdvancedChordGenerator {
  private previousVoicing: number[] | null = null;

  generateChord(
    emotion: AdvancedEmotionAnalysis,
    options?: {
      preferredRoot?: string;
      voicingStyle?: string;
      avoidNotes?: string[];
      instrumentRange?: [number, number];
    }
  ): AdvancedChordSuggestion {
    // Select chord based on emotion
    const chordData = this.selectChordFromEmotion(emotion, options);

    // Generate sophisticated voicing
    const voicing = this.generateAdvancedVoicing(
      chordData.chord,
      emotion,
      options?.voicingStyle
    );

    // Calculate harmonic characteristics
    const harmonicAnalysis = this.analyzeHarmony(chordData.chord, emotion);

    return {
      symbol: chordData.symbol,
      root: chordData.chord.root || "",
      quality: chordData.chord.quality || "",
      notes: chordData.chord.notes,
      intervals: chordData.chord.intervals,
      midiNotes: chordData.chord.notes.map((n: string) => Note.midi(n + "4") || 60),
      voicing,
      harmonicFunction: harmonicAnalysis.function,
      harmonicComplexity: harmonicAnalysis.complexity,
      dissonanceLevel: harmonicAnalysis.dissonance,
      theoreticalContext: chordData.context,
      emotionalResonance: this.calculateResonance(emotion, chordData),
      emotionalJustification: this.generateJustification(emotion, chordData),
      culturalReference: chordData.culturalReference,
      timbre: this.suggestTimbre(emotion),
      dynamics: this.suggestDynamics(emotion),
      articulation: this.suggestArticulation(emotion),
    };
  }

  private selectChordFromEmotion(
    emotion: AdvancedEmotionAnalysis,
    options?: any
  ): {
    symbol: string;
    chord: any;
    context?: any;
    culturalReference?: string;
  } {
    // Check for specific GEMS emotions first
    if (emotion.gems) {
      const dominantGems = this.getDominantGEMS(emotion.gems);
      if (dominantGems && dominantGems in ADVANCED_EMOTION_MAPPINGS.gems) {
        const gemsMapping = ADVANCED_EMOTION_MAPPINGS.gems[dominantGems as keyof typeof ADVANCED_EMOTION_MAPPINGS.gems];
        const qualities = gemsMapping.chordQualities;
        const quality = qualities[Math.floor(Math.random() * qualities.length)];
        const root = options?.preferredRoot || this.selectRoot(emotion);

        // Handle special chord types
        if (quality === "quartal") {
          return this.generateQuartalChord(root, emotion);
        } else if (quality === "spectral") {
          return this.generateSpectralChord(root, emotion);
        } else if (quality === "polychord") {
          return this.generatePolychord(root, emotion);
        }

        const symbol = root + quality;
        return {
          symbol,
          chord: Chord.get(symbol),
          context: { gems: dominantGems },
        };
      }
    }

    // Check for high tension/complexity emotions
    if (emotion.tension > 0.7 && emotion.complexity > 0.6) {
      return this.generateAdvancedHarmony(emotion, options);
    }

    // Default to sophisticated selection based on valence/arousal
    return this.selectFromValenceArousal(emotion, options);
  }

  private generateQuartalChord(root: string, _emotion: AdvancedEmotionAnalysis) {
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
        isQuartal: true,
        modalInterchange: false,
      },
      culturalReference: "McCoy Tyner/modern jazz quartal harmony",
    };
  }

  private generateSpectralChord(
    root: string,
    emotion: AdvancedEmotionAnalysis
  ) {
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
        isSpectral: true,
        extendedHarmony: true,
      },
      culturalReference: "Spectral music (Grisey/Murail)",
    };
  }

  private generatePolychord(_root: string, emotion: AdvancedEmotionAnalysis) {
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

    const bottomChord = Chord.get(bottom);
    const topChord = Chord.get(top);

    return {
      symbol: selected,
      chord: {
        root: bottomChord.root,
        notes: [...bottomChord.notes, ...topChord.notes],
        intervals: [...bottomChord.intervals, ...topChord.intervals],
        quality: "polychord",
      },
      context: {
        isPolychord: true,
        extendedHarmony: true,
      },
      culturalReference:
        type === "dramatic"
          ? "Stravinsky Rite of Spring"
          : "Modern film scoring",
    };
  }

  private generateAdvancedHarmony(
    emotion: AdvancedEmotionAnalysis,
    options?: any
  ) {
    const root = options?.preferredRoot || this.selectRoot(emotion);

    // For high tension, use altered dominants or diminished
    if (emotion.tension > 0.8) {
      const alterations = ["7b9", "7#9", "7alt", "13b9#11"];
      const quality =
        alterations[Math.floor(Math.random() * alterations.length)];
      return {
        symbol: root + quality,
        chord: this.buildAlteredChord(root, quality),
        context: {
          extendedHarmony: true,
          chromaticMediant: false,
        },
      };
    }

    // For complex emotions, use modal interchange
    if (emotion.complexity > 0.7) {
      return this.generateModalInterchange(root, emotion);
    }

    // Default to extended harmony
    const qualities = ["maj7#11", "m11", "maj13", "m13"];
    const quality = qualities[Math.floor(Math.random() * qualities.length)];

    return {
      symbol: root + quality,
      chord: Chord.get(root + quality),
      context: {
        extendedHarmony: true,
      },
    };
  }

  private buildAlteredChord(root: string, quality: string): any {
    const baseChord = Chord.get(root + "7");
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

  private generateModalInterchange(
    root: string,
    emotion: AdvancedEmotionAnalysis
  ) {
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
      chord: Chord.get(root + borrowed.chord),
      context: {
        modalInterchange: true,
        borrowedFrom: borrowed.mode,
      },
      culturalReference: borrowed.description,
    };
  }

  private selectFromValenceArousal(
    emotion: AdvancedEmotionAnalysis,
    options?: any
  ) {
    const root = options?.preferredRoot || this.selectRoot(emotion);
    let quality = "";

    // Quadrant-based selection
    if (emotion.valence > 0.5 && emotion.arousal > 0.5) {
      // Happy, excited
      const qualities = ["maj7", "maj9", "6/9", "maj13"];
      quality = qualities[Math.floor(Math.random() * qualities.length)];
    } else if (emotion.valence > 0.5 && emotion.arousal < 0.5) {
      // Peaceful, content
      const qualities = ["maj7", "add9", "sus2", "maj6"];
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

    return {
      symbol: root + quality,
      chord: Chord.get(root + quality),
      context: {},
    };
  }

  private generateAdvancedVoicing(
    chord: any,
    emotion: AdvancedEmotionAnalysis,
    style?: string
  ): VoicingInfo {
    const voicingStyle = style || this.selectVoicingStyle(emotion);

    switch (voicingStyle) {
      case "drop2":
        return this.generateDrop2Voicing(chord, emotion);
      case "rootless":
        return this.generateRootlessVoicing(chord, emotion);
      case "cluster":
        return this.generateClusterVoicing(chord, emotion);
      case "quartal":
        return this.generateQuartalVoicing(chord, emotion);
      case "spread":
        return this.generateSpreadVoicing(chord, emotion);
      default:
        return this.generateStandardVoicing(chord, emotion);
    }
  }

  private generateDrop2Voicing(
    chord: any,
    emotion: AdvancedEmotionAnalysis
  ): VoicingInfo {
    const notes = chord.notes || [];
    if (notes.length < 4) {
      return this.generateStandardVoicing(chord, emotion);
    }

    // Drop 2: Take second voice from top and drop it an octave
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
      voiceLeadingScore: this.calculateVoiceLeading(drop2),
    };
  }

  private generateRootlessVoicing(
    chord: any,
    emotion: AdvancedEmotionAnalysis
  ): VoicingInfo {
    const notes = chord.notes || [];
    if (notes.length < 4) {
      return this.generateStandardVoicing(chord, emotion);
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
      voiceLeadingScore: this.calculateVoiceLeading(voicing),
    };
  }

  private generateClusterVoicing(
    chord: any,
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

  private generateQuartalVoicing(
    chord: any,
    _emotion: AdvancedEmotionAnalysis
  ): VoicingInfo {
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
      voiceLeadingScore: this.calculateVoiceLeading(notes),
    };
  }

  private generateSpreadVoicing(
    chord: any,
    _emotion: AdvancedEmotionAnalysis
  ): VoicingInfo {
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
      voiceLeadingScore: this.calculateVoiceLeading(voicing),
    };
  }

  private generateStandardVoicing(
    chord: any,
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
      voiceLeadingScore: this.calculateVoiceLeading(voicing),
    };
  }

  private selectVoicingStyle(emotion: AdvancedEmotionAnalysis): string {
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

  private calculateVoiceLeading(voicing: number[]): number {
    if (!this.previousVoicing) {
      this.previousVoicing = voicing;
      return 1.0;
    }

    let totalMovement = 0;
    const voices = Math.min(voicing.length, this.previousVoicing.length);

    for (let i = 0; i < voices; i++) {
      totalMovement += Math.abs(voicing[i] - this.previousVoicing[i]);
    }

    this.previousVoicing = voicing;

    // Convert to 0-1 score (lower movement = higher score)
    return Math.max(0, 1 - totalMovement / (voices * 12));
  }

  private analyzeHarmony(chord: any, emotion: AdvancedEmotionAnalysis) {
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

    // Determine function
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

  private getDominantGEMS(gems: any): string | null {
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

  private selectRoot(emotion: AdvancedEmotionAnalysis): string {
    // Cultural context influences root selection
    if (emotion.culturalContext === "indian") {
      // Indian music often centers on Sa (C) or Pa (G)
      return emotion.valence > 0 ? "C" : "G";
    } else if (emotion.culturalContext === "arabic") {
      // Arabic music often uses D as tonic
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

  private calculateResonance(
    emotion: AdvancedEmotionAnalysis,
    chordData: any
  ): number {
    let resonance = 0.5;

    // Check GEMS alignment
    if (emotion.gems && chordData.context?.gems) {
      resonance += 0.3;
    }

    // Check cultural alignment
    if (chordData.culturalReference) {
      resonance += 0.2;
    }

    return Math.min(1, resonance);
  }

  private generateJustification(
    emotion: AdvancedEmotionAnalysis,
    chordData: any
  ): string {
    const parts: string[] = [];

    // Emotion-based justification
    parts.push(
      `This ${chordData.chord.quality || "chord"} reflects the ${
        emotion.primaryEmotion
      } emotion`
    );

    // Technical justification
    if (chordData.context?.isQuartal) {
      parts.push("using quartal harmony for modern, open sound");
    } else if (chordData.context?.isPolychord) {
      parts.push("through polychordal tension");
    } else if (chordData.context?.modalInterchange) {
      parts.push(
        `borrowed from ${chordData.context.borrowedFrom || "parallel mode"}`
      );
    }

    // GEMS justification
    if (emotion.gems) {
      const dominant = this.getDominantGEMS(emotion.gems);
      if (dominant) {
        parts.push(`emphasizing the ${dominant} quality`);
      }
    }

    return parts.join(", ") + ".";
  }

  private suggestTimbre(emotion: AdvancedEmotionAnalysis): string {
    if (emotion.gems?.tenderness && emotion.gems.tenderness > 0.7)
      return "strings";
    if (emotion.gems?.power && emotion.gems.power > 0.7) return "brass";
    if (emotion.gems?.wonder && emotion.gems.wonder > 0.7) return "synth_pad";
    if (
      emotion.acousticFeatures?.acousticness &&
      emotion.acousticFeatures.acousticness > 0.7
    )
      return "piano";
    return "piano"; // Default
  }

  private suggestDynamics(emotion: AdvancedEmotionAnalysis): string {
    const intensity = emotion.emotionalIntensity;
    if (intensity > 0.8) return "ff";
    if (intensity > 0.6) return "f";
    if (intensity > 0.4) return "mf";
    if (intensity > 0.2) return "p";
    return "pp";
  }

  private suggestArticulation(emotion: AdvancedEmotionAnalysis): string {
    if (emotion.gems?.tension && emotion.gems.tension > 0.7) return "staccato";
    if (emotion.gems?.peacefulness && emotion.gems.peacefulness > 0.7)
      return "legato";
    if (emotion.arousal > 0.7) return "marcato";
    return "normal";
  }

  generateAlternatives(
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

      const chord = this.generateChord(emotion, {
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

  generateProgression(
    emotion: AdvancedEmotionAnalysis,
    length: number = 4
  ): ChordProgression {
    const chords: string[] = [];
    const romanNumerals: string[] = [];
    const voiceLeading: any[] = [];

    // Reset voice leading tracking
    this.previousVoicing = null;

    // Generate progression based on emotion
    for (let i = 0; i < length; i++) {
      const chord = this.generateChord(emotion);
      chords.push(chord.symbol);

      if (i > 0) {
        // Track voice leading
        voiceLeading.push({
          fromChord: chords[i - 1],
          toChord: chord.symbol,
          smoothness: chord.voicing.voiceLeadingScore || 0,
        });
      }
    }

    return {
      chords,
      romanNumerals,
      emotionalArc: this.describeEmotionalArc(emotion, chords),
      voiceLeading,
    };
  }

  private describeEmotionalArc(
    emotion: AdvancedEmotionAnalysis,
    _chords: string[]
  ): string {
    if (emotion.valence > 0.5) {
      return "Uplifting progression moving through bright harmonies";
    } else if (emotion.valence < -0.5) {
      return "Descending progression exploring darker territories";
    } else {
      return "Ambiguous progression balancing light and shadow";
    }
  }
}
