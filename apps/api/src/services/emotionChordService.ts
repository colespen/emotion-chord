import type {
  AdvancedEmotionAnalysis,
  EmotionChordResponse,
} from "../types/emotion.js";
import { AdvancedEmotionAnalyzer } from "./emotionAnalyzer.js";
import { AdvancedChordGenerator } from "./chordGenerator.js";
// import { SpotifyAnalyzer } from "./spotifyAnalyzer.js"; // Disabled due to API restrictions
import { ADVANCED_EMOTION_MAPPINGS } from "../config/musicalMappings.js";

export class AdvancedEmotionChordService {
  private emotionAnalyzer: AdvancedEmotionAnalyzer;
  private chordGenerator: AdvancedChordGenerator;
  // private spotifyAnalyzer?: SpotifyAnalyzer; // Disabled due to API restrictions

  constructor(
    openaiApiKey: string,
    spotifyClientId?: string,
    spotifyClientSecret?: string
  ) {
    this.emotionAnalyzer = new AdvancedEmotionAnalyzer(openaiApiKey);
    this.chordGenerator = new AdvancedChordGenerator();

    console.log("Initializing AdvancedEmotionChordService...");
    console.log("Spotify Client ID present:", !!spotifyClientId);
    console.log("Spotify Client Secret present:", !!spotifyClientSecret);

    // Temporarily disable Spotify integration due to new API restrictions
    // Spotify now requires 250k+ MAUs and established business entity
    console.log("Spotify integration temporarily disabled due to API restrictions");
    
    // if (spotifyClientId && spotifyClientSecret) {
    //   console.log("Creating Spotify analyzer...");
    //   this.spotifyAnalyzer = new SpotifyAnalyzer(
    //     spotifyClientId,
    //     spotifyClientSecret
    //   );
    // } else {
    //   console.log("Spotify integration disabled - missing credentials");
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
    // Step 1: Analyze emotion with advanced features
    const emotionAnalysis = await this.emotionAnalyzer.analyzeEmotion(
      emotionInput,
      {
        culturalPreference: options?.culturalPreference,
        stylePreference: options?.stylePreference,
      }
    );

    console.log("Emotion Analysis:", emotionAnalysis);

    // Step 2: Generate acoustic features from emotion analysis
    // Since Spotify API has restrictive requirements, we'll generate
    // acoustic features based on the emotion analysis itself
    const acousticFeatures = this.generateAcousticFeaturesFromEmotion(emotionAnalysis);
    emotionAnalysis.acousticFeatures = acousticFeatures;
    console.log("Generated acoustic features:", acousticFeatures);

    // Step 2b: Legacy Spotify integration (disabled)
    // if (this.spotifyAnalyzer) {
    //   const spotifyFeatures = await this.spotifyAnalyzer.searchAndAnalyze(
    //     emotionInput
    //   );
    //   console.log("Spotify Features:", spotifyFeatures);
    //   if (spotifyFeatures) {
    //     emotionAnalysis.acousticFeatures = spotifyFeatures;

    //     // Adjust emotion based on Spotify data
    //     emotionAnalysis.valence = 
    //       (emotionAnalysis.valence + spotifyFeatures.valence) / 2;
    //     emotionAnalysis.arousal = 
    //       (emotionAnalysis.arousal + spotifyFeatures.energy) / 2;
    //   }
    // }    // Step 3: Generate sophisticated primary chord
    const primaryChord = this.chordGenerator.generateChord(emotionAnalysis);

    console.log("Primary Chord:", primaryChord);

    // Step 4: Generate diverse alternatives
    const alternativeChords = this.chordGenerator.generateAlternatives(
      emotionAnalysis,
      4
    );

    console.log("Alternative Chords:", alternativeChords);

    // Step 5: Build response
    const response: EmotionChordResponse = {
      emotion: emotionAnalysis,
      primaryChord,
      alternativeChords,
    };

    // Step 6: Add optional progression
    if (options?.includeProgression) {
      response.chordProgression =
        this.chordGenerator.generateProgression(emotionAnalysis);
    }

    // Step 7: Add cultural alternatives
    if (options?.includeCulturalAlternatives) {
      response.culturalAlternatives =
        this.generateCulturalAlternatives(emotionAnalysis);
    }

    console.log("Final Response:", response);

    return response;
  }

  private generateCulturalAlternatives(emotion: AdvancedEmotionAnalysis) {
    const alternatives: any = {};

    // Indian raga suggestion
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

    // Arabic maqam suggestion
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
    // Simple matching - could be enhanced
    return (
      primary.toLowerCase().includes(target.toLowerCase()) ||
      target.toLowerCase().includes(primary.toLowerCase())
    );
  }

  private generateAcousticFeaturesFromEmotion(emotion: AdvancedEmotionAnalysis) {
    // Generate acoustic features based on emotion analysis
    // This replaces the need for Spotify API
    
    let energy = emotion.arousal;
    let valence = (emotion.valence + 1) / 2; // Convert from -1,1 to 0,1
    let danceability = emotion.arousal * 0.8; // High arousal usually more danceable
    let acousticness = 1 - emotion.arousal; // Lower arousal tends to be more acoustic
    let instrumentalness = 0.5; // Default middle value
    let speechiness = 0.1; // Generally low for music
    let liveness = 0.2; // Default studio recording feel

    // Adjust based on GEMS emotions if available
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

    // Adjust based on musical mode
    if (emotion.musicalMode === 'minor' || emotion.musicalMode === 'dorian') {
      valence = Math.min(valence, 0.6);
    } else if (emotion.musicalMode === 'major') {
      valence = Math.max(valence, 0.4);
    }

    // Cultural context adjustments
    if (emotion.culturalContext === 'indian') {
      instrumentalness = Math.max(instrumentalness, 0.7);
      acousticness = Math.max(acousticness, 0.6);
    } else if (emotion.culturalContext === 'arabic') {
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
