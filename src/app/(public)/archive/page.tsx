import type { Metadata } from "next";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { MainLayout } from "~/components/layout/MainLayout";
import { CategoryBadge } from "~/components/blog/CategoryBadge";
import { getPosts } from "~/server/actions/posts";
import { supabase } from "~/lib/supabase";

export const metadata: Metadata = {
  title: "文章归档 - BlogT3",
  description: "按时间顺序浏览所有文章，探索完整的内容归档",
};

export default async function ArchivePage() {
  const result = await getPosts({
    status: "PUBLISHED",
    orderBy: "publishedAt",
    order: "desc",
  });

  const posts = result.success ? (result.data ?? []) : [];

  // Define types for grouped posts
  type Category = {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };

  // Get categories for all posts
  const categoryIds = [...new Set(posts.map((p) => p.categoryId))] as string[];

  const { data: categories } = await supabase
    .from("Category")
    .select("id, name, slug, color")
    .in("id", categoryIds);

  const categoryMap = new Map<string, Category>(
    categories?.map((c) => [c.id, c as Category]) ?? [],
  );

  type PostWithCategory = (typeof posts)[number] & {
    category?: Category;
  };

  type GroupedPosts = {
    year: number;
    month: string;
    posts: PostWithCategory[];
  };

  // Group posts by year and month
  const postsByYearMonth = posts.reduce<Record<string, GroupedPosts>>(
    (acc, post) => {
      const date = post.publishedAt
        ? new Date(post.publishedAt)
        : new Date(post.createdAt);
      const year = date.getFullYear();
      const month = date.toLocaleDateString("zh-CN", { month: "long" });
      const key = `${year}-${month}`;

      if (!acc[key]) {
        acc[key] = {
          year,
          month,
          posts: [],
        };
      }
      acc[key].posts.push({
        ...post,
        category: categoryMap.get(post.categoryId),
      });
      return acc;
    },
    {},
  );

  // Sort by year and month (newest first)
  const sortedGroups = Object.values(postsByYearMonth).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return (
      new Date(`${b.month} 1, ${b.year}`).getTime() -
      new Date(`${a.month} 1, ${a.year}`).getTime()
    );
  });

  const totalPosts = posts.length;
  const totalWords = posts.reduce(
    (sum, post) => sum + post.readingTime * 200,
    0,
  );
  const totalViews = posts.reduce((sum, post) => sum + post.viewCount, 0);

  return (
    <MainLayout showSidebar={true}>
      <div className="space-y-4">
        {/* Page Title */}
        <div className="card-base onload-animation p-6 md:p-8">
          <div className="mb-2 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-[var(--primary)]" />
            <h1 className="text-90 text-3xl font-bold md:text-4xl">文章归档</h1>
          </div>
          <p className="text-75">按时间顺序浏览所有 {totalPosts} 篇文章</p>
        </div>

        {/* Timeline */}
        {sortedGroups.length > 0 ? (
          <div
            className="card-base onload-animation p-6 md:p-8"
            style={{ animationDelay: "50ms" }}
          >
            <div className="space-y-8">
              {sortedGroups.map((group, groupIndex) => (
                <div key={`${group.year}-${group.month}`} className="relative">
                  {/* Year & Month Header */}
                  <div className="mb-6 flex items-center gap-4">
                    <div className="relative">
                      <div className="text-90 text-2xl font-bold">
                        {group.year}
                      </div>
                      <div className="text-50 mt-1 text-sm">{group.month}</div>
                    </div>
                    <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                    <div className="text-50 text-sm">
                      {group.posts.length} 篇
                    </div>
                  </div>

                  {/* Posts List */}
                  <div className="space-y-4 pl-0 md:pl-4">
                    {group.posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/post/${post.slug}`}
                        className="group block"
                      >
                        <div className="flex flex-col gap-3 rounded-lg p-4 transition hover:bg-[var(--btn-card-bg-hover)] md:flex-row md:items-center md:gap-6">
                          {/* Date */}
                          <div className="text-50 flex flex-shrink-0 items-center gap-2 text-sm md:w-32">
                            <Calendar className="h-4 w-4" />
                            <time
                              dateTime={new Date(
                                post.publishedAt ?? post.createdAt,
                              ).toISOString()}
                            >
                              {new Date(
                                post.publishedAt ?? post.createdAt,
                              ).toLocaleDateString("zh-CN", {
                                month: "numeric",
                                day: "numeric",
                              })}
                            </time>
                          </div>

                          {/* Category */}
                          {post.category && (
                            <div className="flex-shrink-0">
                              <CategoryBadge
                                category={post.category}
                                showLink={false}
                              />
                            </div>
                          )}

                          {/* Title */}
                          <div className="min-w-0 flex-1">
                            <h3 className="text-90 line-clamp-1 text-lg font-medium transition group-hover:text-[var(--primary)]">
                              {post.title}
                            </h3>
                          </div>

                          {/* Meta */}
                          <div className="text-50 flex flex-shrink-0 items-center gap-3 text-xs">
                            <span>{post.readingTime} 分钟</span>
                            <span>·</span>
                            <span>{post.viewCount} 次阅读</span>
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
        ) : (
          <div className="card-base text-75 p-12 text-center">
            <p>暂无归档文章</p>
          </div>
        )}

        {/* Statistics Card */}
        {totalPosts > 0 && (
          <div
            className="card-base onload-animation p-6"
            style={{ animationDelay: "100ms" }}
          >
            <h2 className="text-90 mb-4 text-xl font-bold">统计信息</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-[var(--primary)]">
                  {totalPosts}
                </div>
                <div className="text-75 text-sm">文章总数</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-[var(--primary)]">
                  {sortedGroups.length}
                </div>
                <div className="text-75 text-sm">发布月份</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-[var(--primary)]">
                  {totalWords.toLocaleString()}
                </div>
                <div className="text-75 text-sm">总字数</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-[var(--primary)]">
                  {totalViews.toLocaleString()}
                </div>
                <div className="text-75 text-sm">总阅读</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
