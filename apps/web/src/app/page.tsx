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
  Volume2,
  RefreshCw,
  PlayCircle,
  Square
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

  const handlePlayAllChords = () => {
    if (data) {
      const allChords = [data.primaryChord, ...(data.alternativeChords || [])];
      if (audio.isPlayingAllChords) {
        audio.stopAudio();
      } else {
        audio.playAllChords(allChords);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-[#30363d] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#238636] rounded-lg">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#f0f6fc]">Emotion Chord</h1>
                <p className="text-sm text-[#7d8590]">Transform emotions into harmonious music</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {data && (
                <Button
                  onClick={handlePlayAllChords}
                  variant={audio.isPlayingAllChords ? 'secondary' : 'outline'}
                  size="sm"
                  className="flex items-center gap-2 bg-[#21262d] border-[#30363d] text-[#f0f6fc] hover:bg-[#30363d]"
                >
                  {audio.isPlayingAllChords ? <Square className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                  {audio.isPlayingAllChords ? 'Stop Loop' : 'Loop Chords'}
                </Button>
              )}
              {(audio.isPlaying || audio.isProgressionPlaying || audio.isPlayingAllChords) && (
                <Button
                  onClick={audio.stopAudio}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-[#21262d] border-[#30363d] text-[#f0f6fc] hover:bg-[#da3633] hover:border-[#da3633]"
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
          {/* Emotion Input */}
          <Card className="p-6 bg-[#161b22] border-[#30363d]">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#f0f6fc]">Express Your Emotion</h2>
            </div>
            <AdvancedEmotionInput onGenerate={handleEmotionSubmit} loading={loading} />
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="p-6 bg-[#161b22] border-[#da3633]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#da3633]">Something went wrong</h3>
                  <p className="text-[#f0f6fc] mt-1">{error}</p>
                </div>
                <div className="flex gap-2">
                  {lastEmotion && (
                    <Button 
                      onClick={handleRetry} 
                      variant="outline" 
                      size="sm"
                      className="bg-[#21262d] border-[#30363d] text-[#f0f6fc] hover:bg-[#30363d]"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  )}
                  <Button 
                    onClick={clearData} 
                    variant="outline" 
                    size="sm"
                    className="bg-[#21262d] border-[#30363d] text-[#f0f6fc] hover:bg-[#30363d]"
                  >
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
                <h2 className="text-2xl font-bold text-[#f0f6fc] flex items-center gap-3">
                  <Music className="w-7 h-7 text-[#238636]" />
                  Primary Chord Suggestion
                </h2>
                <AdvancedChordDisplay
                  chord={data.primaryChord}
                  isPlaying={audio.playingChord === data.primaryChord.symbol}
                  isArpeggioLooping={audio.arpeggioChord === data.primaryChord.symbol}
                  onPlay={() => handlePlayChord(data.primaryChord)}
                  onPlayArpeggio={() => handlePlayArpeggio(data.primaryChord)}
                  onStop={handleStopAll}
                  showEmotionalContext={true}
                />
              </div>

              {/* Alternative Chords */}
              {data.alternativeChords && data.alternativeChords.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-[#f0f6fc]">Alternative Suggestions</h2>
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
                        showEmotionalContext={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Chord Progression */}
              {data.chordProgression && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-[#f0f6fc]">Emotional Chord Progression</h2>
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
                  <h2 className="text-2xl font-bold text-[#f0f6fc]">
                    Cultural Musical Alternatives
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Indian Raga */}
                    {data.culturalAlternatives.indian && (
                      <Card className="p-6 bg-[#161b22] border-[#30363d]">
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-[#f0f6fc]">Indian Classical</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-[#f0f6fc]">{data.culturalAlternatives.indian.name}</h4>
                            <p className="text-sm text-[#7d8590]">{data.culturalAlternatives.indian.emotion}</p>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-[#f0f6fc]">Notes: </span>
                            <span className="text-sm text-[#7d8590]">
                              {data.culturalAlternatives.indian.notes.join(' - ')}
                            </span>
                          </div>
                          
                          <p className="text-sm text-[#7d8590] italic">
                            {data.culturalAlternatives.indian.characteristic}
                          </p>
                        </div>
                      </Card>
                    )}

                    {/* Arabic Maqam */}
                    {data.culturalAlternatives.arabic && (
                      <Card className="p-6 bg-[#161b22] border-[#30363d]">
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-[#f0f6fc]">Arabic Maqam</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-[#f0f6fc]">{data.culturalAlternatives.arabic.name}</h4>
                            <p className="text-sm text-[#7d8590]">{data.culturalAlternatives.arabic.emotion}</p>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-[#f0f6fc]">Notes: </span>
                            <span className="text-sm text-[#7d8590]">
                              {data.culturalAlternatives.arabic.notes.join(' - ')}
                            </span>
                          </div>
                          
                          {data.culturalAlternatives.arabic.quarterTones && (
                            <div>
                              <span className="text-sm font-medium text-[#f0f6fc]">Quarter Tones: </span>
                              <span className="text-sm text-[#7d8590]">
                                {data.culturalAlternatives.arabic.quarterTones.join(', ')}
                              </span>
                            </div>
                          )}
                          
                          <p className="text-sm text-[#7d8590] italic">
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
      <footer className="bg-[#161b22] border-t border-[#30363d] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-[#7d8590] text-sm">
              Powered by advanced AI emotion recognition, GEMS framework, and cross-cultural music theory
            </p>
            <p className="text-[#6e7681] text-xs mt-2">
              Built with Next.js 15, TypeScript, and Tone.js for real-time audio synthesis
            </p>
          </div>
        </div>
      </footer>

      {/* Fixed Audio Ready Badge */}
      {audio.isInitialized && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in-0 duration-500">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#238636]/90 backdrop-blur-sm text-[#f0f6fc] rounded-full text-sm shadow-lg border border-[#238636]">
            <span className="font-medium">🔊 Audio Ready</span>
          </div>
        </div>
      )}
    </div>
  );
}
