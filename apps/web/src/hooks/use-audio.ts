import { useState, useCallback, useEffect } from "react";
import { AudioService } from "@/services/audio-service";
import type {
  AdvancedChordSuggestion,
  ChordProgression,
  AdvancedEmotionAnalysis,
} from "@/types/emotion-chord";

interface UseAudioState {
  isPlaying: boolean;
  isInitialized: boolean;
  isArpeggioLooping: boolean;
  playingChord: string | null;
  arpeggioChord: string | null;
  isProgressionPlaying: boolean;
  isProgressionLooping: boolean;
  isPlayingAllChords: boolean;
  currentChord: number;
  error: string | null;
  abortController: AbortController | null;
}

export function useAudio() {
  const [state, setState] = useState<UseAudioState>({
    isPlaying: false,
    isInitialized: false,
    isArpeggioLooping: false,
    playingChord: null,
    arpeggioChord: null,
    isProgressionPlaying: false,
    isProgressionLooping: false,
    isPlayingAllChords: false,
    currentChord: -1,
    error: null,
    abortController: null,
  });

  const initializeAudio = useCallback(async () => {
    try {
      await AudioService.initialize();
      setState((prev) => ({ ...prev, isInitialized: true, error: null }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to initialize audio";
      setState((prev) => ({ ...prev, error: errorMessage }));
    }
  }, []);

  const playChord = useCallback(async (chord: AdvancedChordSuggestion) => {
    setState((prev) => ({
      ...prev,
      isPlaying: true,
      playingChord: chord.symbol,
      error: null,
    }));

    try {
      await AudioService.playChord(chord);

      setState((prev) => ({ ...prev, isInitialized: true }));

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
  }, []);

  const toggleArpeggio = useCallback(
    async (chord: AdvancedChordSuggestion, emotion?: AdvancedEmotionAnalysis) => {
      setState((prev) => ({ ...prev, error: null }));

      try {
        const isNowPlaying = await AudioService.toggleArpeggioLoop(chord, emotion);

        setState((prev) => ({
          ...prev,
          isInitialized: true,
          isArpeggioLooping: isNowPlaying,
          arpeggioChord: isNowPlaying ? chord.symbol : null,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to toggle arpeggio";
        setState((prev) => ({ ...prev, error: errorMessage }));
      }
    },
    []
  );

  const playProgression = useCallback(
    async (progression: ChordProgression, loop = false) => {
      setState((prev) => ({
        ...prev,
        error: null,
        isProgressionPlaying: true,
        isProgressionLooping: loop,
      }));

      try {
        await AudioService.playProgression(progression, loop);

        setState((prev) => ({ ...prev, isInitialized: true }));
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
    []
  );

  const pauseProgression = useCallback(() => {
    AudioService.pauseProgression();
    setState((prev) => ({ ...prev, isProgressionPlaying: false }));
  }, []);

  const resumeProgression = useCallback(() => {
    AudioService.resumeProgression();
    setState((prev) => ({ ...prev, isProgressionPlaying: true }));
  }, []);

  const stopProgression = useCallback(() => {
    AudioService.stopProgression();
    setState((prev) => ({
      ...prev,
      isProgressionPlaying: false,
      isProgressionLooping: false,
      currentChord: -1,
    }));
  }, []);

  const toggleProgressionLoop = useCallback(() => {
    const newLooping = AudioService.toggleProgressionLoop();
    setState((prev) => ({ ...prev, isProgressionLooping: newLooping }));
  }, []);

  const nextChord = useCallback(() => {
    const newIndex = AudioService.nextChord();
    setState((prev) => ({ ...prev, currentChord: newIndex }));
  }, []);

  const previousChord = useCallback(() => {
    const newIndex = AudioService.previousChord();
    setState((prev) => ({ ...prev, currentChord: newIndex }));
  }, []);

  const selectChord = useCallback((index: number) => {
    const newIndex = AudioService.selectChord(index);
    setState((prev) => ({ ...prev, currentChord: newIndex }));
  }, []);

  const playAllChords = useCallback(async (chords: AdvancedChordSuggestion[]) => {
    if (chords.length === 0) return;

    setState((prev) => {
      if (prev.abortController) {
        prev.abortController.abort();
      }
      return prev;
    });

    const abortController = new AbortController();
    const signal = abortController.signal;

    setState((prev) => ({
      ...prev,
      isPlayingAllChords: true,
      error: null,
      abortController,
    }));

    try {
      await AudioService.initialize();
      setState((prev) => ({ ...prev, isInitialized: true }));

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

          await AudioService.playChord(chord);

          if (signal.aborted) break;

          await abortableSleep(1200);

          if (signal.aborted) break;

          setState((prev) => ({ ...prev, playingChord: null }));

          // no gap between chords for seamless flow
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
        abortController: null,
        error: errorMessage,
      }));
    } finally {
      setState((prev) => ({
        ...prev,
        isPlayingAllChords: false,
        playingChord: null,
        abortController: null,
      }));
    }
  }, []);

  const stopAudio = useCallback(() => {
    setState((prev) => {
      if (prev.abortController) {
        prev.abortController.abort();
      }
      return prev;
    });

    AudioService.stopAll();
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      playingChord: null,
      isArpeggioLooping: false,
      arpeggioChord: null,
      isProgressionPlaying: false,
      isProgressionLooping: false,
      isPlayingAllChords: false,
      abortController: null,
      currentChord: -1,
    }));
  }, []);

  useEffect(() => {
    return () => {
      // abort any running operations
      setState((prev) => {
        if (prev.abortController) {
          prev.abortController.abort();
        }
        return prev;
      });

      AudioService.dispose();
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { abortController, ...publicState } = state;

  return {
    ...publicState,
    initializeAudio,
    playChord,
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
  };
}
