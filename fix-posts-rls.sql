-- =============================================
-- 修复 posts 表 RLS 策略
-- 因为使用自定义 users 表 + NextAuth，不使用 Supabase Auth
-- 所以在应用层控制权限，数据库层允许所有操作
-- =============================================

-- 删除所有旧的 posts 表策略
DROP POLICY IF EXISTS "Anyone can read published posts" ON posts;
DROP POLICY IF EXISTS "Authors can view own posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON posts;

-- 创建新的宽松策略（应用层用 NextAuth 控制权限）

-- 允许所有人查看已发布的文章（前台使用）
CREATE POLICY "Allow all to view published posts"
  ON posts FOR SELECT
  USING (status = 'published');

-- 允许所有人查看所有文章（后台管理使用）
CREATE POLICY "Allow all to view all posts"
  ON posts FOR SELECT
  USING (true);

-- 允许所有人创建文章（应用层控制权限）
CREATE POLICY "Allow all to create posts"
  ON posts FOR INSERT
  WITH CHECK (true);

-- 允许所有人更新文章（应用层控制权限）
CREATE POLICY "Allow all to update posts"
  ON posts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 允许所有人删除文章（应用层控制权限）
CREATE POLICY "Allow all to delete posts"
  ON posts FOR DELETE
  USING (true);

-- 修复 post_tags 表策略
DROP POLICY IF EXISTS "Post tags follow post permissions" ON post_tags;

CREATE POLICY "Allow all to manage post tags"
  ON post_tags FOR ALL
  USING (true)
  WITH CHECK (true);

-- 验证策略
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('posts', 'post_tags')
ORDER BY tablename, policyname;

-- =============================================
-- 完成！现在可以在后台管理中创建和编辑文章了
-- =============================================
