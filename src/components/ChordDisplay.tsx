import React from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Play, Square, Music } from "lucide-react";
import type { AdvancedChordSuggestion } from "@/types/emotionChord";
import { formatEmotionalResonance } from "@/lib/utils/index";

interface ChordDisplayProps {
  chord: AdvancedChordSuggestion;
  isPrimary?: boolean;
  isPlaying?: boolean;
  isArpeggioLooping?: boolean;
  onPlayChord: () => void;
  onPlayArpeggio: () => void;
  onStop: () => void;
}

export function ChordDisplay({
  chord,
  isPrimary = false,
  isPlaying = false,
  isArpeggioLooping = false,
  onPlayChord,
  onPlayArpeggio,
  onStop,
}: ChordDisplayProps) {
  return (
    <Card className={isPrimary ? "ring-2 ring-blue-500 bg-blue-50" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <div>
              <span className="text-xl font-bold">{chord.symbol}</span>
              {isPrimary && (
                <span className="ml-2 text-sm bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  Primary
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={isPlaying ? onStop : onPlayChord}
              disabled={false}
            >
              {isPlaying ? (
                <Square className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isPlaying ? "Stop" : "Chord"}
            </Button>
            <Button
              size="sm"
              variant={isArpeggioLooping ? "primary" : "outline"}
              onClick={isArpeggioLooping ? onStop : onPlayArpeggio}
              disabled={isPlaying && !isArpeggioLooping}
            >
              {isArpeggioLooping ? (
                <Square className="h-4 w-4" />
              ) : (
                <Music className="h-4 w-4" />
              )}
              {isArpeggioLooping ? "Stop Loop" : "Arpeggio"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Root Note</h4>
            <span className="text-lg font-semibold text-blue-600">{chord.root}</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Quality</h4>
            <span className="text-sm text-gray-600">{chord.quality}</span>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
          <div className="flex flex-wrap gap-2">
            {chord.notes.map((note, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md font-mono text-sm"
              >
                {note}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Intervals</h4>
          <div className="flex flex-wrap gap-2">
            {chord.intervals.map((interval, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono"
              >
                {interval}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">MIDI Notes</h4>
            <div className="text-xs text-gray-600 font-mono">
              {chord.midiNotes.join(", ")}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Voicing</h4>
            <div className="text-xs text-gray-600 font-mono">
              {chord.voicing.voicingType} ({chord.voicing.density})
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Harmonic Complexity</h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${chord.harmonicComplexity * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">
                {Math.round(chord.harmonicComplexity * 100)}%
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Emotional Resonance</h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 bg-purple-500 rounded-full"
                  style={{ width: `${chord.emotionalResonance * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">
                {formatEmotionalResonance(chord.emotionalResonance)}
              </span>
            </div>
          </div>
        </div>

        {/* Emotional Justification */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Emotional Justification</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            {chord.emotionalJustification}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
