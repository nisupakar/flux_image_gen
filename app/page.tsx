'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import ImageGrid from '../components/image-grid';
import ImageGenerator from '../components/image-generator';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleGenerateImage = async (prompt: string) => {
    setIsGenerating(true);
    try {
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
      const result = await pollForResult(data.id);

      const newImage: GeneratedImage = {
        id: result.id,
        url: result.output[0],
        prompt: prompt,
      };

      setGeneratedImages((prevImages) => [newImage, ...prevImages]);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const pollForResult = async (id: string) => {
    const pollInterval = 1000;
    const maxAttempts = 60;

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

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.firstName}!</h1>
      <ImageGenerator onGenerate={handleGenerateImage} isGenerating={isGenerating} />
      <ImageGrid images={generatedImages} />
    </main>
  );
}
