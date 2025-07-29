'use client';

import React, { useState } from 'react';
import { EmotionInput } from '@/components/EmotionInput';
import { EmotionAnalysisDisplay } from '@/components/EmotionAnalysisDisplay';
import { ChordDisplay } from '@/components/ChordDisplay';
import { Button } from '@/components/ui/Button';
import { useEmotionChord } from '@/hooks/use-emotion-chord';
import { useAudio } from '@/hooks/use-audio';
import { AlertCircle, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import type { ChordSuggestion } from '@/types/emotion-chord';

export default function Home() {
  const { data, loading, error, generateChord, clearData } = useEmotionChord();
  const {
    isInitialized,
    isArpeggioLooping,
    error: audioError,
    playChord,
    toggleArpeggio,
    stopAudio,
  } = useAudio();

  const [playingChord, setPlayingChord] = useState<string | null>(null);

  const handlePlayChord = async (chord: ChordSuggestion) => {
    setPlayingChord(chord.symbol);
    await playChord(chord);
    setPlayingChord(null);
  };

  const handleToggleArpeggio = async (chord: ChordSuggestion) => {
    console.log('handleToggleArpeggio called with data:', data);
    console.log('Emotion data:', data?.emotion);
    console.log('Suggested tempo:', data?.emotion?.suggestedTempo);
    
    if (isArpeggioLooping) {
      // If already looping, stop it
      stopAudio();
      setPlayingChord(null);
    } else {
      // Start the arpeggio loop with emotion-based timing
      setPlayingChord(chord.symbol);
      await toggleArpeggio(chord, data?.emotion);
    }
  };

  const handleStop = () => {
    stopAudio();
    setPlayingChord(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            🎵 Emotion to Chord
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the musical expression of your emotions. Enter how you&apos;re feeling, 
            and we&apos;ll generate the perfect chord using AI-powered emotion analysis.
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Input Section */}
          <div className="max-w-2xl mx-auto">
            <EmotionInput onSubmit={generateChord} loading={loading} />
            
            {/* Audio Status & Controls */}
            {data && (
              <div className="flex items-center justify-center gap-4 mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  {isInitialized ? (
                    <Volume2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">
                    {isInitialized ? 'Audio Ready' : 'Audio will initialize on first play'}
                  </span>
                </div>
                <Button size="sm" variant="outline" onClick={clearData}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            )}
          </div>

          {/* Error Display */}
          {(error || audioError) && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-900">Error</h3>
                  <p className="text-red-700 text-sm mt-1">
                    {error || audioError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {data && (
            <div className="space-y-8">
              {/* Emotion Analysis */}
              <div className="max-w-2xl mx-auto">
                <EmotionAnalysisDisplay emotion={data.emotion} />
              </div>

              {/* Primary Chord */}
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Your Chord
                </h2>
                <ChordDisplay
                  chord={data.primaryChord}
                  isPrimary={true}
                  isPlaying={playingChord === data.primaryChord.symbol && !isArpeggioLooping}
                  isArpeggioLooping={isArpeggioLooping && playingChord === data.primaryChord.symbol}
                  onPlayChord={() => handlePlayChord(data.primaryChord)}
                  onPlayArpeggio={() => handleToggleArpeggio(data.primaryChord)}
                  onStop={handleStop}
                />
              </div>

              {/* Alternative Chords */}
              {data.alternativeChords.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Alternative Chords
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {data.alternativeChords.map((chord, index) => (
                      <ChordDisplay
                        key={`${chord.symbol}-${index}`}
                        chord={chord}
                        isPlaying={playingChord === chord.symbol && !isArpeggioLooping}
                        isArpeggioLooping={isArpeggioLooping && playingChord === chord.symbol}
                        onPlayChord={() => handlePlayChord(chord)}
                        onPlayArpeggio={() => handleToggleArpeggio(chord)}
                        onStop={handleStop}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>
            Powered by OpenAI emotion analysis and Tone.js audio synthesis
          </p>
        </footer>
      </div>
    </div>
  );
}
