import React from 'react';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';

interface PostMetaProps {
  publishedAt: string;
  updatedAt?: string;
  category: {
    name: string;
    slug: string;
    color: string;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
  wordCount?: number;
  readingTime?: number;
  hideTagsForMobile?: boolean;
  hideUpdateDate?: boolean;
  className?: string;
}

export function PostMeta({
  publishedAt,
  updatedAt,
  category,
  tags,
  wordCount,
  readingTime,
  hideTagsForMobile = false,
  hideUpdateDate = false,
  className = '',
}: PostMetaProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 text-sm ${className}`}>
      {/* Category */}
      <CategoryBadge category={category} />

      {/* Published Date */}
      <div className="flex items-center gap-1.5 text-75">
        <Calendar className="h-4 w-4" />
        <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
      </div>

      {/* Updated Date */}
      {!hideUpdateDate && updatedAt && updatedAt !== publishedAt && (
        <div className="flex items-center gap-1.5 text-50 text-xs">
          <span>更新于</span>
          <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
        </div>
      )}

      {/* Word Count & Reading Time */}
      {(wordCount || readingTime) && (
        <div className="flex items-center gap-1.5 text-50">
          <Clock className="h-4 w-4" />
          {wordCount && <span>{wordCount} 字</span>}
          {wordCount && readingTime && <span>·</span>}
          {readingTime && <span>{readingTime} 分钟</span>}
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className={`flex flex-wrap items-center gap-2 ${hideTagsForMobile ? 'hidden md:flex' : ''}`}>
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/blog?tag=${tag.slug}`}
              className="text-50 hover:text-[var(--primary)] transition with-divider"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
