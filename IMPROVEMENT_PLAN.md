# BlogT3 博客完善计划

> 生成日期: 2025-12-28
> 当前版本: v1.0 (基础功能已实现)

## 📊 当前功能状态

### ✅ 已实现的核心功能

1. **基础页面结构**
   - 首页 (`/`)
   - 博客列表 (`/blog`)
   - 文章详情 (`/post/[slug]`)
   - 文章归档 (`/archive`)
   - 关于页面 (`/about`)
   - 摄影展示 (`/photography`)
   - 摄影详情 (`/photography/[id]`)

2. **搜索功能**
   - 全局搜索对话框 (Ctrl+K 快捷键)
   - 博客搜索组件
   - 摄影搜索组件
   - 实时搜索结果

3. **主题系统**
   - 明暗模式切换
   - OKLCH 色相调整 (0-360°)
   - 主题持久化存储

4. **导航系统**
   - 响应式导航栏
   - 移动端菜单
   - 滚动隐藏导航栏

5. **管理功能**
   - 相册图片管理
   - 图片上传功能
   - 富文本编辑器

6. **UI 组件库**
   - 完整的 shadcn/ui 组件集成
   - 自定义组件 (PostCard, PhotoCard, CategoryBadge 等)

7. **交互增强**
   - 返回顶部按钮
   - 阅读进度条
   - 图片灯箱效果

---

## 🎯 待完善功能清单

### 1. 内容展示优化 ⭐⭐⭐⭐⭐

**优先级**: 紧急 (影响基础体验)

**问题描述**:
- 移除 MainLayout 后,页面缺少统一的布局结构
- Sidebar 和 Footer 未在所有页面展示
- 首页布局需要优化

**解决方案**:
```typescript
// 方案 A: 在 (public)/layout.tsx 中统一处理
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
    </div>
  );
}

// 方案 B: 创建新的 PageLayout 组件
<PageLayout showSidebar={true}>
  {/* 页面内容 */}
</PageLayout>
```

**受影响文件**:
- `src/app/(public)/layout.tsx`
- `src/app/(public)/page.tsx`
- `src/app/(public)/blog/page.tsx`
- `src/app/(public)/post/[slug]/page.tsx`
- `src/app/(public)/archive/page.tsx`
- `src/app/(public)/about/page.tsx`
- `src/app/(public)/photography/page.tsx`
- `src/app/(public)/photography/[id]/page.tsx`

**预计工作量**: 2-3 小时

---

### 2. Markdown 内容渲染 ⭐⭐⭐⭐⭐

**优先级**: 紧急 (核心功能缺失)

**问题描述**:
- 文章详情页只显示纯文本 (`whitespace-pre-line`)
- 没有 Markdown 渲染
- 缺少代码语法高亮
- 图片未优化

**解决方案**:

#### 2.1 安装依赖
```bash
pnpm add react-markdown remark-gfm rehype-highlight rehype-slug rehype-autolink-headings
pnpm add -D @types/react-syntax-highlighter
```

#### 2.2 创建 Markdown 组件
```typescript
// src/components/blog/MarkdownContent.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeHighlight,
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }]
      ]}
      className="prose prose-lg dark:prose-invert max-w-none"
    >
      {content}
    </ReactMarkdown>
  );
}
```

#### 2.3 扩展功能
- **数学公式**: 集成 KaTeX (`remark-math`, `rehype-katex`)
- **目录生成**: 自动提取标题生成 TOC
- **图片懒加载**: 使用 Next.js Image 组件
- **代码复制**: 添加代码块复制按钮

**受影响文件**:
- `src/app/(public)/post/[slug]/page.tsx`
- `src/components/blog/MarkdownContent.tsx` (新建)
- `src/styles/markdown.css` (新建,用于代码高亮样式)

**预计工作量**: 4-6 小时

---

### 3. 评论系统 ⭐⭐⭐⭐

**优先级**: 高 (提升用户互动)

**方案对比**:

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Giscus** | 免费、基于 GitHub Discussions、无广告 | 需要 GitHub 账号 | ⭐⭐⭐⭐⭐ |
| **Utterances** | 免费、轻量、基于 GitHub Issues | 功能较简单 | ⭐⭐⭐⭐ |
| **Disqus** | 功能完整、用户基数大 | 有广告、隐私问题 | ⭐⭐⭐ |
| **自建** | 完全控制、无第三方依赖 | 开发成本高 | ⭐⭐⭐ |

