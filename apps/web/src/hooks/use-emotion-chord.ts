import { useState, useCallback } from "react";
import { EmotionChordApiService } from "@/services/emotion-chord-api";
import type { EmotionChordResponse } from "@/types/emotion-chord";

interface UseEmotionChordState {
  data: EmotionChordResponse | null;
  loading: boolean;
  error: string | null;
}

export function useEmotionChord() {
  const [state, setState] = useState<UseEmotionChordState>({
    data: null,
    loading: false,
    error: null,
  });

  const generateChord = useCallback(async (emotion: string) => {
    if (!emotion.trim()) {
      setState((prev) => ({ ...prev, error: "Please enter an emotion" }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await EmotionChordApiService.generateChordFromEmotion(emotion);
      setState({ data, loading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setState({ data: null, loading: false, error: errorMessage });
    }
  }, []);

  const clearData = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    generateChord,
    clearData,
  };
}
