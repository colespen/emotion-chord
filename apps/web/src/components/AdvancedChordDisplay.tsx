'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AdvancedChordSuggestion, VoicingInfo } from '@/types/emotion-chord';
import {
  Music,
  Play,
  Pause,
  Info,
  Volume2,
  Repeat,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Globe
} from 'lucide-react';

// Helper function to convert MIDI note numbers to note names
function midiToNoteName(midiNote: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return noteNames[noteIndex] + (octave >= 0 ? octave : '');
}

// Helper function to get the actual played notes in order
function getPlayedNotes(chord: AdvancedChordSuggestion): string[] {
  if (chord.midiNotes && chord.midiNotes.length > 0) {
    return chord.midiNotes.map(midiToNoteName);
  }
  return chord.notes; // fallback to theoretical notes
}

interface AdvancedChordDisplayProps {
  chord: AdvancedChordSuggestion;
  isPlaying?: boolean;
  isArpeggioLooping?: boolean;
  isLooping?: boolean;
  onPlay?: () => void;
  onPlayArpeggio?: () => void;
  onLoop?: () => void;
  onStop?: () => void;
  showDetails?: boolean;
}

export function AdvancedChordDisplay({ 
  chord, 
  isPlaying = false,
  isArpeggioLooping = false,
  isLooping = false,
  onPlay,
  onPlayArpeggio,
  onLoop,
  onStop,
  showDetails = false 
}: AdvancedChordDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  const getVoicingDescription = (voicing: VoicingInfo): string => {
    const descriptions: Record<string, string> = {
      close: 'Close voicing (notes within an octave)',
      open: 'Open voicing (notes spread across octaves)',
      drop2: 'Drop 2 voicing (second voice dropped an octave)',
      drop3: 'Drop 3 voicing (third voice dropped an octave)',
      rootless: 'Rootless voicing (sophisticated jazz style)',
      cluster: 'Cluster voicing (adjacent tones for texture)',
      quartal: 'Quartal voicing (stacked fourths)',
      spread: 'Spread voicing (wide range distribution)',
    };
    return descriptions[voicing.voicingType] || voicing.voicingType;
  };

  const getComplexityColor = (complexity: number): string => {
    if (complexity < 0.3) return 'text-green-600';
    if (complexity < 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResonanceColor = (resonance: number): string => {
    if (resonance > 0.8) return 'text-purple-600';
    if (resonance > 0.6) return 'text-blue-600';
    if (resonance > 0.4) return 'text-indigo-600';
    return 'text-gray-600';
  };

  const formatMidiNotes = (notes: number[]): string => {
    return notes.map(note => {
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const octave = Math.floor(note / 12) - 1;
      const noteName = noteNames[note % 12];
      return `${noteName}${octave}`;
    }).join(' - ');
  };

  return (
    <Card className="w-full p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
            <Music className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{chord.symbol}</h3>
            <p className="text-sm text-gray-600">
              {chord.root} {chord.quality}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {onPlay && (
            <Button
              onClick={onPlay}
              variant={isPlaying ? 'secondary' : 'primary'}
              size="sm"
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Playing' : 'Play'}
            </Button>
          )}

          {onPlayArpeggio && (
            <Button
              onClick={onPlayArpeggio}
              variant={isArpeggioLooping ? 'secondary' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              <Music className="w-4 h-4" />
              {isArpeggioLooping ? 'Stop Arp' : 'Arpeggio'}
            </Button>
          )}

          {onLoop && (
            <Button
              onClick={onLoop}
              variant={isLooping ? 'secondary' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              <Repeat className="w-4 h-4" />
              {isLooping ? 'Looping' : 'Loop'}
            </Button>
          )}

          {onStop && (isPlaying || isLooping || isArpeggioLooping) && (
            <Button
              onClick={onStop}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Stop
            </Button>
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Played Notes</div>
          <div className="font-semibold text-gray-900">
            {getPlayedNotes(chord).join(' - ')}
          </div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Theoretical</div>
          <div className="font-semibold text-gray-900">
            {chord.notes.join(' - ')}
          </div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Voicing</div>
          <div className="font-semibold text-gray-900 capitalize">
            {chord.voicing.voicingType}
          </div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Complexity</div>
          <div className={`font-semibold ${getComplexityColor(chord.harmonicComplexity)}`}>
            {Math.round(chord.harmonicComplexity * 100)}%
          </div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Resonance</div>
          <div className={`font-semibold ${getResonanceColor(chord.emotionalResonance)}`}>
            {Math.round(chord.emotionalResonance * 100)}%
          </div>
        </div>
      </div>

      {/* Emotional Justification */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Emotional Context</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {chord.emotionalJustification}
            </p>
          </div>
        </div>
      </div>

      {/* Cultural Reference */}
      {chord.culturalReference && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Globe className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Cultural Reference</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
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
            {expanded ? 'Hide' : 'Show'} Technical Details
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {expanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Harmonic Analysis */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Harmonic Analysis</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Function:</span>
                    <span className="text-sm font-medium capitalize">
                      {chord.harmonicFunction || 'Color'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Dissonance:</span>
                    <span className="text-sm font-medium">
                      {Math.round(chord.dissonanceLevel * 100)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Intervals:</span>
                    <span className="text-sm font-medium">
                      {chord.intervals.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Theoretical Context */}
                {chord.theoreticalContext && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-800">Features:</h5>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(chord.theoreticalContext)
                        .filter(([, value]) => value)
                        .map(([key]) => (
                          <span
                            key={key}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                          >
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Voicing Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Voicing Details</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-medium capitalize">
                      {chord.voicing.voicingType}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Density:</span>
                    <span className="text-sm font-medium capitalize">
                      {chord.voicing.density}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Register:</span>
                    <span className="text-sm font-medium capitalize">
                      {chord.voicing.register}
                    </span>
                  </div>
                  
                  {chord.voicing.voiceLeadingScore && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Voice Leading:</span>
                      <span className="text-sm font-medium">
                        {Math.round(chord.voicing.voiceLeadingScore * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-sm text-gray-600">Description:</span>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {getVoicingDescription(chord.voicing)}
                  </p>
                </div>
              </div>

              {/* Performance Hints */}
              <div className="md:col-span-2 space-y-3">
                <h4 className="font-semibold text-gray-900">Performance Guidelines</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  {chord.timbre && (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Timbre</div>
                      <div className="font-medium text-gray-900 capitalize">
                        {chord.timbre.replace(/_/g, ' ')}
                      </div>
                    </div>
                  )}
                  
                  {chord.dynamics && (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Dynamics</div>
                      <div className="font-medium text-gray-900 uppercase">
                        {chord.dynamics}
                      </div>
                    </div>
                  )}
                  
                  {chord.articulation && (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Articulation</div>
                      <div className="font-medium text-gray-900 capitalize">
                        {chord.articulation}
                      </div>
                    </div>
                  )}
                </div>

                {/* MIDI Notes */}
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">MIDI Notes (Voicing):</span>
                  <p className="text-xs font-mono text-gray-700 bg-white p-2 rounded border">
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
};
