import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeEmotion } from "@/lib/services/emotionAnalyzer";
import * as chordGeneration from "@/lib/chord-generation";
import type { AdvancedChordSuggestion, AdvancedEmotionAnalysis, ChordProgression } from "@/lib/types/emotion";

// Response type
interface EmotionChordResponse {
  chord: AdvancedChordSuggestion;
  emotionAnalysis: AdvancedEmotionAnalysis;
  progression?: ChordProgression;
  alternatives?: AdvancedChordSuggestion[];
}

const EmotionRequestSchema = z.object({
  emotion: z.string().min(1).max(500),
  options: z
    .object({
      culturalPreference: z
        .enum(["western", "indian", "arabic", "universal"])
        .optional(),
      stylePreference: z
        .enum(["classical", "jazz", "contemporary", "experimental"])
        .optional(),
      includeProgression: z.boolean().optional(),
      includeCulturalAlternatives: z.boolean().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = EmotionRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { emotion, options } = validation.data;
    
    // Get OpenAI API key
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    // Analyze emotion using functional approach
    const emotionAnalysis = await analyzeEmotion(openaiKey, emotion);

    // Generate chord using functional approach
    const chordOptions = {
      preferredRoot: undefined, // Could be derived from cultural preference
      voicingStyle: options?.stylePreference === "jazz" ? "drop2" : undefined,
    };
    const chordSuggestion = chordGeneration.generateChord(emotionAnalysis, chordOptions);

    // Generate additional content if requested
    const result: EmotionChordResponse = {
      chord: chordSuggestion,
      emotionAnalysis,
    };

    if (options?.includeProgression) {
      result.progression = chordGeneration.generateProgression(emotionAnalysis);
    }

    if (options?.includeCulturalAlternatives) {
      result.alternatives = chordGeneration.generateAlternatives(emotionAnalysis);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating chord:", error);
    return NextResponse.json(
      { error: "Failed to generate chord from emotion" },
      { status: 500 }
    );
  }
}
