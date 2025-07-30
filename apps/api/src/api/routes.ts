import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AdvancedEmotionChordService } from "../services/emotionChordService.js";

const app = new Hono();

// enable CORS
app.use("/*", cors());

// initialize service
const emotionChordService = new AdvancedEmotionChordService(
  process.env.OPENAI_API_KEY!,
  process.env.SPOTIFY_CLIENT_ID,
  process.env.SPOTIFY_CLIENT_SECRET
);

// request schemas
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

// health check
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    version: "2.0.0",
    features: {
      advancedHarmony: true,
      culturalMappings: true,
      spotifyIntegration: false, // disabled due to API restrictions
      gems: true,
      syntheticAcousticFeatures: true, // new feature replacing Spotify
    },
  });
});

// main endpoint
app.post(
  "/api/emotion-to-chord",
  zValidator("json", EmotionRequestSchema),
  async (c) => {
    try {
      const { emotion, options } = c.req.valid("json");

      const result = await emotionChordService.generateChordFromEmotion(
        emotion,
        options
      );

      return c.json(result);
    } catch (error) {
      console.error("Error generating chord:", error);
      return c.json({ error: "Failed to generate chord from emotion" }, 500);
    }
  }
);

// batch processing endpoint
app.post(
  "/api/batch",
  zValidator(
    "json",
    z.object({
      emotions: z.array(z.string()).max(10),
    })
  ),
  async (c) => {
    try {
      const { emotions } = c.req.valid("json");

      const results = await Promise.all(
        emotions.map((emotion) => emotionChordService.generateChordFromEmotion(emotion))
      );

      return c.json({ results });
    } catch (error) {
      console.error("Batch processing error:", error);
      return c.json({ error: "Failed to process batch" }, 500);
    }
  }
);

export default app;
