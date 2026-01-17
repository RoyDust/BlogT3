'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { PhotoCard } from '~/components/photography/PhotoCard';
import { getGalleries } from '~/server/actions/galleries';

interface PhotographySearchProps {
  initialGalleries: any[];
  initialCount: number;
}

export function PhotographySearch({ initialGalleries, initialCount }: PhotographySearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams?.get('q') || '');

  // 使用 React Query 获取数据
  const { data, isLoading } = useQuery({
    queryKey: ['galleries', query],
    queryFn: async () => {
      const result = await getGalleries({
        status: 'PUBLISHED',
        query: query || undefined,
        orderBy: 'publishedAt',
        order: 'desc',
      });

      if (result.success) {
        return {
          galleries: result.data ?? [],
          count: result.count ?? 0,
        };
      }
      return { galleries: [], count: 0 };
    },
    initialData: { galleries: initialGalleries, count: initialCount },
    staleTime: 30 * 1000, // 30秒内数据视为新鲜
  });

  const galleries = data?.galleries ?? [];
  const count = data?.count ?? 0;

  // 使用 useCallback 避免函数重新创建
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);

    const newURL = params.toString() ? `?${params.toString()}` : '/photography';

    // 使用 startTransition 标记为非紧急更新
    startTransition(() => {
      router.push(newURL, { scroll: false });
    });
  }, [query, router]);

  // 延迟更新 URL
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL();
    }, 500); // 延迟500ms更新URL

    return () => clearTimeout(timer);
  }, [updateURL]);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

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
              placeholder="搜索相册标题或描述..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          {query && (
            <button
              onClick={clearSearch}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            >
              <X className="h-5 w-5" />
              清除
            </button>
          )}
        </div>
      </div>

      {/* 搜索结果统计 */}
      <div className="card-base p-4 onload-animation">
        <p className="text-75">
          {isLoading || isPending ? '搜索中...' : `找到 ${count} 个相册`}
        </p>
      </div>

      {/* 相册列表 */}
      <div className="space-y-4">
        {galleries.length > 0 ? (
          galleries.map((gallery, index) => (
            <div
              key={gallery.id}
              className="onload-animation"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <PhotoCard gallery={gallery} />
            </div>
          ))
        ) : (
          <div className="card-base p-12 text-center text-75">
            <p>未找到匹配的相册</p>
            {query && (
              <button
                onClick={clearSearch}
                className="mt-4 text-blue-500 hover:underline"
              >
                清除搜索
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
