/**
 * React Hook for Audio Management
 * Manages stateful audio operations using functional audio service
 */

import { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import * as audioService from "@/services/audioService";
import type {
  AdvancedChordSuggestion,
  ChordProgression,
  AdvancedEmotionAnalysis,
} from "@/types/emotionChord";

export interface UseAudioState {
  isPlaying: boolean;
  isInitialized: boolean;
  isArpeggioPlaying: boolean;
  playingChord: string | null;
  arpeggioChord: string | null;
  isProgressionPlaying: boolean;
  isProgressionLooping: boolean;
  isPlayingAllChords: boolean;
  currentChord: number;
  error: string | null;
}

export function useAudio() {
  const [state, setState] = useState<UseAudioState>({
    isPlaying: false,
    isInitialized: false,
    isArpeggioPlaying: false,
    playingChord: null,
    arpeggioChord: null,
    isProgressionPlaying: false,
    isProgressionLooping: false,
    isPlayingAllChords: false,
    currentChord: -1,
    error: null,
  });

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const oneOffSynthRef = useRef<Tone.PolySynth | null>(null);
  const arpeggioLoopRef = useRef<Tone.Loop | null>(null);
  const progressionSequenceRef = useRef<Tone.Sequence | null>(null);
  const currentProgressionRef = useRef<ChordProgression | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize audio on first use
  const initialize = useCallback(async () => {
    if (state.isInitialized) return;

    try {
      const synth = await audioService.createAudioSynth();
      synthRef.current = synth;
      
      // Create separate synth for one-off chord playback with DRAMATICALLY longer envelope for testing
      const oneOffEnvelope = {
        attack: 0.1,     // 5x longer attack (was 0.02)
        decay: 1.0,      // 5x longer decay (was 0.2) 
        sustain: 0.9,    // Much higher sustain (was 0.65)
        release: 4.0,    // Much longer release (was 1.2)
      };
      const oneOffSynth = await audioService.createAudioSynth(audioService.defaultAudioConfig, oneOffEnvelope);
      oneOffSynthRef.current = oneOffSynth;
      
      setState((prev) => ({ ...prev, isInitialized: true, error: null }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to initialize audio";
      setState((prev) => ({ ...prev, error: errorMessage }));
    }
  }, [state.isInitialized]);

  // Play a chord
  const playChord = useCallback(
    async (chord: AdvancedChordSuggestion) => {
      setState((prev) => ({
        ...prev,
        isPlaying: true,
        playingChord: chord.symbol,
        error: null,
      }));

      try {
        await initialize();
        if (!oneOffSynthRef.current) return;

        await audioService.playChord(oneOffSynthRef.current, chord);

        // Auto-stop playing state after duration
        setTimeout(() => {
          setState((prev) => ({ ...prev, isPlaying: false, playingChord: null }));
        }, 2000);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to play chord";
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          playingChord: null,
          error: errorMessage,
        }));
      }
    },
    [initialize]
  );

  // Play arpeggio once
  const playArpeggio = useCallback(
    async (
      chord: AdvancedChordSuggestion,
      emotion?: AdvancedEmotionAnalysis,
      noteLength: string = "8n"
    ) => {
      await initialize();
      if (!synthRef.current) return;

      try {
        await audioService.playArpeggio(synthRef.current, chord, emotion, noteLength);
      } catch (error) {
        console.error("Failed to play arpeggio:", error);
      }
    },
    [initialize]
  );

  // Toggle arpeggio loop
  const toggleArpeggio = useCallback(
    async (
      chord: AdvancedChordSuggestion,
      emotion?: AdvancedEmotionAnalysis,
      noteLength: string = "8n"
    ) => {
      setState((prev) => ({ ...prev, error: null }));

      try {
        await initialize();
        if (!synthRef.current) return;

        if (state.isArpeggioPlaying) {
          // Stop current arpeggio
          if (arpeggioLoopRef.current) {
            arpeggioLoopRef.current.stop();
            arpeggioLoopRef.current.dispose();
            arpeggioLoopRef.current = null;
          }
          Tone.getTransport().stop();
          setState((prev) => ({
            ...prev,
            isArpeggioPlaying: false,
            arpeggioChord: null,
          }));
        } else {
          // Start arpeggio loop
          const loop = audioService.createArpeggioLoop(
            synthRef.current,
            chord,
            emotion,
            noteLength
          );

          arpeggioLoopRef.current = loop;
          loop.start(0);
          Tone.getTransport().start();
          setState((prev) => ({
            ...prev,
            isArpeggioPlaying: true,
            arpeggioChord: chord.symbol,
          }));
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to toggle arpeggio";
        setState((prev) => ({ ...prev, error: errorMessage }));
      }
    },
    [initialize, state.isArpeggioPlaying]
  );

  // Play progression
  const playProgression = useCallback(
    async (progression: ChordProgression, loop: boolean = false) => {
      setState((prev) => ({
        ...prev,
        error: null,
        isProgressionPlaying: true,
        isProgressionLooping: loop,
      }));

      try {
        await initialize();
        if (!synthRef.current) return;

        // Stop any current progression
        if (progressionSequenceRef.current) {
          progressionSequenceRef.current.stop();
          progressionSequenceRef.current.dispose();
          progressionSequenceRef.current = null;
        }

        currentProgressionRef.current = progression;

        const sequence = audioService.createProgressionSequence(
          synthRef.current,
          progression,
          (index) => {
            setState((prev) => ({ ...prev, currentChord: index }));
          }
        );

        sequence.loop = loop;
        if (loop) {
          sequence.loopEnd = progression.chords.length * 4;
        }

        progressionSequenceRef.current = sequence;
        sequence.start();
        Tone.getTransport().start();

        setState((prev) => ({
          ...prev,
          currentChord: 0,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to play progression";
        setState((prev) => ({
          ...prev,
          isProgressionPlaying: false,
          error: errorMessage,
        }));
      }
    },
    [initialize]
  );

  // Pause progression
  const pauseProgression = useCallback(() => {
    Tone.getTransport().pause();
    setState((prev) => ({ ...prev, isProgressionPlaying: false }));
  }, []);

  // Resume progression
  const resumeProgression = useCallback(() => {
    if (progressionSequenceRef.current) {
      Tone.getTransport().start();
      setState((prev) => ({ ...prev, isProgressionPlaying: true }));
    }
  }, []);

  // Stop progression
  const stopProgression = useCallback(() => {
    if (progressionSequenceRef.current) {
      progressionSequenceRef.current.stop();
      progressionSequenceRef.current.dispose();
      progressionSequenceRef.current = null;
    }

    Tone.getTransport().stop();
    currentProgressionRef.current = null;

    setState((prev) => ({
      ...prev,
      isProgressionPlaying: false,
      isProgressionLooping: false,
      currentChord: -1,
    }));
  }, []);

  // Toggle progression loop
  const toggleProgressionLoop = useCallback(() => {
    if (progressionSequenceRef.current) {
      const newLoopState = !state.isProgressionLooping;
      progressionSequenceRef.current.loop = newLoopState;
      setState((prev) => ({ ...prev, isProgressionLooping: newLoopState }));
      return newLoopState;
    }
    return false;
  }, [state.isProgressionLooping]);

  // Navigation methods
  const nextChord = useCallback(() => {
    if (
      currentProgressionRef.current &&
      state.currentChord < currentProgressionRef.current.chords.length - 1
    ) {
      const newIndex = state.currentChord + 1;
      setState((prev) => ({ ...prev, currentChord: newIndex }));
      return newIndex;
    }
    return state.currentChord;
  }, [state.currentChord]);

  const previousChord = useCallback(() => {
    if (state.currentChord > 0) {
      const newIndex = state.currentChord - 1;
      setState((prev) => ({ ...prev, currentChord: newIndex }));
      return newIndex;
    }
    return state.currentChord;
  }, [state.currentChord]);

  const selectChord = useCallback(
    (index: number) => {
      if (
        currentProgressionRef.current &&
        index >= 0 &&
        index < currentProgressionRef.current.chords.length
      ) {
        setState((prev) => ({ ...prev, currentChord: index }));
        return index;
      }
      return state.currentChord;
    },
    [state.currentChord]
  );

  // Play all chords in sequence
  const playAllChords = useCallback(
    async (chords: AdvancedChordSuggestion[]) => {
      if (chords.length === 0) return;

      // Stop any existing playback
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      const signal = abortController.signal;
      abortControllerRef.current = abortController;

      setState((prev) => ({
        ...prev,
        isPlayingAllChords: true,
        error: null,
      }));

      try {
        await initialize();
        if (!synthRef.current) return;

        const abortableSleep = (ms: number): Promise<void> => {
          return new Promise((resolve, reject) => {
            if (signal.aborted) {
              reject(new Error("Aborted"));
              return;
            }

            const timeout = setTimeout(() => {
              if (signal.aborted) {
                reject(new Error("Aborted"));
              } else {
                resolve();
              }
            }, ms);

            signal.addEventListener("abort", () => {
              clearTimeout(timeout);
              reject(new Error("Aborted"));
            });
          });
        };

        while (!signal.aborted) {
          for (let i = 0; i < chords.length && !signal.aborted; i++) {
            const chord = chords[i];

            if (signal.aborted) break;

            setState((prev) => ({ ...prev, playingChord: chord.symbol }));

            await audioService.playChord(synthRef.current!, chord);

            if (signal.aborted) break;

            await abortableSleep(1200);

            if (signal.aborted) break;

            setState((prev) => ({ ...prev, playingChord: null }));
          }

          if (signal.aborted) break;
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Aborted") {
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : "Failed to play chord sequence";
        setState((prev) => ({
          ...prev,
          isPlayingAllChords: false,
          playingChord: null,
          error: errorMessage,
        }));
      } finally {
        setState((prev) => ({
          ...prev,
          isPlayingAllChords: false,
          playingChord: null,
        }));
        abortControllerRef.current = null;
      }
    },
    [initialize]
  );

  // Stop all audio
  const stopAudio = useCallback(() => {
    // Abort any running operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    audioService.stopAllAudio(
      synthRef.current || undefined,
      arpeggioLoopRef.current || undefined,
      progressionSequenceRef.current || undefined
    );
    
    // Also stop the one-off synth
    if (oneOffSynthRef.current) {
      oneOffSynthRef.current.releaseAll();
    }

    arpeggioLoopRef.current = null;
    progressionSequenceRef.current = null;
    currentProgressionRef.current = null;
    abortControllerRef.current = null;

    setState((prev) => ({
      ...prev,
      isPlaying: false,
      playingChord: null,
      isArpeggioPlaying: false,
      arpeggioChord: null,
      isProgressionPlaying: false,
      isProgressionLooping: false,
      isPlayingAllChords: false,
      currentChord: -1,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (synthRef.current) {
        audioService.disposeAudio(synthRef.current);
        synthRef.current = null;
      }
      if (oneOffSynthRef.current) {
        audioService.disposeAudio(oneOffSynthRef.current);
        oneOffSynthRef.current = null;
      }
    };
  }, [stopAudio]);

  return {
    // State
    ...state,

    // Actions
    playChord,
    playArpeggio,
    toggleArpeggio,
    playProgression,
    pauseProgression,
    resumeProgression,
    stopProgression,
    toggleProgressionLoop,
    nextChord,
    previousChord,
    selectChord,
    playAllChords,
    stopAudio,

    // Legacy method alias
    initializeAudio: initialize,
  };
}
