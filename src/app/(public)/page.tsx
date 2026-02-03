import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PostCard } from "~/components/blog/PostCard";
import { getPosts } from "~/server/actions/posts";
import { getCategoriesByIds, getCategoriesWithPostCount } from "~/server/actions/categories";

export const metadata: Metadata = {
  title: "BlogT3 - 现代化博客平台",
  description:
    "基于 Next.js 15 和 Supabase 构建的现代化博客平台，采用 RealBlog (Fuwari) 设计系统，支持动态主题和 OKLCH 色彩空间",
};

export default async function HomePage() {
  // Define types
  type Category = {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };

  // Get 3 most recent posts (with author, category, and tags included)
  const postsResult = await getPosts({
    status: "PUBLISHED",
    limit: 3,
    orderBy: "publishedAt",
    order: "desc",
  });
  const posts = postsResult.success ? (postsResult.data ?? []) : [];

  // Transform posts to include proper structure
  const recentPosts = posts.map((post: any) => ({
    ...post,
    author: post.User,
    category: post.Category,
    tags: post.PostTag?.map((pt: any) => pt.Tag) ?? [],
  }));

  // Get all categories with post counts
  const categoriesWithCountsResult = await getCategoriesWithPostCount();
  const categoriesWithCounts = categoriesWithCountsResult.success
    ? (categoriesWithCountsResult.data ?? [])
    : [];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="card-base onload-animation p-8 text-center md:p-12">
          <h1 className="text-90 mb-4 text-4xl font-bold md:text-5xl">
            欢迎来到 BlogT3
          </h1>
          <p className="text-75 mx-auto max-w-2xl text-lg leading-relaxed md:text-xl">
            基于 Next.js 15 和 Supabase 构建的现代化博客平台
            <br />
            采用 RealBlog (Fuwari) 设计系统
          </p>
        </section>

        {/* Recent Posts */}
        <section
          className="onload-animation space-y-4"
          style={{ animationDelay: "50ms" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-90 text-2xl font-bold">最新文章</h2>
            <Link
              href="/blog"
              className="btn-plain scale-animation flex h-9 items-center gap-1 rounded-lg px-4 text-sm"
            >
              查看全部
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentPosts.map((post, index) => (
              <div
                key={post.id}
                className="onload-animation"
                style={{ animationDelay: `${100 + index * 50}ms` }}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section
          className="card-base onload-animation p-6 md:p-8"
          style={{ animationDelay: "250ms" }}
        >
          <h2 className="text-90 mb-6 text-2xl font-bold">分类浏览</h2>
          <div className="flex flex-wrap gap-3">
            {categoriesWithCounts.map((category) => (
              <Link
                key={category.slug}
                href={`/blog?category=${category.id}`}
                className="rounded-full bg-[var(--btn-content)] px-4 py-2 text-sm font-medium text-[var(--primary)] transition-all hover:scale-105 hover:bg-[var(--btn-content-hover)]"
              >
                {category.name} ({category.count})
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section
          className="onload-animation grid gap-4 md:grid-cols-3"
          style={{ animationDelay: "300ms" }}
        >
          <Link
            href="/blog"
            className="card-base group p-6 transition hover:bg-[var(--btn-card-bg-hover)]"
          >
            <h3 className="text-90 mb-2 text-xl font-bold transition group-hover:text-[var(--primary)]">
              📝 博客文章
            </h3>
            <p className="text-75 text-sm">查看所有技术文章和教程</p>
          </Link>

          <Link
            href="/archive"
            className="card-base group p-6 transition hover:bg-[var(--btn-card-bg-hover)]"
          >
            <h3 className="text-90 mb-2 text-xl font-bold transition group-hover:text-[var(--primary)]">
              📚 归档
            </h3>
            <p className="text-75 text-sm">按时间线浏览所有内容</p>
          </Link>

          <Link
            href="/about"
            className="card-base group p-6 transition hover:bg-[var(--btn-card-bg-hover)]"
          >
            <h3 className="text-90 mb-2 text-xl font-bold transition group-hover:text-[var(--primary)]">
              👤 关于
            </h3>
            <p className="text-75 text-sm">了解更多关于作者的信息</p>
          </Link>
        </section>

        {/* Features */}
        <section
          className="card-base onload-animation p-6 md:p-8"
          style={{ animationDelay: "350ms" }}
        >
          <h2 className="text-90 mb-6 text-2xl font-bold">主要特性</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-90 flex items-center gap-2 font-bold">
                <span className="text-[var(--primary)]">🎨</span>
                动态主题系统
              </h3>
              <p className="text-75 text-sm">
                OKLCH 色彩空间，支持 0-360° 色相调整，明暗模式自由切换
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-90 flex items-center gap-2 font-bold">
                <span className="text-[var(--primary)]">⚡</span>
                Next.js 15
              </h3>
              <p className="text-75 text-sm">
                最新的 React Server Components，Turbopack 构建工具
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-90 flex items-center gap-2 font-bold">
                <span className="text-[var(--primary)]">🗄️</span>
                Supabase
              </h3>
              <p className="text-75 text-sm">
                PostgreSQL 数据库，实时功能，身份认证一体化解决方案
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-90 flex items-center gap-2 font-bold">
                <span className="text-[var(--primary)]">🎯</span>
                TypeScript
              </h3>
              <p className="text-75 text-sm">
                完整的类型安全，更好的开发体验和代码质量
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section
          className="card-base onload-animation p-8 text-center md:p-12"
          style={{ animationDelay: "400ms" }}
        >
          <h2 className="text-90 mb-4 text-2xl font-bold">开始探索</h2>
          <p className="text-75 mx-auto mb-6 max-w-xl">
            点击右上角的主题控件，尝试切换明暗模式或调整主题色，体验完整的主题定制功能。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/blog"
              className="btn-regular scale-animation h-12 rounded-lg px-8 font-medium"
            >
              浏览文章
            </Link>
            <Link
              href="/theme-demo"
              className="btn-plain scale-animation h-12 rounded-lg px-8 font-medium"
            >
              主题演示
            </Link>
          </div>
        </section>
      </div>
  );
}
