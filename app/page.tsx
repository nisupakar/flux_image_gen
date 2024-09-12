'use client';

import React, { useState } from 'react';
import ImageGrid from '../components/image-grid';
import ImageGenerator from '../components/image-generator';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

// Dummy image data
const dummyImages: GeneratedImage[] = [
  {
    id: '1',
    url: 'https://picsum.photos/300/300?random=1',
    prompt: 'A beautiful landscape',
  },
  {
    id: '2',
    url: 'https://picsum.photos/300/300?random=2',
    prompt: 'A cute animal',
  },
  {
    id: '3',
    url: 'https://picsum.photos/300/300?random=3',
    prompt: 'An abstract artwork',
  },
  {
    id: '4',
    url: 'https://picsum.photos/300/300?random=4',
    prompt: 'A futuristic city',
  },
];

export default function Home() {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(dummyImages);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async (prompt: string) => {
    setIsGenerating(true);
    try {
      console.log('Generating image with prompt:', prompt);
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      console.log('Received prediction ID:', data.id);

      // Poll for the result
      const result = await pollForResult(data.id);
      console.log('Received generated image:', result);

      const newImage: GeneratedImage = {
        id: result.id,
        url: result.output[0],
        prompt: prompt,
      };

      setGeneratedImages((prevImages) => [newImage, ...prevImages]);
      console.log('Added new image to state');
    } catch (error) {
      console.error('Error generating image:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsGenerating(false);
    }
  };

  const pollForResult = async (id: string) => {
    const pollInterval = 1000; // 1 second
    const maxAttempts = 60; // 1 minute max

    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(`/api/poll-image?id=${id}`);
      const result = await response.json();

      if (result.status === 'succeeded') {
        return result;
      } else if (result.status === 'failed') {
        throw new Error('Image generation failed');
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Timeout while waiting for image generation');
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Generated Images</h1>
      <ImageGenerator onGenerate={handleGenerateImage} isGenerating={isGenerating} />
      <ImageGrid images={generatedImages} />
    </main>
  );
}
