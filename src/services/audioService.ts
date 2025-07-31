/**
 * Audio Service - Functional Implementation
 * Pure functions for audio synthesis with React hook for state management
 */

import * as Tone from "tone";
import type {
  AdvancedChordSuggestion,
  ChordProgression,
  AdvancedEmotionAnalysis,
} from "@/types/emotionChord";

// Types for audio state management
export interface AudioState {
  isInitialized: boolean;
  isArpeggioPlaying: boolean;
  isProgressionPlaying: boolean;
  isProgressionLooping: boolean;
  currentChordIndex: number;
}

export interface AudioConfig {
  volume: number;
  reverb: { decay: number; wet: number };
  filter: { frequency: number; type: "lowpass" | "highpass"; rolloff: -12 | -24 };
  compressor: { threshold: number; ratio: number; attack: number; release: number };
}

// Default audio configuration
export const defaultAudioConfig: AudioConfig = {
  volume: -8,
  reverb: { decay: 1.2, wet: 0.2 },
  filter: { frequency: 1200, type: "lowpass", rolloff: -12 },
  compressor: { threshold: -12, ratio: 3, attack: 0.003, release: 0.1 },
};

/**
 * Initialize audio synthesis with configuration
 * Pure function that returns configured synth and effects chain
 */
export async function createAudioSynth(
  config: AudioConfig = defaultAudioConfig
): Promise<Tone.PolySynth> {
  // Start audio context if needed
  if (Tone.getContext().state !== "running") {
    await Tone.start();
  }

  // Set destination volume
  Tone.getDestination().volume.value = -12;

  // Create synth
  const synth = new Tone.PolySynth(Tone.Synth, {
    volume: config.volume,
    envelope: {
      attack: 0.02,
      decay: 0.2,
      sustain: 0.65,
      release: 1.2,
    },
    oscillator: {
      type: "triangle",
    },
  });

  // Create effects chain
  const reverb = new Tone.Reverb(config.reverb);
  const filter = new Tone.Filter(config.filter);
  const compressor = new Tone.Compressor(config.compressor);

  // Connect effects chain
  synth.connect(filter);
  filter.connect(reverb);
  reverb.connect(compressor);
  compressor.toDestination();

  return synth;
}

/**
 * Convert MIDI note number to frequency
 * Pure function for frequency conversion
 */
export function midiToFrequency(midiNote: number): number {
  return Tone.Frequency(midiNote, "midi").toFrequency();
}

/**
 * Calculate arpeggio speed based on tempo
 * Pure function for tempo calculation
 */
export function calculateArpeggioSpeed(tempo: number): number {
  return 60 / (tempo * 2);
}

/**
 * Get chord frequencies from chord data
 * Pure function for frequency extraction
 */
export function getChordFrequencies(chord: AdvancedChordSuggestion): number[] {
  if (chord.midiNotes && chord.midiNotes.length > 0) {
    return chord.midiNotes.map(midiToFrequency);
  }

  if (chord.voicing?.notes && chord.voicing.notes.length > 0) {
    return chord.voicing.notes.map(midiToFrequency);
  }

  // Fallback to note names
  const noteToMidi: Record<string, number> = {
    C: 60,
    "C#": 61,
    Db: 61,
    D: 62,
    "D#": 63,
    Eb: 63,
    E: 64,
    F: 65,
    "F#": 66,
    Gb: 66,
    G: 67,
    "G#": 68,
    Ab: 68,
    A: 69,
    "A#": 70,
    Bb: 70,
    B: 71,
  };

  return chord.notes.map((note) => {
    const midiNote = noteToMidi[note] || 60;
    return midiToFrequency(midiNote + 12);
  });
}

/**
 * Get arpeggio frequencies sorted from low to high
 * Pure function for arpeggio frequency arrangement
 */
export function getArpeggioFrequencies(chord: AdvancedChordSuggestion): number[] {
  return [...getChordFrequencies(chord)].sort((a, b) => a - b);
}

/**
 * Get velocity value from dynamics marking
 * Pure function for dynamics conversion
 */
export function getDynamicsVelocity(dynamics?: string): number {
  switch (dynamics) {
    case "pp":
      return 0.2;
    case "p":
      return 0.4;
    case "mf":
      return 0.6;
    case "f":
      return 0.8;
    case "ff":
      return 1.0;
    default:
      return 0.6;
  }
}

