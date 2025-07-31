import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { EmotionAnalysis } from "@/types/emotionChord";
import { getArousalIntensity, getTensionLevel } from "@/lib/utils/index";
import Image from "next/image";
import { getEmotionColor } from "@/lib/utils/index";

interface EmotionAnalysisDisplayProps {
  emotion: EmotionAnalysis;
}

export function EmotionAnalysisDisplay({ emotion }: EmotionAnalysisDisplayProps) {
  const valencePercentage = Math.round(((emotion.valence + 1) / 2) * 100);
  const arousalPercentage = Math.round(emotion.arousal * 100);
  const tensionPercentage = Math.round(emotion.tension * 100);
  const complexityPercentage = Math.round(emotion.complexity * 100);

  return (
    <Card className="bg-[#161b22] border-[#30363d]">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Image
            src="/brain-research.svg"
            alt="Brain Research"
            width={36}
            height={36}
            className="object-contain"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(29%) sepia(99%) saturate(4947%) hue-rotate(235deg) brightness(104%) contrast(107%)",
            }}
          />
          <span className="text-xl font-bold">Emotion Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Emotion */}
        <div>
          <h4 className="font-medium text-[#f0f6fc] mb-1">Primary Emotion</h4>
          <span
            className={`text-lg font-semibold capitalize ${getEmotionColor(
              emotion.valence
            )}`}
          >
            {emotion.primaryEmotion}
          </span>
        </div>

        {/* Secondary Emotions */}
        {emotion.secondaryEmotions.length > 0 && (
          <div>
            <h4 className="font-medium text-[#f0f6fc] mb-2">Secondary Emotions</h4>
            <div className="flex flex-wrap gap-2">
              {emotion.secondaryEmotions.map((secondary, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-[#21262d] text-[#f0f6fc] border border-[#30363d] rounded-md text-sm capitalize"
                >
                  {secondary}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Emotional Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-[#f0f6fc] mb-2">Valence</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-[#7d8590]">
                <span>Negative</span>
                <span>Positive</span>
              </div>
              <div className="w-full bg-[#21262d] rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    emotion.valence > 0 ? "bg-[#238636]" : "bg-[#da3633]"
                  }`}
                  style={{ width: `${valencePercentage}%` }}
                />
              </div>
              <div className="text-xs text-[#7d8590]">
                {emotion.valence > 0 ? "+" : ""}
                {emotion.valence.toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[#f0f6fc] mb-2">Arousal</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-[#7d8590]">
                <span>Calm</span>
                <span>Energetic</span>
              </div>
              <div className="w-full bg-[#21262d] rounded-full h-2">
                <div
                  className="h-2 bg-[#4044ff] rounded-full transition-all"
                  style={{ width: `${arousalPercentage}%` }}
                />
              </div>
              <div className="text-xs text-[#7d8590]">
                {getArousalIntensity(emotion.arousal)}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[#f0f6fc] mb-2">Tension</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-[#7d8590]">
                <span>Relaxed</span>
                <span>Tense</span>
              </div>
              <div className="w-full bg-[#21262d] rounded-full h-2">
                <div
                  className="h-2 bg-[#fb8500] rounded-full transition-all"
                  style={{ width: `${tensionPercentage}%` }}
                />
              </div>
              <div className="text-xs text-[#7d8590]">
                {getTensionLevel(emotion.tension)}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-[#f0f6fc] mb-2">Complexity</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-[#7d8590]">
                <span>Simple</span>
                <span>Complex</span>
              </div>
              <div className="w-full bg-[#21262d] rounded-full h-2">
                <div
                  className="h-2 bg-[#8b5cf6] rounded-full transition-all"
                  style={{ width: `${complexityPercentage}%` }}
                />
              </div>
              <div className="text-xs text-[#7d8590]">
                {emotion.complexity.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Musical Properties */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#30363d]">
          <div>
            <h4 className="font-medium text-[#f0f6fc] mb-1">Musical Mode</h4>
            <span className="text-sm text-[#7d8590] capitalize">
              {emotion.musicalMode}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-[#f0f6fc] mb-1">Suggested Tempo</h4>
            <span className="text-sm text-[#7d8590]">{emotion.suggestedTempo} BPM</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
