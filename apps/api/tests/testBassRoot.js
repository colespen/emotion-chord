import { ChordGenerator } from '../dist/services/chordGenerator.js';

// Test the bass root logic specifically for Dm9
const chordGenerator = new ChordGenerator();

const sadEmotion = {
  primaryEmotion: "sad",
  secondaryEmotions: ["gloomy", "nostalgic"],
  valence: -0.7,
  arousal: 0.2,
  tension: 0,
  complexity: 0.5,
  musicalMode: "minor",
  suggestedTempo: 80
};

console.log('🎵 Testing Bass Root Logic for Better Inversions...\n');

// Test Dm9 specifically - the problematic chord
const dm9Chord = chordGenerator.generateChord(sadEmotion, 'D', 'm9');
console.log('Dm9 Chord Analysis:');
console.log('Root:', dm9Chord.root);
console.log('Notes:', dm9Chord.notes);
console.log('Expected: ["D", "F", "A", "C", "E"]');
console.log('');
console.log('BEFORE (problematic): [57, 60, 62, 64, 65] = A3, C4, D4, E4, F4');
console.log('AFTER (with bass):   ', dm9Chord.voicing);

// Convert MIDI to note names for clarity
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const voicingNotes = dm9Chord.voicing.map(midi => {
  const octave = Math.floor(midi / 12) - 1;
  const noteName = noteNames[midi % 12];
  return `${noteName}${octave}`;
});

console.log('Voicing as notes:    ', voicingNotes);
console.log('');

// Check if it starts with D (root)
const lowestNote = noteNames[dm9Chord.voicing[0] % 12];
if (lowestNote === 'D') {
  console.log('✅ SUCCESS: Voicing starts with root (D)');
  console.log('   This will sound like a proper Dm9 chord');
} else {
  console.log('❌ ISSUE: Voicing starts with', lowestNote);
  console.log('   This may sound like a different chord');
}

console.log('\n' + '─'.repeat(60) + '\n');

// Test a few more chords to verify the logic
const testChords = [
  { root: 'C', quality: 'maj9', name: 'Cmaj9' },
  { root: 'F', quality: 'm7', name: 'Fm7' },
  { root: 'G', quality: '7', name: 'G7' }
];

testChords.forEach(test => {
  const chord = chordGenerator.generateChord(sadEmotion, test.root, test.quality);
  const lowestNote = noteNames[chord.voicing[0] % 12];
  const startsWithRoot = lowestNote === test.root;
  
  console.log(`${test.name}:`);
  console.log(`  Voicing: ${chord.voicing}`);
  console.log(`  Starts with: ${lowestNote} ${startsWithRoot ? '✅' : '❌'}`);
  console.log('');
});
