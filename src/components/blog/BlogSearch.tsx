'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { PostCard } from '~/components/blog/PostCard';
import { getPosts } from '~/server/actions/posts';
import type { Post } from '../../../generated/prisma';

const PAGE_SIZE = 10;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
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

  const resolveCategoryId = useCallback(
    (value: string | null | undefined) => {
      if (!value) return '';
      const match = categories.find((category) => category.id === value || category.slug === value);
      return match?.id ?? value;
    },
    [categories]
  );

  const resolveTagIds = useCallback(
    (value: string | null | undefined, legacyValue: string | null | undefined) => {
      const rawValue = value ?? legacyValue ?? '';
      if (!rawValue) return [];
      const candidates = rawValue.split(',').filter(Boolean);
      return candidates.map((tagValue) => {
        const match = tags.find((tag) => tag.id === tagValue || tag.slug === tagValue);
        return match?.id ?? tagValue;
      });
    },
    [tags]
  );

  // 搜索和筛选状态
  const [query, setQuery] = useState(searchParams?.get('q') ?? '');
  const [selectedCategory, setSelectedCategory] = useState(
    resolveCategoryId(searchParams?.get('category') ?? undefined)
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    resolveTagIds(searchParams?.get('tags') ?? undefined, searchParams?.get('tag') ?? undefined)
  );
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(() => {
    const p = parseInt(searchParams?.get('page') ?? '1', 10);
    return p > 0 ? p : 1;
  });

  // 使用 React Query 获取数据
  const { data, isLoading } = useQuery({
    queryKey: ['posts', query, selectedCategory, selectedTags, page],
    queryFn: async () => {
      const result = await getPosts({
        status: 'PUBLISHED',
        query: query || undefined,
        categoryId: selectedCategory || undefined,
        tagIds: selectedTags.length > 0 ? selectedTags : undefined,
        orderBy: 'publishedAt',
        order: 'desc',
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });

      if (result.success) {
        // Transform posts to include proper structure
        const transformedPosts = (result.data ?? []).map((post: any) => ({
          ...post,
          author: post.User,
          category: post.Category,
          tags: post.PostTag?.map((pt: any) => pt.Tag) ?? [],
        }));
        return {
          posts: transformedPosts,
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

  // 同步 URL 参数到组件状态（当用户从外部链接进入时）
  useEffect(() => {
    const urlQuery = searchParams?.get('q') ?? '';
    const urlCategory = resolveCategoryId(searchParams?.get('category') ?? undefined);
    const urlTags = resolveTagIds(searchParams?.get('tags') ?? undefined, searchParams?.get('tag') ?? undefined);
    const urlPage = parseInt(searchParams?.get('page') ?? '1', 10);

    setQuery(urlQuery);
    setSelectedCategory(urlCategory);
    setSelectedTags(urlTags);
    setPage(urlPage > 0 ? urlPage : 1);
  }, [searchParams, resolveCategoryId, resolveTagIds]);

  // 更新 URL（当用户在组件内操作时）
  useEffect(() => {
    const urlQuery = searchParams?.get('q') ?? '';
    const urlCategory = searchParams?.get('category') ?? '';
    const urlTagsString = searchParams?.get('tags') ?? '';
    const urlTags = urlTagsString ? urlTagsString.split(',').filter(Boolean) : [];
    const urlPage = parseInt(searchParams?.get('page') ?? '1', 10);

    const stateMatchesUrl =
      query === urlQuery &&
      selectedCategory === urlCategory &&
      JSON.stringify(selectedTags) === JSON.stringify(urlTags) &&
      page === urlPage;

    if (stateMatchesUrl) return;

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (page > 1) params.set('page', String(page));

    const newURL = params.toString() ? `?${params.toString()}` : '/blog';

    const timer = setTimeout(() => {
      startTransition(() => {
        router.push(newURL, { scroll: false });
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [query, selectedCategory, selectedTags, page, searchParams, router]);

  // 筛选条件变化时重置到第一页
  useEffect(() => {
    setPage(1);
  }, [query, selectedCategory, selectedTags]);

  // 清除所有筛选
  const clearFilters = useCallback(() => {
    setQuery('');
    setSelectedCategory('');
    setSelectedTags([]);
    setPage(1);
  }, []);

  // 切换标签选择
  const toggleTag = useCallback((tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }, []);

  const hasActiveFilters = query || selectedCategory || selectedTags.length > 0;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <div className="card-base p-4 onload-animation">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-50" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索文章标题、摘要或内容..."
              className="w-full rounded-lg border border-[var(--line-color)] bg-[var(--card-bg)] py-2 pl-10 pr-4 text-90 outline-none transition focus:border-[var(--primary)]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition ${
              showFilters || hasActiveFilters
                ? 'bg-primary text-white'
                : 'btn-regular'
            }`}
          >
            <Filter className="h-5 w-5" />
            筛选
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-regular flex items-center gap-2 rounded-lg px-4 py-2"
            >
              <X className="h-5 w-5" />
              清除
            </button>
          )}
        </div>

        {/* 筛选面板 */}
        {showFilters && (
          <div className="mt-4 space-y-4 border-t border-[var(--line-color)] pt-4">
            {/* 分类筛选 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-75">
                分类
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-[var(--line-color)] bg-[var(--card-bg)] px-3 py-2 text-90 outline-none transition focus:border-[var(--primary)]"
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
              <label className="mb-2 block text-sm font-medium text-75">
                标签（可多选）
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full px-3 py-1 text-sm transition ${
                      selectedTags.includes(tag.id)
                        ? 'bg-primary text-white'
                        : 'bg-[var(--btn-regular-bg)] text-[var(--btn-content)] hover:bg-[var(--btn-regular-bg-hover)]'
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
                className="mt-4 text-primary hover:underline"
              >
                清除筛选条件
              </button>
            )}
          </div>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="card-base p-4 onload-animation">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm disabled:opacity-40 hover:bg-[var(--btn-plain-bg-hover)] transition"
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="px-2 text-50">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`min-w-[36px] rounded-lg px-3 py-2 text-sm transition ${
                      page === item
                        ? 'bg-primary text-white'
                        : 'hover:bg-[var(--btn-plain-bg-hover)]'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm disabled:opacity-40 hover:bg-[var(--btn-plain-bg-hover)] transition"
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
