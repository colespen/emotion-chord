import SpotifyWebApi from "spotify-web-api-node";

export class SpotifyAnalyzer {
  private spotify: SpotifyWebApi;
  private tokenExpiry: number = 0;

  constructor(clientId: string, clientSecret: string) {
    this.spotify = new SpotifyWebApi({
      clientId,
      clientSecret,
    });
  }

  private extractEmotionKeywords(emotion: string): string {
    // extract key emotional words for better Spotify search
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

    const words = emotion.toLowerCase().split(/\s+/);
    const foundEmotions = words.filter((word) =>
      emotionWords.some((emo) => word.includes(emo) || emo.includes(word))
    );

    // if we found emotion words, use them, otherwise use the first few words
    return foundEmotions.length > 0
      ? foundEmotions.slice(0, 3).join(" ")
      : words.slice(0, 3).join(" ");
  }

  private estimateFromTrackMetadata(_tracks: any[], emotionKeywords: string) {
    // basic heuristics based on emotion keywords and track info
    const keywords = emotionKeywords.toLowerCase();

    let valence = 0.5; // Default neutral
    let energy = 0.5;
    let danceability = 0.5;
    let acousticness = 0.5;

    // adjust based on emotion keywords
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
    };
  }

  private async ensureToken() {
    if (Date.now() > this.tokenExpiry) {
      try {
        const data = await this.spotify.clientCredentialsGrant();
        this.spotify.setAccessToken(data.body["access_token"]);
        this.tokenExpiry = Date.now() + data.body["expires_in"] * 1000 - 60000; // refresh 1 min early
      } catch (error) {
        console.error("Failed to get Spotify token:", error);
        throw error;
      }
    }
  }

  async searchAndAnalyze(emotion: string, limit: number = 5) {
    try {
      await this.ensureToken();

      // improve search query by extracting key emotion words
      const emotionKeywords = this.extractEmotionKeywords(emotion);

      // search for tracks matching the emotion
      const searchResults = await this.spotify.searchTracks(emotionKeywords, { limit });

      const tracks = searchResults.body.tracks?.items || [];
      const trackIds = tracks.map((track) => track.id);

      if (trackIds.length === 0) {
        return null;
      }

      // get audio features for the tracks
      let audioFeatures;
      try {
        audioFeatures = await this.spotify.getAudioFeaturesForTracks(trackIds);
      } catch (featureError: any) {
        console.error("Failed to get audio features:", featureError);
        console.error("Error body:", featureError.body);
        console.error("Status code:", featureError.statusCode);

        // if we can't get audio features, try getting them one by one
        const individualFeatures = [];
        for (const trackId of trackIds.slice(0, 3)) {
          // try fewer tracks
          try {
            const feature = await this.spotify.getAudioFeaturesForTrack(trackId);
            individualFeatures.push(feature.body);
          } catch (individualError) {
            console.error(
              `Failed to get features for track ${trackId}:`,
              individualError
            );
            individualFeatures.push(null);
          }
        }

        if (individualFeatures.every((f) => f === null)) {
          return this.estimateFromTrackMetadata(tracks, emotionKeywords);
        }

        // mock the response structure
        audioFeatures = { body: { audio_features: individualFeatures } };
      }

      // average the features
      const avgFeatures = audioFeatures.body.audio_features.reduce(
        (acc, track) => {
          if (!track) return acc;
          return {
            valence: acc.valence + (track.valence || 0),
            energy: acc.energy + (track.energy || 0),
            danceability: acc.danceability + (track.danceability || 0),
            acousticness: acc.acousticness + (track.acousticness || 0),
            instrumentalness: acc.instrumentalness + (track.instrumentalness || 0),
            speechiness: acc.speechiness + (track.speechiness || 0),
            liveness: acc.liveness + (track.liveness || 0),
          };
        },
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

      const count = audioFeatures.body.audio_features.filter(
        (track) => track !== null
      ).length;

      if (count === 0) {
        return null;
      }

      const result = {
        valence: avgFeatures.valence / count,
        energy: avgFeatures.energy / count,
        danceability: avgFeatures.danceability / count,
        acousticness: avgFeatures.acousticness / count,
        instrumentalness: avgFeatures.instrumentalness / count,
        speechiness: avgFeatures.speechiness / count,
        liveness: avgFeatures.liveness / count,
      };

      return result;
    } catch (error) {
      console.error("Spotify analysis error:", error);
      return null;
    }
  }
}
