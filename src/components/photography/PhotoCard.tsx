'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Tag, ImageIcon } from 'lucide-react';
import type { PhotoGallery } from '@/lib/types';

interface PhotoCardProps {
  gallery: PhotoGallery;
}

export function PhotoCard({ gallery }: PhotoCardProps) {
  const formattedDate = gallery.date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 显示前 4 张图片
  const displayImages = gallery.images.slice(0, 4);
  const remainingCount = gallery.images.length - displayImages.length;

  return (
    <Link href={`/photography/${gallery.id}`} className="block">
      <div className="card-base overflow-hidden transition-all hover:shadow-lg group">
        {/* Top: Title */}
        <div className="p-6 pb-4 border-b border-[var(--line-divider)]">
          <h3 className="text-2xl font-bold text-90 group-hover:text-[var(--primary)] transition-colors">
            {gallery.title}
          </h3>
          {gallery.description && (
            <p className="text-75 mt-2 line-clamp-2 leading-relaxed">
              {gallery.description}
            </p>
          )}
        </div>

        {/* Middle: Images Grid */}
        <div className="relative bg-[var(--card-bg)] p-2">
          <div className="grid grid-cols-4 gap-2">
            {displayImages.map((image, index) => (
              <div
                key={index}
                className="relative aspect-[4/3] overflow-hidden rounded-md bg-[var(--card-bg)] group/image"
              >
                <Image
                  src={image.thumbnail}
                  alt={image.alt || `${gallery.title} - ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/image:scale-110"
                  sizes="(max-width: 768px) 25vw, (max-width: 1024px) 20vw, 15vw"
                />
                {/* Show remaining count on last image */}
                {index === displayImages.length - 1 && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-white text-xl font-bold">
                      +{remainingCount}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Meta Info */}
        <div className="p-6 pt-4 border-t border-[var(--line-divider)]">
          <div className="flex flex-wrap items-center gap-4 text-75 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>{gallery.images.length} 张照片</span>
            </div>

            {gallery.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4" />
                {gallery.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {gallery.tags.length > 3 && (
                  <span className="text-xs text-50">+{gallery.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
