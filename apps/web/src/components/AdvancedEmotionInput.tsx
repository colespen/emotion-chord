"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmotionChordApiService } from "@/services/emotion-chord-api";
import {
  Sparkles,
  Music,
  // globe,
  Settings,
  ChevronDown,
  ChevronUp,
  Shuffle,
} from "lucide-react";

interface AdvancedEmotionInputProps {
  onGenerate: (
    emotion: string,
    options?: {
      culturalPreference?: "western" | "indian" | "arabic" | "universal";
      stylePreference?: "classical" | "jazz" | "contemporary" | "experimental";
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
  const [culturalPreference, setCulturalPreference] = useState<string>("universal");
  const [stylePreference, setStylePreference] = useState<string>("contemporary");
  const [includeProgression, setIncludeProgression] = useState(true);
  const [includeCulturalAlternatives, setIncludeCulturalAlternatives] = useState(true);
  const [showExamples, setShowExamples] = useState(false);

  const examples = EmotionChordApiService.getEmotionExamples();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const validation = EmotionChordApiService.validateEmotionInput(emotion);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }

      const options = {
        culturalPreference: culturalPreference as
          | "western"
          | "indian"
          | "arabic"
          | "universal",
        stylePreference: stylePreference as
          | "classical"
          | "jazz"
          | "contemporary"
          | "experimental",
        includeProgression,
        includeCulturalAlternatives,
      };

      onGenerate(emotion, options);
    },
    [
      emotion,
      culturalPreference,
      stylePreference,
      includeProgression,
      includeCulturalAlternatives,
      onGenerate,
    ]
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
    <Card className="w-full max-w-2xl mx-auto p-6 space-y-6 bg-[#0d1117] border-[#30363d]">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-[#238636]" />
          <h2 className="text-2xl font-bold text-[#f0f6fc]">Emotion to Chord</h2>
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
              placeholder="e.g., transcendent wonder with a touch of melancholy..."
              className="w-full pr-10 bg-[#0d1117] border-[#30363d] text-[#f0f6fc] placeholder:text-[#7d8590] focus:border-[#238636] focus:ring-[#238636]"
              disabled={disabled}
              maxLength={500}
            />
            <button
              type="button"
              onClick={handleRandomExample}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-[#7d8590] hover:text-[#f0f6fc]"
              title="Random example"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-[#6e7681]">{emotion.length}/500 characters</div>
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
                        className="text-left text-sm p-2 rounded bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] hover:border-[#238636] transition-colors text-[#f0f6fc]"
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
            Advanced Options
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
                  className="w-full p-2 border border-[#30363d] rounded-md focus:ring-2 focus:ring-[#238636] focus:border-[#238636] bg-[#0d1117] text-[#f0f6fc]"
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
                  className="w-full p-2 border border-[#30363d] rounded-md focus:ring-2 focus:ring-[#238636] focus:border-[#238636] bg-[#0d1117] text-[#f0f6fc]"
                  disabled={disabled}
                >
                  <option value="contemporary">Contemporary</option>
                  <option value="classical">Classical</option>
                  <option value="jazz">Jazz</option>
                  <option value="experimental">Experimental</option>
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
          className="w-full bg-[#238636] hover:bg-[#2ea043] text-white border-[#238636]"
          disabled={disabled || loading || !emotion.trim()}
          size="lg"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing Emotion...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Chord
            </div>
          )}
        </Button>
      </form>
    </Card>
  );
};
