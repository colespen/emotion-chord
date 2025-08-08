/**
 * Music-related utility functions
 */

import { NOTE_NAMES, FLAT_NOTE_NAMES } from "../constants/music";

/**
 * Get proper note names considering chord context
 * Uses flat notation for flat-based chords (Bb, Eb, Ab, Db, Gb)
 */
export function getContextualNoteName(midiNote: number, chordSymbol: string): string {
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;

  // Use flat notation for flat-based chords
  const useFlatNotation = /^(Bb|Eb|Ab|Db|Gb|F)/.test(chordSymbol);

  const selectedNames = useFlatNotation ? FLAT_NOTE_NAMES : NOTE_NAMES;
  return selectedNames[noteIndex] + (octave >= 0 ? octave : "");
}

/**
 * Get the actual played notes in the order they're heard (lowest to highest)
 */
export function getPlayedNotes(chord: {
  midiNotes?: number[];
  notes: string[];
  symbol: string;
}): string[] {
  if (chord.midiNotes && chord.midiNotes.length > 0) {
    // Sort MIDI notes from lowest to highest (the order you actually hear them)
    const sortedMidiNotes = [...chord.midiNotes].sort((a, b) => a - b);
    return sortedMidiNotes.map((midiNote) =>
      getContextualNoteName(midiNote, chord.symbol)
    );
  }
  return chord.notes; // Fallback to theoretical notes
}

/**
 * Format MIDI notes array into a readable string
 */
export function formatMidiNotes(notes: number[]): string {
  return notes
    .map((note) => {
      const octave = Math.floor(note / 12) - 1;
      const noteName = NOTE_NAMES[note % 12];
      return `${noteName}${octave}`;
    })
    .join(" - ");
}

/**
 * Format duration from beats to measures and beats
 */
export function formatDuration(beats: number): string {
  const measures = Math.floor(beats / 4);
  const remainingBeats = beats % 4;

  if (measures > 0 && remainingBeats > 0) {
    return `${measures}m ${remainingBeats}b`;
  } else if (measures > 0) {
    return `${measures}m`;
  } else {
    return `${remainingBeats}b`;
  }
}
