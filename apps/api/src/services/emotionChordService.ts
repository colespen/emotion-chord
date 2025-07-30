import type {
  AdvancedEmotionAnalysis,
  EmotionChordResponse,
} from "../types/emotion.js";
import { AdvancedEmotionAnalyzer } from "./emotionAnalyzer.js";
import { AdvancedChordGenerator } from "./chordGenerator.js";
// import { SpotifyAnalyzer } from "./spotifyAnalyzer.js"; // disabled due to API restrictions
import { ADVANCED_EMOTION_MAPPINGS } from "../config/musicalMappings.js";

export class AdvancedEmotionChordService {
  private emotionAnalyzer: AdvancedEmotionAnalyzer;
  private chordGenerator: AdvancedChordGenerator;
  // private spotifyAnalyzer?: SpotifyAnalyzer; // disabled due to API restrictions

  constructor(
    openaiApiKey: string,
    spotifyClientId?: string,
    spotifyClientSecret?: string
  ) {
    this.emotionAnalyzer = new AdvancedEmotionAnalyzer(openaiApiKey);
    this.chordGenerator = new AdvancedChordGenerator();

    // temporarily disable Spotify integration due to new API restrictions
    // spotify now requires 250k+ MAUs and established business entity

    // if (spotifyClientId && spotifyClientSecret) {
    //   this.spotifyAnalyzer = new SpotifyAnalyzer(
    //     spotifyClientId,
    //     spotifyClientSecret
    //   );
    // }
  }

  async generateChordFromEmotion(
    emotionInput: string,
    options?: {
      culturalPreference?: string;
      stylePreference?: string;
      includeProgression?: boolean;
      includeCulturalAlternatives?: boolean;
    }
  ): Promise<EmotionChordResponse> {
    // step 1: Analyze emotion with advanced features
    const emotionAnalysis = await this.emotionAnalyzer.analyzeEmotion(emotionInput, {
      culturalPreference: options?.culturalPreference,
      stylePreference: options?.stylePreference,
    });

    // step 2: Generate acoustic features from emotion analysis
    // since Spotify API has restrictive requirements, we'll generate
    // acoustic features based on the emotion analysis itself
    const acousticFeatures = this.generateAcousticFeaturesFromEmotion(emotionAnalysis);
    emotionAnalysis.acousticFeatures = acousticFeatures;

    // step 2b: Legacy Spotify integration (disabled)
    // if (this.spotifyAnalyzer) {
    //   const spotifyFeatures = await this.spotifyAnalyzer.searchAndAnalyze(
    //     emotionInput
    //   );
    //   if (spotifyFeatures) {
    //     emotionAnalysis.acousticFeatures = spotifyFeatures;

    //     // adjust emotion based on Spotify data
    //     emotionAnalysis.valence =
    //       (emotionAnalysis.valence + spotifyFeatures.valence) / 2;
    //     emotionAnalysis.arousal =
    //       (emotionAnalysis.arousal + spotifyFeatures.energy) / 2;
    //   }
    // }

    // step 3: Generate sophisticated primary chord
    const primaryChord = this.chordGenerator.generateChord(emotionAnalysis);

    // step 4: Generate diverse alternatives
    const alternativeChords = this.chordGenerator.generateAlternatives(
      emotionAnalysis,
      4
    );

    // step 5: Build response
    const response: EmotionChordResponse = {
      emotion: emotionAnalysis,
      primaryChord,
      alternativeChords,
    };

    // step 6: Add optional progression
    if (options?.includeProgression) {
      response.chordProgression =
        this.chordGenerator.generateProgression(emotionAnalysis);
    }

    // step 7: Add cultural alternatives
    if (options?.includeCulturalAlternatives) {
      response.culturalAlternatives =
        this.generateCulturalAlternatives(emotionAnalysis);
    }

    return response;
  }

