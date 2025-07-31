"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { AdvancedChordSuggestion } from "@/types/emotionChord";
import {
  Music,
  Play,
  Square,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Globe,
} from "lucide-react";
import { EmotionChordLogo } from "@/components/ui/EmotionChordLogo";
import {
  getPlayedNotes,
  formatMidiNotes,
  getVoicingDescription,
  getComplexityColor,
  getResonanceColor,
} from "@/lib/utils/index";

interface AdvancedChordDisplayProps {
  chord: AdvancedChordSuggestion;
  isPlaying?: boolean;
  isArpeggioLooping?: boolean;
  onPlay?: () => void;
  onPlayArpeggio?: () => void;
  onStop?: () => void;
  showDetails?: boolean;
  showEmotionalContext?: boolean;
}

export function AdvancedChordDisplay({
  chord,
  isPlaying = false,
  isArpeggioLooping = false,
  onPlay,
  onPlayArpeggio,
  onStop,
  showDetails = false,
  showEmotionalContext = false,
}: AdvancedChordDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="w-full p-6 space-y-4 bg-[#161b22] border-[#30363d]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <EmotionChordLogo size={40} />
          <div>
            <h3 className="text-xl font-bold text-[#f0f6fc]">{chord.symbol}</h3>
            <p className="text-sm text-[#7d8590]">
              {chord.root} {chord.quality}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {onPlay && (
            <Button
              onClick={isPlaying ? onStop : onPlay}
              variant={isPlaying ? "secondary" : "primary"}
              size="sm"
              className="flex items-center gap-2"
            >
              {isPlaying ? (
                <Square className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isPlaying ? "Stop" : "Play"}
            </Button>
          )}

          {onPlayArpeggio && (
            <Button
              onClick={isArpeggioLooping ? onStop : onPlayArpeggio}
              variant={isArpeggioLooping ? "secondary" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              {isArpeggioLooping ? (
                <Square className="w-4 h-4" />
              ) : (
                <Music className="w-4 h-4" />
              )}
              {isArpeggioLooping ? "Stop" : "Arpeggio"}
            </Button>
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-[#0d1117] border border-[#30363d] rounded-lg">
          <div className="text-xs text-[#7d8590] uppercase tracking-wide">
            Played Notes
          </div>
          <div className="font-semibold text-[#f0f6fc]">
            {getPlayedNotes(chord).join(" - ")}
          </div>
        </div>

        <div className="text-center p-3 bg-[#0d1117] border border-[#30363d] rounded-lg">
          <div className="text-xs text-[#7d8590] uppercase tracking-wide">
            Theoretical
          </div>
          <div className="font-semibold text-[#f0f6fc]">{chord.notes.join(" - ")}</div>
        </div>

        <div className="text-center p-3 bg-[#0d1117] border border-[#30363d] rounded-lg">
          <div className="text-xs text-[#7d8590] uppercase tracking-wide">
            Complexity
          </div>
          <div
            className={`font-semibold ${getComplexityColor(chord.harmonicComplexity)}`}
          >
            {Math.round(chord.harmonicComplexity * 100)}%
          </div>
        </div>

        <div className="text-center p-3 bg-[#0d1117] border border-[#30363d] rounded-lg">
          <div className="text-xs text-[#7d8590] uppercase tracking-wide">
            Resonance
          </div>
          <div
            className={`font-semibold ${getResonanceColor(chord.emotionalResonance)}`}
          >
            {Math.round(chord.emotionalResonance * 100)}%
          </div>
        </div>
      </div>

      {/* Emotional Justification */}
      {showEmotionalContext && (
        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-[#238636] mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-[#f0f6fc] mb-1">Emotional Context</h4>
              <p className="text-[#7d8590] text-sm leading-relaxed">
                {chord.emotionalJustification}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cultural Reference */}
      {chord.culturalReference && (
        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <div className="flex items-start gap-2">
            <Globe className="w-5 h-5 text-[#fb8500] mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-[#f0f6fc] mb-1">Cultural Reference</h4>
              <p className="text-[#7d8590] text-sm leading-relaxed">
                {chord.culturalReference}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Details Toggle */}
      {showDetails && (
        <div className="space-y-4">
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
          >
            <Info className="w-4 h-4" />
            {expanded ? "Hide" : "Show"} Technical Details
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {expanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#0d1117] border border-[#30363d] rounded-lg">
              {/* Harmonic Analysis */}
              <div className="space-y-3">
                <h4 className="font-semibold text-[#f0f6fc]">Harmonic Analysis</h4>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d8590]">Function:</span>
                    <span className="text-sm font-medium capitalize text-[#f0f6fc]">
                      {chord.harmonicFunction || "Color"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d8590]">Dissonance:</span>
                    <span className="text-sm font-medium text-[#f0f6fc]">
                      {Math.round(chord.dissonanceLevel * 100)}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d8590]">Intervals:</span>
                    <span className="text-sm font-medium text-[#f0f6fc]">
                      {chord.intervals.join(", ")}
                    </span>
                  </div>
                </div>

                {/* Theoretical Context */}
                {chord.theoreticalContext && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-[#f0f6fc]">Features:</h5>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(chord.theoreticalContext)
                        .filter(([, value]) => value)
                        .map(([key]) => (
                          <span
                            key={key}
                            className="px-2 py-1 text-xs bg-[#238636] text-white rounded-full"
                          >
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Voicing Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-[#f0f6fc]">Voicing Details</h4>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d8590]">Type:</span>
                    <span className="text-sm font-medium capitalize text-[#f0f6fc]">
                      {chord.voicing.voicingType}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d8590]">Density:</span>
                    <span className="text-sm font-medium capitalize text-[#f0f6fc]">
                      {chord.voicing.density}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d8590]">Register:</span>
                    <span className="text-sm font-medium capitalize text-[#f0f6fc]">
                      {chord.voicing.register}
                    </span>
                  </div>

                  {chord.voicing.voiceLeadingScore && (
                    <div className="flex justify-between">
                      <span className="text-sm text-[#7d8590]">Voice Leading:</span>
                      <span className="text-sm font-medium text-[#f0f6fc]">
                        {Math.round(chord.voicing.voiceLeadingScore * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-sm text-[#7d8590]">Description:</span>
                  <p className="text-xs text-[#f0f6fc] leading-relaxed">
                    {getVoicingDescription(chord.voicing)}
                  </p>
                </div>
              </div>

              {/* Performance Hints */}
              <div className="md:col-span-2 space-y-3">
                <h4 className="font-semibold text-[#f0f6fc]">Performance Guidelines</h4>

                <div className="grid grid-cols-3 gap-4">
                  {chord.timbre && (
                    <div className="text-center">
                      <div className="text-xs text-[#7d8590] uppercase tracking-wide">
                        Timbre
                      </div>
                      <div className="font-medium text-[#f0f6fc] capitalize">
                        {chord.timbre.replace(/_/g, " ")}
                      </div>
                    </div>
                  )}

                  {chord.dynamics && (
                    <div className="text-center">
                      <div className="text-xs text-[#7d8590] uppercase tracking-wide">
                        Dynamics
                      </div>
                      <div className="font-medium text-[#f0f6fc] uppercase">
                        {chord.dynamics}
                      </div>
                    </div>
                  )}

                  {chord.articulation && (
                    <div className="text-center">
                      <div className="text-xs text-[#7d8590] uppercase tracking-wide">
                        Articulation
                      </div>
                      <div className="font-medium text-[#f0f6fc] capitalize">
                        {chord.articulation}
                      </div>
                    </div>
                  )}
                </div>

                {/* MIDI Notes */}
                <div className="space-y-1">
                  <span className="text-sm text-[#7d8590]">MIDI Notes (Voicing):</span>
                  <p className="text-xs font-mono text-[#f0f6fc] bg-[#161b22] p-2 rounded border border-[#30363d]">
                    {formatMidiNotes(chord.voicing.notes)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
