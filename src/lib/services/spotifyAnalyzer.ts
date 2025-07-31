/**
 * Spotify Audio Analysis - Functional Implementation
 * Pure functions for Spotify audio feature analysis - currenty NOT INTEGRATED
 */

// Define Spotify interfaces
interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string };
}

interface SpotifyAudioFeatures {
  valence: number;
  energy: number;
  danceability: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
  liveness: number;
  tempo: number;
}

interface AudioFeaturesAccumulator {
  valence: number;
  energy: number;
  danceability: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
  liveness: number;
}

interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
}

interface SpotifyTokenResponse {
  access_token: string;
  expires_in: number;
}

const emotionWords = [
  "happy",
  "sad",
  "angry",
  "calm",
  "excited",
  "peaceful",
  "dark",
  "bright",
  "melancholy",
  "joyful",
  "energetic",
  "somber",
  "uplifting",
  "dramatic",
  "tender",
  "powerful",
  "gentle",
  "intense",
  "serene",
  "nostalgic",
  "transcendent",
  "wonder",
  "love",
  "hope",
  "fear",
  "anxiety",
  "relaxed",
];

// mock API functions (can be replaced with real Spotify SDK when available)
async function getSpotifyToken(config: SpotifyConfig): Promise<SpotifyTokenResponse> {
  // mock token response
  console.log("Mock Spotify token requested for client:", config.clientId);
  return {
    access_token: "mock_token",
    expires_in: 3600,
  };
}

async function searchSpotifyTracks(
  query: string,
  limit: number,
  token: string
): Promise<SpotifyTrack[]> {
  // mock search response
  console.log(
    "Mock Spotify search for:",
    query,
    "limit:",
    limit,
    "token:",
    token ? "present" : "missing"
  );
  return [];
}

async function getTrackAudioFeatures(
  trackIds: string[]
  // token: string
): Promise<(SpotifyAudioFeatures | null)[]> {
  // mock audio features response
  console.log("Mock audio features requested for", trackIds.length, "tracks");
  return [];
}

async function getSingleTrackAudioFeatures(
  trackId: string
  // token: string
): Promise<SpotifyAudioFeatures | null> {
  // mock single track audio features
  console.log("Mock audio features requested for track:", trackId);
  return {
    valence: 0.5,
    energy: 0.5,
    danceability: 0.5,
    acousticness: 0.5,
    instrumentalness: 0.5,
    speechiness: 0.1,
    liveness: 0.2,
    tempo: 120,
  };
}

/**
 * extract emotion keywords from emotion text
 * pure fn for keyword extraction
 */
export function extractEmotionKeywords(emotion: string): string {
  const words = emotion.toLowerCase().split(/\s+/);
  const foundEmotions = words.filter((word) =>
    emotionWords.some((emo) => word.includes(emo) || emo.includes(word))
  );

  // If we found emotion words, use them, otherwise use the first few words
  return foundEmotions.length > 0
    ? foundEmotions.slice(0, 3).join(" ")
    : words.slice(0, 3).join(" ");
}

/**
 * Estimate audio features from emotion keywords
 * pure fn for emotion-based feature estimation
 */
export function estimateAudioFeaturesFromEmotion(
  emotionKeywords: string
): SpotifyAudioFeatures {
  const keywords = emotionKeywords.toLowerCase();

  let valence = 0.5; // Default neutral
  let energy = 0.5;
  let danceability = 0.5;
  let acousticness = 0.5;

  // Adjust based on emotion keywords
  if (keywords.includes("transcendent") || keywords.includes("wonder")) {
    valence = 0.7;
    energy = 0.6;
    acousticness = 0.7;
  }
  if (keywords.includes("melancholy") || keywords.includes("sad")) {
    valence = 0.3;
    energy = 0.4;
    acousticness = 0.6;
  }
  if (keywords.includes("bright") || keywords.includes("happy")) {
    valence = 0.8;
    energy = 0.7;
    danceability = 0.7;
  }
  if (keywords.includes("dark") || keywords.includes("somber")) {
    valence = 0.2;
    energy = 0.3;
    acousticness = 0.4;
  }

  return {
    valence,
    energy,
    danceability,
    acousticness,
    instrumentalness: 0.5,
    speechiness: 0.1,
    liveness: 0.2,
    tempo: 120,
  };
}

/**
 * average multiple audio features
 * pure function for feature aggregation
 */
