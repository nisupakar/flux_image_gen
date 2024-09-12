'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Download } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

interface ImageGridProps {
  images: GeneratedImage[];
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

const ImageGrid: React.FC<ImageGridProps> = ({ images = dummyImages }) => {
  const [likedImages, setLikedImages] = useState<{ [key: string]: boolean }>({});

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${prompt.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleLike = async (imageId: string) => {
    setLikedImages((prev) => ({
      ...prev,
      [imageId]: !prev[imageId],
    }));

    try {
      const response = await fetch('/api/like-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId }),
      });
      const data = await response.json();
      if (data.success) {
        console.log('Like updated successfully');
      }
    } catch (error) {
      console.error('Error updating like count:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <Card key={image.id} className="relative overflow-hidden group">
          <Image
            src={image.url}
            alt={image.prompt}
            width={300}
            height={300}
            className="rounded-t-lg w-full h-auto"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-2">
              <Button
                onClick={() => handleDownload(image.url, image.prompt)}
                variant="outline"
                size="icon"
                className="bg-white hover:bg-gray-100"
              >
                <Download size={20} />
              </Button>
              <Button
                onClick={() => handleLike(image.id)}
                variant="outline"
                size="icon"
                className="bg-white hover:bg-gray-100"
              >
                <Heart
                  size={20}
                  fill={likedImages[image.id] ? 'red' : 'none'}
                  color={likedImages[image.id] ? 'red' : 'black'}
                />
              </Button>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">{image.prompt}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ImageGrid;