**推荐方案**: Giscus

#### 实现步骤
```typescript
// 1. 安装依赖
pnpm add @giscus/react

// 2. 创建评论组件
// src/components/blog/Comments.tsx
import Giscus from '@giscus/react';

export function Comments({ postId }: { postId: string }) {
  return (
    <Giscus
      repo="your-username/your-repo"
      repoId="your-repo-id"
      category="Announcements"
      categoryId="your-category-id"
      mapping="pathname"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="preferred_color_scheme"
      lang="zh-CN"
    />
  );
}
```

**受影响文件**:
- `src/app/(public)/post/[slug]/page.tsx`
- `src/components/blog/Comments.tsx` (新建)

**预计工作量**: 2-3 小时

---

### 4. SEO 优化 ⭐⭐⭐⭐

**优先级**: 高 (提升搜索引擎可见性)

#### 4.1 Sitemap 生成
```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getPosts } from '~/server/actions/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts({ status: 'PUBLISHED' });

  const postUrls = posts.data?.map((post) => ({
    url: `https://yourdomain.com/post/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) ?? [];

  return [
    {
      url: 'https://yourdomain.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://yourdomain.com/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...postUrls,
  ];
}
```

#### 4.2 Robots.txt
```typescript
// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: 'https://yourdomain.com/sitemap.xml',
  };
}
```

#### 4.3 结构化数据
```typescript
// 在文章详情页添加 JSON-LD
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.excerpt,
  image: post.coverImage,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: {
    '@type': 'Person',
    name: author.name,
  },
};
```

#### 4.4 RSS Feed
```typescript
// src/app/feed.xml/route.ts
import RSS from 'rss';
import { getPosts } from '~/server/actions/posts';

