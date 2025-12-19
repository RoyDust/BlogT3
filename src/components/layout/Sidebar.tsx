'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, Mail, Folder, Tag } from 'lucide-react';

// Mock data - will be replaced with real data later
const profile = {
  name: 'Zhang Wei',
  avatar: 'https://github.com/shadcn.png',
  bio: '全栈开发者，热爱开源和技术分享。专注于 React 生态和现代 Web 开发。',
  links: [
    { name: 'GitHub', url: 'https://github.com', icon: Github },
    { name: 'Twitter', url: 'https://twitter.com', icon: Twitter },
    { name: 'Email', url: 'mailto:example@example.com', icon: Mail },
  ],
};

const categories = [
  { name: '前端开发', slug: 'frontend', color: '#3b82f6', count: 12 },
  { name: '后端开发', slug: 'backend', color: '#10b981', count: 8 },
  { name: 'UI/UX 设计', slug: 'ui-ux', color: '#ec4899', count: 5 },
  { name: '编程语言', slug: 'programming', color: '#f59e0b', count: 7 },
];

const tags = [
  'Next.js', 'React', 'TypeScript', 'Tailwind', 'CSS',
  'Supabase', 'PostgreSQL', 'Node.js',
];

export function Sidebar() {
  return (
    <aside id="sidebar" className="onload-animation w-[17.5rem] shrink-0">
      <div className="sticky top-[5.5rem] space-y-4">
        {/* Profile Card */}
        <div className="card-base p-6">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--card-bg)]">
              <Image
                src={profile.avatar}
                alt={profile.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Name */}
            <h2 className="text-xl font-bold text-90 mb-2">{profile.name}</h2>

            {/* Bio */}
            <p className="text-75 text-sm leading-relaxed mb-4">{profile.bio}</p>

            {/* Social Links */}
            <div className="flex gap-2">
              {profile.links.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.name}
                    className="btn-plain scale-animation rounded-lg h-9 w-9"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Categories Card */}
        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-4">
            <Folder className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="font-bold text-90">分类</h3>
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/blog?category=${category.slug}`}
                className="flex items-center justify-between py-2 px-3 rounded-lg transition hover:bg-[var(--btn-plain-bg-hover)]"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-75 text-sm">{category.name}</span>
                </div>
                <span className="text-50 text-xs">{category.count}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Tags Card */}
        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="font-bold text-90">标签</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="px-3 py-1 text-xs rounded-full bg-[var(--btn-regular-bg)] text-[var(--btn-content)] hover:bg-[var(--btn-regular-bg-hover)] transition"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Archive Link */}
        <Link
          href="/archive"
          className="card-base p-4 flex items-center justify-between hover:bg-[var(--btn-card-bg-hover)] transition"
        >
          <span className="text-75 font-medium">归档</span>
          <span className="text-50 text-sm">查看全部 →</span>
        </Link>
      </div>
    </aside>
  );
}
