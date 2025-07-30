import * as Tone from "tone";
import type { AdvancedChordSuggestion, ChordProgression, AdvancedEmotionAnalysis } from "@/types/emotion-chord";

export class AudioService {
  private static synth: Tone.PolySynth | null = null;
  private static isInitialized = false;
  private static arpeggioLoop: Tone.Loop | null = null;
  private static isArpeggioPlaying = false;
  
  // Progression playback state
  private static progressionSequence: Tone.Sequence | null = null;
  private static isProgressionPlaying = false;
  private static isProgressionLooping = false;
  private static currentProgression: ChordProgression | null = null;
  private static currentChordIndex = -1;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Set master volume to prevent distortion
    Tone.getDestination().volume.value = -12; // Reduce master volume by 12dB

    // Create a polyphonic synthesizer for playing chords
    this.synth = new Tone.PolySynth(Tone.Synth, {
      volume: -8, // Additional volume reduction at synth level
      envelope: {
        attack: 0.02,
        decay: 0.2,  // Slightly faster decay
        sustain: 0.65, // Lower sustain level
        release: 1.2, // Longer release for better chord sustain
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

  static getChordFrequencies(chord: AdvancedChordSuggestion): number[] {
    // Prioritize midiNotes (correct chord tones) over voicing notes
    if (chord.midiNotes && chord.midiNotes.length > 0) {
      return chord.midiNotes.map(this.midiToFrequency);
    } else if (chord.voicing?.notes && chord.voicing.notes.length > 0) {
      return chord.voicing.notes.map(this.midiToFrequency);
    } else {
      // Fallback to converting string notes to MIDI
      const noteToMidi: Record<string, number> = {
        'C': 60, 'C#': 61, 'Db': 61, 'D': 62, 'D#': 63, 'Eb': 63,
        'E': 64, 'F': 65, 'F#': 66, 'Gb': 66, 'G': 67, 'G#': 68,
        'Ab': 68, 'A': 69, 'A#': 70, 'Bb': 70, 'B': 71
      };
      return chord.notes.map(note => {
        const midiNote = noteToMidi[note] || 60;
        return this.midiToFrequency(midiNote + 12); // Add octave
      });
    }
  }

  /**
   * Get frequencies for arpeggiator sorted from lowest to highest pitch
   * This ensures arpeggio always plays notes in ascending pitch order
   * regardless of the original voicing arrangement
   */
  static getArpeggioFrequencies(chord: AdvancedChordSuggestion): number[] {
    // Get the frequencies in their original order
    let frequencies: number[] = [];
    
    if (chord.midiNotes && chord.midiNotes.length > 0) {
      console.log(`Using midiNotes for arpeggio: [${chord.midiNotes.join(', ')}]`);
      frequencies = chord.midiNotes.map(this.midiToFrequency);
    } else if (chord.voicing?.notes && chord.voicing.notes.length > 0) {
      console.log(`Using voicing.notes for arpeggio: [${chord.voicing.notes.join(', ')}]`);
      frequencies = chord.voicing.notes.map(this.midiToFrequency);
    } else {
      // Fallback: use the same logic as getChordFrequencies
      console.log(`Using fallback chord frequencies for arpeggio`);
      frequencies = this.getChordFrequencies(chord);
    }
    
    // Sort frequencies from lowest to highest for arpeggio
    const sortedFrequencies = [...frequencies].sort((a, b) => a - b);
    console.log(`Arpeggio frequencies sorted low to high: [${sortedFrequencies.map(f => f.toFixed(2)).join(', ')}]`);
    
    return sortedFrequencies;
  }

  static getDynamicsVelocity(dynamics?: string): number {
    switch (dynamics) {
      case 'pp': return 0.2;
      case 'p': return 0.4;
      case 'mf': return 0.6;
      case 'f': return 0.8;
      case 'ff': return 1.0;
      default: return 0.6;
    }
  }

  static async playChord(
    chord: AdvancedChordSuggestion,
    duration: string = "4n"  // Shorter default duration (quarter note instead of half note)
  ): Promise<void> {
    // Auto-initialize if not already done
    await this.initialize();
    await this.startAudioContext();

    if (!this.synth) {
      throw new Error("Audio synthesizer not initialized");
    }

    // Get frequencies from the advanced chord structure
    const frequencies = this.getChordFrequencies(chord);
    const velocity = this.getDynamicsVelocity(chord.dynamics);

    // Play the chord with controlled timing and dynamics
    this.synth.triggerAttackRelease(frequencies, duration, undefined, velocity);
  }

  static async playArpeggio(
    chord: AdvancedChordSuggestion,
    emotion?: AdvancedEmotionAnalysis,
    noteLength: string = "8n"
  ): Promise<void> {
    // Auto-initialize if not already done
    await this.initialize();
    await this.startAudioContext();

    if (!this.synth) {
      throw new Error("Audio synthesizer not initialized");
    }

    const frequencies = this.getArpeggioFrequencies(chord);
    const velocity = this.getDynamicsVelocity(chord.dynamics);

    console.log(`Playing single arpeggio from lowest to highest frequency`);

    // Calculate timing based on emotion's suggested tempo
    const noteDelay = emotion
      ? this.calculateArpeggioSpeed(emotion.suggestedTempo)
      : 0.15; // fallback to default timing (roughly 100 BPM)

    // Clear any existing scheduled events
    Tone.getTransport().cancel();

    // Play notes in sequence with tempo-appropriate delay
    frequencies.forEach((freq, index) => {
      Tone.getTransport().schedule((time) => {
        this.synth!.triggerAttackRelease(freq, noteLength, time, velocity);
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
    chord: AdvancedChordSuggestion,
    emotion?: AdvancedEmotionAnalysis,
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
    const frequencies = this.getArpeggioFrequencies(chord);
    const velocity = this.getDynamicsVelocity(chord.dynamics);
    let currentIndex = 0;
    let direction = 1; // 1 for up, -1 for down

    console.log(`Arpeggio will play from lowest to highest frequency`);

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
        time,
        velocity
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

  static async playProgression(
    progression: ChordProgression,
    loop = false
  ): Promise<void> {
    await this.initialize();
    await this.startAudioContext();

    if (!this.synth) {
      throw new Error("Audio synthesizer not initialized");
    }

    // Stop any existing progression
    this.stopProgression();

    this.currentProgression = progression;
    this.isProgressionLooping = loop;
    
    // Set tempo
    Tone.getTransport().bpm.value = progression.tempo;

    // Create chord events for the sequence
    const events = progression.chords.map((chord, index) => ({
      time: index * 4, // Assume 4 beats per chord for now
      chord,
      index
    }));

    // Create and start sequence
    this.progressionSequence = new Tone.Sequence(
      (time, data) => {
        this.currentChordIndex = data.index;
        
        // For now, use a simple chord symbol to frequency conversion
        // This would need to be expanded to handle the full chord data
        const frequencies = [220, 277, 330, 415]; // Simplified Am chord
        const duration = `${data.chord.duration}n` as Tone.Unit.Time;
        
        this.synth!.triggerAttackRelease(frequencies, duration, time);
      },
      events,
      '4n'
    );

    this.progressionSequence.loop = loop;
    if (loop) {
      this.progressionSequence.loopEnd = progression.chords.length * 4; // Total beats
    }

    this.progressionSequence.start();
    Tone.getTransport().start();
    this.isProgressionPlaying = true;
  }

  static pauseProgression(): void {
    if (this.isProgressionPlaying) {
      Tone.getTransport().pause();
      this.isProgressionPlaying = false;
    }
  }

  static resumeProgression(): void {
    if (!this.isProgressionPlaying && this.progressionSequence) {
      Tone.getTransport().start();
      this.isProgressionPlaying = true;
    }
  }

  static stopProgression(): void {
    if (this.progressionSequence) {
      this.progressionSequence.stop();
      this.progressionSequence.dispose();
      this.progressionSequence = null;
    }
    Tone.getTransport().stop();
    this.isProgressionPlaying = false;
    this.isProgressionLooping = false;
    this.currentChordIndex = -1;
    this.currentProgression = null;
  }

  static toggleProgressionLoop(): boolean {
    if (this.progressionSequence) {
      this.isProgressionLooping = !this.isProgressionLooping;
      this.progressionSequence.loop = this.isProgressionLooping;
    }
    return this.isProgressionLooping;
  }

  static nextChord(): number {
    if (this.currentProgression && this.currentChordIndex < this.currentProgression.chords.length - 1) {
      this.currentChordIndex++;
      // TODO: Update transport position
    }
    return this.currentChordIndex;
  }

  static previousChord(): number {
    if (this.currentChordIndex > 0) {
      this.currentChordIndex--;
      // TODO: Update transport position
    }
    return this.currentChordIndex;
  }

  static selectChord(index: number): number {
    if (this.currentProgression && index >= 0 && index < this.currentProgression.chords.length) {
      this.currentChordIndex = index;
      // TODO: Update transport position to match chord
    }
    return this.currentChordIndex;
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

  static getProgressionState(): { isPlaying: boolean; isLooping: boolean; currentChord: number } {
    return {
      isPlaying: this.isProgressionPlaying,
      isLooping: this.isProgressionLooping,
      currentChord: this.currentChordIndex,
    };
  }

  static stopAll(): void {
    if (this.synth) {
      this.synth.releaseAll();
    }
    this.stopArpeggioLoop();
    this.stopProgression();
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
  }

  static dispose(): void {
    this.stopAll();
    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }
    this.isInitialized = false;
  }
}
