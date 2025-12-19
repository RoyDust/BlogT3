import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Eye } from 'lucide-react';
import { PostMeta } from './PostMeta';
import type { Post } from '~/lib/mock-data';

interface PostCardProps {
  post: Post;
  className?: string;
}

export function PostCard({ post, className = '' }: PostCardProps) {
  const hasCover = !!post.coverImage;

  return (
    <>
      <div
        className={`card-base flex flex-col-reverse md:flex-col w-full rounded-[var(--radius-large)] overflow-hidden relative ${className}`}
      >
        {/* Content Area */}
        <div
          className={`
          pl-6 md:pl-9 pr-6 md:pr-2 pt-6 md:pt-7 pb-6 relative
          ${hasCover ? 'w-full md:w-[calc(100%-28%-12px)]' : 'w-full md:w-[calc(100%-52px-12px)]'}
        `}
        >
          {/* Title with accent bar */}
          <Link
            href={`/post/${post.slug}`}
            className="
            group transition w-full block font-bold mb-3 text-3xl text-90
            hover:text-[var(--primary)] dark:hover:text-[var(--primary)]
            active:text-[var(--title-active)] dark:active:text-[var(--title-active)]
            before:w-1 before:h-5 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:top-[35px] before:left-[18px] before:hidden md:before:block
          "
          >
            {post.title}

            {/* Mobile chevron */}
            <ChevronRight className="inline h-8 w-8 text-[var(--primary)] md:hidden translate-y-0.5 absolute" />

            {/* Desktop chevron with animation */}
            <ChevronRight
              className="
            text-[var(--primary)] h-8 w-8 transition hidden md:inline
            absolute translate-y-0.5 opacity-0 group-hover:opacity-100
            -translate-x-1 group-hover:translate-x-0
          "
            />
          </Link>

          {/* Metadata */}
          <PostMeta
            publishedAt={post.publishedAt}
            updatedAt={post.updatedAt}
            category={post.category}
            tags={post.tags}
            hideTagsForMobile={true}
            hideUpdateDate={true}
            className="mb-4"
          />

          {/* Excerpt */}
          <div className="transition text-75 mb-3.5 pr-4 line-clamp-2 md:line-clamp-1">{post.excerpt}</div>

          {/* Word count and read time */}
          <div className="text-sm text-30 flex gap-4 transition">
            <div>{post.wordCount} 字</div>
            <div>|</div>
            <div>{post.readingTime} 分钟</div>
            {post.viewCount > 0 && (
              <>
                <div>|</div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {post.viewCount}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {hasCover && (
          <Link
            href={`/post/${post.slug}`}
            aria-label={post.title}
            className="
            group
            max-h-[20vh] md:max-h-none mx-4 mt-4 -mb-2 md:mb-0 md:mx-0 md:mt-0
            md:w-[28%] relative md:absolute md:top-3 md:bottom-3 md:right-3
            rounded-xl overflow-hidden active:scale-95 transition-transform
          "
          >
            <div className="absolute pointer-events-none z-10 w-full h-full group-hover:bg-black/30 group-active:bg-black/50 transition" />
            <div className="absolute pointer-events-none z-20 w-full h-full flex items-center justify-center">
              <ChevronRight
                className="
              transition opacity-0 group-hover:opacity-100
              scale-50 group-hover:scale-100 text-white text-5xl
            "
              />
            </div>
            <Image src={post.coverImage!} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 28vw, 400px" />
          </Link>
        )}

        {/* Enter Button (when no cover) */}
        {!hasCover && (
          <Link
            href={`/post/${post.slug}`}
            aria-label={post.title}
            className="
            !hidden md:!flex btn-regular w-[3.25rem]
            absolute right-3 top-3 bottom-3 rounded-xl
            bg-[var(--enter-btn-bg)]
            hover:bg-[var(--enter-btn-bg-hover)]
            active:bg-[var(--enter-btn-bg-active)]
            active:scale-95
          "
          >
            <ChevronRight className="text-[var(--primary)] text-4xl mx-auto" />
          </Link>
        )}
      </div>

      {/* Divider for mobile */}
      <div className="transition border-t-[1px] border-dashed mx-6 border-black/10 dark:border-white/[0.15] last:border-t-0 md:hidden" />
    </>
  );
}
