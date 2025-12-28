import type { Metadata } from 'next';
import { MainLayout } from '~/components/layout/MainLayout';
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

export default async function BlogPage() {
  const result = await getPosts({
    status: 'PUBLISHED',
    orderBy: 'publishedAt',
    order: 'desc'
  });

  const categoriesResult = await getCategories();
  const tagsResult = await getTags();

  const posts = result.success ? result.data ?? [] : [];
  const count = result.count ?? 0;
  const categories = categoriesResult.success ? categoriesResult.data ?? [] : [];
  const tags = tagsResult.success ? tagsResult.data ?? [] : [];

  return (
    <MainLayout showSidebar={true}>
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
    </MainLayout>
  );
}
