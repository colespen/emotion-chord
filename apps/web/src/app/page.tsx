'use client';

import React, { useState } from 'react';
import { AdvancedEmotionInput } from '@/components/AdvancedEmotionInput';
import { AdvancedChordDisplay } from '@/components/AdvancedChordDisplay';
import { ChordProgressionDisplay } from '@/components/ChordProgressionDisplay';
import { EmotionAnalysisDisplay } from '@/components/EmotionAnalysisDisplay';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useEmotionChord } from '@/hooks/use-emotion-chord';
import type { AdvancedChordSuggestion } from '@/types/emotion-chord';
import { useAudio } from '@/hooks/use-audio';
import {
  Music,
  Sparkles,
  Volume2,
  Heart,
  RefreshCw,
  Lightbulb,
  Globe,
  Headphones
} from 'lucide-react';

export default function Home() {
  const [lastEmotion, setLastEmotion] = useState<string>('');
  const { data, loading, error, generateChord, clearData } = useEmotionChord();
  const audio = useAudio();

  const handleEmotionSubmit = (emotion: string) => {
    setLastEmotion(emotion);
    // For now, just use the emotion since the API doesn't support options yet
    generateChord(emotion);
  };

  const handlePlayChord = (chord: AdvancedChordSuggestion) => {
    audio.playChord(chord);
  };

  const handlePlayArpeggio = (chord: AdvancedChordSuggestion) => {
    audio.toggleArpeggio(chord);
  };

  const handleStopAll = () => {
    audio.stopAudio();
  };

  const handlePlayProgression = () => {
    if (data?.chordProgression) {
      audio.playProgression(data.chordProgression, false);
    }
  };

  const handleLoopProgression = () => {
    if (data?.chordProgression) {
      audio.playProgression(data.chordProgression, !audio.isProgressionLooping);
    }
  };

  const handleRetry = () => {
    if (lastEmotion) {
      generateChord(lastEmotion);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Emotion Chord</h1>
                <p className="text-sm text-gray-600">Transform emotions into harmonious music</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {audio.isInitialized && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <Headphones className="w-4 h-4" />
                  Audio Ready
                </div>
              )}
              {(audio.isPlaying || audio.isProgressionPlaying) && (
                <Button
                  onClick={audio.stopAudio}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  Stop All
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          {!data && !loading && (
            <div className="text-center py-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
                  <Heart className="w-12 h-12 text-purple-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Emotion Chord
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Discover the musical harmony that matches your emotions. Our advanced AI analyzes your feelings 
                and generates sophisticated chord progressions using the Geneva Emotional Music Scale (GEMS) 
                and cross-cultural musical theory.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
                  <p className="text-sm text-gray-600">
                    Advanced emotion recognition using GPT-4 and the GEMS framework
                  </p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Music className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Sophisticated Harmony</h3>
                  <p className="text-sm text-gray-600">
                    Professional chord voicings with voice leading and harmonic analysis
                  </p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Globe className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Cultural Diversity</h3>
                  <p className="text-sm text-gray-600">
                    Explore Western, Indian raga, and Arabic maqam musical traditions
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Emotion Input */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-900">Express Your Emotion</h2>
            </div>
            <AdvancedEmotionInput onGenerate={handleEmotionSubmit} loading={loading} />
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Something went wrong</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
                <div className="flex gap-2">
                  {lastEmotion && (
                    <Button onClick={handleRetry} variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  )}
                  <Button onClick={clearData} variant="outline" size="sm">
                    Dismiss
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Results */}
          {data && (
            <div className="space-y-8">
              {/* Emotion Analysis */}
              <EmotionAnalysisDisplay emotion={data.emotion} />

              {/* Primary Chord */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Music className="w-7 h-7 text-purple-600" />
                  Primary Chord Suggestion
                </h2>
                <AdvancedChordDisplay
                  chord={data.primaryChord}
                  isPlaying={audio.playingChord === data.primaryChord.symbol}
                  isArpeggioLooping={audio.arpeggioChord === data.primaryChord.symbol}
                  onPlay={() => handlePlayChord(data.primaryChord)}
                  onPlayArpeggio={() => handlePlayArpeggio(data.primaryChord)}
                  onStop={handleStopAll}
                />
              </div>

              {/* Alternative Chords */}
              {data.alternativeChords && data.alternativeChords.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Alternative Suggestions</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {data.alternativeChords.map((chord, index) => (
                      <AdvancedChordDisplay
                        key={index}
                        chord={chord}
                        isPlaying={audio.playingChord === chord.symbol}
                        isArpeggioLooping={audio.arpeggioChord === chord.symbol}
                        onPlay={() => handlePlayChord(chord)}
                        onPlayArpeggio={() => handlePlayArpeggio(chord)}
                        onStop={handleStopAll}
                        showDetails={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Chord Progression */}
              {data.chordProgression && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Emotional Chord Progression</h2>
                  <ChordProgressionDisplay
                    progression={data.chordProgression}
                    currentChord={audio.currentChord}
                    isPlaying={audio.isProgressionPlaying}
                    isLooping={audio.isProgressionLooping}
                    onPlay={handlePlayProgression}
                    onPause={audio.pauseProgression}
                    onLoop={handleLoopProgression}
                    onNext={audio.nextChord}
                    onPrev={audio.previousChord}
                    onChordSelect={audio.selectChord}
                  />
                </div>
              )}

              {/* Cultural Alternatives */}
              {data.culturalAlternatives && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Globe className="w-7 h-7 text-green-600" />
                    Cultural Musical Alternatives
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Indian Raga */}
                    {data.culturalAlternatives.indian && (
                      <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-orange-100 rounded-full">
                            <Globe className="w-5 h-5 text-orange-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">Indian Classical</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{data.culturalAlternatives.indian.name}</h4>
                            <p className="text-sm text-gray-600">{data.culturalAlternatives.indian.emotion}</p>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-700">Notes: </span>
                            <span className="text-sm text-gray-600">
                              {data.culturalAlternatives.indian.notes.join(' - ')}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-700 italic">
                            {data.culturalAlternatives.indian.characteristic}
                          </p>
                        </div>
                      </Card>
                    )}

                    {/* Arabic Maqam */}
                    {data.culturalAlternatives.arabic && (
                      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Globe className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">Arabic Maqam</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{data.culturalAlternatives.arabic.name}</h4>
                            <p className="text-sm text-gray-600">{data.culturalAlternatives.arabic.emotion}</p>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-700">Notes: </span>
                            <span className="text-sm text-gray-600">
                              {data.culturalAlternatives.arabic.notes.join(' - ')}
                            </span>
                          </div>
                          
                          {data.culturalAlternatives.arabic.quarterTones && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Quarter Tones: </span>
                              <span className="text-sm text-gray-600">
                                {data.culturalAlternatives.arabic.quarterTones.join(' - ')}
                              </span>
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-700 italic">
                            {data.culturalAlternatives.arabic.characteristic}
                          </p>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Powered by advanced AI emotion recognition, GEMS framework, and cross-cultural music theory
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Built with Next.js 15, TypeScript, and Tone.js for real-time audio synthesis
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
