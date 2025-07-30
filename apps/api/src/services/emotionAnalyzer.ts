import OpenAI from "openai";
import { z } from "zod";
import type { AdvancedEmotionAnalysis } from "../types/emotion.js";

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
  culturalContext: z
    .enum(["western", "indian", "arabic", "universal"])
    .optional(),
  harmonicStyle: z
    .enum(["classical", "jazz", "contemporary", "experimental"])
    .optional(),
});

export class AdvancedEmotionAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyzeEmotion(
    input: string,
    context?: {
      culturalPreference?: string;
      stylePreference?: string;
      previousEmotions?: string[];
    }
  ): Promise<AdvancedEmotionAnalysis> {
    const systemPrompt = `analyze emotion and return comprehensive JSON with all required fields:

Core dimensions:
- primaryEmotion: main emotion (string)
- secondaryEmotions: related emotions array
- emotionalIntensity: overall intensity (0-1)
- valence: pleasure dimension (-1 to 1)
- arousal: activation dimension (0-1)
- tension: calculated as arousal * (1 - valence) / 2 (0-1)
- complexity: emotional nuance/layers (0-1)

Musical parameters:
- musicalMode: "major", "minor", "dorian", "mixolydian", "lydian", "phrygian", "locrian", "chromatic", "atonal"
- suggestedTempo: BPM matching emotion (40-200)

Optional GEMS dimensions (0-1 each if relevant):
- gems: object with applicable emotions: joy, sadness, tension, wonder, peacefulness, power, tenderness, nostalgia, transcendence

Optional Context:
- culturalContext: "western", "indian", "arabic", "universal"
- harmonicStyle: "classical", "jazz", "contemporary", "experimental"

${context ? `Context: ${JSON.stringify(context)}` : ""}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this emotional input: "${input}"` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from OpenAI");
      
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse OpenAI response as JSON:", parseError);
        throw new Error("Invalid JSON response from OpenAI");
      }
      
      const result = AdvancedEmotionSchema.safeParse(parsed);
      if (!result.success) {
        console.error("Schema validation failed:", result.error.issues);
        const fallbackData = {
          primaryEmotion: parsed.primaryEmotion || input.split(' ')[0] || "neutral",
          secondaryEmotions: parsed.secondaryEmotions || [],
          emotionalIntensity: parsed.emotionalIntensity || 0.5,
          valence: parsed.valence || 0,
          arousal: parsed.arousal || 0.5,
          tension: parsed.tension || 0.5,
          complexity: parsed.complexity || 0.5,
          musicalMode: parsed.musicalMode || "major",
          suggestedTempo: parsed.suggestedTempo || 120,
          ...parsed
        };
        console.log("Using fallback data:", fallbackData);
        return AdvancedEmotionSchema.parse(fallbackData);
      }
      
      return result.data;
    } catch (error) {
      console.error("Error analyzing emotion:", error);
      throw new Error("Failed to analyze emotion");
    }
  }
}
