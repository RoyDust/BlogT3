import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { MainLayout } from '~/components/layout/MainLayout';
import { CategoryBadge } from '~/components/blog/CategoryBadge';
import { mockPosts } from '~/lib/mock-data';

export const metadata: Metadata = {
  title: '文章归档 - BlogT3',
  description: '按时间顺序浏览所有文章，探索完整的内容归档',
};

export default function ArchivePage() {
  // Group posts by year and month
  const postsByYearMonth = mockPosts.reduce((acc, post) => {
    const date = new Date(post.publishedAt);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('zh-CN', { month: 'long' });
    const key = `${year}-${month}`;

    acc[key] ??= {
      year,
      month,
      posts: [],
    };
    acc[key].posts.push(post);
    return acc;
  }, {} as Record<string, { year: number; month: string; posts: typeof mockPosts }>);

  // Sort by year and month (newest first)
  const sortedGroups = Object.values(postsByYearMonth).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return new Date(`${b.month} 1, ${b.year}`).getTime() - new Date(`${a.month} 1, ${a.year}`).getTime();
  });

  const totalPosts = mockPosts.length;

  return (
    <MainLayout showSidebar={true}>
      <div className="space-y-4">
        {/* Page Title */}
        <div className="card-base p-6 md:p-8 onload-animation">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-[var(--primary)]" />
            <h1 className="text-3xl md:text-4xl font-bold text-90">
              文章归档
            </h1>
          </div>
          <p className="text-75">
            按时间顺序浏览所有 {totalPosts} 篇文章
          </p>
        </div>

        {/* Timeline */}
        <div className="card-base p-6 md:p-8 onload-animation" style={{ animationDelay: '50ms' }}>
          <div className="space-y-8">
            {sortedGroups.map((group, groupIndex) => (
              <div key={`${group.year}-${group.month}`} className="relative">
                {/* Year & Month Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="text-2xl font-bold text-90">
                      {group.year}
                    </div>
                    <div className="text-sm text-50 mt-1">
                      {group.month}
                    </div>
                  </div>
                  <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
                  <div className="text-sm text-50">
                    {group.posts.length} 篇
                  </div>
                </div>

                {/* Posts List */}
                <div className="space-y-4 pl-0 md:pl-4">
                  {group.posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.slug}`}
                      className="block group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 p-4 rounded-lg hover:bg-[var(--btn-card-bg-hover)] transition">
                        {/* Date */}
                        <div className="flex items-center gap-2 text-sm text-50 md:w-32 flex-shrink-0">
                          <Calendar className="h-4 w-4" />
                          <time dateTime={post.publishedAt}>
                            {new Date(post.publishedAt).toLocaleDateString('zh-CN', {
                              month: 'numeric',
                              day: 'numeric',
                            })}
                          </time>
                        </div>

                        {/* Category */}
                        <div className="flex-shrink-0">
                          <CategoryBadge category={post.category} showLink={false} />
                        </div>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-90 group-hover:text-[var(--primary)] transition line-clamp-1">
                            {post.title}
                          </h3>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-3 text-xs text-50 flex-shrink-0">
                          <span>{post.wordCount} 字</span>
                          <span>·</span>
                          <span>{post.readingTime} 分钟</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Divider between groups (not after last group) */}
                {groupIndex < sortedGroups.length - 1 && (
                  <div className="mt-8 border-t border-dashed border-black/10 dark:border-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Card */}
        <div className="card-base p-6 onload-animation" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl font-bold text-90 mb-4">统计信息</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--primary)] mb-1">
                {totalPosts}
              </div>
              <div className="text-sm text-75">文章总数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--primary)] mb-1">
                {sortedGroups.length}
              </div>
              <div className="text-sm text-75">发布月份</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--primary)] mb-1">
                {mockPosts.reduce((sum, post) => sum + post.wordCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-75">总字数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--primary)] mb-1">
                {mockPosts.reduce((sum, post) => sum + post.viewCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-75">总阅读</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
