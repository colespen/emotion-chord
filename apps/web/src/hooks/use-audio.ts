import { useState, useCallback, useEffect } from 'react';
import { AudioService } from '@/services/audio-service';
import type { ChordSuggestion, EmotionAnalysis } from '@/types/emotion-chord';

interface UseAudioState {
  isPlaying: boolean;
  isInitialized: boolean;
  isArpeggioLooping: boolean;
  error: string | null;
}

export function useAudio() {
  const [state, setState] = useState<UseAudioState>({
    isPlaying: false,
    isInitialized: false,
    isArpeggioLooping: false,
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

  const playChord = useCallback(async (chord: ChordSuggestion) => {
    setState(prev => ({ ...prev, isPlaying: true, error: null }));
    
    try {
      // Auto-initialize audio on first play (handles user interaction requirement)
      await AudioService.playChord(chord);
      
      // Mark as initialized after successful play
      setState(prev => ({ ...prev, isInitialized: true }));
      
      // Reset playing state after chord duration
      setTimeout(() => {
        setState(prev => ({ ...prev, isPlaying: false }));
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to play chord';
      setState(prev => ({ ...prev, isPlaying: false, error: errorMessage }));
    }
  }, []);

  const toggleArpeggio = useCallback(async (chord: ChordSuggestion, emotion?: EmotionAnalysis) => {
    setState(prev => ({ ...prev, error: null }));
    
    try {
      // Auto-initialize audio on first play (handles user interaction requirement)
      const isNowPlaying = await AudioService.toggleArpeggioLoop(chord, emotion);
      
      // Mark as initialized after successful interaction
      setState(prev => ({ 
        ...prev, 
        isInitialized: true,
        isArpeggioLooping: isNowPlaying
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle arpeggio';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  const stopAudio = useCallback(() => {
    AudioService.stopAll();
    setState(prev => ({ 
      ...prev, 
      isPlaying: false,
      isArpeggioLooping: false
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
    stopAudio,
  };
}