export function averageAudioFeatures(
  features: (SpotifyAudioFeatures | null)[]
): SpotifyAudioFeatures | null {
  const validFeatures = features.filter((f): f is SpotifyAudioFeatures => f !== null);

  if (validFeatures.length === 0) {
    return null;
  }

  const avgFeatures = validFeatures.reduce(
    (acc: AudioFeaturesAccumulator, track: SpotifyAudioFeatures) => ({
      valence: acc.valence + track.valence,
      energy: acc.energy + track.energy,
      danceability: acc.danceability + track.danceability,
      acousticness: acc.acousticness + track.acousticness,
      instrumentalness: acc.instrumentalness + track.instrumentalness,
      speechiness: acc.speechiness + track.speechiness,
      liveness: acc.liveness + track.liveness,
    }),
    {
      valence: 0,
      energy: 0,
      danceability: 0,
      acousticness: 0,
      instrumentalness: 0,
      speechiness: 0,
      liveness: 0,
    }
  );

  const count = validFeatures.length;
  const avgTempo = validFeatures.reduce((sum, f) => sum + f.tempo, 0) / count;

  return {
    valence: avgFeatures.valence / count,
    energy: avgFeatures.energy / count,
    danceability: avgFeatures.danceability / count,
    acousticness: avgFeatures.acousticness / count,
    instrumentalness: avgFeatures.instrumentalness / count,
    speechiness: avgFeatures.speechiness / count,
    liveness: avgFeatures.liveness / count,
    tempo: avgTempo,
  };
}

/**
 * get audio features for tracks with fallback strategies
 * function w error handling and fallback logic
 */
async function getAudioFeaturesWithFallback(
  trackIds: string[],
  token: string
): Promise<(SpotifyAudioFeatures | null)[]> {
  try {
    console.log({ token });
    return await getTrackAudioFeatures(trackIds);
  } catch (error) {
    console.error("Failed to get batch audio features:", error);

    // fallback: try getting features one by one
    const individualFeatures: (SpotifyAudioFeatures | null)[] = [];

    for (const trackId of trackIds.slice(0, 3)) {
      // Limit to 3 tracks for fallback
      try {
        const feature = await getSingleTrackAudioFeatures(trackId);
        individualFeatures.push(feature);
      } catch (individualError) {
        console.error(`Failed to get features for track ${trackId}:`, individualError);
        individualFeatures.push(null);
      }
    }

    return individualFeatures;
  }
}

/**
 * search and analyze emotion through Spotify audio features
 * main function for emotion-based audio analysis
 */
export async function searchAndAnalyzeEmotion(
  emotion: string,
  config: SpotifyConfig,
  limit: number = 5,
  cachedToken?: { token: string; expiry: number }
): Promise<SpotifyAudioFeatures | null> {
  try {
    // Get or refresh token
    let token = cachedToken?.token;

    if (!token || Date.now() > (cachedToken?.expiry || 0)) {
      const tokenResponse = await getSpotifyToken(config);
      token = tokenResponse.access_token;
    }

    // extract emotion keywords for better search
    const emotionKeywords = extractEmotionKeywords(emotion);

    // search for tracks matching the emotion
    const tracks = await searchSpotifyTracks(emotionKeywords, limit, token);

    if (tracks.length === 0) {
      // fallback to emotion-based estimation
      return estimateAudioFeaturesFromEmotion(emotionKeywords);
    }

    const trackIds = tracks.map((track) => track.id);

    // get audio features with fallback handling
    const audioFeatures = await getAudioFeaturesWithFallback(trackIds, token);

    if (audioFeatures.every((f) => f === null)) {
      // all API calls failed, use emotion-based estimation
      return estimateAudioFeaturesFromEmotion(emotionKeywords);
    }

    // average the features
    const avgFeatures = averageAudioFeatures(audioFeatures);

    return avgFeatures || estimateAudioFeaturesFromEmotion(emotionKeywords);
  } catch (error) {
    console.error("Spotify analysis error:", error);

    // Final fallback: use emotion-based estimation
    const emotionKeywords = extractEmotionKeywords(emotion);
    return estimateAudioFeaturesFromEmotion(emotionKeywords);
  }
}

/**
 * create token manager for reusing Spotify tokens
 * -pure function that returns token management utilities
 */
export function createSpotifyTokenManager(config: SpotifyConfig) {
  let cachedToken: { token: string; expiry: number } | null = null;

  return {
    async getToken(): Promise<string> {
      if (!cachedToken || Date.now() > cachedToken.expiry) {
        const tokenResponse = await getSpotifyToken(config);
        cachedToken = {
          token: tokenResponse.access_token,
          expiry: Date.now() + tokenResponse.expires_in * 1000 - 60000, // Refresh 1 min early
        };
      }
      return cachedToken.token;
    },

    isTokenValid(): boolean {
      return cachedToken !== null && Date.now() <= cachedToken.expiry;
    },

    clearToken(): void {
      cachedToken = null;
    },
  };
}
