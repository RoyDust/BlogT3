-- =============================================
-- BlogT3 完整初始化脚本（包含测试数据）
-- 在 Supabase SQL Editor 中运行此脚本
-- =============================================

-- 1. 创建文章表
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id UUID,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 2. 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建标签表
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 创建文章-标签关联表
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- 5. 添加外键约束
ALTER TABLE posts
  DROP CONSTRAINT IF EXISTS fk_category;

ALTER TABLE posts
  ADD CONSTRAINT fk_category
  FOREIGN KEY (category_id)
  REFERENCES categories(id)
  ON DELETE SET NULL;

-- 6. 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- 7. 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. 启用 Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- 9. 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Anyone can read published posts" ON posts;
DROP POLICY IF EXISTS "Authors can view own posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON posts;
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
DROP POLICY IF EXISTS "Anyone can read tags" ON tags;
DROP POLICY IF EXISTS "Authenticated users can manage tags" ON tags;
DROP POLICY IF EXISTS "Post tags follow post permissions" ON post_tags;

-- 10. 创建新的 RLS 策略

-- 文章策略：所有人可读已发布的文章
CREATE POLICY "Anyone can read published posts"
  ON posts FOR SELECT
  USING (status = 'published');

-- 文章策略：作者可以查看自己的所有文章
CREATE POLICY "Authors can view own posts"
  ON posts FOR SELECT
  USING (auth.uid() = author_id);

-- 文章策略：认证用户可以创建文章
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- 文章策略：作者可以更新自己的文章
CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

-- 文章策略：作者可以删除自己的文章
CREATE POLICY "Authors can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = author_id);

-- 分类策略：所有人可读
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO public
  USING (true);

-- 分类策略：认证用户可以管理
CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 标签策略：所有人可读
CREATE POLICY "Anyone can read tags"
  ON tags FOR SELECT
  TO public
  USING (true);

-- 标签策略：认证用户可以管理
CREATE POLICY "Authenticated users can manage tags"
  ON tags FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 文章标签关联策略
CREATE POLICY "Post tags follow post permissions"
  ON post_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_tags.post_id
      AND (posts.status = 'published' OR posts.author_id = auth.uid())
    )
  );

-- 11. 插入示例分类
INSERT INTO categories (name, slug, description, color) VALUES
  ('技术', 'tech', '技术相关文章', '#3B82F6'),
  ('生活', 'life', '生活随笔', '#10B981'),
  ('教程', 'tutorial', '教程和指南', '#F59E0B')
ON CONFLICT (slug) DO NOTHING;

-- 12. 插入示例标签
INSERT INTO tags (name, slug) VALUES
  ('Next.js', 'nextjs'),
  ('TypeScript', 'typescript'),
  ('React', 'react'),
  ('Supabase', 'supabase'),
  ('Tailwind CSS', 'tailwindcss')
ON CONFLICT (slug) DO NOTHING;

-- 13. 插入测试文章
INSERT INTO posts (title, slug, content, excerpt, status, published_at, category_id, cover_image)
SELECT
  'Welcome to BlogT3',
  'welcome-to-blogt3',
  '<h2>欢迎使用 BlogT3！</h2>
   <p>这是一个基于 <strong>Next.js 15</strong> 和 <strong>Supabase</strong> 构建的现代化博客系统。</p>
   <h3>主要特性</h3>
   <ul>
     <li>✨ 端到端类型安全 (tRPC + TypeScript)</li>
     <li>🚀 Next.js 15 App Router 和 Server Components</li>
     <li>💾 Supabase PostgreSQL 数据库</li>
     <li>🎨 Tailwind CSS 响应式设计</li>
     <li>🔒 Row Level Security 数据安全</li>
     <li>📝 完整的 CRUD 功能</li>
   </ul>
   <h3>快速开始</h3>
   <p>访问 <a href="/blog">博客列表</a> 查看所有文章，或者继续阅读下面的内容了解更多功能。</p>',
  '欢迎使用基于 Next.js 15 和 Supabase 的现代化博客平台',
  'published',
  NOW(),
  (SELECT id FROM categories WHERE slug = 'tech' LIMIT 1),
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'welcome-to-blogt3');

