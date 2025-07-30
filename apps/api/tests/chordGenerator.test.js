import { describe, it, expect } from "vitest";
import { ChordGenerator } from "../dist/services/chordGenerator.js";

describe("ChordGenerator", () => {
  const chordGenerator = new ChordGenerator();

  const sadEmotion = {
    primaryEmotion: "sad",
    secondaryEmotions: ["gloomy", "melancholic"],
    valence: -0.7,
    arousal: 0.2,
    tension: 0,
    complexity: 0.3,
    musicalMode: "minor",
    suggestedTempo: 80,
  };

  it("should generate complete voicings for extended chords", () => {
    // test am11 chord specifically
    const am11Chord = chordGenerator.generateChord(sadEmotion, "A", "m11");

    expect(am11Chord.symbol).toBe("Am11");
    expect(am11Chord.notes).toHaveLength(6);
    expect(am11Chord.voicing).toHaveLength(6);
    expect(am11Chord.notes.length).toBe(am11Chord.voicing.length);

    // ensure no notes are too low (below g3 = midi 55)
    expect(Math.min(...am11Chord.voicing)).toBeGreaterThanOrEqual(55);
  });

  it("should generate complete voicings for 9th chords", () => {
    const am9Chord = chordGenerator.generateChord(sadEmotion, "A", "m9");

    expect(am9Chord.symbol).toBe("Am9");
    expect(am9Chord.notes).toHaveLength(5);
    expect(am9Chord.voicing).toHaveLength(5);
    expect(am9Chord.notes.length).toBe(am9Chord.voicing.length);
  });

  it("should generate alternatives with complete voicings", () => {
    const alternatives = chordGenerator.generateAlternatives(sadEmotion, 3);

    alternatives.forEach((chord) => {
      expect(chord.notes.length).toBe(chord.voicing.length);
      expect(chord.voicing.length).toBeGreaterThan(0);
      // ensure no chord voicings go too low
      expect(Math.min(...chord.voicing)).toBeGreaterThanOrEqual(55);
    });
  });

  it("should handle basic triads correctly", () => {
    const basicChord = chordGenerator.generateChord(sadEmotion, "A", "m");

    expect(basicChord.notes.length).toBe(basicChord.voicing.length);
    expect(basicChord.notes).toHaveLength(3);
  });
});
