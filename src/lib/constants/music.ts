/**
 * Musical constants and note configurations
 */

// Note name arrays for different contexts
export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;
export const FLAT_NOTE_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

// Root note selections based on emotional context
export const BRIGHT_ROOTS = ["C", "G", "D", "A", "E"] as const;
export const DARK_ROOTS = ["F", "Bb", "Eb", "Ab", "Db"] as const;
export const AMBIGUOUS_ROOTS = ["B", "F#", "C#"] as const;
