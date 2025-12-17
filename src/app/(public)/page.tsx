import Link from "next/link";
import Image from "next/image";
import { supabase } from "~/lib/supabase";

export default async function HomePage() {
  // 直接使用 Supabase 查询
  const { data: posts } = await supabase
    .from("posts")
    .select("*, categories(name, slug, color)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(6);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            欢迎来到 BlogT3
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            基于 Next.js 15 和 Supabase 构建的现代化博客平台
          </p>
        </div>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog?category=${category.slug}`}
                className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
                style={{
                  backgroundColor: category.color + "20",
                  color: category.color,
                }}
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Latest Posts */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            最新文章
          </h2>

          {!posts || posts.length === 0 ? (
            <div className="mt-8 text-center">
              <p className="text-slate-600">暂无文章</p>
              <p className="mt-2 text-sm text-slate-500">
                请先在 Supabase Dashboard 运行 supabase-init.sql 初始化数据库
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg"
                >
                  {post.cover_image && (
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    {post.categories && (
                      <div className="mb-2">
                        <span
                          className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: post.categories.color + "20",
                            color: post.categories.color,
                          }}
                        >
                          {post.categories.name}
                        </span>
                      </div>
                    )}

                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600">
                      <Link href={`/post/${post.slug}`}>
                        <span className="absolute inset-0" />
                        {post.title}
                      </Link>
                    </h3>

                    {post.excerpt && (
                      <p className="mt-3 line-clamp-3 text-sm text-slate-600">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                      <time
                        dateTime={post.published_at ?? undefined}
                        suppressHydrationWarning
                      >
                        {new Date(
                          String(post.published_at ?? new Date()),
                        ).toLocaleDateString("zh-CN")}
                      </time>
                      {post.view_count > 0 && (
                        <span>{post.view_count} 次阅读</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {posts && posts.length > 0 && (
            <div className="mt-12 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                查看所有文章
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
