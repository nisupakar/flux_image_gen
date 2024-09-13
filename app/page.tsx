'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import ImageGrid from '../components/image-grid';
import ImageGenerator from '../components/image-generator';

interface GeneratedImage {
  id: number;
  image_url: string;
  prompt: string;
  likes_count: number;
  creator_user_id: string;
  created_at: string;
}

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  console.log('Current generatedImages:', generatedImages);
  useEffect(() => {
    console.log('generatedImages updated:', generatedImages);
  }, [generatedImages]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      createOrFetchUser();
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/get-images');
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }
        const data = await response.json();
        console.log('Fetched images in Home:', data.images);
        if (Array.isArray(data.images)) {
          setGeneratedImages(data.images);
        } else {
          console.error('Received invalid image data:', data);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    if (isSignedIn) {
      fetchImages();
    }
  }, [isSignedIn]);

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
      console.log('API response:', data);

      if (data.image) {
        setGeneratedImages((prevImages) => [data.image, ...prevImages]);
      } else {
        throw new Error('Image generation failed');
      }
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

  const createOrFetchUser = async () => {
    try {
      const response = await fetch('/api/user', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to create or fetch user');
      }
      const data = await response.json();
      console.log('User data:', data);
    } catch (error) {
      console.error('Error creating or fetching user:', error);
    }
  };

  const updateImageLikes = (imageId: number, newLikesCount: number) => {
    setGeneratedImages(prevImages =>
      prevImages.map(img =>
        img.id === imageId ? { ...img, likes_count: newLikesCount } : img
      )
    );
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.firstName}!</h1>
      <ImageGenerator onGenerate={handleGenerateImage} isGenerating={isGenerating} />
      <ImageGrid images={generatedImages} updateLikes={updateImageLikes} />
    </main>
  );
}
