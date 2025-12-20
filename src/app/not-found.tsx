import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] transition">
      <div className="mx-auto max-w-2xl px-4 text-center">
        {/* 404 Card */}
        <div className="card-base space-y-6 p-8 md:p-12">
          {/* 404 Number */}
          <div className="text-9xl leading-none font-bold text-[var(--primary)] md:text-[12rem]">
            404
          </div>

          {/* Title */}
          <h1 className="text-90 text-3xl font-bold md:text-4xl">页面未找到</h1>

          {/* Description */}
          <p className="text-75 mx-auto max-w-md text-lg">
            抱歉，您访问的页面不存在或已被移动。请检查 URL
            是否正确，或返回首页继续浏览。
          </p>

          {/* Actions */}
          <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
            <Link
              href="/"
              className="btn-regular scale-animation inline-flex h-12 items-center justify-center gap-2 rounded-lg px-8 font-medium"
            >
              <Home className="h-5 w-5" />
              返回首页
            </Link>
            <Link
              href="/blog"
              className="btn-plain scale-animation inline-flex h-12 items-center justify-center gap-2 rounded-lg px-8 font-medium"
            >
              <Search className="h-5 w-5" />
              浏览文章
            </Link>
          </div>

          {/* Additional Links */}
          <div className="border-t border-black/10 pt-8 dark:border-white/10">
            <p className="text-50 mb-4 text-sm">您可能想要访问：</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/blog"
                className="text-75 text-sm underline transition hover:text-[var(--primary)]"
              >
                博客文章
              </Link>
              <span className="text-50">·</span>
              <Link
                href="/archive"
                className="text-75 text-sm underline transition hover:text-[var(--primary)]"
              >
                归档
              </Link>
              <span className="text-50">·</span>
              <Link
                href="/about"
                className="text-75 text-sm underline transition hover:text-[var(--primary)]"
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
