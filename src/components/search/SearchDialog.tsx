'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, X, FileText, Image } from 'lucide-react';
import { getPosts } from '~/server/actions/posts';
import { getGalleries } from '~/server/actions/galleries';
import { useSearch } from '~/components/providers/SearchProvider';

interface SearchResult {
  id: string;
  type: 'post' | 'gallery';
  title: string;
  excerpt?: string;
  slug: string;
  coverImage?: string | null;
}

export function SearchDialog() {
  const { isSearchOpen, closeSearch } = useSearch();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchType, setSearchType] = useState<'all' | 'post' | 'gallery'>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 使用 React Query 进行搜索
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', query, searchType],
    queryFn: async () => {
      if (!query.trim()) {
        return [];
      }

      const searchResults: SearchResult[] = [];

      // 搜索文章
      if (searchType === 'all' || searchType === 'post') {
        const postsResult = await getPosts({
          query: query,
          status: 'PUBLISHED',
          limit: 10,
        });

        if (postsResult.success && postsResult.data) {
          searchResults.push(
            ...postsResult.data.map((post) => ({
              id: post.id,
              type: 'post' as const,
              title: post.title,
              excerpt: post.excerpt,
              slug: post.slug,
              coverImage: post.coverImage,
            }))
          );
        }
      }

      // 搜索相册
      if (searchType === 'all' || searchType === 'gallery') {
        const galleriesResult = await getGalleries({
          query: query,
          status: 'PUBLISHED',
          limit: 10,
        });

        if (galleriesResult.success && galleriesResult.data) {
          searchResults.push(
            ...galleriesResult.data.map((gallery) => ({
              id: gallery.id,
              type: 'gallery' as const,
              title: gallery.title,
              excerpt: gallery.description || undefined,
              slug: gallery.slug,
              coverImage: gallery.coverImage,
            }))
          );
        }
      }

      return searchResults;
    },
    enabled: query.trim().length > 0, // 只在有查询时执行
    staleTime: 30 * 1000, // 30秒内数据视为新鲜
  });

  // 重置选中索引
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSearchOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelectResult(results[selectedIndex]!);
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeSearch();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, results, selectedIndex, closeSearch]);

  // 自动聚焦
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // 选择结果
  const handleSelectResult = (result: SearchResult) => {
    const path = result.type === 'post' ? `/post/${result.slug}` : `/photography/${result.slug}`;
    router.push(path);
    closeSearch();
    setQuery('');
  };

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={closeSearch}
    >
      <div
        className="w-full max-w-2xl rounded-lg shadow-2xl"
        style={{ backgroundColor: 'var(--card-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜索输入 */}
        <div className="flex items-center gap-3 border-b p-4" style={{ borderColor: 'var(--line-divider)' }}>
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章和相册..."
            className="flex-1 bg-transparent text-lg outline-none"
            style={{ color: 'var(--text-90)' }}
          />
          <button
            onClick={closeSearch}
            className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* 搜索类型切换 */}
        <div className="flex gap-2 border-b px-4 py-2" style={{ borderColor: 'var(--line-divider)' }}>
          <button
            onClick={() => setSearchType('all')}
            className={`rounded-lg px-3 py-1 text-sm ${
              searchType === 'all'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            style={searchType !== 'all' ? { backgroundColor: 'var(--btn-regular-bg)', color: 'var(--text-90)' } : {}}
          >
            全部
          </button>
          <button
            onClick={() => setSearchType('post')}
            className={`rounded-lg px-3 py-1 text-sm ${
              searchType === 'post'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            style={searchType !== 'post' ? { backgroundColor: 'var(--btn-regular-bg)', color: 'var(--text-90)' } : {}}
          >
            文章
          </button>
          <button
            onClick={() => setSearchType('gallery')}
            className={`rounded-lg px-3 py-1 text-sm ${
              searchType === 'gallery'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            style={searchType !== 'gallery' ? { backgroundColor: 'var(--btn-regular-bg)', color: 'var(--text-90)' } : {}}
          >
            相册
          </button>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center" style={{ color: 'var(--text-75)' }}>搜索中...</div>
          ) : results.length > 0 ? (
            <div className="divide-y" style={{ borderColor: 'var(--line-divider)' }}>
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectResult(result)}
                  className={`flex w-full items-start gap-4 p-4 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:opacity-80'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {result.type === 'post' ? (
                      <FileText className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Image className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium" style={{ color: 'var(--text-90)' }}>
                      {result.title}
                    </h3>
                    {result.excerpt && (
                      <p className="mt-1 text-sm line-clamp-2" style={{ color: 'var(--text-75)' }}>
                        {result.excerpt}
                      </p>
                    )}
                    <span className="mt-1 text-xs" style={{ color: 'var(--text-50)' }}>
                      {result.type === 'post' ? '文章' : '相册'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-8 text-center">
              <p style={{ color: 'var(--text-75)' }}>未找到相关内容</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-50)' }}>尝试使用其他关键词</p>
            </div>
          ) : (
            <div className="p-8 text-center" style={{ color: 'var(--text-50)' }}>
              输入关键词开始搜索
            </div>
          )}
        </div>

        {/* 快捷键提示 */}
        <div className="border-t px-4 py-2 text-xs" style={{ borderColor: 'var(--line-divider)', color: 'var(--text-50)' }}>
          <span className="mr-4">↑↓ 导航</span>
          <span className="mr-4">Enter 打开</span>
          <span>Esc 关闭</span>
        </div>
      </div>
    </div>
  );
}
