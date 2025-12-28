'use client';

import { useState, useEffect, useMemo, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Filter } from 'lucide-react';
import { PostCard } from '~/components/blog/PostCard';
import { getPosts } from '~/server/actions/posts';
import type { Post } from '~/server/actions/posts';

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface BlogSearchProps {
  initialPosts: Post[];
  initialCount: number;
  categories: Category[];
  tags: Tag[];
}

export function BlogSearch({ initialPosts, initialCount, categories, tags }: BlogSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 搜索和筛选状态
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );
  const [showFilters, setShowFilters] = useState(false);

  // 使用 React Query 获取数据
  const { data, isLoading } = useQuery({
    queryKey: ['posts', query, selectedCategory, selectedTags],
    queryFn: async () => {
      const result = await getPosts({
        status: 'PUBLISHED',
        query: query || undefined,
        categoryId: selectedCategory || undefined,
        tagIds: selectedTags.length > 0 ? selectedTags : undefined,
        orderBy: 'publishedAt',
        order: 'desc',
      });

      if (result.success) {
        return {
          posts: result.data ?? [],
          count: result.count ?? 0,
        };
      }
      return { posts: [], count: 0 };
    },
    initialData: { posts: initialPosts, count: initialCount },
    staleTime: 30 * 1000, // 30秒内数据视为新鲜
  });

  const posts = data?.posts ?? [];
  const count = data?.count ?? 0;

  // 使用 useCallback 避免函数重新创建
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));

    const newURL = params.toString() ? `?${params.toString()}` : '/blog';

    // 使用 startTransition 标记为非紧急更新
    startTransition(() => {
      router.push(newURL, { scroll: false });
    });
  }, [query, selectedCategory, selectedTags, router]);

  // 延迟更新 URL
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL();
    }, 500); // 延迟500ms更新URL

    return () => clearTimeout(timer);
  }, [updateURL]);

  // 清除所有筛选
  const clearFilters = useCallback(() => {
    setQuery('');
    setSelectedCategory('');
    setSelectedTags([]);
  }, []);

  // 切换标签选择
  const toggleTag = useCallback((tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }, []);

  const hasActiveFilters = query || selectedCategory || selectedTags.length > 0;

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <div className="card-base p-4 onload-animation">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索文章标题、摘要或内容..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
              showFilters || hasActiveFilters
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <Filter className="h-5 w-5" />
            筛选
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            >
              <X className="h-5 w-5" />
              清除
            </button>
          )}
        </div>

        {/* 筛选面板 */}
        {showFilters && (
          <div className="mt-4 space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            {/* 分类筛选 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                分类
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">全部分类</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 标签筛选 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                标签（可多选）
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full px-3 py-1 text-sm ${
                      selectedTags.includes(tag.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 搜索结果统计 */}
      <div className="card-base p-4 onload-animation">
        <p className="text-75">
          {isLoading || isPending ? '搜索中...' : `找到 ${count} 篇文章`}
        </p>
      </div>

      {/* 文章列表 */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <div
              key={post.id}
              className="onload-animation"
              style={{ animationDelay: `${50 + index * 50}ms` }}
            >
              <PostCard post={post} />
            </div>
          ))
        ) : (
          <div className="card-base p-12 text-center text-75">
            <p>未找到匹配的文章</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-500 hover:underline"
              >
                清除筛选条件
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
