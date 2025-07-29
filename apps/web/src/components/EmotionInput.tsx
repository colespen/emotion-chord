import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Send } from 'lucide-react';

interface EmotionInputProps {
  onSubmit: (emotion: string) => void;
  loading: boolean;
}

export function EmotionInput({ onSubmit, loading }: EmotionInputProps) {
  const [emotion, setEmotion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emotion.trim()) {
      onSubmit(emotion.trim());
    }
  };

  const suggestions = [
    'I feel overwhelmed by my responsibilities',
    'Excited about new possibilities',
    'Nostalgic about childhood memories',
    'Anxious about the future',
    'Peaceful and content',
    'Frustrated with current situation',
    'Hopeful despite challenges',
    'Melancholic on a rainy day',
  ];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="emotion" className="block text-sm font-medium text-gray-700 mb-2">
            Describe your emotion or feeling
          </label>
          <Textarea
            id="emotion"
            placeholder="Express how you're feeling in your own words..."
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            className="min-h-[100px]"
            maxLength={500}
          />
          <div className="mt-1 text-xs text-gray-500">
            {emotion.length}/500 characters
          </div>
        </div>
        
        <Button
          type="submit"
          loading={loading}
          disabled={!emotion.trim() || loading}
          className="w-full"
          size="lg"
        >
          <Send className="mr-2 h-4 w-4" />
          Generate Chord
        </Button>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Try these examples:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setEmotion(suggestion)}
              className="text-left text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
              disabled={loading}
            >
              "{suggestion}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
