import type { 
  EmotionRequest, 
  EmotionChordResponse, 
  BatchRequest,
  BatchResponse,
  HealthCheckResponse,
  ApiError 
} from '@/types/emotion-chord';

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

  /**
   * Generate chord from emotion with advanced options
   */
  static async generateChordFromEmotion(
    emotion: string,
    options?: {
      culturalPreference?: "western" | "indian" | "arabic" | "universal";
      stylePreference?: "classical" | "jazz" | "contemporary" | "experimental";
      includeProgression?: boolean;
      includeCulturalAlternatives?: boolean;
    }
  ): Promise<EmotionChordResponse> {
    const requestBody: EmotionRequest = { emotion, options };

    return this.makeRequest<EmotionChordResponse>('/api/emotion-to-chord', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Process multiple emotions in batch
   */
  static async batchProcessEmotions(
    emotions: string[]
  ): Promise<BatchResponse> {
    const requestBody: BatchRequest = { emotions };

    return this.makeRequest<BatchResponse>('/api/batch', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Get API health and feature information
   */
  static async healthCheck(): Promise<HealthCheckResponse> {
    return this.makeRequest<HealthCheckResponse>('/api/health');
  }

  /**
   * Utility method to validate emotion input
   */
  static validateEmotionInput(emotion: string): { isValid: boolean; error?: string } {
    if (!emotion.trim()) {
      return { isValid: false, error: 'Emotion cannot be empty' };
    }
    
    if (emotion.length > 500) {
      return { isValid: false, error: 'Emotion description too long (max 500 characters)' };
    }

    return { isValid: true };
  }

  /**
   * Get suggested emotion examples based on category
   */
  static getEmotionExamples(): Record<string, string[]> {
    return {
      basic: [
        "peaceful morning",
        "joyful celebration",
        "melancholic reflection",
        "anxious anticipation"
      ],
      complex: [
        "transcendent wonder with a touch of melancholy",
        "bittersweet nostalgia for a childhood home",
        "the feeling of looking at old photographs on a rainy afternoon",
        "spiritual devotion mixed with earthly longing"
      ],
      cultural: [
        "the serenity of a Japanese tea ceremony",
        "the passionate intensity of flamenco",
        "the mystical depth of Sufi meditation",
        "the communal joy of an African celebration"
      ],
      sophisticated: [
        "sophisticated nostalgia tinged with hope",
        "chaotic anxiety with underlying determination",
        "ethereal transcendence grounded in human warmth",
        "dramatic tension resolving into peaceful acceptance"
      ]
    };
  }
}
