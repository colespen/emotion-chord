import * as Tone from "tone";
import type {
  AdvancedChordSuggestion,
  ChordProgression,
  AdvancedEmotionAnalysis,
} from "@/types/emotion-chord";

export class AudioService {
  private static synth: Tone.PolySynth | null = null;
  private static isInitialized = false;
  private static arpeggioLoop: Tone.Loop | null = null;
  private static isArpeggioPlaying = false;
  private static progressionSequence: Tone.Sequence | null = null;
  private static isProgressionPlaying = false;
  private static isProgressionLooping = false;
  private static currentProgression: ChordProgression | null = null;
  private static currentChordIndex = -1;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    Tone.getDestination().volume.value = -12;

    this.synth = new Tone.PolySynth(Tone.Synth, {
      volume: -8,
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

    const reverb = new Tone.Reverb({
      decay: 1.2,
      wet: 0.2,
    });

    const filter = new Tone.Filter({
      frequency: 1200,
      type: "lowpass",
      rolloff: -12,
    });

    const compressor = new Tone.Compressor({
      threshold: -12,
      ratio: 3,
      attack: 0.003,
      release: 0.1,
    });

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

  // calculate arpeggio speed based on tempo (BPM)
  static calculateArpeggioSpeed(tempo: number): number {
    return 60 / (tempo * 2);
  }

  static getChordFrequencies(chord: AdvancedChordSuggestion): number[] {
    if (chord.midiNotes && chord.midiNotes.length > 0) {
      return chord.midiNotes.map(this.midiToFrequency);
    } else if (chord.voicing?.notes && chord.voicing.notes.length > 0) {
      return chord.voicing.notes.map(this.midiToFrequency);
    } else {
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
        return this.midiToFrequency(midiNote + 12);
      });
    }
  }

  // get arpeggio frequencies sorted from low to high
  static getArpeggioFrequencies(chord: AdvancedChordSuggestion): number[] {
    let frequencies: number[] = [];

    if (chord.midiNotes && chord.midiNotes.length > 0) {
      frequencies = chord.midiNotes.map(this.midiToFrequency);
    } else if (chord.voicing?.notes && chord.voicing.notes.length > 0) {
      frequencies = chord.voicing.notes.map(this.midiToFrequency);
    } else {
      frequencies = this.getChordFrequencies(chord);
    }

    return [...frequencies].sort((a, b) => a - b);
  }

  static getDynamicsVelocity(dynamics?: string): number {
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

  static async playChord(
    chord: AdvancedChordSuggestion,
    duration: string = "4n"
  ): Promise<void> {
    await this.initialize();
    await this.startAudioContext();

    if (!this.synth) {
      throw new Error("Audio synthesizer not initialized");
    }

    const frequencies = this.getChordFrequencies(chord);
    const velocity = this.getDynamicsVelocity(chord.dynamics);
    this.synth.triggerAttackRelease(frequencies, duration, undefined, velocity);
  }

  static async playArpeggio(
    chord: AdvancedChordSuggestion,
    emotion?: AdvancedEmotionAnalysis,
    noteLength: string = "8n"
  ): Promise<void> {
    await this.initialize();
    await this.startAudioContext();

    if (!this.synth) {
      throw new Error("Audio synthesizer not initialized");
    }

    const frequencies = this.getArpeggioFrequencies(chord);
    const velocity = this.getDynamicsVelocity(chord.dynamics);
    const noteDelay = emotion
      ? this.calculateArpeggioSpeed(emotion.suggestedTempo)
      : 0.15;

    Tone.getTransport().cancel();

    frequencies.forEach((freq, index) => {
      Tone.getTransport().schedule(
        (time) => {
          this.synth!.triggerAttackRelease(freq, noteLength, time, velocity);
        },
        `+${index * noteDelay}`
      );
    });

    Tone.getTransport().start();

    Tone.getTransport().schedule(
      () => {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
      },
      `+${frequencies.length * noteDelay + 1}`
    );
  }

  static async toggleArpeggioLoop(
    chord: AdvancedChordSuggestion,
    emotion?: AdvancedEmotionAnalysis,
    noteLength: string = "8n"
  ): Promise<boolean> {
    await this.initialize();
    await this.startAudioContext();

    if (!this.synth) {
      throw new Error("Audio synthesizer not initialized");
    }

    if (this.isArpeggioPlaying) {
      this.stopArpeggioLoop();
      return false;
    }

    const frequencies = this.getArpeggioFrequencies(chord);
    const velocity = this.getDynamicsVelocity(chord.dynamics);
    let currentIndex = 0;
    let direction = 1;

    const arpeggioSpeed = emotion
      ? this.calculateArpeggioSpeed(emotion.suggestedTempo)
      : 0.3;

    this.arpeggioLoop = new Tone.Loop((time) => {
      this.synth!.triggerAttackRelease(
        frequencies[currentIndex],
        noteLength,
        time,
        velocity
      );

      currentIndex += direction;

      if (currentIndex >= frequencies.length) {
        currentIndex = frequencies.length - 2;
        direction = -1;
      } else if (currentIndex < 0) {
        currentIndex = 1;
        direction = 1;
      }
    }, arpeggioSpeed);

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

    this.stopProgression();

    this.currentProgression = progression;
    this.isProgressionLooping = loop;

    Tone.getTransport().bpm.value = progression.tempo;

    const events = progression.chords.map((chord, index) => ({
      time: index * 4,
      chord,
      index,
    }));

    this.progressionSequence = new Tone.Sequence(
      (time, data) => {
        this.currentChordIndex = data.index;

        // simplified chord frequencies - should be expanded
        const frequencies = [220, 277, 330, 415];
        const duration = `${data.chord.duration}n` as Tone.Unit.Time;

        this.synth!.triggerAttackRelease(frequencies, duration, time);
      },
      events,
      "4n"
    );

    this.progressionSequence.loop = loop;
    if (loop) {
      this.progressionSequence.loopEnd = progression.chords.length * 4;
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
    if (
      this.currentProgression &&
      this.currentChordIndex < this.currentProgression.chords.length - 1
    ) {
      this.currentChordIndex++;
    }
    return this.currentChordIndex;
  }

  static previousChord(): number {
    if (this.currentChordIndex > 0) {
      this.currentChordIndex--;
    }
    return this.currentChordIndex;
  }

  static selectChord(index: number): number {
    if (
      this.currentProgression &&
      index >= 0 &&
      index < this.currentProgression.chords.length
    ) {
      this.currentChordIndex = index;
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

  static getProgressionState(): {
    isPlaying: boolean;
    isLooping: boolean;
    currentChord: number;
  } {
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