/**
 * Play a chord with specified duration
 * Pure function for chord playback
 */
export async function playChord(
  synth: Tone.PolySynth,
  chord: AdvancedChordSuggestion,
  duration: string = "4n"
): Promise<void> {
  const frequencies = getChordFrequencies(chord);
  const velocity = getDynamicsVelocity(chord.dynamics);
  synth.triggerAttackRelease(frequencies, duration, undefined, velocity);
}

/**
 * Play an arpeggio pattern
 * Pure function for arpeggio playback
 */
export async function playArpeggio(
  synth: Tone.PolySynth,
  chord: AdvancedChordSuggestion,
  emotion?: AdvancedEmotionAnalysis,
  noteLength: string = "8n"
): Promise<void> {
  const frequencies = getArpeggioFrequencies(chord);
  const velocity = getDynamicsVelocity(chord.dynamics);
  const noteDelay = emotion ? calculateArpeggioSpeed(emotion.suggestedTempo) : 0.15;

  // Cancel any existing scheduled events
  Tone.getTransport().cancel();

  // Schedule arpeggio notes
  frequencies.forEach((freq, index) => {
    Tone.getTransport().schedule(
      (time) => {
        synth.triggerAttackRelease(freq, noteLength, time, velocity);
      },
      `+${index * noteDelay}`
    );
  });

  // Start transport and schedule stop
  Tone.getTransport().start();
  Tone.getTransport().schedule(
    () => {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
    },
    `+${frequencies.length * noteDelay + 1}`
  );
}

/**
 * Create arpeggio loop
 * Function for creating looping arpeggio pattern
 */
export function createArpeggioLoop(
  synth: Tone.PolySynth,
  chord: AdvancedChordSuggestion,
  emotion?: AdvancedEmotionAnalysis,
  noteLength: string = "8n"
): Tone.Loop {
  const frequencies = getArpeggioFrequencies(chord);
  const velocity = getDynamicsVelocity(chord.dynamics);
  const arpeggioSpeed = emotion ? calculateArpeggioSpeed(emotion.suggestedTempo) : 0.3;

  let currentIndex = 0;
  let direction = 1;

  return new Tone.Loop((time) => {
    synth.triggerAttackRelease(frequencies[currentIndex], noteLength, time, velocity);

    currentIndex += direction;

    if (currentIndex >= frequencies.length) {
      currentIndex = frequencies.length - 2;
      direction = -1;
    } else if (currentIndex < 0) {
      currentIndex = 1;
      direction = 1;
    }
  }, arpeggioSpeed);
}

/**
 * Create progression sequence
 * Function for creating chord progression playback
 */
export function createProgressionSequence(
  synth: Tone.PolySynth,
  progression: ChordProgression,
  onChordChange?: (index: number) => void
): Tone.Sequence {
  // Set transport tempo
  Tone.getTransport().bpm.value = progression.tempo;

  const events = progression.chords.map((chord, index) => ({
    time: index * 4,
    chord,
    index,
  }));

  return new Tone.Sequence(
    (time, data) => {
      onChordChange?.(data.index);

      // Get chord frequencies - simplified for now
      // TODO: Use actual chord data for more accurate playback
      const frequencies = [220, 277, 330, 415]; // Should be derived from chord data
      const duration = `${data.chord.duration}n` as Tone.Unit.Time;

      synth.triggerAttackRelease(frequencies, duration, time);
    },
    events,
    "4n"
  );
}

/**
 * Stop all audio and clean up
 * Pure function for audio cleanup
 */
export function stopAllAudio(
  synth?: Tone.PolySynth,
  arpeggioLoop?: Tone.Loop,
  progressionSequence?: Tone.Sequence
): void {
  // Release all synth voices
  synth?.releaseAll();

  // Stop and dispose arpeggio loop
  if (arpeggioLoop) {
    arpeggioLoop.stop();
    arpeggioLoop.dispose();
  }

  // Stop and dispose progression sequence
  if (progressionSequence) {
    progressionSequence.stop();
    progressionSequence.dispose();
  }

  // Stop transport
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
}

/**
 * Dispose audio resources
 * Pure function for resource cleanup
 */
export function disposeAudio(synth?: Tone.PolySynth): void {
  synth?.dispose();
}
