import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "~/lib/supabase";
import DebugButton from "~/components/DebugButton";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: post, error } = await supabase
    .from("posts")
    .select("*, categories(name, slug, color)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !post) {
    notFound();
  }

  // 增加阅读数
  await supabase
    .from("posts")
    .update({ view_count: (post.view_count ?? 0) + 1 })
    .eq("id", post.id);

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto max-w-4xl px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-blue-600">
            首页
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-600">
            博客
          </Link>
          <span>/</span>
          <span className="text-slate-900">{post.title}</span>
        </nav>

        {/* Category */}
        {post.categories && (
          <div className="mb-4">
            <Link
              href={`/blog?category=${post.categories.slug}`}
              className="inline-block rounded-full px-3 py-1 text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                backgroundColor: post.categories.color + "20",
                color: post.categories.color,
              }}
            >
              {post.categories.name}
            </Link>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {post.title}
        </h1>

        {/* Debug Button */}
        <DebugButton content={post.content ?? ""} />

        {/* Meta */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <time dateTime={post.published_at ?? undefined} suppressHydrationWarning>
            发布于{" "}
            {new Date(String(post.published_at ?? new Date())).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {post.view_count > 0 && (
            <>
              <span>·</span>
              <span>{post.view_count} 次阅读</span>
            </>
          )}
        </div>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <div className="mt-8 rounded-lg border-l-4 border-blue-600 bg-blue-50 p-4">
            <p className="text-lg text-slate-700 italic">{post.excerpt}</p>
          </div>
        )}

        {/* Content - Markdown 渲染 */}
        <div className="prose prose-slate prose-lg prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-code:text-pink-600 prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-img:rounded-lg prose-blockquote:border-l-blue-600 prose-blockquote:text-slate-600 mt-8 max-w-none">
          {post.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          ) : (
            <p className="text-slate-600">暂无内容</p>
          )}
        </div>

        {/* Back to Blog */}
        <div className="mt-12 border-t border-slate-200 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            返回博客列表
          </Link>
        </div>
      </article>
    </main>
  );
}
