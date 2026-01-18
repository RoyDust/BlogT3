import type { Metadata } from 'next';
import { BlogSearch } from '~/components/blog/BlogSearch';
import { getPosts } from '~/server/actions/posts';
import { getCategories } from '~/server/actions/categories';
import { getTags } from '~/server/actions/tags';

export async function generateMetadata(): Promise<Metadata> {
  const result = await getPosts({ status: 'PUBLISHED' });
  const count = result.count ?? 0;

  return {
    title: '博客文章 - BlogT3',
    description: `浏览所有 ${count} 篇技术文章和教程，涵盖前端开发、后端开发、UI/UX 设计等多个领域`,
  };
}

interface BlogPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    tags?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const categoriesResult = await getCategories();
  const tagsResult = await getTags();

  const categories = categoriesResult.success ? categoriesResult.data ?? [] : [];
  const tags = tagsResult.success ? tagsResult.data ?? [] : [];

  const resolveCategoryId = (value?: string) => {
    if (!value) return undefined;
    const match = categories.find((category) => category.id === value || category.slug === value);
    return match?.id ?? value;
  };

  const resolveTagIds = (value?: string) => {
    if (!value) return undefined;
    const candidates = value.split(',').filter(Boolean);
    if (candidates.length === 0) return undefined;
    return candidates.map((tagValue) => {
      const match = tags.find((tag) => tag.id === tagValue || tag.slug === tagValue);
      return match?.id ?? tagValue;
    });
  };

  const tagParam = params.tags ?? params.tag;
  const result = await getPosts({
    status: 'PUBLISHED',
    query: params.q,
    categoryId: resolveCategoryId(params.category),
    tagIds: resolveTagIds(tagParam),
    orderBy: 'publishedAt',
    order: 'desc'
  });

  const posts = result.success ? result.data ?? [] : [];
  const count = result.count ?? 0;

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div className="card-base p-6 md:p-8 onload-animation">
        <h1 className="text-3xl md:text-4xl font-bold text-90 mb-2">
          博客文章
        </h1>
        <p className="text-75">
          共 {count} 篇文章
        </p>
      </div>

      {/* Search and Filter */}
      <BlogSearch
        initialPosts={posts}
        initialCount={count}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