  private generateCulturalAlternatives(emotion: AdvancedEmotionAnalysis) {
    const alternatives: any = {};

    // indian raga suggestion
    const indianEmotions = ADVANCED_EMOTION_MAPPINGS.cultural.indian;
    for (const [raga, info] of Object.entries(indianEmotions)) {
      if (this.matchesEmotion(emotion.primaryEmotion, info.emotion)) {
        alternatives.indian = {
          name: raga,
          emotion: info.emotion,
          notes: info.notes,
          characteristic: `Raga ${raga} for ${info.emotion}`,
        };
        break;
      }
    }

    // arabic maqam suggestion
    const arabicEmotions = ADVANCED_EMOTION_MAPPINGS.cultural.arabic;
    for (const [maqam, info] of Object.entries(arabicEmotions)) {
      if (this.matchesEmotion(emotion.primaryEmotion, info.emotion)) {
        alternatives.arabic = {
          name: maqam,
          emotion: info.emotion,
          notes: info.notes,
          characteristic: `Maqam ${maqam} for ${info.emotion}`,
        };
        break;
      }
    }

    return alternatives;
  }

  private matchesEmotion(primary: string, target: string): boolean {
    // simple matching - could be enhanced
    return (
      primary.toLowerCase().includes(target.toLowerCase()) ||
      target.toLowerCase().includes(primary.toLowerCase())
    );
  }

  private generateAcousticFeaturesFromEmotion(emotion: AdvancedEmotionAnalysis) {
    // generate acoustic features based on emotion analysis
    // this replaces the need for Spotify API

    let energy = emotion.arousal;
    let valence = (emotion.valence + 1) / 2; // Convert from -1,1 to 0,1
    let danceability = emotion.arousal * 0.8; // High arousal usually more danceable
    let acousticness = 1 - emotion.arousal; // Lower arousal tends to be more acoustic
    let instrumentalness = 0.5; // Default middle value
    let speechiness = 0.1; // Generally low for music
    let liveness = 0.2; // Default studio recording feel

    // adjust based on GEMS emotions if available
    if (emotion.gems) {
      if (emotion.gems.power && emotion.gems.power > 0.7) {
        energy = Math.max(energy, 0.8);
        danceability = Math.max(danceability, 0.7);
      }

      if (emotion.gems.peacefulness && emotion.gems.peacefulness > 0.7) {
        energy = Math.min(energy, 0.4);
        acousticness = Math.max(acousticness, 0.7);
      }

      if (emotion.gems.tenderness && emotion.gems.tenderness > 0.7) {
        acousticness = Math.max(acousticness, 0.6);
        energy = Math.min(energy, 0.5);
      }

      if (emotion.gems.transcendence && emotion.gems.transcendence > 0.7) {
        instrumentalness = Math.max(instrumentalness, 0.8);
        acousticness = Math.max(acousticness, 0.6);
      }
    }

    // adjust based on musical mode
    if (emotion.musicalMode === "minor" || emotion.musicalMode === "dorian") {
      valence = Math.min(valence, 0.6);
    } else if (emotion.musicalMode === "major") {
      valence = Math.max(valence, 0.4);
    }

    // cultural context adjustments
    if (emotion.culturalContext === "indian") {
      instrumentalness = Math.max(instrumentalness, 0.7);
      acousticness = Math.max(acousticness, 0.6);
    } else if (emotion.culturalContext === "arabic") {
      instrumentalness = Math.max(instrumentalness, 0.6);
    }

    return {
      energy: Math.max(0, Math.min(1, energy)),
      valence: Math.max(0, Math.min(1, valence)),
      danceability: Math.max(0, Math.min(1, danceability)),
      acousticness: Math.max(0, Math.min(1, acousticness)),
      instrumentalness: Math.max(0, Math.min(1, instrumentalness)),
      speechiness: Math.max(0, Math.min(1, speechiness)),
      liveness: Math.max(0, Math.min(1, liveness)),
    };
  }
}
