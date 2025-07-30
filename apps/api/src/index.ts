import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./api/routes.js";

const port = parseInt(process.env.PORT || "3001");

console.log(`🎵 Emotion-to-Chord API starting on port ${port}... \n`);

serve({
  fetch: app.fetch,
  port,
});
