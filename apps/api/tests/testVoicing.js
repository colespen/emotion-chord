import { ChordGenerator } from "../dist/services/chordGenerator.js";

// test the updated voicing ranges
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

console.log("🎵 Testing Updated Voicing Ranges...\n");

// test em7 chord (the problematic one)
const em7Chord = chordGenerator.generateChord(sadEmotion, "E", "m7");
console.log("Em7 Chord:");
console.log("Notes:", em7Chord.notes);
console.log("Old Voicing (before): [40, 43, 47, 50] = E2, G2, B2, D3");
console.log("New Voicing (after): ", em7Chord.voicing);
console.log(
  "MIDI Range:",
  `${Math.min(...em7Chord.voicing)} - ${Math.max(...em7Chord.voicing)}`
);
console.log(
  "Lowest note is:",
  Math.min(...em7Chord.voicing) >= 55 ? "✅ G3 or higher" : "❌ Below G3"
);

console.log("\n" + "─".repeat(50) + "\n");

// test am11 chord
const am11Chord = chordGenerator.generateChord(sadEmotion, "A", "m11");
console.log("Am11 Chord:");
console.log("Notes:", am11Chord.notes);
console.log("Voicing:", am11Chord.voicing);
console.log(
  "MIDI Range:",
  `${Math.min(...am11Chord.voicing)} - ${Math.max(...am11Chord.voicing)}`
);
console.log(
  "Lowest note is:",
  Math.min(...am11Chord.voicing) >= 55 ? "✅ G3 or higher" : "❌ Below G3"
);

console.log("\n" + "─".repeat(50) + "\n");

// test am9 for comparison
const am9Chord = chordGenerator.generateChord(sadEmotion, "A", "m9");
console.log("Am9 Chord (reference):");
console.log("Notes:", am9Chord.notes);
console.log("Old Voicing (before): [45, 48, 52, 55, 59] = A2, C3, E3, G3, B3");
console.log("New Voicing (after): ", am9Chord.voicing);
console.log(
  "MIDI Range:",
  `${Math.min(...am9Chord.voicing)} - ${Math.max(...am9Chord.voicing)}`
);
console.log(
  "Lowest note is:",
  Math.min(...am9Chord.voicing) >= 55 ? "✅ G3 or higher" : "❌ Below G3"
);

// test alternatives
console.log("\n" + "─".repeat(50) + "\n");
console.log("🎵 Alternative Chords:");
const alternatives = chordGenerator.generateAlternatives(sadEmotion, 3);

alternatives.forEach((chord, index) => {
  const minNote = Math.min(...chord.voicing);
  console.log(`\n${index + 1}. ${chord.symbol}`);
  console.log("   Voicing:", chord.voicing);
  console.log("   Range:", `${minNote} - ${Math.max(...chord.voicing)}`);
  console.log("   Status:", minNote >= 55 ? "✅ Good range" : "❌ Too low");
});
