import { useState, useCallback, useEffect } from 'react';
import { AudioService } from '@/services/audio-service';
import type { ChordSuggestion } from '@/types/emotion-chord';

interface UseAudioState {
  isPlaying: boolean;
  isInitialized: boolean;
  error: string | null;
}

export function useAudio() {
  const [state, setState] = useState<UseAudioState>({
    isPlaying: false,
    isInitialized: false,
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
      await AudioService.playChord(chord);
      // Reset playing state after chord duration
      setTimeout(() => {
        setState(prev => ({ ...prev, isPlaying: false }));
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to play chord';
      setState(prev => ({ ...prev, isPlaying: false, error: errorMessage }));
    }
  }, []);

  const playArpeggio = useCallback(async (chord: ChordSuggestion) => {
    setState(prev => ({ ...prev, isPlaying: true, error: null }));
    
    try {
      await AudioService.playArpeggio(chord);
      // Reset playing state after arpeggio duration
      setTimeout(() => {
        setState(prev => ({ ...prev, isPlaying: false }));
      }, chord.voicing.length * 200 + 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to play arpeggio';
      setState(prev => ({ ...prev, isPlaying: false, error: errorMessage }));
    }
  }, []);

  const stopAudio = useCallback(() => {
    AudioService.stopAll();
    setState(prev => ({ ...prev, isPlaying: false }));
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
    playArpeggio,
    stopAudio,
  };
}