INSERT INTO posts (title, slug, content, excerpt, status, published_at, category_id, cover_image)
SELECT
  'Next.js 15 新特性介绍',
  'nextjs-15-features',
  '<h2>Next.js 15 带来了哪些新特性？</h2>
   <p>Next.js 15 是一个重要的版本更新，引入了许多令人兴奋的新功能。</p>
   <h3>1. Turbopack 稳定版</h3>
   <p>Turbopack 正式稳定，构建速度提升 <strong>700%</strong>！</p>
   <h3>2. Server Components 改进</h3>
   <p>React Server Components 性能大幅提升，加载速度更快。</p>
   <h3>3. 更好的开发体验</h3>
   <ul>
     <li>更快的热重载</li>
     <li>改进的错误提示</li>
     <li>更好的 TypeScript 支持</li>
   </ul>
   <p>立即升级体验这些新特性吧！</p>',
  '探索 Next.js 15 的最新功能和改进',
  'published',
  NOW() - INTERVAL '1 day',
  (SELECT id FROM categories WHERE slug = 'tech' LIMIT 1),
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'nextjs-15-features');

INSERT INTO posts (title, slug, content, excerpt, status, published_at, category_id, cover_image)
SELECT
  'TypeScript 最佳实践',
  'typescript-best-practices',
  '<h2>如何写出更好的 TypeScript 代码</h2>
   <p>本文介绍了 TypeScript 开发的最佳实践和常见模式。</p>
   <h3>1. 使用严格模式</h3>
   <pre><code>// tsconfig.json
{
  "compilerOptions": {
    "strict": true
  }
}</code></pre>
   <h3>2. 避免使用 any</h3>
   <p>尽量使用具体的类型，而不是 <code>any</code>。</p>
   <h3>3. 善用类型推导</h3>
   <p>让 TypeScript 自动推导类型，减少冗余代码。</p>
   <h3>4. 使用联合类型和交叉类型</h3>
   <p>灵活运用这些高级特性可以让代码更加健壮。</p>',
  '提升你的 TypeScript 开发技能',
  'published',
  NOW() - INTERVAL '2 days',
  (SELECT id FROM categories WHERE slug = 'tutorial' LIMIT 1),
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'typescript-best-practices');

INSERT INTO posts (title, slug, content, excerpt, status, published_at, category_id, cover_image)
SELECT
  'Supabase 入门指南',
  'supabase-getting-started',
  '<h2>Supabase 快速入门</h2>
   <p>Supabase 是一个开源的 Firebase 替代品，提供了完整的后端解决方案。</p>
   <h3>核心功能</h3>
   <ul>
     <li>📊 PostgreSQL 数据库</li>
     <li>🔐 用户认证</li>
     <li>💾 文件存储</li>
     <li>⚡ 实时订阅</li>
     <li>🔒 Row Level Security</li>
   </ul>
   <h3>快速开始</h3>
   <p>只需几行代码即可连接到 Supabase：</p>
   <pre><code>import { createClient } from "@supabase/supabase-js"

const supabase = createClient(url, anonKey)</code></pre>
   <p>就是这么简单！</p>',
  '学习如何使用 Supabase 构建应用',
  'published',
  NOW() - INTERVAL '3 days',
  (SELECT id FROM categories WHERE slug = 'tutorial' LIMIT 1),
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80'
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'supabase-getting-started');

-- 14. 验证数据
SELECT
  'Tables created:' as status,
  COUNT(*) FILTER (WHERE table_name = 'posts') as posts_table,
  COUNT(*) FILTER (WHERE table_name = 'categories') as categories_table,
  COUNT(*) FILTER (WHERE table_name = 'tags') as tags_table,
  COUNT(*) FILTER (WHERE table_name = 'post_tags') as post_tags_table
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('posts', 'categories', 'tags', 'post_tags');

SELECT 'Sample data inserted:' as status;
SELECT 'Categories:' as type, COUNT(*) as count FROM categories;
SELECT 'Tags:' as type, COUNT(*) as count FROM tags;
SELECT 'Posts:' as type, COUNT(*) as count FROM posts;

-- =============================================
-- 初始化完成！
-- =============================================
