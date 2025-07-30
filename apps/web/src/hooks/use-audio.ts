import { useState, useCallback, useEffect } from 'react';
import { AudioService } from '@/services/audio-service';
import type { AdvancedChordSuggestion, ChordProgression, AdvancedEmotionAnalysis } from '@/types/emotion-chord';

interface UseAudioState {
  isPlaying: boolean;
  isInitialized: boolean;
  isArpeggioLooping: boolean;
  playingChord: string | null;
  arpeggioChord: string | null;
  isProgressionPlaying: boolean;
  isProgressionLooping: boolean;
  currentChord: number;
  error: string | null;
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
    currentChord: -1,
    error: null,
  });

  const initializeAudio = useCallback(async () => {
    try {
      await AudioService.initialize();
      setState(prev => ({ ...prev, isInitialized: true, error: null }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize audio';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  const playChord = useCallback(async (chord: AdvancedChordSuggestion) => {
    setState(prev => ({ ...prev, isPlaying: true, playingChord: chord.symbol, error: null }));
    
    try {
      // Auto-initialize audio on first play (handles user interaction requirement)
      await AudioService.playChord(chord);
      
      // Mark as initialized after successful play
      setState(prev => ({ ...prev, isInitialized: true }));
      
      // Reset playing state after chord duration
      setTimeout(() => {
        setState(prev => ({ ...prev, isPlaying: false, playingChord: null }));
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to play chord';
      setState(prev => ({ ...prev, isPlaying: false, playingChord: null, error: errorMessage }));
    }
  }, []);

  const toggleArpeggio = useCallback(async (chord: AdvancedChordSuggestion, emotion?: AdvancedEmotionAnalysis) => {
    setState(prev => ({ ...prev, error: null }));
    
    try {
      // Auto-initialize audio on first play (handles user interaction requirement)
      const isNowPlaying = await AudioService.toggleArpeggioLoop(chord, emotion);
      
      // Mark as initialized after successful interaction
      setState(prev => ({ 
        ...prev, 
        isInitialized: true,
        isArpeggioLooping: isNowPlaying,
        arpeggioChord: isNowPlaying ? chord.symbol : null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle arpeggio';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  const playProgression = useCallback(async (progression: ChordProgression, loop = false) => {
    setState(prev => ({ ...prev, error: null, isProgressionPlaying: true, isProgressionLooping: loop }));
    
    try {
      // Auto-initialize audio on first play
      await AudioService.playProgression(progression, loop);
      
      setState(prev => ({ ...prev, isInitialized: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to play progression';
      setState(prev => ({ ...prev, isProgressionPlaying: false, error: errorMessage }));
    }
  }, []);

  const pauseProgression = useCallback(() => {
    AudioService.pauseProgression();
    setState(prev => ({ ...prev, isProgressionPlaying: false }));
  }, []);

  const resumeProgression = useCallback(() => {
    AudioService.resumeProgression();
    setState(prev => ({ ...prev, isProgressionPlaying: true }));
  }, []);

  const stopProgression = useCallback(() => {
    AudioService.stopProgression();
    setState(prev => ({ 
      ...prev, 
      isProgressionPlaying: false,
      isProgressionLooping: false,
      currentChord: -1
    }));
  }, []);

  const toggleProgressionLoop = useCallback(() => {
    const newLooping = AudioService.toggleProgressionLoop();
    setState(prev => ({ ...prev, isProgressionLooping: newLooping }));
  }, []);

  const nextChord = useCallback(() => {
    const newIndex = AudioService.nextChord();
    setState(prev => ({ ...prev, currentChord: newIndex }));
  }, []);

  const previousChord = useCallback(() => {
    const newIndex = AudioService.previousChord();
    setState(prev => ({ ...prev, currentChord: newIndex }));
  }, []);

  const selectChord = useCallback((index: number) => {
    const newIndex = AudioService.selectChord(index);
    setState(prev => ({ ...prev, currentChord: newIndex }));
  }, []);

  const stopAudio = useCallback(() => {
    AudioService.stopAll();
    setState(prev => ({ 
      ...prev, 
      isPlaying: false,
      playingChord: null,
      isArpeggioLooping: false,
      arpeggioChord: null,
      isProgressionPlaying: false,
      isProgressionLooping: false,
      currentChord: -1
    }));
  }, []);

  useEffect(() => {
    return () => {
      AudioService.dispose();
    };
  }, []);

  return {
    ...state,
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
    stopAudio,
  };
}
