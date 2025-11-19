/**
 * Post Media Gallery Component
 * Display media attachments in posts
 */

import React, { useState } from 'react';
import { MediaItem, MediaType } from '@/types/community';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Download } from 'lucide-react';

interface PostMediaGalleryProps {
  media: MediaItem[];
}

export const PostMediaGallery: React.FC<PostMediaGalleryProps> = ({ media }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < media.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const renderMediaItem = (item: MediaItem, index: number) => {
    switch (item.type) {
      case MediaType.IMAGE:
        return (
          <img
            key={item.id}
            src={item.url}
            alt={item.filename}
            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openLightbox(index)}
          />
        );
      case MediaType.VIDEO:
        return (
          <video
            key={item.id}
            src={item.url}
            controls
            className="w-full h-full object-cover"
            poster={item.thumbnailUrl}
          />
        );
      case MediaType.AUDIO:
        return (
          <div key={item.id} className="flex items-center justify-center bg-gray-100 p-4">
            <audio src={item.url} controls className="w-full" />
          </div>
        );
      case MediaType.DOCUMENT:
        return (
          <div key={item.id} className="flex items-center justify-center bg-gray-100 p-4">
            <a
              href={item.url}
              download={item.filename}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Download className="w-5 h-5" />
              {item.filename}
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  const getGridClass = () => {
    const count = media.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    return 'grid-cols-2';
  };

  return (
    <>
      <div className={`grid ${getGridClass()} gap-2 my-4 rounded-lg overflow-hidden`}>
        {media.map((item, index) => (
          <div
            key={item.id}
            className={`relative ${
              media.length === 3 && index === 0 ? 'col-span-2' : ''
            } ${
              media.length > 4 && index >= 3 ? 'hidden' : ''
            }`}
            style={{ minHeight: media.length === 1 ? '400px' : '200px' }}
          >
            {renderMediaItem(item, index)}
            {media.length > 4 && index === 3 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-2xl font-semibold">
                +{media.length - 4}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Dialog */}
      {selectedIndex !== null && (
        <Dialog open={selectedIndex !== null} onOpenChange={closeLightbox}>
          <DialogContent className="max-w-4xl p-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={closeLightbox}
                className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              >
                <X className="w-5 h-5" />
              </Button>

              {selectedIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}

              {selectedIndex < media.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}

              <img
                src={media[selectedIndex].url}
                alt={media[selectedIndex].filename}
                className="w-full h-auto max-h-[80vh] object-contain"
              />

              <div className="p-4 bg-black bg-opacity-50 text-white text-center">
                {selectedIndex + 1} / {media.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
