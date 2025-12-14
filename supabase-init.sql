-- =============================================
-- BlogT3 数据库初始化脚本
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

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. 启用 Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- 9. 创建 RLS 策略

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

-- 分类策略：认证用户可以管理（根据需要调整）
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

-- 文章标签关联策略：跟随文章权限
CREATE POLICY "Post tags follow post permissions"
  ON post_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_tags.post_id
      AND (posts.status = 'published' OR posts.author_id = auth.uid())
    )
  );

-- 10. 插入一些示例分类
INSERT INTO categories (name, slug, description, color) VALUES
  ('技术', 'tech', '技术相关文章', '#3B82F6'),
  ('生活', 'life', '生活随笔', '#10B981'),
  ('教程', 'tutorial', '教程和指南', '#F59E0B')
ON CONFLICT (slug) DO NOTHING;

-- 11. 插入一些示例标签
INSERT INTO tags (name, slug) VALUES
  ('Next.js', 'nextjs'),
  ('TypeScript', 'typescript'),
  ('React', 'react'),
  ('Supabase', 'supabase'),
  ('Tailwind CSS', 'tailwindcss')
ON CONFLICT (slug) DO NOTHING;

-- 12. 创建存储桶（用于图片上传）
-- 注意：这需要在 Supabase Dashboard 的 Storage 中手动创建
-- 或使用以下 SQL（如果有权限）:
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;
*/

-- =============================================
-- 完成！
-- =============================================

-- 验证表已创建
SELECT
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('posts', 'categories', 'tags', 'post_tags')
ORDER BY tablename;
