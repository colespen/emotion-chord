import { ChordGenerator } from "../dist/services/chordGenerator.js";

// test the no-doubled-root logic for dm9
const chordGenerator = new ChordGenerator();

const sadEmotion = {
  primaryEmotion: "sad",
  secondaryEmotions: ["gloomy", "melancholic"],
  valence: -0.7,
  arousal: 0.2,
  tension: 0.04,
  complexity: 0.5,
  musicalMode: "minor",
  suggestedTempo: 80,
};

console.log("🎵 Testing No-Doubled-Root Logic...\n");

// test dm9 specifically
const dm9Chord = chordGenerator.generateChord(sadEmotion, "D", "m9");
console.log("Dm9 Chord Analysis:");
console.log("Notes:", dm9Chord.notes);
console.log('Expected notes: ["D", "F", "A", "C", "E"]');
console.log("");
console.log("BEFORE (doubled root): [50, 57, 60, 62, 64, 65] = D3, A3, C4, D4, E4, F4");
console.log("AFTER (no doubling):  ", dm9Chord.voicing);

// convert midi to note names for clarity
const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const voicingNotes = dm9Chord.voicing.map((midi) => {
  const octave = Math.floor(midi / 12) - 1;
  const noteName = noteNames[midi % 12];
  return `${noteName}${octave}`;
});

console.log("Voicing as notes:     ", voicingNotes);
console.log("Expected:            ", '["D3", "A3", "C4", "E4", "F4"]');

// check for root doubling
const rootCount = dm9Chord.voicing.filter(
  (midi) => noteNames[midi % 12] === "D"
).length;
console.log("");
console.log("Root (D) appears", rootCount, "time(s) in voicing");
if (rootCount === 1) {
  console.log("✅ SUCCESS: No root doubling");
} else {
  console.log("❌ ISSUE: Root is doubled");
}

// check if bass note is root
const bassNote = noteNames[dm9Chord.voicing[0] % 12];
console.log("Bass note:", bassNote);
console.log("Bass is root:", bassNote === "D" ? "✅ YES" : "❌ NO");

console.log("\n" + "─".repeat(60) + "\n");

// test a chord that naturally starts with root (should remain unchanged)
console.log("Testing chord that already starts with root...");
const am7Chord = chordGenerator.generateChord(sadEmotion, "A", "m7");
console.log("Am7 Chord:");
console.log("Voicing:", am7Chord.voicing);
const am7VoicingNotes = am7Chord.voicing.map((midi) => {
  const octave = Math.floor(midi / 12) - 1;
  const noteName = noteNames[midi % 12];
  return `${noteName}${octave}`;
});
console.log("As notes:", am7VoicingNotes);

const am7BassNote = noteNames[am7Chord.voicing[0] % 12];
const am7RootCount = am7Chord.voicing.filter(
  (midi) => noteNames[midi % 12] === "A"
).length;
console.log("Bass note:", am7BassNote, am7BassNote === "A" ? "✅" : "❌");
console.log("Root (A) count:", am7RootCount, am7RootCount === 1 ? "✅" : "❌");
