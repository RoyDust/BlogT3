import Link from "next/link";
import { supabase } from "~/lib/supabase";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  // 获取文章列表
  let postsQuery = supabase
    .from("posts")
    .select("*, categories(name, slug, color)", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // 如果有分类筛选
  if (params.category) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .single();

    if (category) {
      postsQuery = postsQuery.eq("category_id", category.id);
    }
  }

  const { data: posts, count } = await postsQuery;
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">博客文章</h1>
          <p className="mt-2 text-slate-600">
            共 {total} 篇文章
          </p>
        </div>

        {/* Categories Filter */}
        {categories && categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href="/blog"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                !params.category
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              全部
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog?category=${category.slug}`}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  params.category === category.slug
                    ? "text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
                style={
                  params.category === category.slug
                    ? { backgroundColor: category.color }
                    : {}
                }
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Posts Grid */}
        {!posts || posts.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <p className="text-lg text-slate-600">该分类下暂无文章</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: any) => (
                <article
                  key={post.id}
                  className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {post.cover_image && (
                    <div className="aspect-video w-full overflow-hidden bg-slate-100">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-5">
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

                    <h2 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600">
                      <Link href={`/post/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    {post.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="mt-auto pt-4 flex items-center gap-4 text-xs text-slate-500">
                      <time dateTime={post.published_at} suppressHydrationWarning>
                        {new Date(post.published_at).toLocaleDateString("zh-CN")}
                      </time>
                      {post.view_count > 0 && (
                        <span>{post.view_count} 次阅读</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/blog?${new URLSearchParams({
                      ...(params.category && { category: params.category }),
                      page: String(page - 1),
                    })}`}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
                  >
                    上一页
                  </Link>
                )}

                <span className="flex items-center px-4 py-2 text-sm text-slate-600">
                  第 {page} / {totalPages} 页
                </span>

                {page < totalPages && (
                  <Link
                    href={`/blog?${new URLSearchParams({
                      ...(params.category && { category: params.category }),
                      page: String(page + 1),
                    })}`}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
                  >
                    下一页
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
