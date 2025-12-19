import type { Metadata } from 'next';
import { MainLayout } from '~/components/layout/MainLayout';
import { PostCard } from '~/components/blog/PostCard';
import { mockPosts } from '~/lib/mock-data';

export const metadata: Metadata = {
  title: '博客文章 - BlogT3',
  description: `浏览所有 ${mockPosts.length} 篇技术文章和教程，涵盖前端开发、后端开发、UI/UX 设计等多个领域`,
};

export default function BlogPage() {
  return (
    <MainLayout showSidebar={true}>
      <div className="space-y-4">
        {/* Page Title */}
        <div className="card-base p-6 md:p-8 onload-animation">
          <h1 className="text-3xl md:text-4xl font-bold text-90 mb-2">
            博客文章
          </h1>
          <p className="text-75">
            共 {mockPosts.length} 篇文章
          </p>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {mockPosts.map((post, index) => (
            <div
              key={post.id}
              className="onload-animation"
              style={{ animationDelay: `${50 + index * 50}ms` }}
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
