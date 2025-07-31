import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
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
}
