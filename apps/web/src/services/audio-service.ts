import * as Tone from 'tone';
import type { ChordSuggestion } from '@/types/emotion-chord';

export class AudioService {
  private static synth: Tone.PolySynth | null = null;
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Create a polyphonic synthesizer for playing chords
    this.synth = new Tone.PolySynth(Tone.Synth, {
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.7,
        release: 2,
      },
      oscillator: {
        type: 'sawtooth',
      },
    }).toDestination();

    // Apply some effects for richer sound
    const reverb = new Tone.Reverb({
      decay: 1.5,
      wet: 0.3,
    });
    
    const filter = new Tone.Filter({
      frequency: 1000,
      type: 'lowpass',
    });

    this.synth.connect(filter);
    filter.connect(reverb);
    reverb.toDestination();

    this.isInitialized = true;
  }

  static async startAudioContext(): Promise<void> {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
  }

  static midiToFrequency(midiNote: number): number {
    return Tone.Frequency(midiNote, 'midi').toFrequency();
  }

  static async playChord(
    chord: ChordSuggestion,
    duration: string = '2n'
  ): Promise<void> {
    await this.initialize();
    await this.startAudioContext();

    if (!this.synth) {
      throw new Error('Audio synthesizer not initialized');
    }

    // Convert MIDI notes to frequencies
    const frequencies = chord.voicing.map(this.midiToFrequency);
    
    // Play the chord
    this.synth.triggerAttackRelease(frequencies, duration);
  }

  static async playArpeggio(
    chord: ChordSuggestion,
    noteLength: string = '8n'
  ): Promise<void> {
    await this.initialize();
    await this.startAudioContext();

    if (!this.synth) {
      throw new Error('Audio synthesizer not initialized');
    }

    const frequencies = chord.voicing.map(this.midiToFrequency);
    
    // Play notes in sequence with slight delay
    frequencies.forEach((freq, index) => {
      Tone.getTransport().schedule((time) => {
        this.synth!.triggerAttackRelease(freq, noteLength, time);
      }, `+${index * 0.2}`);
    });

    Tone.getTransport().start();
    
    // Stop transport after arpeggio completes
    Tone.getTransport().schedule(() => {
      Tone.getTransport().stop();
    }, `+${frequencies.length * 0.2 + 1}`);
  }

  static stopAll(): void {
    if (this.synth) {
      this.synth.releaseAll();
    }
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
  }

  static dispose(): void {
    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }
    this.isInitialized = false;
  }
}
