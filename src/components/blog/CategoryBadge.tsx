import React from 'react';
import Link from 'next/link';

interface CategoryBadgeProps {
  category: {
    name: string;
    slug: string;
    color: string;
  };
  showLink?: boolean;
}

export function CategoryBadge({ category, showLink = true }: CategoryBadgeProps) {
  const badgeContent = (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-medium transition-all hover:scale-105"
      style={{
        backgroundColor: category.color + '20',
        color: category.color,
      }}
    >
      {category.name}
    </span>
  );

  if (showLink) {
    return (
      <Link href={`/blog?category=${category.slug}`}>
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}
