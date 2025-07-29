import * as Tone from "tone";
import type { ChordSuggestion, EmotionAnalysis } from "@/types/emotion-chord";

export class AudioService {
  private static synth: Tone.PolySynth | null = null;
  private static isInitialized = false;
  private static arpeggioLoop: Tone.Loop | null = null;
  private static isArpeggioPlaying = false;

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
        type: "triangle", // Softer waveform than sawtooth
      },
    });

    // Apply effects for richer sound with controlled levels
    const reverb = new Tone.Reverb({
      decay: 1.2,
      wet: 0.2, // Reduced wet signal to prevent muddiness
    });

    const filter = new Tone.Filter({
      frequency: 1200,
      type: "lowpass",
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
    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }
  }

  static midiToFrequency(midiNote: number): number {
    return Tone.Frequency(midiNote, "midi").toFrequency();
  }

  /**
   * Calculate arpeggio speed based on tempo (BPM)
   * Returns the delay in seconds between arpeggio notes
   */
  static calculateArpeggioSpeed(tempo: number): number {
    console.log(`Calculating arpeggio speed for tempo: ${tempo} BPM`);
    // Much more aggressive tempo differences for testing
    // Slow emotions: 60 BPM = 0.5 seconds between notes
    // Fast emotions: 160 BPM = 0.125 seconds between notes
    const noteDelay = 60 / (tempo * 2); // Simplified: 2 subdivisions per beat
    console.log(`Calculated note delay: ${noteDelay} seconds`);
    return noteDelay;
  }

  static async playChord(
    chord: ChordSuggestion,
    duration: string = "2n"
  ): Promise<void> {
    // Auto-initialize if not already done
    await this.initialize();
    await this.startAudioContext();

    if (!this.synth) {
      throw new Error("Audio synthesizer not initialized");
    }

    // Convert MIDI notes to frequencies
    const frequencies = chord.voicing.map(this.midiToFrequency);

    // Play the chord with controlled timing
    this.synth.triggerAttackRelease(frequencies, duration);
  }

  static async playArpeggio(
    chord: ChordSuggestion,
    emotion?: EmotionAnalysis,
    noteLength: string = "8n"
  ): Promise<void> {
    // Auto-initialize if not already done
    await this.initialize();
    await this.startAudioContext();

    if (!this.synth) {
      throw new Error("Audio synthesizer not initialized");
    }

    const frequencies = chord.voicing.map(this.midiToFrequency);

    // Calculate timing based on emotion's suggested tempo
    const noteDelay = emotion
      ? this.calculateArpeggioSpeed(emotion.suggestedTempo)
      : 0.15; // fallback to default timing (roughly 100 BPM)

    // Clear any existing scheduled events
    Tone.getTransport().cancel();

    // Play notes in sequence with tempo-appropriate delay
    frequencies.forEach((freq, index) => {
      Tone.getTransport().schedule((time) => {
        this.synth!.triggerAttackRelease(freq, noteLength, time);
      }, `+${index * noteDelay}`);
    });

    Tone.getTransport().start();

    // Stop transport after arpeggio completes
    Tone.getTransport().schedule(() => {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
    }, `+${frequencies.length * noteDelay + 1}`);
  }

  static async toggleArpeggioLoop(
    chord: ChordSuggestion,
    emotion?: EmotionAnalysis,
    noteLength: string = "8n"
  ): Promise<boolean> {
    console.log("toggleArpeggioLoop called with emotion:", emotion);
    console.log("Emotion suggestedTempo:", emotion?.suggestedTempo);

    // Auto-initialize if not already done
    await this.initialize();
    await this.startAudioContext();

    if (!this.synth) {
      throw new Error("Audio synthesizer not initialized");
    }

    // If already playing, stop the loop
    if (this.isArpeggioPlaying) {
      this.stopArpeggioLoop();
      return false;
    }

    // Start the infinite arpeggio loop
    const frequencies = chord.voicing.map(this.midiToFrequency);
    let currentIndex = 0;
    let direction = 1; // 1 for up, -1 for down

    // Calculate timing based on emotion's suggested tempo
    const arpeggioSpeed = emotion
      ? this.calculateArpeggioSpeed(emotion.suggestedTempo)
      : 0.3; // Very slow fallback to make the difference obvious

    console.log(`Using arpeggio speed: ${arpeggioSpeed} seconds between notes`);

    // Create a loop that plays one note at a time
    this.arpeggioLoop = new Tone.Loop((time) => {
      // Play the current note
      this.synth!.triggerAttackRelease(
        frequencies[currentIndex],
        noteLength,
        time
      );

      // Move to next note
      currentIndex += direction;

      // Change direction at boundaries (without repeating boundary notes)
      if (currentIndex >= frequencies.length) {
        currentIndex = frequencies.length - 2; // Skip the last note
        direction = -1;
      } else if (currentIndex < 0) {
        currentIndex = 1; // Skip the first note
        direction = 1;
      }
    }, arpeggioSpeed); // Use calculated arpeggio speed in seconds

    this.arpeggioLoop.start(0);
    Tone.getTransport().start();
    this.isArpeggioPlaying = true;

    return true;
  }

  static stopArpeggioLoop(): void {
    if (this.arpeggioLoop) {
      this.arpeggioLoop.stop();
      this.arpeggioLoop.dispose();
      this.arpeggioLoop = null;
    }
    this.isArpeggioPlaying = false;
    Tone.getTransport().stop();
  }

  static getArpeggioState(): boolean {
    return this.isArpeggioPlaying;
  }

  static stopAll(): void {
    if (this.synth) {
      this.synth.releaseAll();
    }
    this.stopArpeggioLoop();
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
