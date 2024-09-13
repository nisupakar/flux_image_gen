'use client';

import React from 'react';
import Image from 'next/image';

interface GeneratedImage {
  id: number;
  image_url: string;
  prompt: string;
  likes_count: number;
  creator_user_id: string;
  created_at: string;
}

interface ImageGridProps {
  images: GeneratedImage[];
  updateLikes: (imageId: number, newLikesCount: number) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, updateLikes }) => {
  const handleDownload = (imageUrl: string, prompt: string) => {
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${prompt}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Error downloading image:', error));
  };

  const handleLike = async (imageId: number) => {
    try {
      const response = await fetch('/api/like-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId }),
      });
      if (!response.ok) {
        throw new Error('Failed to like image');
      }
      const { likes } = await response.json();
      updateLikes(imageId, likes);
    } catch (error) {
      console.error('Error liking image:', error);
    }
  };

  if (images.length === 0) {
    return <p className="text-center mt-8">No images generated yet. Try creating one!</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
      {images.map((image) => (
        <div key={image.id} className="relative group">
          <Image
            src={image.image_url}
            alt={image.prompt}
            width={300}
            height={300}
            className="w-full h-64 object-cover rounded-lg"
            onError={(e) => {
              console.error('Error loading image:', image.image_url, e);
              e.currentTarget.src = '/placeholder.png';
            }}
            unoptimized
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <p className="text-white text-center p-2">{image.prompt}</p>
            <button onClick={() => handleDownload(image.image_url, image.prompt)} className="absolute bottom-2 left-2 bg-white text-black p-1 rounded">
              Download
            </button>
            <button onClick={() => handleLike(image.id)} className="absolute bottom-2 right-2 bg-white text-black p-1 rounded">
              Like ({image.likes_count})
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;