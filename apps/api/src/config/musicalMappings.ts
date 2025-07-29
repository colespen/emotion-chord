export const EMOTION_MUSICAL_CHARACTERISTICS = {
  // Valence mappings
  positive: {
    modes: ["major", "lydian", "mixolydian"],
    chordQualities: ["maj7", "maj9", "add9", "6", "sus2"],
    preferredRoots: ["C", "G", "D", "A", "F"],
  },
  negative: {
    modes: ["minor", "dorian", "phrygian"],
    chordQualities: ["m7", "m9", "m11", "m6", "mMaj7"],
    preferredRoots: ["A", "E", "D", "B", "F"],
  },

  // Arousal mappings
  highEnergy: {
    chordQualities: ["7", "13", "aug", "sus4", "7#11"],
    voicingSpread: "wide",
    addTensions: true,
  },
  lowEnergy: {
    chordQualities: ["maj7", "m7", "add9", "6"],
    voicingSpread: "close",
    addTensions: false,
  },

  // Tension mappings
  tense: {
    chordQualities: ["dim7", "m7b5", "7alt", "aug", "7b9"],
    preferDissonance: true,
  },
  relaxed: {
    chordQualities: ["maj7", "6", "add9", "sus2"],
    preferConsonance: true,
  },
};

export const CHORD_EMOTIONAL_WEIGHTS = {
  // Major family
  maj: { valence: 0.8, tension: 0.1, complexity: 0.1 },
  maj7: { valence: 0.9, tension: 0.1, complexity: 0.3 },
  maj9: { valence: 0.85, tension: 0.15, complexity: 0.5 },
  maj13: { valence: 0.8, tension: 0.2, complexity: 0.7 },
  "6": { valence: 0.75, tension: 0.2, complexity: 0.3 },
  add9: { valence: 0.85, tension: 0.1, complexity: 0.3 },
  "maj7#11": { valence: 0.7, tension: 0.3, complexity: 0.7 },

  // Minor family
  m: { valence: -0.6, tension: 0.3, complexity: 0.1 },
  m7: { valence: -0.5, tension: 0.3, complexity: 0.3 },
  m9: { valence: -0.4, tension: 0.3, complexity: 0.5 },
  m11: { valence: -0.45, tension: 0.35, complexity: 0.6 },
  m6: { valence: -0.3, tension: 0.4, complexity: 0.4 },
  mMaj7: { valence: -0.4, tension: 0.6, complexity: 0.6 },

  // Dominant family
  "7": { valence: 0.3, tension: 0.5, complexity: 0.3 },
  "9": { valence: 0.4, tension: 0.4, complexity: 0.5 },
  "13": { valence: 0.5, tension: 0.4, complexity: 0.7 },
  "7b9": { valence: -0.3, tension: 0.8, complexity: 0.7 },
  "7#9": { valence: 0.1, tension: 0.7, complexity: 0.8 },
  "7alt": { valence: -0.2, tension: 0.9, complexity: 0.9 },
  "7#11": { valence: 0.2, tension: 0.6, complexity: 0.8 },

  // Diminished/Augmented
  dim: { valence: -0.7, tension: 0.8, complexity: 0.4 },
  dim7: { valence: -0.8, tension: 0.9, complexity: 0.6 },
  m7b5: { valence: -0.6, tension: 0.7, complexity: 0.6 },
  aug: { valence: 0.0, tension: 0.8, complexity: 0.5 },

  // Sus chords
  sus2: { valence: 0.6, tension: 0.3, complexity: 0.2 },
  sus4: { valence: 0.4, tension: 0.5, complexity: 0.2 },
  "7sus4": { valence: 0.3, tension: 0.6, complexity: 0.4 },
};