export async function GET() {
  const feed = new RSS({
    title: 'BlogT3',
    description: '现代化博客平台',
    feed_url: 'https://yourdomain.com/feed.xml',
    site_url: 'https://yourdomain.com',
    language: 'zh-CN',
  });

  const posts = await getPosts({ status: 'PUBLISHED' });

  posts.data?.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.excerpt,
      url: `https://yourdomain.com/post/${post.slug}`,
      date: new Date(post.publishedAt ?? post.createdAt),
    });
  });

  return new Response(feed.xml(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
```

**新建文件**:
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/app/feed.xml/route.ts`

**预计工作量**: 3-4 小时

---

### 5. 文章功能增强 ⭐⭐⭐⭐

**优先级**: 高 (提升内容价值)

#### 5.1 相关文章推荐
```typescript
// src/server/actions/posts.ts
export async function getRelatedPosts(postId: string, limit = 3) {
  // 基于标签和分类的相似度推荐
  const post = await getPostById(postId);

  const { data } = await supabase
    .from('Post')
    .select('*, PostTag(*)')
    .eq('status', 'PUBLISHED')
    .neq('id', postId)
    .limit(limit);

  // 计算相似度并排序
  return data;
}
```

#### 5.2 文章点赞功能
```typescript
// src/server/actions/posts.ts
export async function togglePostLike(postId: string) {
  const { data, error } = await supabase.rpc('increment_post_like', {
    post_id: postId
  });

  return { success: !error, data };
}

// 在文章详情页添加点赞按钮
<button onClick={() => handleLike(post.id)}>
  <Heart className={isLiked ? 'fill-current' : ''} />
  {post.likeCount}
</button>
```

#### 5.3 社交分享功能
```typescript
// src/components/blog/ShareButtons.tsx
export function ShareButtons({ title, url }: { title: string; url: string }) {
  return (
    <div className="flex gap-2">
      <button onClick={() => shareToTwitter(title, url)}>Twitter</button>
      <button onClick={() => shareToFacebook(url)}>Facebook</button>
      <button onClick={() => copyToClipboard(url)}>复制链接</button>
    </div>
  );
}
```

#### 5.4 文章系列支持
- 在数据库中添加 `seriesId` 字段
- 创建系列管理界面
- 在文章详情页显示系列导航

**受影响文件**:
- `src/server/actions/posts.ts`
- `src/app/(public)/post/[slug]/page.tsx`
- `src/components/blog/RelatedPosts.tsx` (新建)
- `src/components/blog/ShareButtons.tsx` (新建)

**预计工作量**: 4-5 小时

---

### 6. 性能优化 ⭐⭐⭐

**优先级**: 中 (提升用户体验)

#### 6.1 图片优化
```typescript
// 使用 Next.js Image 的 blur placeholder
<Image
  src={post.coverImage}
  alt={post.title}
  fill
  placeholder="blur"
  blurDataURL={post.coverImageBlur}
  sizes="(max-width: 768px) 100vw, 1200px"
/>

// 生成 blur placeholder (在上传时)
import { getPlaiceholder } from 'plaiceholder';

const { base64 } = await getPlaiceholder(imageBuffer);
```

#### 6.2 分页功能
```typescript
// src/app/(public)/blog/page.tsx
export default async function BlogPage({ searchParams }: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams.page ?? '1');
  const limit = 10;

  const posts = await getPosts({
    status: 'PUBLISHED',
    limit,
    offset: (page - 1) * limit,
  });

  return (
    <>
      <PostList posts={posts.data} />
      <Pagination currentPage={page} totalPages={posts.totalPages} />
    </>
  );
}
```

#### 6.3 ISR 缓存策略
```typescript
// 在页面中添加 revalidate
export const revalidate = 3600; // 1小时重新验证

// 或使用按需重新验证
import { revalidatePath } from 'next/cache';

export async function updatePost(postId: string) {
  // 更新文章
  await supabase.from('Post').update(...);

  // 重新验证相关路径
  revalidatePath('/blog');
  revalidatePath(`/post/${post.slug}`);
}
```

**受影响文件**:
- `src/app/(public)/blog/page.tsx`
- `src/app/(public)/archive/page.tsx`
- `src/components/ui/Pagination.tsx` (新建)
- `src/server/actions/posts.ts`

**预计工作量**: 3-4 小时

---

### 7. 用户体验提升 ⭐⭐⭐

**优先级**: 中 (细节优化)

#### 7.1 阅读体验优化
```typescript
// 字体选择器
export function FontSelector() {
  const fonts = ['默认', '思源宋体', 'Noto Serif SC'];
  return (
    <select onChange={(e) => setFont(e.target.value)}>
      {fonts.map(font => <option key={font}>{font}</option>)}
    </select>
  );
}

// 字体大小调整
export function FontSizeControl() {
  return (
    <div className="flex gap-2">
      <button onClick={() => decreaseFontSize()}>A-</button>
      <button onClick={() => resetFontSize()}>A</button>
      <button onClick={() => increaseFontSize()}>A+</button>
    </div>
  );
}
```

#### 7.2 快捷键支持
```typescript
// src/hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // J/K 键导航文章
      if (e.key === 'j') navigateToNext();
      if (e.key === 'k') navigateToPrev();

      // ESC 关闭对话框
      if (e.key === 'Escape') closeDialog();

      // / 聚焦搜索
      if (e.key === '/') focusSearch();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
}
```

#### 7.3 PWA 支持
```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // 其他配置
});

// public/manifest.json
{
  "name": "BlogT3",
  "short_name": "BlogT3",
  "description": "现代化博客平台",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [...]
}
```

#### 7.4 加载状态优化
```typescript
// 使用 Skeleton 组件
export function PostCardSkeleton() {
  return (
    <div className="card-base p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-3 bg-gray-200 rounded w-full mb-2" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
    </div>
  );
}

// 在页面中使用 Suspense
<Suspense fallback={<PostCardSkeleton />}>
  <PostList />
</Suspense>
```

**受影响文件**:
- `src/hooks/useKeyboardShortcuts.ts` (新建)
- `src/components/ui/FontSelector.tsx` (新建)
- `src/components/ui/Skeleton.tsx` (已存在,需优化)
- `public/manifest.json` (新建)
- `next.config.js`

**预计工作量**: 4-5 小时

---

### 8. 管理后台完善 ⭐⭐⭐

**优先级**: 中 (提升管理效率)

#### 8.1 Markdown 编辑器增强
```typescript
// 实时预览
export function MarkdownEditor() {
  const [content, setContent] = useState('');

  return (
    <div className="grid grid-cols-2 gap-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="font-mono"
      />
      <MarkdownContent content={content} />
    </div>
  );
}

// 图片拖拽上传
const handleDrop = async (e: DragEvent) => {
  const files = Array.from(e.dataTransfer.files);
  const imageFiles = files.filter(f => f.type.startsWith('image/'));

  for (const file of imageFiles) {
    const url = await uploadImage(file);
    insertImageMarkdown(url);
  }
};

// 自动保存草稿
useEffect(() => {
  const timer = setInterval(() => {
    saveDraft(content);
  }, 30000); // 每30秒保存

  return () => clearInterval(timer);
}, [content]);
```

#### 8.2 数据统计面板
```typescript
// src/app/admin/dashboard/page.tsx
export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="总文章数" value={stats.totalPosts} />
      <StatCard title="总浏览量" value={stats.totalViews} />
      <StatCard title="本月新增" value={stats.monthlyPosts} />
      <StatCard title="热门文章" value={stats.topPost.title} />

      <Chart data={stats.viewsTrend} />
      <TopPostsList posts={stats.topPosts} />
    </div>
  );
}
```

**受影响文件**:
- `src/components/RichTextEditor.tsx` (需增强)
- `src/app/admin/dashboard/page.tsx` (新建)
- `src/server/actions/stats.ts` (新建)

**预计工作量**: 6-8 小时

---

### 9. 搜索功能增强 ⭐⭐

**优先级**: 中低 (已有基础功能)

#### 9.1 搜索结果高亮
```typescript
// src/components/search/SearchResult.tsx
export function HighlightText({ text, keyword }: { text: string; keyword: string }) {
  const parts = text.split(new RegExp(`(${keyword})`, 'gi'));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}
```

#### 9.2 搜索历史
```typescript
// 使用 localStorage 存储搜索历史
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const addToHistory = (keyword: string) => {
    const newHistory = [keyword, ...history.filter(k => k !== keyword)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  return { history, addToHistory };
}
```

**受影响文件**:
- `src/components/search/SearchDialog.tsx`
- `src/components/search/SearchResult.tsx` (新建)
- `src/hooks/useSearchHistory.ts` (新建)

**预计工作量**: 2-3 小时

---

### 10. 其他功能扩展 ⭐⭐

**优先级**: 低 (锦上添花)

#### 10.1 标签云
```typescript
// src/components/blog/TagCloud.tsx
export function TagCloud({ tags }: { tags: Array<{ name: string; count: number }> }) {
  const maxCount = Math.max(...tags.map(t => t.count));
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <Link key={tag.name} href={`/blog?tag=${tag.name}`}>
          {tag.name} ({tag.count})
        </Link>
      ))}
    </div>
  );
}
```

**预计工作量**: 3-4 小时

---

## 📋 实施优先级建议

### 🔴 紧急 (立即处理)
1. **内容展示优化** - 修复布局问题,添加统一的 Layout
2. **Markdown 渲染** - 实现文章内容的正确渲染和代码高亮

### 🟠 高优先级 (1-2周内)
3. **评论系统** - 集成 Giscus 评论功能
4. **SEO 优化** - 添加 sitemap、robots.txt、RSS feed
5. **文章功能增强** - 相关文章推荐、点赞、分享

### 🟡 中优先级 (1个月内)
6. **性能优化** - 图片优化、分页、ISR 缓存
7. **用户体验提升** - 快捷键、PWA、加载状态
8. **管理后台完善** - 编辑器增强、数据统计

### 🟢 低优先级 (有时间再做)
9. **搜索功能增强** - 结果高亮、搜索历史
10. **其他功能扩展** - 标签云、时间线视图

---

## 💡 总结

当前博客已经具备了良好的基础架构和核心功能。建议按照以下步骤逐步完善:

1. **第一阶段** (本周): 修复布局问题 + 实现 Markdown 渲染
2. **第二阶段** (下周): 添加评论系统 + SEO 优化
3. **第三阶段** (本月): 性能优化 + 用户体验提升
4. **第四阶段** (长期): 管理后台完善 + 功能扩展

预计总工作量: **40-60 小时**

---

## 📚 参考资源

- [Next.js 15 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [Giscus](https://giscus.app/)
- [shadcn/ui](https://ui.shadcn.com/)

