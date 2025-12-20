'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import type { PhotoImage } from '@/lib/types';
import { PhotoLightbox } from './PhotoLightbox';

interface PhotoGalleryGridProps {
  images: PhotoImage[];
  title: string;
}

export function PhotoGalleryGrid({ images, title }: PhotoGalleryGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  // Masonry breakpoint columns
  const breakpointColumns = {
    default: 2,
    768: 1,
  };

  return (
    <>
      <style jsx global>{`
        .masonry-grid {
          display: flex;
          width: auto;
          margin-left: -1rem; /* gutter size offset */
        }
        .masonry-grid_column {
          padding-left: 1rem; /* gutter size */
          background-clip: padding-box;
        }
        .masonry-grid_column > div {
          margin-bottom: 1rem;
        }
      `}</style>

      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {images.map((image, index) => {
          // Calculate aspect ratio for varied heights
          const aspectRatio = image.width && image.height
            ? image.width / image.height
            : 4 / 3;

          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg bg-[var(--card-bg)] cursor-pointer group"
              style={{ aspectRatio: aspectRatio }}
              onClick={() => handleImageClick(index)}
            >
              <Image
                src={image.thumbnail}
                alt={image.alt || `${title} - ${index + 1}`}
                fill
                className="object-cover transition-all group-hover:scale-105 group-hover:opacity-90"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
            </div>
          );
        })}
      </Masonry>

      <PhotoLightbox
        images={images}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setCurrentIndex}
      />
    </>
  );
}
