/**
 * Harmonic constants for advanced chord generation
 */

// Modal interchange borrowings for complex emotions
export const MODAL_INTERCHANGE_BORROWINGS = {
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
} as const;

// Polychord configurations for different emotional types
export const POLYCHORD_MAP = {
  dramatic: ["C/F#", "D♭/C", "E♭/E"],
  mystical: ["D/E♭", "F/G♭", "E/F"],
  expansive: ["C/G", "F/C", "B♭/F"],
} as const;