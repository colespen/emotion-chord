#!/usr/bin/env node

// quick test script for the emotion-to-chord api
async function testEmotionToChord() {
  const testData = {
    emotion: "transcendent wonder with a touch of melancholy",
    options: {
      culturalPreference: "universal",
      stylePreference: "contemporary",
      includeProgression: true,
      includeCulturalAlternatives: true,
    },
  };

  try {
    console.log("Testing emotion-to-chord API...");
    console.log("Input:", JSON.stringify(testData, null, 2));

    const response = await fetch("http://localhost:3001/api/emotion-to-chord", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("\n✅ API Response:");
    console.log("Primary Emotion:", result.emotion?.primaryEmotion);
    console.log("Primary Chord:", result.primaryChord?.symbol);
    console.log("Acoustic Features:", result.emotion?.acousticFeatures);
    console.log("GEMS:", result.emotion?.gems);

    console.log("\n🎵 Full response saved to test-output.json");

    // save to file for inspection
    await import("fs").then((fs) => {
      fs.writeFileSync("test-output.json", JSON.stringify(result, null, 2));
    });
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// run the test
testEmotionToChord();
