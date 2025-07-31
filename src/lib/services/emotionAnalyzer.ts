import OpenAI from "openai";
import { z } from "zod";
import type { AdvancedEmotionAnalysis } from "@/types/emotionChord";

const AdvancedEmotionSchema = z.object({
  primaryEmotion: z.string(),
  secondaryEmotions: z.array(z.string()).default([]),
  emotionalIntensity: z.number().min(0).max(1).default(0.5),
  valence: z.number().min(-1).max(1).default(0),
  arousal: z.number().min(0).max(1).default(0.5),
  tension: z.number().min(0).max(1).default(0.5),
  complexity: z.number().min(0).max(1).default(0.5),
  musicalMode: z.string().default("major"),
  suggestedTempo: z.number().min(40).max(200).default(120),
  gems: z
    .object({
      joy: z.number().optional(),
      sadness: z.number().optional(),
      tension: z.number().optional(),
      wonder: z.number().optional(),
      peacefulness: z.number().optional(),
      power: z.number().optional(),
      tenderness: z.number().optional(),
      nostalgia: z.number().optional(),
      transcendence: z.number().optional(),
    })
    .optional(),
  culturalContext: z.enum(["western", "indian", "arabic", "universal"]).optional(),
  harmonicStyle: z
    .enum(["classical", "jazz", "contemporary", "experimental"])
    .optional(),
});

const commonEmotions = [
  "happy",
  "sad",
  "angry",
  "fear",
  "joy",
  "love",
  "peace",
  "calm",
  "excited",
  "nervous",
  "confident",
  "worried",
  "hopeful",
  "grateful",
  "lonely",
  "proud",
  "disappointed",
  "surprised",
  "content",
  "frustrated",
  "relaxed",
  "anxious",
];

// Helper function to extract primary emotion from input text
const extractPrimaryEmotion = (input: string): string | null => {
  const words = input.toLowerCase().split(/\s+/);
  return (
    commonEmotions.find((emotion) =>
      words.some((word) => word.includes(emotion) || emotion.includes(word))
    ) || null
  );
};

// OpenAI client factory function
let openaiClient: OpenAI | null = null;

export const createOpenAIClient = (apiKey: string): OpenAI => {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
};

export const analyzeEmotion = async (
  apiKey: string,
  input: string,
  context?: {
    culturalPreference?: string;
    stylePreference?: string;
    previousEmotions?: string[];
  }
): Promise<AdvancedEmotionAnalysis> => {
  const openai = createOpenAIClient(apiKey);

  const systemPrompt = `You must return a valid JSON object with ALL required fields. Return only JSON, no other text.

REQUIRED STRUCTURE:
{
  "primaryEmotion": "string - main emotion",
  "secondaryEmotions": ["array", "of", "related", "emotions"],
  "emotionalIntensity": 0.5,
  "valence": 0.0,
  "arousal": 0.5,
  "tension": 0.25,
  "complexity": 0.5,
  "musicalMode": "major",
  "suggestedTempo": 120
}

FIELD DEFINITIONS:
- primaryEmotion: main emotion as string (REQUIRED)
- secondaryEmotions: array of related emotions (REQUIRED, can be empty [])
- emotionalIntensity: intensity 0-1 (REQUIRED)
- valence: pleasure dimension -1 to 1 (REQUIRED)
- arousal: activation dimension 0-1 (REQUIRED) 
- tension: emotional tension 0-1 (REQUIRED)
- complexity: emotional complexity 0-1 (REQUIRED)
- musicalMode: "major", "minor", "dorian", "mixolydian", "lydian", "phrygian", "locrian", "chromatic", "atonal" (REQUIRED)
- suggestedTempo: BPM 40-200 (REQUIRED)

OPTIONAL FIELDS (include if relevant):
- gems: {joy: 0.8, sadness: 0.2, tension: 0.3, wonder: 0.5, peacefulness: 0.1, power: 0.7, tenderness: 0.4, nostalgia: 0.6, transcendence: 0.3}
- culturalContext: ${JSON.stringify([
    "western",
    "indian",
    "arabic",
    "universal",
  ])} // CulturalPreference type
- harmonicStyle: ${JSON.stringify([
    "classical",
    "jazz",
    "contemporary",
    "experimental",
  ])} // StylePreference type

${context ? `Context: ${JSON.stringify(context)}` : ""}

Return complete JSON for emotion analysis.`;

  try {
    const response = await openai.chat.completions.create({
      // model: "gpt-4o",
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze this emotional input and return complete JSON: "${input}"`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.25,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error("No response from OpenAI");
      throw new Error("No response from OpenAI");
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      console.error("Raw content:", content);
      throw new Error("Invalid JSON response from OpenAI");
    }

    const result = AdvancedEmotionSchema.safeParse(parsed);
    if (!result.success) {
      console.error("Schema validation failed:", result.error.issues);
      console.error("Received data:", JSON.stringify(parsed, null, 2));

      // Enhanced fallback with better emotion detection
      const primaryEmotion =
        parsed.primaryEmotion ||
        parsed.emotion ||
        parsed.mainEmotion ||
        extractPrimaryEmotion(input) ||
        "neutral";

      const fallbackData = {
        primaryEmotion,
        secondaryEmotions: Array.isArray(parsed.secondaryEmotions)
          ? parsed.secondaryEmotions
          : [],
        emotionalIntensity:
          typeof parsed.emotionalIntensity === "number"
            ? parsed.emotionalIntensity
            : 0.5,
        valence: typeof parsed.valence === "number" ? parsed.valence : 0,
        arousal: typeof parsed.arousal === "number" ? parsed.arousal : 0.5,
        tension: typeof parsed.tension === "number" ? parsed.tension : 0.5,
        complexity: typeof parsed.complexity === "number" ? parsed.complexity : 0.5,
        musicalMode:
          typeof parsed.musicalMode === "string" ? parsed.musicalMode : "major",
        suggestedTempo:
          typeof parsed.suggestedTempo === "number" ? parsed.suggestedTempo : 120,
        // Preserve any additional valid fields
        ...(parsed.gems && typeof parsed.gems === "object"
          ? { gems: parsed.gems }
          : {}),
        ...(parsed.culturalContext ? { culturalContext: parsed.culturalContext } : {}),
        ...(parsed.harmonicStyle ? { harmonicStyle: parsed.harmonicStyle } : {}),
      };

      const fallbackResult = AdvancedEmotionSchema.safeParse(fallbackData);
      if (!fallbackResult.success) {
        console.error("Fallback validation also failed:", fallbackResult.error.issues);
        throw new Error("Unable to create valid emotion analysis");
      }
      return fallbackResult.data;
    }

    return result.data;
  } catch (error) {
    console.error("Error analyzing emotion:", error);
    throw new Error("Failed to analyze emotion");
  }
};

// Batch analysis helper function
export const batchAnalyzeEmotions = async (
  apiKey: string,
  inputs: string[],
  context?: {
    culturalPreference?: string;
    stylePreference?: string;
    previousEmotions?: string[];
  }
): Promise<AdvancedEmotionAnalysis[]> => {
  return Promise.all(inputs.map((input) => analyzeEmotion(apiKey, input, context)));
};

// Reset client function for testing or key rotation
export const resetOpenAIClient = (): void => {
  openaiClient = null;
};
