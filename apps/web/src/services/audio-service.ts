import * as Tone from 'tone';
import type { ChordSuggestion } from '@/types/emotion-chord';

export class AudioService {
  private static synth: Tone.PolySynth | null = null;
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Set master volume to prevent distortion
    Tone.getDestination().volume.value = -12; // Reduce master volume by 12dB

    // Create a polyphonic synthesizer for playing chords
    this.synth = new Tone.PolySynth(Tone.Synth, {
      volume: -8, // Additional volume reduction at synth level
      envelope: {
        attack: 0.02,
        decay: 0.2,
        sustain: 0.4,
        release: 1.5,
      },
      oscillator: {
        type: 'triangle', // Softer waveform than sawtooth
      },
    });

    // Apply effects for richer sound with controlled levels
    const reverb = new Tone.Reverb({
      decay: 1.2,
      wet: 0.2, // Reduced wet signal to prevent muddiness
    });
    
    const filter = new Tone.Filter({
      frequency: 1200,
      type: 'lowpass',
      rolloff: -12, // Gentler filter rolloff
    });

    // Add a compressor to control dynamics and prevent clipping
    const compressor = new Tone.Compressor({
      threshold: -12,
      ratio: 3,
      attack: 0.003,
      release: 0.1,
    });

    // Signal chain: synth -> filter -> reverb -> compressor -> destination
    this.synth.connect(filter);
    filter.connect(reverb);
    reverb.connect(compressor);
    compressor.toDestination();

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
    // Auto-initialize if not already done
    await this.initialize();
    await this.startAudioContext();

    if (!this.synth) {
      throw new Error('Audio synthesizer not initialized');
    }

    // Convert MIDI notes to frequencies
    const frequencies = chord.voicing.map(this.midiToFrequency);
    
    // Play the chord with controlled timing
    this.synth.triggerAttackRelease(frequencies, duration);
  }

  static async playArpeggio(
    chord: ChordSuggestion,
    noteLength: string = '8n'
  ): Promise<void> {
    // Auto-initialize if not already done
    await this.initialize();
    await this.startAudioContext();

    if (!this.synth) {
      throw new Error('Audio synthesizer not initialized');
    }

    const frequencies = chord.voicing.map(this.midiToFrequency);
    
    // Clear any existing scheduled events
    Tone.getTransport().cancel();
    
    // Play notes in sequence with slight delay
    frequencies.forEach((freq, index) => {
      Tone.getTransport().schedule((time) => {
        this.synth!.triggerAttackRelease(freq, noteLength, time);
      }, `+${index * 0.15}`); // Slightly faster arpeggio timing
    });

    Tone.getTransport().start();
    
    // Stop transport after arpeggio completes
    Tone.getTransport().schedule(() => {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
    }, `+${frequencies.length * 0.15 + 1}`);
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
