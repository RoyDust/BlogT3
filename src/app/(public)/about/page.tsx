import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Github, Twitter, Mail, Globe, Heart, GraduationCap, Lightbulb, Target, Palette, Flower2, Coffee, PenLine, Wrench, Monitor, Database, Zap, Code2, Settings } from 'lucide-react';
import { mockProfile, mockCategories, mockPosts } from '~/lib/mock-data';

export const metadata: Metadata = {
  title: '关于 - BlogT3',
  description: mockProfile.bio,
};

export default function AboutPage() {
  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="card-base p-8 md:p-12 onload-animation text-center relative overflow-hidden">
        {/* 装饰性背景 */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
        {/* Avatar */}
        <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden ring-4 ring-primary/20">
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

      {/* About Me */}
      <div className="card-base p-6 md:p-8 onload-animation" style={{ animationDelay: '50ms' }}>
        <div className="text-center space-y-2 mb-6">
          <p className="text-lg text-75">Hey there! I&apos;m RoyDust</p>
          <h2 className="text-2xl md:text-3xl font-bold text-90 flex items-center justify-center gap-2">
            <Monitor className="h-7 w-7 text-primary" />
            About Me
          </h2>
          <p className="text-75 italic">&quot;像调配一杯精品咖啡一样编写代码&quot;</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-75 leading-relaxed">
          <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
            <p className="flex items-start gap-2">
              <GraduationCap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              软件工程 出身（湖南 | 2024届），从非名校启航，在技术海洋中乘风破浪
            </p>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
              <p className="flex items-start gap-2"><Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" /> 前端工程师 + 全栈探索者，专注于构建优雅的用户界面和流畅的交互体验</p>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
              <p className="flex items-start gap-2"><Target className="h-5 w-5 text-primary shrink-0 mt-0.5" /> 技术理念：既要追求代码的实用性，更要在时间允许时雕琢细节与性能，让每一行代码都值得被欣赏</p>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
              <p className="flex items-start gap-2"><Palette className="h-5 w-5 text-primary shrink-0 mt-0.5" /> 跨界创作者：前端开发 × UI设计，善于将多媒体思维融入 Web 开发</p>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
              <p className="flex items-start gap-2"><Flower2 className="h-5 w-5 text-primary shrink-0 mt-0.5" /> 二次元老宅 | 资深萌豚观众，相信好的交互设计就像好的动画分镜一样能传递情感</p>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
              <p className="flex items-start gap-2"><Coffee className="h-5 w-5 text-primary shrink-0 mt-0.5" /> 咖啡驱动开发者，用一杯手冲开启每天的编码时光</p>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] md:col-span-2">
              <p className="flex items-start gap-2"><PenLine className="h-5 w-5 text-primary shrink-0 mt-0.5" /> 在 个人博客 和 掘金 分享技术思考与实践</p>
            </div>
          </div>
        </div>

        {/* Personal Tech Stack */}
        <div className="card-base p-6 md:p-8 onload-animation" style={{ animationDelay: '100ms' }}>
          <h2 className="text-2xl font-bold text-90 mb-6 flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Tech Stack
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-90 mb-3">核心技能</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
                  <h4 className="font-bold text-90 mb-2 flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /> Frontend: Vue | React | TypeScript</h4>
                  <p className="text-sm text-75">专注于现代化前端开发，追求性能与美学的平衡</p>
                </div>
                <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
                  <h4 className="font-bold text-90 mb-2 flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> Backend: Java | C | Node.js | Next.js</h4>
                  <p className="text-sm text-75">全栈视野，理解前后端协作的完整链路</p>
                </div>
                <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] md:col-span-2">
                  <h4 className="font-bold text-90 mb-2 flex items-center gap-2"><Database className="h-4 w-4 text-primary" /> Database: MySQL | MongoDB</h4>
                  <p className="text-sm text-75">关系型与文档型数据库的实践应用</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-90 mb-3">开发工具链</h3>
              <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
                <p className="text-75 flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /> Cursor | IntelliJ IDEA | Visual Studio Code | Vim</p>
                <p className="text-sm text-75 mt-2">工欲善其事，必先利其器</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="card-base p-6 md:p-8 onload-animation" style={{ animationDelay: '150ms' }}>
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
        <div className="card-base p-6 md:p-8 onload-animation" style={{ animationDelay: '200ms' }}>
          <h2 className="text-2xl font-bold text-90 mb-4">关于本站</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="text-75 leading-relaxed space-y-4">
              <p>
                BlogT3 是一个基于 Next.js 15 和 Prisma 构建的现代化博客平台，采用 RealBlog (Fuwari) 的设计系统。
              </p>
              <p>
                本站的设计理念是提供简洁、优雅、高性能的阅读体验，同时支持完整的主题定制功能。
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="card-base p-6 md:p-8 onload-animation" style={{ animationDelay: '250ms' }}>
          <h2 className="text-2xl font-bold text-90 mb-6">技术栈</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
              <h3 className="font-bold text-90 mb-2 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Next.js 15
              </h3>
              <p className="text-sm text-75">
                最新的 React Server Components 和 Turbopack 构建工具
              </p>
            </div>

            <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
              <h3 className="font-bold text-90 mb-2 flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Prisma
              </h3>
              <p className="text-sm text-75">
                类型安全的 ORM，PostgreSQL 数据库，NextAuth 身份认证
              </p>
            </div>

            <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
              <h3 className="font-bold text-90 mb-2 flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                OKLCH 色彩空间
              </h3>
              <p className="text-sm text-75">
                支持 0-360° 色相调整的动态主题系统
              </p>
            </div>

            <div className="p-4 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
              <h3 className="font-bold text-90 mb-2 flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                TypeScript
              </h3>
              <p className="text-sm text-75">
                完整的类型安全和更好的开发体验
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card-base p-6 md:p-8 onload-animation text-center" style={{ animationDelay: '300ms' }}>
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
        <div className="text-center py-8 onload-animation" style={{ animationDelay: '350ms' }}>
          <p className="text-75 flex items-center justify-center gap-2">
            用
            <Heart className="h-4 w-4 text-[var(--primary)] fill-current" />
            构建
          </p>
        </div>
      </div>
  );
}
