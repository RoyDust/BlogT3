import Link from 'next/link';
import { MainLayout } from '~/components/layout/MainLayout';
import { mockCategories } from '~/lib/mock-data';

export default function HomePage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="card-base p-8 md:p-12 text-center onload-animation">
          <h1 className="text-4xl md:text-5xl font-bold text-90 mb-4">
            欢迎来到 BlogT3
          </h1>
          <p className="text-75 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            基于 Next.js 15 和 Supabase 构建的现代化博客平台
            <br />
            采用 RealBlog (Fuwari) 设计系统
          </p>
        </section>

        {/* Categories */}
        <section className="card-base p-6 md:p-8 onload-animation" style={{ animationDelay: '50ms' }}>
          <h2 className="text-2xl font-bold text-90 mb-6">分类浏览</h2>
          <div className="flex flex-wrap gap-3">
            {mockCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/blog?category=${category.slug}`}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: category.color + '20',
                  color: category.color,
                }}
              >
                {category.name} ({category.count})
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="grid md:grid-cols-3 gap-4 onload-animation" style={{ animationDelay: '100ms' }}>
          <Link
            href="/blog"
            className="card-base p-6 hover:bg-[var(--btn-card-bg-hover)] transition group"
          >
            <h3 className="text-xl font-bold text-90 mb-2 group-hover:text-[var(--primary)] transition">
              📝 博客文章
            </h3>
            <p className="text-75 text-sm">
              查看所有技术文章和教程
            </p>
          </Link>

          <Link
            href="/archive"
            className="card-base p-6 hover:bg-[var(--btn-card-bg-hover)] transition group"
          >
            <h3 className="text-xl font-bold text-90 mb-2 group-hover:text-[var(--primary)] transition">
              📚 归档
            </h3>
            <p className="text-75 text-sm">
              按时间线浏览所有内容
            </p>
          </Link>

          <Link
            href="/about"
            className="card-base p-6 hover:bg-[var(--btn-card-bg-hover)] transition group"
          >
            <h3 className="text-xl font-bold text-90 mb-2 group-hover:text-[var(--primary)] transition">
              👤 关于
            </h3>
            <p className="text-75 text-sm">
              了解更多关于作者的信息
            </p>
          </Link>
        </section>

        {/* Features */}
        <section className="card-base p-6 md:p-8 onload-animation" style={{ animationDelay: '150ms' }}>
          <h2 className="text-2xl font-bold text-90 mb-6">主要特性</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-90 flex items-center gap-2">
                <span className="text-[var(--primary)]">🎨</span>
                动态主题系统
              </h3>
              <p className="text-75 text-sm">
                OKLCH 色彩空间，支持 0-360° 色相调整，明暗模式自由切换
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-90 flex items-center gap-2">
                <span className="text-[var(--primary)]">⚡</span>
                Next.js 15
              </h3>
              <p className="text-75 text-sm">
                最新的 React Server Components，Turbopack 构建工具
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-90 flex items-center gap-2">
                <span className="text-[var(--primary)]">🗄️</span>
                Supabase
              </h3>
              <p className="text-75 text-sm">
                PostgreSQL 数据库，实时功能，身份认证一体化解决方案
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-90 flex items-center gap-2">
                <span className="text-[var(--primary)]">🎯</span>
                TypeScript
              </h3>
              <p className="text-75 text-sm">
                完整的类型安全，更好的开发体验和代码质量
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="card-base p-8 md:p-12 text-center onload-animation" style={{ animationDelay: '200ms' }}>
          <h2 className="text-2xl font-bold text-90 mb-4">
            开始探索
          </h2>
          <p className="text-75 mb-6 max-w-xl mx-auto">
            点击右上角的主题控件，尝试切换明暗模式或调整主题色，体验完整的主题定制功能。
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/blog"
              className="btn-regular scale-animation rounded-lg h-12 px-8 font-medium"
            >
              浏览文章
            </Link>
            <Link
              href="/theme-demo"
              className="btn-plain scale-animation rounded-lg h-12 px-8 font-medium"
            >
              主题演示
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
