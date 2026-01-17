import React, { cache } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, Mail, Folder, Tag } from 'lucide-react';
import { getCategories } from '~/server/actions/categories';
import { getTags } from '~/server/actions/tags';
import { getPosts } from '~/server/actions/posts';

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

// 使用 React cache 缓存侧边栏数据，避免重复查询
const getSidebarData = cache(async () => {
  // 获取真实的分类和标签数据
  const categoriesResult = await getCategories();
  const tagsResult = await getTags();

  const categories = categoriesResult.success ? categoriesResult.data ?? [] : [];
  const tags = tagsResult.success ? tagsResult.data ?? [] : [];

  // 获取每个分类的文章数量
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const result = await getPosts({
        status: 'PUBLISHED',
        categoryId: category.id,
      });
      return {
        ...category,
        count: result.count ?? 0,
      };
    })
  );

  return { categoriesWithCount, tags };
});

export async function Sidebar() {
  const { categoriesWithCount, tags } = await getSidebarData();
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
                sizes="96px"
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
            {categoriesWithCount.map((category) => (
              <Link
                key={category.id}
                href={`/blog?category=${category.id}`}
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
                key={tag.id}
                href={`/blog?tags=${tag.id}`}
                className="px-3 py-1 text-xs rounded-full bg-[var(--btn-regular-bg)] text-[var(--btn-content)] hover:bg-[var(--btn-regular-bg-hover)] transition"
              >
                {tag.name}
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
