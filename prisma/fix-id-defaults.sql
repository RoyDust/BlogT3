-- 为所有表的 id 字段添加默认值生成函数
-- 这个脚本需要在 Supabase SQL Editor 中执行

-- 用户相关表
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Account" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Session" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- 博客系统表
ALTER TABLE "Category" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Tag" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Post" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Comment" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Like" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
-- 注意：PostTag 表使用复合主键，没有 id 字段

-- 摄影系统表
ALTER TABLE "PhotoGallery" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "PhotoImage" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- 验证修改
SELECT
    table_name,
    column_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'id'
  AND table_name IN (
    'User', 'Account', 'Session', 'Category', 'Tag', 'Post',
    'Comment', 'Like', 'PhotoGallery', 'PhotoImage'
  )
ORDER BY table_name;
