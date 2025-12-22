"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Tag, ImageIcon } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  alt: string | null;
}

interface PhotoCardProps {
  gallery: any; // Using any for now since the type doesn't match the actual data structure
}

export function PhotoCard({ gallery }: PhotoCardProps) {
  // Use publishedAt if available, otherwise use captureDate or createdAt
  const dateToUse =
    gallery.publishedAt ?? gallery.captureDate ?? gallery.createdAt;
  const formattedDate = dateToUse
    ? new Date(dateToUse).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const photos: Photo[] = gallery.photos ?? [];
  const hasPhotos = photos.length > 0;
  const displayPhotos = photos.slice(0, 4);
  const totalImageCount = gallery.imageCount ?? 0;
  const remainingCount = totalImageCount > 4 ? totalImageCount - 4 : 0;

  return (
    <Link href={`/photography/${gallery.slug ?? gallery.id}`} className="block">
      <div className="card-base group overflow-hidden transition-all hover:shadow-lg">
        {/* Top: Title */}
        <div className="border-b border-[var(--line-divider)] p-6 pb-4">
          <h3 className="text-90 text-2xl font-bold transition-colors group-hover:text-[var(--primary)]">
            {gallery.title}
          </h3>
          {gallery.description && (
            <p className="text-75 mt-2 line-clamp-2 leading-relaxed">
              {gallery.description}
            </p>
          )}
        </div>

        {/* Middle: Photo Row */}
        <div className="relative bg-[var(--card-bg)] p-2">
          {hasPhotos ? (
            <div className="flex gap-2">
              {displayPhotos.map((photo, index) => {
                const isLast = index === 3 && remainingCount > 0;
                return (
                  <div
                    key={photo.id}
                    className="group/photo relative aspect-square flex-1 overflow-hidden rounded-md bg-[var(--card-bg)]"
                  >
                    <Image
                      src={photo.thumbnail ?? photo.url}
                      alt={photo.alt ?? gallery.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover/photo:scale-105"
                      sizes="(max-width: 768px) 25vw, (max-width: 1024px) 20vw, 15vw"
                    />
                    {isLast && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <span className="text-2xl font-bold text-white">
                          +{remainingCount}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="flex items-center justify-center rounded-md bg-slate-100"
              style={{ aspectRatio: "4/1" }}
            >
              <ImageIcon className="text-75 h-12 w-12 opacity-30" />
            </div>
          )}
        </div>

        {/* Bottom: Meta Info */}
        <div className="border-t border-[var(--line-divider)] p-6 pt-4">
          <div className="text-75 flex flex-wrap items-center gap-4 text-sm">
            {formattedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>{gallery.imageCount ?? 0} 张照片</span>
            </div>

            {gallery.tags && gallery.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4" />
                {gallery.tags.slice(0, 3).map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="rounded-full bg-[var(--primary)]/10 px-2 py-1 text-xs text-[var(--primary)]"
                  >
                    {tag}
                  </span>
                ))}
                {gallery.tags.length > 3 && (
                  <span className="text-50 text-xs">
                    +{gallery.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
