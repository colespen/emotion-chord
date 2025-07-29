import type { EmotionChordResponse } from "../types/emotion.js";
import { EmotionAnalyzer } from "./emotionAnalyzer.js";
import { ChordGenerator } from "./chordGenerator.js";

export class EmotionChordService {
  private emotionAnalyzer: EmotionAnalyzer;
  private chordGenerator: ChordGenerator;

  constructor(openaiApiKey: string) {
    this.emotionAnalyzer = new EmotionAnalyzer(openaiApiKey);
    this.chordGenerator = new ChordGenerator();
  }

  async generateChordFromEmotion(
    emotionInput: string
  ): Promise<EmotionChordResponse> {
    // Step 1: Analyze the emotion
    const emotionAnalysis = await this.emotionAnalyzer.analyzeEmotion(
      emotionInput
    );

    // Step 2: Generate primary chord
    const primaryChord = this.chordGenerator.generateChord(emotionAnalysis);

    // Step 3: Generate alternatives
    const alternativeChords =
      this.chordGenerator.generateAlternatives(emotionAnalysis);

    return {
      emotion: emotionAnalysis,
      primaryChord,
      alternativeChords,
    };
  }
}
