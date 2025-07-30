'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ChordProgression } from '@/types/emotion-chord';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Music2,
  ArrowRight,
  Clock,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface ChordProgressionDisplayProps {
  progression: ChordProgression;
  currentChord?: number;
  isPlaying?: boolean;
  isLooping?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onLoop?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onChordSelect?: (index: number) => void;
}

export const ChordProgressionDisplay: React.FC<ChordProgressionDisplayProps> = ({
  progression,
  currentChord = -1,
  isPlaying = false,
  isLooping = false,
  onPlay,
  onPause,
  onLoop,
  onNext,
  onPrev,
  onChordSelect,
}) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const formatDuration = (beats: number): string => {
    const measures = Math.floor(beats / 4);
    const remainingBeats = beats % 4;
    
    if (measures > 0 && remainingBeats > 0) {
      return `${measures}m ${remainingBeats}b`;
    } else if (measures > 0) {
      return `${measures}m`;
    } else {
      return `${remainingBeats}b`;
    }
  };

  const getProgressionTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'ascending': 'text-green-600 bg-green-50',
      'descending': 'text-blue-600 bg-blue-50',
      'circular': 'text-purple-600 bg-purple-50',
      'static': 'text-gray-600 bg-gray-50',
      'modal': 'text-indigo-600 bg-indigo-50',
      'chromatic': 'text-red-600 bg-red-50',
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const getTensionColor = (tension: number): string => {
    if (tension < 0.3) return 'bg-green-200';
    if (tension < 0.7) return 'bg-yellow-200';
    return 'bg-red-200';
  };

  return (
    <Card className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
            <Music2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Chord Progression</h3>
            <p className="text-sm text-gray-600">
              {progression.key} • {progression.chords.length} chords • {formatDuration(progression.totalDuration)}
            </p>
          </div>
        </div>

        {/* Type Badge */}
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProgressionTypeColor(progression.type)}`}>
          {progression.type}
        </span>
      </div>

      {/* Progression Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">Chord Sequence</h4>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>BPM: {progression.tempo}</span>
          </div>
        </div>

        {/* Chord Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {progression.chords.map((chord, index) => (
            <div key={index} className="relative">
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  currentChord === index
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => onChordSelect?.(index)}
              >
                {/* Chord Symbol */}
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-lg text-gray-900">{chord.symbol}</h5>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {formatDuration(chord.duration)}
                  </span>
                </div>

                {/* Tension Indicator */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Tension</span>
                    <span className="text-xs font-medium text-gray-700">
                      {Math.round(chord.tension * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${getTensionColor(chord.tension)}`}
                      style={{ width: `${chord.tension * 100}%` }}
                    />
                  </div>
                </div>

                {/* Function */}
                {chord.function && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {chord.function}
                    </span>
                  </div>
                )}
              </div>

              {/* Arrow between chords */}
              {index < progression.chords.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <div className="bg-white rounded-full p-1 shadow-sm border">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
        <Button
          onClick={onPrev}
          variant="outline"
          size="sm"
          disabled={currentChord <= 0}
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          onClick={isPlaying ? onPause : onPlay}
          variant={isPlaying ? 'secondary' : 'primary'}
          size="lg"
          className="flex items-center gap-2 px-6"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isPlaying ? 'Pause' : 'Play Progression'}
        </Button>

        <Button
          onClick={onNext}
          variant="outline"
          size="sm"
          disabled={currentChord >= progression.chords.length - 1}
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        <Button
          onClick={onLoop}
          variant={isLooping ? 'secondary' : 'outline'}
          size="sm"
          className="flex items-center gap-2 ml-3"
        >
          <Repeat className="w-4 h-4" />
          {isLooping ? 'Looping' : 'Loop'}
        </Button>
      </div>

      {/* Emotional Journey */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Emotional Journey</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {progression.emotionalJourney}
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Toggle */}
      <Button
        onClick={() => setShowAnalysis(!showAnalysis)}
        variant="outline"
        size="sm"
        className="w-full flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-4 h-4" />
        {showAnalysis ? 'Hide' : 'Show'} Harmonic Analysis
      </Button>

      {/* Detailed Analysis */}
      {showAnalysis && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Key Center */}
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Key Center</div>
              <div className="font-bold text-lg text-gray-900">{progression.key}</div>
              {progression.mode && (
                <div className="text-sm text-gray-600 capitalize">{progression.mode}</div>
              )}
            </div>

            {/* Complexity */}
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Complexity</div>
              <div className="font-bold text-lg text-gray-900">
                {Math.round(progression.complexity * 100)}%
              </div>
              <div className="text-sm text-gray-600">
                {progression.complexity < 0.3 ? 'Simple' : 
                 progression.complexity < 0.7 ? 'Moderate' : 'Complex'}
              </div>
            </div>

            {/* Tension Curve */}
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Tension Curve</div>
              <div className="font-bold text-lg text-gray-900">
                {progression.tensionCurve}
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {progression.tensionCurve.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Roman Numeral Analysis */}
          {progression.romanNumerals && (
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900">Roman Numeral Analysis</h5>
              <div className="flex flex-wrap gap-2">
                {progression.romanNumerals.map((numeral, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-mono ${
                      currentChord === index ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {numeral}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {progression.features && progression.features.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900">Harmonic Features</h5>
              <div className="flex flex-wrap gap-2">
                {progression.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full"
                  >
                    {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
