/**
 * Emotion Chord API Service
 * Functional approach for API communication
 * Pure functions for emotion chord API interactions
 */

import type {
  EmotionRequest,
  EmotionChordResponse,
  BatchRequest,
  BatchResponse,
  HealthCheckResponse,
  ApiError,
} from "@/types/emotionChord";

import type {
  CulturalPreference,
  StylePreference,
  EmotionCategory,
} from "@/types/common";

/**
 * Generic API request handler
 * Pure function for making HTTP requests
 * Uses relative paths for Next.js internal API routes (current best practice)
 */
async function makeApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // For Next.js internal API routes, use relative paths directly
  const url = endpoint;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
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
 * Pure function for emotion-to-chord API interaction
 */
export async function generateChordFromEmotion(
  emotion: string,
  options?: {
    culturalPreference?: CulturalPreference;
    stylePreference?: StylePreference;
    includeProgression?: boolean;
    includeCulturalAlternatives?: boolean;
  }
): Promise<EmotionChordResponse> {
  const requestBody: EmotionRequest = { emotion, options };

  return makeApiRequest<EmotionChordResponse>("/api/emotion-to-chord", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
}

/**
 * Process multiple emotions in batch
 * Pure function for batch emotion processing
 */
export async function batchProcessEmotions(emotions: string[]): Promise<BatchResponse> {
  const requestBody: BatchRequest = { emotions };

  return makeApiRequest<BatchResponse>("/api/batch", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
}

/**
 * Get API health and feature information
 * Pure function for health check
 */
export async function getApiHealth(): Promise<HealthCheckResponse> {
  return makeApiRequest<HealthCheckResponse>("/api/health");
}

/**
 * Validate emotion input
 * Pure function for input validation
 */
export function validateEmotionInput(emotion: string): {
  isValid: boolean;
  error?: string;
} {
  if (!emotion.trim()) {
    return { isValid: false, error: "Emotion cannot be empty" };
  }

  if (emotion.length > 500) {
    return {
      isValid: false,
      error: "Emotion description too long (max 500 characters)",
    };
  }

  return { isValid: true };
}

/**
 * Get suggested emotion examples based on category
 * Pure function returning emotion examples
 */
export function getEmotionExamples(): Record<string, string[]> {
  return {
    basic: [
      "peaceful morning",
      "joyful celebration",
      "melancholic reflection",
      "anxious anticipation",
    ],
    complex: [
      "transcendent wonder with a touch of melancholy",
      "bittersweet nostalgia for a childhood home",
      "the feeling of looking at old photographs on a rainy afternoon",
      "spiritual devotion mixed with earthly longing",
    ],
    // cultural: [
    //   "the serenity of a Japanese tea ceremony",
    //   "the passionate intensity of flamenco",
    //   "the mystical depth of Sufi meditation",
    //   "the communal joy of an Senegalese celebration",
    // ],
    sophisticated: [
      "sophisticated nostalgia tinged with hope",
      "chaotic anxiety with underlying determination",
      "ethereal transcendence grounded in human warmth",
      "dramatic tension resolving into peaceful acceptance",
    ],
  };
}

/**
 * Get emotion examples by category
 * Pure function for category-specific examples
 */
export function getEmotionExamplesByCategory(category: EmotionCategory): string[] {
  const examples = getEmotionExamples();
  return examples[category] || [];
}

/**
 * Get random emotion example
 * Pure function for random example selection
 */
export function getRandomEmotionExample(category?: EmotionCategory): string {
  const examples = getEmotionExamples();

  if (category) {
    const categoryExamples = examples[category];
    return categoryExamples[Math.floor(Math.random() * categoryExamples.length)];
  }

  // Get random from all categories
  const allExamples = Object.values(examples).flat();
  return allExamples[Math.floor(Math.random() * allExamples.length)];
}
