import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { batchAnalyzeEmotions } from "@/lib/services/emotionAnalyzer";
import * as chordGeneration from "@/lib/chord-generation";
import type { AdvancedChordSuggestion, AdvancedEmotionAnalysis } from "@/lib/types/emotion";

// Response type for batch processing
interface BatchChordResponse {
  emotion: string;
  chord: AdvancedChordSuggestion;
  emotionAnalysis: AdvancedEmotionAnalysis;
}

const BatchRequestSchema = z.object({
  emotions: z.array(z.string()).max(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = BatchRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { emotions } = validation.data;
    
    // Get OpenAI API key
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    // Analyze emotions using functional batch approach
    const emotionAnalyses = await batchAnalyzeEmotions(openaiKey, emotions);
    
    const results: BatchChordResponse[] = emotionAnalyses.map((emotionAnalysis, index) => {
      const emotion = emotions[index];
      const chord = chordGeneration.generateChord(emotionAnalysis);
      
      return {
        emotion,
        chord,
        emotionAnalysis,
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Batch processing error:", error);
    return NextResponse.json(
      { error: "Failed to process batch" },
      { status: 500 }
    );
  }
}
