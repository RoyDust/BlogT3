'use client';

import React, { useEffect } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import type { PhotoImage } from '@/lib/types';

interface PhotoLightboxProps {
  images: PhotoImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function PhotoLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
}: PhotoLightboxProps) {
  // Convert images to lightbox format
  const lightboxImages = images.map((img) => ({
    src: img.url,
    alt: img.alt,
    width: img.width,
    height: img.height,
  }));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        onIndexChange(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onIndexChange]);

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      slides={lightboxImages}
      index={currentIndex}
      on={{
        view: ({ index }) => {
          onIndexChange(index);
        },
      }}
      animation={{ fade: 300 }}
      controller={{ closeOnBackdropClick: true }}
      styles={{
        container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' },
      }}
    />
  );
}
