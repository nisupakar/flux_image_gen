'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import ImageGrid from '../components/image-grid';
import ImageGenerator from '../components/image-generator';
import { GeneratedImage } from './types';

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchImages = useCallback(async () => {
    try {
      const [imagesResponse, userLikes] = await Promise.all([
        fetch('/api/get-images'),
        fetchUserLikes()
      ]);
      if (!imagesResponse.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await imagesResponse.json();
      if (Array.isArray(data.images)) {
        const imagesWithLikeStatus = data.images.map((image: GeneratedImage) => ({
          ...image,
          is_liked: userLikes.has(image.id)
        }));
        setGeneratedImages(imagesWithLikeStatus);
        console.log('Updated generatedImages:', imagesWithLikeStatus);
      } else {
        console.error('Received invalid image data:', data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      createOrFetchUser();
      fetchImages();
    }
  }, [isLoaded, isSignedIn, fetchImages]);

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
      setGeneratedImages(prevImages => [data.image as GeneratedImage, ...prevImages]);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateImageLikes = async (imageId: number) => {
    try {
      const response = await fetch('/api/like-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update likes');
      }

      const data = await response.json();
      
      setGeneratedImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId 
            ? { 
                ...img, 
                likes_count: data.likes,
                is_liked: data.action === 'liked'
              } 
            : img
        )
      );
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const fetchUserLikes = async () => {
    try {
      const response = await fetch('/api/get-user-likes');
      if (!response.ok) {
        throw new Error('Failed to fetch user likes');
      }
      const data = await response.json();
      return new Set(data.likedImageIds);
    } catch (error) {
      console.error('Error fetching user likes:', error);
      return new Set();
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  console.log('Rendering ImageGrid with images:', generatedImages);
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.firstName}!</h1>
      <ImageGenerator onGenerate={handleGenerateImage} isGenerating={isGenerating} />
      <ImageGrid images={generatedImages} updateLikes={updateImageLikes} />
    </main>
  );
}
