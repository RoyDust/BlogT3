import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)] transition">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* 404 Card */}
        <div className="card-base p-8 md:p-12 space-y-6">
          {/* 404 Number */}
          <div className="text-9xl md:text-[12rem] font-bold text-[var(--primary)] leading-none">
            404
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-90">
            页面未找到
          </h1>

          {/* Description */}
          <p className="text-lg text-75 max-w-md mx-auto">
            抱歉，您访问的页面不存在或已被移动。请检查 URL 是否正确，或返回首页继续浏览。
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/"
              className="btn-regular scale-animation rounded-lg h-12 px-8 font-medium inline-flex items-center justify-center gap-2"
            >
              <Home className="h-5 w-5" />
              返回首页
            </Link>
            <Link
              href="/blog"
              className="btn-plain scale-animation rounded-lg h-12 px-8 font-medium inline-flex items-center justify-center gap-2"
            >
              <Search className="h-5 w-5" />
              浏览文章
            </Link>
          </div>

          {/* Additional Links */}
          <div className="pt-8 border-t border-black/10 dark:border-white/10">
            <p className="text-sm text-50 mb-4">您可能想要访问：</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/blog"
                className="text-sm text-75 hover:text-[var(--primary)] transition underline"
              >
                博客文章
              </Link>
              <span className="text-50">·</span>
              <Link
                href="/archive"
                className="text-sm text-75 hover:text-[var(--primary)] transition underline"
              >
                归档
              </Link>
              <span className="text-50">·</span>
              <Link
                href="/about"
                className="text-sm text-75 hover:text-[var(--primary)] transition underline"
              >
                关于
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
