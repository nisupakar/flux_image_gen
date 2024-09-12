'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ImageGeneratorProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt);
      setPrompt('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
      <Input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a prompt for image generation"
        className="flex-grow"
        disabled={isGenerating}
      />
      <Button type="submit" disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Image'}
      </Button>
    </form>
  );
};

export default ImageGenerator;