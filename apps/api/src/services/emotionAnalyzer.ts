import OpenAI from "openai";
import { z } from "zod";
import type { EmotionAnalysis } from "../types/emotion.js";

const EmotionAnalysisSchema = z.object({
  primaryEmotion: z.string(),
  secondaryEmotions: z.array(z.string()),
  valence: z.number().min(-1).max(1),
  arousal: z.number().min(0).max(1),
  tension: z.number().min(0).max(1),
  complexity: z.number().min(0).max(1),
  musicalMode: z.enum([
    "major",
    "minor",
    "dorian",
    "mixolydian",
    "lydian",
    "phrygian",
    "locrian",
  ]),
  suggestedTempo: z.number().min(40).max(200),
});

// Russell's Circumplex Model emotion examples
const EMOTION_EXAMPLES = {
  // High Arousal + Positive Valence
  excited: { valence: 0.8, arousal: 0.9, quadrant: "high arousal positive" },
  elated: { valence: 0.9, arousal: 0.8, quadrant: "high arousal positive" },
  happy: { valence: 0.7, arousal: 0.7, quadrant: "high arousal positive" },
  delighted: { valence: 0.8, arousal: 0.8, quadrant: "high arousal positive" },

  // High Arousal + Negative Valence
  angry: { valence: -0.8, arousal: 0.9, quadrant: "high arousal negative" },
  afraid: { valence: -0.7, arousal: 0.8, quadrant: "high arousal negative" },
  alarmed: { valence: -0.9, arousal: 0.9, quadrant: "high arousal negative" },
  tense: { valence: -0.6, arousal: 0.7, quadrant: "high arousal negative" },
  frustrated: {
    valence: -0.7,
    arousal: 0.8,
    quadrant: "high arousal negative",
  },

  // Low Arousal + Positive Valence
  content: { valence: 0.6, arousal: 0.3, quadrant: "low arousal positive" },
  serene: { valence: 0.7, arousal: 0.2, quadrant: "low arousal positive" },
  relaxed: { valence: 0.6, arousal: 0.2, quadrant: "low arousal positive" },
  calm: { valence: 0.5, arousal: 0.1, quadrant: "low arousal positive" },
  peaceful: { valence: 0.7, arousal: 0.1, quadrant: "low arousal positive" },

  // Low Arousal + Negative Valence
  sad: { valence: -0.7, arousal: 0.2, quadrant: "low arousal negative" },
  depressed: { valence: -0.8, arousal: 0.1, quadrant: "low arousal negative" },
  lethargic: { valence: -0.5, arousal: 0.1, quadrant: "low arousal negative" },
  tired: { valence: -0.4, arousal: 0.2, quadrant: "low arousal negative" },
  gloomy: { valence: -0.6, arousal: 0.3, quadrant: "low arousal negative" },

  // Mixed/Complex emotions
  nostalgic: { valence: -0.2, arousal: 0.4, quadrant: "mixed" },
  bittersweet: { valence: 0.1, arousal: 0.5, quadrant: "mixed" },
  melancholic: { valence: -0.4, arousal: 0.3, quadrant: "mixed" },
  anxious: { valence: -0.5, arousal: 0.7, quadrant: "high arousal negative" },
  hopeful: {
    valence: 0.5,
    arousal: 0.6,
    quadrant: "moderate arousal positive",
  },
};

export class EmotionAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyzeEmotion(input: string): Promise<EmotionAnalysis> {
    const systemPrompt = `You are a music psychologist expert in mapping emotions to musical characteristics using Russell's Circumplex Model of Affect.

Russell's Circumplex Model positions emotions on two dimensions:
- VALENCE (x-axis): Unpleasant (-1) to Pleasant (+1)
- AROUSAL (y-axis): Deactivation (0) to Activation (1)

Here are reference emotion mappings based on Russell's model:
${JSON.stringify(EMOTION_EXAMPLES, null, 2)}

Musical mapping principles:
- High valence → major modes (major, lydian, mixolydian)
- Low valence → minor modes (minor, phrygian, locrian)
- Neutral valence → modal (dorian)
- High arousal → faster tempo (100-180 BPM), complex rhythms, tension
- Low arousal → slower tempo (40-80 BPM), simple patterns, resolution
- Tension derives from both arousal and negative valence
- Complexity increases for emotions near the center or with mixed feelings

Mode selection guidelines:
- Very positive (>0.7): major, lydian
- Positive (0.3-0.7): major, mixolydian
- Neutral (-0.3-0.3): dorian
- Negative (-0.7--0.3): minor
- Very negative (<-0.7): phrygian, locrian

Analyze the given emotion/feeling and return a JSON object with these exact fields:
- primaryEmotion: The main emotion (one word)
- secondaryEmotions: Array of related emotions (2-3 words)
- valence: -1 (very unpleasant) to 1 (very pleasant)
- arousal: 0 (very deactivated/calm) to 1 (very activated/energetic)
- tension: 0 (very relaxed) to 1 (very tense) - IMPORTANT: calculate as arousal * (1 - valence) / 2
  For example: anger with arousal=0.9 and valence=-0.8 → tension = 0.9 * (1 - (-0.8)) / 2 = 0.9 * 1.8 / 2 = 0.81
- complexity: 0 (simple/pure emotion) to 1 (complex/mixed emotions) - IMPORTANT: should be higher (0.3-0.7) if multiple secondary emotions are present or if the emotion has conflicting aspects. Pure single emotions = low complexity (0-0.3), mixed/layered emotions = high complexity (0.5-1.0)
- musicalMode: Choose from major, minor, dorian, mixolydian, lydian, phrygian, locrian
- suggestedTempo: BPM that matches the arousal level - calculate as: 60 + (arousal * 100)

CRITICAL: Ensure tension is calculated correctly using the formula above. High arousal + negative valence = high tension!`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this emotion: "${input}"` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from OpenAI");

      const parsed = JSON.parse(content);
      return EmotionAnalysisSchema.parse(parsed);
    } catch (error) {
      console.error("Error analyzing emotion:", error);
      throw new Error("Failed to analyze emotion");
    }
  }
}
