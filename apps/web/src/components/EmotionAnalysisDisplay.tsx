import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { EmotionAnalysis } from '@/types/emotion-chord';
import {
  getEmotionColor,
  getArousalIntensity,
  getTensionLevel,
} from '@/lib/utils';

interface EmotionAnalysisDisplayProps {
  emotion: EmotionAnalysis;
}

export function EmotionAnalysisDisplay({ emotion }: EmotionAnalysisDisplayProps) {
  const valencePercentage = Math.round(((emotion.valence + 1) / 2) * 100);
  const arousalPercentage = Math.round(emotion.arousal * 100);
  const tensionPercentage = Math.round(emotion.tension * 100);
  const complexityPercentage = Math.round(emotion.complexity * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          Emotion Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Emotion */}
        <div>
          <h4 className="font-medium text-gray-900 mb-1">Primary Emotion</h4>
          <span className={`text-lg font-semibold capitalize ${getEmotionColor(emotion.valence)}`}>
            {emotion.primaryEmotion}
          </span>
        </div>

        {/* Secondary Emotions */}
        {emotion.secondaryEmotions.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Secondary Emotions</h4>
            <div className="flex flex-wrap gap-2">
              {emotion.secondaryEmotions.map((secondary, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm capitalize"
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
            <h4 className="font-medium text-gray-900 mb-2">Valence</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Negative</span>
                <span>Positive</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    emotion.valence > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${valencePercentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-600">
                {emotion.valence > 0 ? '+' : ''}{emotion.valence.toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Arousal</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Calm</span>
                <span>Energetic</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 bg-blue-500 rounded-full transition-all"
                  style={{ width: `${arousalPercentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-600">
                {getArousalIntensity(emotion.arousal)}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tension</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Relaxed</span>
                <span>Tense</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 bg-orange-500 rounded-full transition-all"
                  style={{ width: `${tensionPercentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-600">
                {getTensionLevel(emotion.tension)}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Complexity</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Simple</span>
                <span>Complex</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 bg-purple-500 rounded-full transition-all"
                  style={{ width: `${complexityPercentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-600">
                {emotion.complexity.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Musical Properties */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Musical Mode</h4>
            <span className="text-sm text-gray-600 capitalize">
              {emotion.musicalMode}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Suggested Tempo</h4>
            <span className="text-sm text-gray-600">
              {emotion.suggestedTempo} BPM
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
