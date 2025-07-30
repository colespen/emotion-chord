// Extended emotion-to-harmony mappings based on research
export const ADVANCED_EMOTION_MAPPINGS = {
  // GEMS-based mappings
  gems: {
    joy: {
      chordQualities: ["maj7", "maj9", "maj13", "6/9", "add9", "maj7#11"],
      voicingPreference: "open",
      harmonicFeatures: ["bright", "consonant", "stable"],
    },
    sadness: {
      chordQualities: ["m7", "m9", "m11", "m6", "mMaj7", "m7b5"],
      voicingPreference: "close",
      harmonicFeatures: ["dark", "introspective", "descending"],
    },
    tension: {
      chordQualities: ["7alt", "7b9", "7#9", "dim7", "aug", "7#11", "13b9"],
      voicingPreference: "cluster",
      harmonicFeatures: ["dissonant", "unstable", "chromatic"],
    },
    wonder: {
      chordQualities: ["maj7#11", "maj13#11", "sus", "quartal", "maj7/5"],
      voicingPreference: "spread",
      harmonicFeatures: ["ethereal", "floating", "modal"],
    },
    peacefulness: {
      chordQualities: ["maj7", "add9", "sus2", "6", "maj9"],
      voicingPreference: "open",
      harmonicFeatures: ["consonant", "stable", "spacious"],
    },
    power: {
      chordQualities: ["5", "sus4", "7", "maj", "m"],
      voicingPreference: "dense",
      harmonicFeatures: ["strong", "direct", "forceful"],
    },
    tenderness: {
      chordQualities: ["maj7", "m7", "maj9", "m9", "6"],
      voicingPreference: "close",
      harmonicFeatures: ["gentle", "warm", "intimate"],
    },
    nostalgia: {
      chordQualities: ["m6", "mMaj7", "maj6", "m7", "dim7"],
      voicingPreference: "rootless",
      harmonicFeatures: ["bittersweet", "yearning", "chromatic"],
    },
    transcendence: {
      chordQualities: ["maj7#11", "spectral", "quartal", "polychord"],
      voicingPreference: "spread",
      harmonicFeatures: ["otherworldly", "expansive", "overtone-based"],
    },
  },

  // Cross-cultural mappings
  cultural: {
    indian: {
      Hamsadhwani: { emotion: "joy", notes: ["C", "D", "E", "G", "B"] },
      "Gujari Todi": {
        emotion: "compassion",
        notes: ["C", "Db", "Eb", "F#", "G", "Ab", "B"],
      },
      Bhairav: {
        emotion: "austere",
        notes: ["C", "Db", "E", "F", "G", "Ab", "B"],
      },
      Yaman: {
        emotion: "romantic",
        notes: ["C", "D", "E", "F#", "G", "A", "B"],
      },
      Marwa: {
        emotion: "sunset_longing",
        notes: ["C", "Db", "E", "F#", "G", "A", "B"],
      },
    },
    arabic: {
      Rast: { emotion: "pride", notes: ["C", "D", "E♭+", "F", "G", "A", "B♭"] },
      Saba: {
        emotion: "sadness",
        notes: ["D", "E♭", "F", "G♭", "A", "B♭", "C"],
      },
      Hijaz: {
        emotion: "mystical",
        notes: ["D", "E♭", "F#", "G", "A", "B♭", "C"],
      },
      Bayati: {
        emotion: "tender",
        notes: ["D", "E♭+", "F", "G", "A", "B♭", "C"],
      },
    },
  },

  // Advanced harmonic concepts
  advancedHarmony: {
    polychords: {
      dramatic_tension: ["C/F#", "E♭/E", "D♭/C", "A♭/A"],
      mystical: ["D/E♭", "F/G♭", "B♭/B", "E/F"],
      expansive: ["C/G", "F/C", "B♭/F", "E♭/B♭"],
    },
    quartal: {
      floating: ["C-F-B♭-E♭", "D-G-C-F", "E-A-D-G"],
      modern: ["A-D-G-C", "B-E-A-D", "F#-B-E-A"],
    },
    spectral: {
      ethereal: ["C-E-G-B♭-D-F#-A", "F-A-C-E♭-G-B-D"],
      luminous: ["G-B-D-F-A-C#-E", "D-F#-A-C-E-G#-B"],
    },
    clusters: {
      anxiety: ["C-C#-D", "F#-G-G#", "B-C-C#"],
      tension: ["E-F-F#-G", "A-B♭-B-C", "D-E♭-E-F"],
    },
  },
};

// Voice leading algorithms
export const VOICE_LEADING_RULES = {
  classical: {
    maxInterval: 8, // Maximum interval jump in semitones
    preferredInterval: 4, // Preferred maximum
    avoidParallels: true,
    smoothness: 0.8,
  },
  jazz: {
    maxInterval: 12,
    preferredInterval: 7,
    avoidParallels: false,
    smoothness: 0.6,
    preferRootless: true,
  },
  contemporary: {
    maxInterval: 24,
    preferredInterval: 12,
    avoidParallels: false,
    smoothness: 0.4,
  },
};

// Acoustic feature to emotion mappings (based on Spotify research)
export const ACOUSTIC_EMOTION_MAPPINGS = {
  highValenceHighArousal: {
    energy: [0.7, 1.0],
    valence: [0.7, 1.0],
    danceability: [0.6, 1.0],
    emotions: ["joy", "excitement", "euphoria"],
  },
  highValenceLowArousal: {
    energy: [0.0, 0.4],
    valence: [0.6, 1.0],
    acousticness: [0.5, 1.0],
    emotions: ["contentment", "peace", "serenity"],
  },
  lowValenceHighArousal: {
    energy: [0.6, 1.0],
    valence: [0.0, 0.3],
    emotions: ["anger", "fear", "anxiety"],
  },
  lowValenceLowArousal: {
    energy: [0.0, 0.4],
    valence: [0.0, 0.4],
    emotions: ["sadness", "melancholy", "grief"],
  },
};
