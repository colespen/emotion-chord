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
    const systemPrompt = `You are an advanced music psychology expert combining multiple emotion theories:

1. Russell's Circumplex Model (valence/arousal)
2. Geneva Emotional Music Scale (GEMS) - 9 music-specific emotions
3. Cross-cultural emotion mappings (Indian raga, Arabic maqam)
4. Modern music psychology research

Analyze the given emotion and return a comprehensive JSON object with ALL of the following fields (no fields should be missing):

REQUIRED Core dimensions:
- primaryEmotion: Main emotion identified (string)
- secondaryEmotions: Related emotions array (e.g., ["melancholy", "longing"])
- emotionalIntensity: Overall intensity (number 0-1)
- valence: Pleasure dimension (number -1 to 1)
- arousal: Activation dimension (number 0 to 1)
- tension: Calculated as arousal * (1 - valence) / 2 (number 0-1)
- complexity: Emotional nuance/layers (number 0-1)

REQUIRED Musical parameters:
- musicalMode: one of "major", "minor", "dorian", "mixolydian", "lydian", "phrygian", "locrian", "chromatic", "atonal"
- suggestedTempo: BPM matching the emotion (number 40-200)

OPTIONAL GEMS dimensions (include if relevant, 0-1 each):
- gems: object with any of these emotions that apply:
  - joy: Happiness, elation, gaiety
  - sadness: Melancholy, grief, sorrow  
  - tension: Stress, agitation, nervousness
  - wonder: Amazement, awe, dazzled
  - peacefulness: Calm, relaxed, serene
  - power: Strong, triumphant, energetic
  - tenderness: Gentle, soft, mellow
  - nostalgia: Dreamy, melancholic longing
  - transcendence: Inspired, spiritual, thrilled

OPTIONAL Context:
- culturalContext: "western", "indian", "arabic", or "universal"
- harmonicStyle: "classical", "jazz", "contemporary", or "experimental"

EXAMPLE OUTPUT:
{
  "primaryEmotion": "wonder",
  "secondaryEmotions": ["transcendence", "melancholy"],
  "emotionalIntensity": 0.8,
  "valence": 0.3,
  "arousal": 0.7,
  "tension": 0.25,
  "complexity": 0.9,
  "musicalMode": "lydian",
  "suggestedTempo": 80,
  "gems": {
    "wonder": 0.9,
    "transcendence": 0.8,
    "sadness": 0.3
  },
  "culturalContext": "universal",
  "harmonicStyle": "contemporary"
}

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

      console.log("Raw OpenAI response:", content);
      
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse OpenAI response as JSON:", parseError);
        throw new Error("Invalid JSON response from OpenAI");
      }

      console.log("Parsed OpenAI response:", parsed);
      
      // Use safeParse to get better error information
      const result = AdvancedEmotionSchema.safeParse(parsed);
      if (!result.success) {
        console.error("Schema validation failed:", result.error.issues);
        // Provide fallback values for missing required fields
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
