/**
 * Voicing and chord description constants
 */

// Descriptive text for different voicing types
export const VOICING_DESCRIPTIONS = {
  close: "Close voicing (notes within an octave)",
  open: "Open voicing (notes spread across octaves)",
  drop2: "Drop 2 voicing (second voice dropped an octave)",
  drop3: "Drop 3 voicing (third voice dropped an octave)",
  rootless: "Rootless voicing (sophisticated jazz style)",
  cluster: "Cluster voicing (adjacent tones for texture)",
  quartal: "Quartal voicing (stacked fourths)",
  spread: "Spread voicing (wide range distribution)",
} as const;
