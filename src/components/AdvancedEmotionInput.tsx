"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { getEmotionExamples, validateEmotionInput } from "@/services/emotionChordApi";
import { STYLE_PREFERENCES, INPUT_LIMITS, PLACEHOLDER_TEXT, BUTTON_TEXT } from "@/lib/constants/form";
import { COLORS } from "@/lib/constants/ui";
import type { CulturalPreference, StylePreference } from "@/types/common";
import {
  Sparkles,
  Music,
  Settings,
  ChevronDown,
  ChevronUp,
  Shuffle,
} from "lucide-react";

interface AdvancedEmotionInputProps {
  onGenerate: (
    emotion: string,
    options?: {
      culturalPreference?: CulturalPreference;
      stylePreference?: StylePreference;
      includeProgression?: boolean;
      includeCulturalAlternatives?: boolean;
    }
  ) => void;
  loading?: boolean;
  disabled?: boolean;
}

export const AdvancedEmotionInput: React.FC<AdvancedEmotionInputProps> = ({
  onGenerate,
  loading = false,
  disabled = false,
}) => {
  const [emotion, setEmotion] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [stylePreference, setStylePreference] = useState<string>("contemporary");
  const [showExamples, setShowExamples] = useState(false);

  const examples = getEmotionExamples();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const validation = validateEmotionInput(emotion);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }

      const options = {
        culturalPreference: "universal" as
          | "western"
          | "indian"
          | "arabic"
          | "universal",
        stylePreference: stylePreference as
          | "classical"
          | "jazz"
          | "contemporary"
          | "experimental",
        includeProgression: true,
        includeCulturalAlternatives: true,
      };

      onGenerate(emotion, options);
    },
    [emotion, stylePreference, onGenerate]
  );

  const handleExampleClick = (exampleEmotion: string) => {
    setEmotion(exampleEmotion);
    setShowExamples(false);
  };

  const handleRandomExample = () => {
    const allExamples = Object.values(examples).flat();
    const randomExample = allExamples[Math.floor(Math.random() * allExamples.length)];
    setEmotion(randomExample);
  };

  return (
    <Card className="w-full mb-10 max-w-[622px] mx-auto p-4 sm:p-6 space-y-6 bg-[#0d1117] border-[#30363d] mt-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <BrandLogo variant="left" size="xsmall" alt="Logo Left" />
          <h2 className="text-2xl font-bold text-[#f0f6fc]">Emotion to Chord</h2>
          <BrandLogo variant="right" size="xsmall" alt="Logo Right" />
        </div>
        <p className="text-[#7d8590]">
          Describe your emotion in detail for the most accurate musical interpretation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Emotion Input */}
        <div className="space-y-2">
          <label htmlFor="emotion" className="block text-sm font-medium text-[#f0f6fc]">
            Emotion Description
          </label>
          <div className="relative">
            <Input
              id="emotion"
              type="text"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              placeholder={PLACEHOLDER_TEXT.EMOTION_INPUT}
              className="w-full pr-10"
              disabled={disabled}
              maxLength={INPUT_LIMITS.EMOTION_MAX_LENGTH}
            />
            <button
              type="button"
              onClick={handleRandomExample}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-[#7d8590] hover:text-[#f0f6fc]"
              title={BUTTON_TEXT.RANDOM_EXAMPLE}
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-[#6e7681]">{emotion.length}/{INPUT_LIMITS.EMOTION_MAX_LENGTH} characters</div>
        </div>

        {/* Examples Toggle - OMIT EXAMPLES - DONT NEED RIGHT NOW. */}
        <div className="space-y-2">
          {/* <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowExamples(!showExamples)}
            className="w-full flex items-center justify-center gap-2 bg-[#21262d] border-[#30363d] text-[#f0f6fc] hover:bg-[#30363d]"
          >
            <Sparkles className="w-4 h-4" />
            {showExamples ? "Hide Examples" : "Show Example Emotions"}
            {showExamples ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button> */}

          {showExamples && (
            <div className="grid grid-cols-1 gap-3 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
              {Object.entries(examples).map(([category, categoryExamples]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-[#f0f6fc] mb-2 capitalize">
                    {category} Emotions
                  </h4>
                  <div className="grid grid-cols-1 gap-1">
                    {categoryExamples.map((example, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleExampleClick(example)}
                        className="text-left text-sm p-2 rounded bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] hover:border-[#4044ff] transition-colors text-[#f0f6fc]"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Options */}
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-center gap-2 bg-[#21262d] border-[#30363d] text-[#f0f6fc] hover:bg-[#30363d]"
          >
            <Settings className="w-4 h-4" />
            {BUTTON_TEXT.ADVANCED_OPTIONS}
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
              {/* Cultural Preference - OMIT FOR NOW UNTIL FIXED. */}
              {/* <div className="space-y-2">
                <label className="block text-sm font-medium text-[#f0f6fc]">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Cultural Context
                </label>
                <select
                  value={culturalPreference}
                  onChange={(e) => setCulturalPreference(e.target.value)}
                  className="w-full p-2 border border-[#30363d] rounded-md focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] bg-[#0d1117] text-[#f0f6fc]"
                  disabled={disabled}
                >
                  <option value="universal">Universal</option>
                  <option value="western">Western</option>
                  <option value="indian">Indian (Raga)</option>
                  <option value="arabic">Arabic (Maqam)</option>
                </select>
              </div> */}

              {/* Style Preference */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#f0f6fc]">
                  <Music className="w-4 h-4 inline mr-1" />
                  Musical Style
                </label>
                <select
                  value={stylePreference}
                  onChange={(e) => setStylePreference(e.target.value)}
                  className="w-full p-2 border border-[#30363d] rounded-md focus:outline-none focus:border-[#4044ff] bg-[#0d1117] text-[#f0f6fc]"
                  disabled={disabled}
                >
                  {STYLE_PREFERENCES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Options - OMIT FOR NOW UNTIL FIXED. */}
              {/* <div className="space-y-3 md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeProgression}
                    onChange={(e) => setIncludeProgression(e.target.checked)}
                    className="rounded border-[#30363d] text-[#238636] focus:ring-[#238636] bg-[#0d1117]"
                    disabled={disabled}
                  />
                  <span className="text-sm text-[#f0f6fc]">
                    Include chord progression
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeCulturalAlternatives}
                    onChange={(e) =>
                      setIncludeCulturalAlternatives(e.target.checked)
                    }
                    className="rounded border-[#30363d] text-[#238636] focus:ring-[#238636] bg-[#0d1117]"
                    disabled={disabled}
                  />
                  <span className="text-sm text-[#f0f6fc]">
                    Include cultural alternatives (Raga/Maqam)
                  </span>
                </label>
              </div> */}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className={`w-full bg-[${COLORS.PRIMARY}] hover:bg-[${COLORS.PRIMARY_HOVER}] text-white border-[${COLORS.PRIMARY}]`}
          disabled={disabled || loading || !emotion.trim()}
          size="lg"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {BUTTON_TEXT.ANALYZING}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              {BUTTON_TEXT.GENERATE_CHORD}
            </div>
          )}
        </Button>
      </form>
    </Card>
  );
};
