'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Tag, ImageIcon } from 'lucide-react';

interface PhotoCardProps {
  gallery: any; // Using any for now since the type doesn't match the actual data structure
}

export function PhotoCard({ gallery }: PhotoCardProps) {
  // Use publishedAt if available, otherwise use captureDate or createdAt
  const dateToUse = gallery.publishedAt || gallery.captureDate || gallery.createdAt;
  const formattedDate = dateToUse
    ? new Date(dateToUse).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <Link href={`/photography/${gallery.slug || gallery.id}`} className="block">
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

        {/* Middle: Cover Image */}
        <div className="relative bg-[var(--card-bg)] p-2">
          <div className="relative aspect-video overflow-hidden rounded-md bg-[var(--card-bg)]">
            {gallery.coverImage && (
              <Image
                src={gallery.coverImageThumb || gallery.coverImage}
                alt={gallery.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
              />
            )}
          </div>
        </div>

        {/* Bottom: Meta Info */}
        <div className="p-6 pt-4 border-t border-[var(--line-divider)]">
          <div className="flex flex-wrap items-center gap-4 text-75 text-sm">
            {formattedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>{gallery.imageCount || 0} 张照片</span>
            </div>

            {gallery.tags && gallery.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4" />
                {gallery.tags.slice(0, 3).map((tag: string, idx: number) => (
                  <span
                    key={idx}
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
