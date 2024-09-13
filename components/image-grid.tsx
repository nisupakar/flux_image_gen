'use client';

import React from 'react';
import Image from 'next/image';
import { GeneratedImage } from '../app/types';
import { Download, Heart } from 'lucide-react';

interface ImageGridProps {
  images: GeneratedImage[];
  updateLikes: (imageId: number, newLikesCount: number, isLiked: boolean) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, updateLikes }) => {
  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${prompt.slice(0, 20)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
      {images.map((image: GeneratedImage) => (
        <div key={image.id} className="relative group">
          <Image
            src={image.image_url}
            alt={image.prompt} 
            width={300}
            height={300}
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center">
            <p className="text-white text-center p-2 mb-4">{image.prompt}</p>
            <div className="flex justify-between w-full px-4">
              <button 
                onClick={() => handleDownload(image.image_url, image.prompt)} 
                className="bg-white text-black p-2 rounded flex items-center"
              >
                <Download size={16} className="mr-1" /> Download
              </button>
              <button 
                onClick={() => updateLikes(image.id, image.likes_count, image.is_liked ?? false)}
                className={`${image.is_liked ? 'bg-red-500 text-white' : 'bg-white text-black'} p-2 rounded flex items-center`}
              >
                <Heart size={16} className="mr-1" fill={image.is_liked ? 'white' : 'none'} /> {image.likes_count}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;