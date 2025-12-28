'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1分钟内数据视为新鲜
            gcTime: 5 * 60 * 1000, // 5分钟后清理缓存
            refetchOnWindowFocus: false, // 窗口聚焦时不自动重新获取
            retry: 1, // 失败重试1次
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
