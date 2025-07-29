import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { EmotionChordService } from "../services/emotionChordService.js";

// Validate required environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const app = new Hono();

// Enable CORS for Next.js frontend
app.use("/*", cors());

// Initialize service
const emotionChordService = new EmotionChordService(OPENAI_API_KEY);

// Request validation schema
const EmotionRequestSchema = z.object({
  emotion: z.string().min(1).max(500),
});

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Main endpoint
app.post(
  "/api/emotion-to-chord",
  zValidator("json", EmotionRequestSchema),
  async (c) => {
    try {
      const { emotion } = c.req.valid("json");

      const result = await emotionChordService.generateChordFromEmotion(
        emotion
      );

      return c.json(result);
    } catch (error) {
      console.error("Error generating chord:", error);
      return c.json({ error: "Failed to generate chord from emotion" }, 500);
    }
  }
);

export default app;
