import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Github, Twitter, Mail, Globe, Heart } from 'lucide-react';
import { MainLayout } from '~/components/layout/MainLayout';
import { mockProfile, mockCategories, mockPosts } from '~/lib/mock-data';

export const metadata: Metadata = {
  title: '关于 - BlogT3',
  description: mockProfile.bio,
};

export default function AboutPage() {
  return (
    <MainLayout showSidebar={false}>
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="card-base p-8 md:p-12 onload-animation text-center">
          {/* Avatar */}
          <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden ring-4 ring-[var(--primary)]/20">
            <Image
              src={mockProfile.avatar}
              alt={mockProfile.name}
              fill
              className="object-cover"
              sizes="128px"
              priority
            />
          </div>

          {/* Name */}
          <h1 className="text-3xl md:text-4xl font-bold text-90 mb-3">
            {mockProfile.name}
          </h1>

          {/* Bio */}
          <p className="text-lg text-75 max-w-2xl mx-auto leading-relaxed mb-6">
            {mockProfile.bio}
          </p>

          {/* Social Links */}
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-regular scale-animation rounded-lg h-11 px-6 flex items-center gap-2"
            >
              <Github className="h-5 w-5" />
              GitHub
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-regular scale-animation rounded-lg h-11 px-6 flex items-center gap-2"
            >
              <Twitter className="h-5 w-5" />
              Twitter
            </Link>
            <Link
              href="mailto:example@example.com"
              className="btn-regular scale-animation rounded-lg h-11 px-6 flex items-center gap-2"
            >
              <Mail className="h-5 w-5" />
              Email
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="card-base p-6 md:p-8 onload-animation" style={{ animationDelay: '50ms' }}>
          <h2 className="text-2xl font-bold text-90 mb-6 text-center">创作统计</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">
                {mockPosts.length}
              </div>
              <div className="text-sm text-75">文章</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">
                {mockCategories.length}
              </div>
              <div className="text-sm text-75">分类</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">
                {mockPosts.reduce((sum, post) => sum + post.wordCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-75">字数</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">
                {mockPosts.reduce((sum, post) => sum + post.viewCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-75">阅读</div>
            </div>
          </div>
        </div>

        {/* About Blog */}
        <div className="card-base p-6 md:p-8 onload-animation" style={{ animationDelay: '100ms' }}>
          <h2 className="text-2xl font-bold text-90 mb-4">关于本站</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="text-75 leading-relaxed space-y-4">
              <p>
                BlogT3 是一个基于 Next.js 15 和 Supabase 构建的现代化博客平台，采用 RealBlog (Fuwari) 的设计系统。
              </p>
              <p>
                本站的设计理念是提供简洁、优雅、高性能的阅读体验，同时支持完整的主题定制功能。
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="card-base p-6 md:p-8 onload-animation" style={{ animationDelay: '150ms' }}>
          <h2 className="text-2xl font-bold text-90 mb-6">技术栈</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
              <h3 className="font-bold text-90 mb-2 flex items-center gap-2">
                <span className="text-[var(--primary)]">⚡</span>
                Next.js 15
              </h3>
              <p className="text-sm text-75">
                最新的 React Server Components 和 Turbopack 构建工具
              </p>
            </div>

            <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
              <h3 className="font-bold text-90 mb-2 flex items-center gap-2">
                <span className="text-[var(--primary)]">🗄️</span>
                Supabase
              </h3>
              <p className="text-sm text-75">
                PostgreSQL 数据库和身份认证解决方案
              </p>
            </div>

            <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
              <h3 className="font-bold text-90 mb-2 flex items-center gap-2">
                <span className="text-[var(--primary)]">🎨</span>
                OKLCH 色彩空间
              </h3>
              <p className="text-sm text-75">
                支持 0-360° 色相调整的动态主题系统
              </p>
            </div>

            <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
              <h3 className="font-bold text-90 mb-2 flex items-center gap-2">
                <span className="text-[var(--primary)]">🎯</span>
                TypeScript
              </h3>
              <p className="text-sm text-75">
                完整的类型安全和更好的开发体验
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card-base p-6 md:p-8 onload-animation text-center" style={{ animationDelay: '200ms' }}>
          <h2 className="text-2xl font-bold text-90 mb-4">联系方式</h2>
          <p className="text-75 mb-6">
            如果您有任何问题或建议，欢迎通过以下方式联系我：
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="mailto:example@example.com"
              className="btn-plain scale-animation rounded-lg h-11 px-6 flex items-center gap-2"
            >
              <Mail className="h-5 w-5" />
              发送邮件
            </Link>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-plain scale-animation rounded-lg h-11 px-6 flex items-center gap-2"
            >
              <Globe className="h-5 w-5" />
              访问网站
            </Link>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center py-8 onload-animation" style={{ animationDelay: '250ms' }}>
          <p className="text-75 flex items-center justify-center gap-2">
            用
            <Heart className="h-4 w-4 text-[var(--primary)] fill-current" />
            构建
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
