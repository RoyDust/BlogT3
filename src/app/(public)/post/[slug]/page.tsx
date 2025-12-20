import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Eye, ChevronLeft } from 'lucide-react';
import { MainLayout } from '~/components/layout/MainLayout';
import { CategoryBadge } from '~/components/blog/CategoryBadge';
import { getPostBySlug, getPosts, incrementPostView } from '~/server/actions/posts';
import { supabase } from '~/lib/supabase';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPostBySlug(slug);

  if (!result.success || !result.data) {
    return {
      title: '文章未找到 - BlogT3',
    };
  }

  const post = result.data;

  return {
    title: `${post.title} - BlogT3`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      modifiedTime: new Date(post.updatedAt).toISOString(),
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const result = await getPostBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const post = result.data;

  // Increment view count (fire and forget)
  void incrementPostView(post.id);

  // Get author info
  const { data: author } = await supabase
    .from('User')
    .select('id, name, avatar, bio')
    .eq('id', post.authorId)
    .single();

  // Get category info
  const { data: category } = await supabase
    .from('Category')
    .select('id, name, slug')
    .eq('id', post.categoryId)
    .single();

  // Get tags
  const { data: postTags } = await supabase
    .from('PostTag')
    .select('tagId, Tag(*)')
    .eq('postId', post.id);

  const tags = postTags?.map((pt) => pt.Tag).filter(Boolean) ?? [];

  // Get prev/next posts
  const allPostsResult = await getPosts({
    status: 'PUBLISHED',
    orderBy: 'publishedAt',
    order: 'desc'
  });
  const allPosts = allPostsResult.success ? allPostsResult.data ?? [] : [];
  const currentIndex = allPosts.findIndex((p) => p.id === post.id);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return (
    <MainLayout showSidebar={true}>
      <div className="space-y-4">
        {/* Back Button */}
        <Link
          href="/blog"
          className="btn-plain scale-animation rounded-lg h-11 px-4 inline-flex items-center gap-2 onload-animation"
        >
          <ChevronLeft className="h-5 w-5" />
          返回博客列表
        </Link>

        {/* Post Header */}
        <article className="card-base p-6 md:p-10 onload-animation" style={{ animationDelay: '50ms' }}>
          {/* Category */}
          {category && (
            <div className="mb-4">
              <CategoryBadge category={category} showLink={true} />
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-90 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-50 mb-6 pb-6 border-b border-black/10 dark:border-white/[0.15]">
            {post.publishedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={new Date(post.publishedAt).toISOString()}>
                  {new Date(post.publishedAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            )}

            {post.updatedAt && new Date(post.updatedAt).getTime() !== new Date(post.createdAt).getTime() && (
              <div className="flex items-center gap-1.5">
                <span>更新于</span>
                <time dateTime={new Date(post.updatedAt).toISOString()}>
                  {new Date(post.updatedAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime} 分钟阅读</span>
            </div>

            {post.viewCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{post.viewCount} 次阅读</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {tags.map((tag: any) => (
                <Link
                  key={tag.slug}
                  href={`/blog?tag=${tag.slug}`}
                  className="btn-plain scale-animation rounded-lg px-3 py-1 text-sm"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                priority
              />
            </div>
          )}

          {/* Excerpt */}
          <div className="text-lg text-75 leading-relaxed mb-8 p-4 bg-black/[0.03] dark:bg-white/[0.03] rounded-lg border-l-4 border-[var(--primary)]">
            {post.excerpt}
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="text-75 leading-relaxed whitespace-pre-line">
              {post.content}
            </div>
          </div>
        </article>

        {/* Author Card */}
        {author && (
          <div className="card-base p-6 onload-animation" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-4">
              {author.avatar && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={author.avatar}
                    alt={author.name ?? ''}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
              <div>
                <div className="font-bold text-90 text-lg">{author.name}</div>
                <div className="text-75 text-sm">文章作者</div>
                {author.bio && <div className="text-50 text-sm mt-1">{author.bio}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Related Posts Navigation */}
        <div className="grid md:grid-cols-2 gap-4 onload-animation" style={{ animationDelay: '150ms' }}>
          {prevPost ? (
            <Link
              href={`/post/${prevPost.slug}`}
              className="card-base p-4 hover:bg-[var(--btn-card-bg-hover)] transition group"
            >
              <div className="text-50 text-sm mb-2">← 上一篇</div>
              <div className="text-90 font-medium group-hover:text-[var(--primary)] transition line-clamp-1">
                {prevPost.title}
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextPost ? (
            <Link
              href={`/post/${nextPost.slug}`}
              className="card-base p-4 hover:bg-[var(--btn-card-bg-hover)] transition group text-right"
            >
              <div className="text-50 text-sm mb-2">下一篇 →</div>
              <div className="text-90 font-medium group-hover:text-[var(--primary)] transition line-clamp-1">
                {nextPost.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
