import type { EmotionRequest, EmotionChordResponse, ApiError } from '@/types/emotion-chord';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class EmotionChordApiService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.error);
    }

    return response.json();
  }

  static async generateChordFromEmotion(
    emotion: string
  ): Promise<EmotionChordResponse> {
    const requestBody: EmotionRequest = { emotion };

    return this.makeRequest<EmotionChordResponse>('/api/emotion-to-chord', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest<{ status: string; timestamp: string }>('/health');
  }
}
