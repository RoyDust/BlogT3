-- ============================================================================
-- BlogT3 数据库初始化 SQL 脚本
-- ============================================================================
-- 数据库: PostgreSQL 12+
-- 部署平台: Supabase
-- 日期: 2024-06-20
-- 说明: 不使用外键约束，应用层保证数据一致性
-- ============================================================================

-- 清理已存在的表（谨慎使用，仅用于开发环境）
-- DROP TABLE IF EXISTS "Like" CASCADE;
-- DROP TABLE IF EXISTS "PostView" CASCADE;
-- DROP TABLE IF EXISTS "Comment" CASCADE;
-- DROP TABLE IF EXISTS "PostTag" CASCADE;
-- DROP TABLE IF EXISTS "GalleryTag" CASCADE;
-- DROP TABLE IF EXISTS "PhotoImage" CASCADE;
-- DROP TABLE IF EXISTS "PhotoGallery" CASCADE;
-- DROP TABLE IF EXISTS "Post" CASCADE;
-- DROP TABLE IF EXISTS "Tag" CASCADE;
-- DROP TABLE IF EXISTS "Category" CASCADE;
-- DROP TABLE IF EXISTS "Session" CASCADE;
-- DROP TABLE IF EXISTS "Account" CASCADE;
-- DROP TABLE IF EXISTS "VerificationToken" CASCADE;
-- DROP TABLE IF EXISTS "User" CASCADE;

-- ============================================================================
-- 1. 枚举类型定义
-- ============================================================================

-- 用户角色枚举
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 用户状态枚举
DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BANNED', 'DELETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 文章状态枚举
DO $$ BEGIN
    CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 评论状态枚举
DO $$ BEGIN
    CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 相册状态枚举
DO $$ BEGIN
    CREATE TYPE "GalleryStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 点赞目标类型枚举
DO $$ BEGIN
    CREATE TYPE "LikeTargetType" AS ENUM ('POST', 'COMMENT', 'GALLERY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. 用户系统表
-- ============================================================================

-- 用户表
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "emailVerified" TIMESTAMP WITH TIME ZONE,
    "name" TEXT,
    "password" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 用户表索引
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_user_role_status" ON "User"("role", "status");

-- 用户表注释
COMMENT ON TABLE "User" IS '用户表：存储用户基本信息';
COMMENT ON COLUMN "User"."id" IS '用户唯一标识';
COMMENT ON COLUMN "User"."email" IS '用户邮箱';
COMMENT ON COLUMN "User"."role" IS '用户角色：USER/ADMIN/MODERATOR';
COMMENT ON COLUMN "User"."status" IS '账号状态：ACTIVE/BANNED/DELETED';

-- ============================================================================

-- OAuth 账号表
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER
);

-- Account 表索引
CREATE UNIQUE INDEX IF NOT EXISTS "idx_account_provider" ON "Account"("provider", "providerAccountId");
CREATE INDEX IF NOT EXISTS "idx_account_userId" ON "Account"("userId");

COMMENT ON TABLE "Account" IS 'OAuth 账号表：存储第三方登录信息';

-- ============================================================================

-- 会话表
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT PRIMARY KEY,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Session 表索引
CREATE UNIQUE INDEX IF NOT EXISTS "idx_session_token" ON "Session"("sessionToken");
CREATE INDEX IF NOT EXISTS "idx_session_userId" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "idx_session_expires" ON "Session"("expires");

COMMENT ON TABLE "Session" IS '会话表：存储用户会话信息';

-- ============================================================================

-- 验证令牌表
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expires" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- VerificationToken 表索引
CREATE UNIQUE INDEX IF NOT EXISTS "idx_verification_identifier_token" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_verification_token" ON "VerificationToken"("token");
CREATE INDEX IF NOT EXISTS "idx_verification_expires" ON "VerificationToken"("expires");

COMMENT ON TABLE "VerificationToken" IS '验证令牌表：用于邮箱验证和密码重置';

-- ============================================================================
-- 3. 博客系统表
-- ============================================================================

-- 分类表
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "icon" TEXT,
    "postCount" INTEGER NOT NULL DEFAULT 0 CHECK ("postCount" >= 0),
    "sortOrder" INTEGER NOT NULL DEFAULT 0 CHECK ("sortOrder" >= 0),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Category 表索引
CREATE UNIQUE INDEX IF NOT EXISTS "idx_category_slug" ON "Category"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_category_name" ON "Category"("name");
CREATE INDEX IF NOT EXISTS "idx_category_sortOrder" ON "Category"("sortOrder");

COMMENT ON TABLE "Category" IS '分类表：文章分类管理';

-- ============================================================================

-- 标签表
CREATE TABLE IF NOT EXISTS "Tag" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "postCount" INTEGER NOT NULL DEFAULT 0 CHECK ("postCount" >= 0),
    "galleryCount" INTEGER NOT NULL DEFAULT 0 CHECK ("galleryCount" >= 0),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tag 表索引
CREATE UNIQUE INDEX IF NOT EXISTS "idx_tag_slug" ON "Tag"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_tag_name" ON "Tag"("name");
CREATE INDEX IF NOT EXISTS "idx_tag_postCount" ON "Tag"("postCount" DESC);

COMMENT ON TABLE "Tag" IS '标签表：用于文章和相册标签';

-- ============================================================================

-- 文章表
CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT FALSE,
    "viewCount" INTEGER NOT NULL DEFAULT 0 CHECK ("viewCount" >= 0),
    "likeCount" INTEGER NOT NULL DEFAULT 0 CHECK ("likeCount" >= 0),
    "commentCount" INTEGER NOT NULL DEFAULT 0 CHECK ("commentCount" >= 0),
    "wordCount" INTEGER NOT NULL DEFAULT 0 CHECK ("wordCount" >= 0),
    "readingTime" INTEGER NOT NULL DEFAULT 0 CHECK ("readingTime" >= 0),
    "publishedAt" TIMESTAMP WITH TIME ZONE,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Post 表索引
CREATE UNIQUE INDEX IF NOT EXISTS "idx_post_slug" ON "Post"("slug");
CREATE INDEX IF NOT EXISTS "idx_post_authorId" ON "Post"("authorId");
CREATE INDEX IF NOT EXISTS "idx_post_categoryId" ON "Post"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_post_status_published" ON "Post"("status", "publishedAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_post_featured_published" ON "Post"("featured", "publishedAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_post_likeCount" ON "Post"("likeCount" DESC);

-- 全文搜索索引（可选）
-- CREATE INDEX IF NOT EXISTS "idx_post_fulltext" ON "Post"
-- USING GIN (to_tsvector('english', "title" || ' ' || COALESCE("excerpt", '') || ' ' || "content"));

COMMENT ON TABLE "Post" IS '文章表：存储博客文章内容';
COMMENT ON COLUMN "Post"."readingTime" IS '阅读时间（分钟），根据 wordCount 计算';
COMMENT ON COLUMN "Post"."likeCount" IS '点赞数（冗余字段，从 Like 表聚合）';
COMMENT ON COLUMN "Post"."commentCount" IS '评论数（冗余字段，从 Comment 表聚合）';

-- ============================================================================

-- 文章-标签关联表
CREATE TABLE IF NOT EXISTS "PostTag" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("postId", "tagId")
);

-- PostTag 表索引
CREATE INDEX IF NOT EXISTS "idx_posttag_tagId" ON "PostTag"("tagId");

COMMENT ON TABLE "PostTag" IS '文章-标签关联表：多对多关系';

-- ============================================================================

-- 评论表
CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT PRIMARY KEY,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT,
    "authorEmail" TEXT,
    "parentId" TEXT,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING',
    "likeCount" INTEGER NOT NULL DEFAULT 0 CHECK ("likeCount" >= 0),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Comment 表索引
CREATE INDEX IF NOT EXISTS "idx_comment_postId" ON "Comment"("postId", "status", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_comment_authorId" ON "Comment"("authorId");
CREATE INDEX IF NOT EXISTS "idx_comment_parentId" ON "Comment"("parentId");
CREATE INDEX IF NOT EXISTS "idx_comment_status" ON "Comment"("status");

COMMENT ON TABLE "Comment" IS '评论表：文章评论系统，支持嵌套回复';
COMMENT ON COLUMN "Comment"."authorId" IS '登录用户 ID，未登录时为 NULL';
COMMENT ON COLUMN "Comment"."authorName" IS '游客昵称（未登录用户使用）';

-- ============================================================================

-- 点赞表
CREATE TABLE IF NOT EXISTS "Like" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "targetType" "LikeTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Like 表索引
CREATE UNIQUE INDEX IF NOT EXISTS "idx_like_unique" ON "Like"("userId", "targetType", "targetId");
CREATE INDEX IF NOT EXISTS "idx_like_target" ON "Like"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "idx_like_userId" ON "Like"("userId");

COMMENT ON TABLE "Like" IS '点赞表：记录用户对文章、评论、相册的点赞';
COMMENT ON COLUMN "Like"."targetType" IS '目标类型：POST/COMMENT/GALLERY';
COMMENT ON COLUMN "Like"."targetId" IS '目标 ID（postId/commentId/galleryId）';

-- ============================================================================

-- 文章浏览记录表
CREATE TABLE IF NOT EXISTS "PostView" (
    "id" TEXT PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "viewerIp" TEXT,
    "viewerId" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "viewedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- PostView 表索引
CREATE INDEX IF NOT EXISTS "idx_postview_postId" ON "PostView"("postId", "viewedAt");
CREATE INDEX IF NOT EXISTS "idx_postview_viewerId" ON "PostView"("viewerId");
CREATE INDEX IF NOT EXISTS "idx_postview_viewedAt" ON "PostView"("viewedAt");

COMMENT ON TABLE "PostView" IS '文章浏览记录表：用于统计分析和去重';

-- ============================================================================
-- 4. 摄影系统表
-- ============================================================================

-- 相册表
CREATE TABLE IF NOT EXISTS "PhotoGallery" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "coverImage" TEXT,
    "coverImageThumb" TEXT,
    "status" "GalleryStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT FALSE,
    "viewCount" INTEGER NOT NULL DEFAULT 0 CHECK ("viewCount" >= 0),
    "likeCount" INTEGER NOT NULL DEFAULT 0 CHECK ("likeCount" >= 0),
    "imageCount" INTEGER NOT NULL DEFAULT 0 CHECK ("imageCount" >= 0),
    "captureDate" TIMESTAMP WITH TIME ZONE,
    "location" TEXT,
    "camera" TEXT,
    "lens" TEXT,
    "authorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- PhotoGallery 表索引
CREATE UNIQUE INDEX IF NOT EXISTS "idx_gallery_slug" ON "PhotoGallery"("slug");
CREATE INDEX IF NOT EXISTS "idx_gallery_authorId" ON "PhotoGallery"("authorId");
CREATE INDEX IF NOT EXISTS "idx_gallery_status_published" ON "PhotoGallery"("status", "publishedAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_gallery_featured_published" ON "PhotoGallery"("featured", "publishedAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_gallery_likeCount" ON "PhotoGallery"("likeCount" DESC);

COMMENT ON TABLE "PhotoGallery" IS '相册表：摄影作品集管理';
COMMENT ON COLUMN "PhotoGallery"."imageCount" IS '图片数量（冗余字段）';

-- ============================================================================

-- 照片表
CREATE TABLE IF NOT EXISTS "PhotoImage" (
    "id" TEXT PRIMARY KEY,
    "galleryId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "alt" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "exifData" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0 CHECK ("sortOrder" >= 0),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- PhotoImage 表索引
CREATE INDEX IF NOT EXISTS "idx_photoimage_galleryId" ON "PhotoImage"("galleryId", "sortOrder");

COMMENT ON TABLE "PhotoImage" IS '照片表：存储相册中的单张照片信息';
COMMENT ON COLUMN "PhotoImage"."exifData" IS 'EXIF 信息（JSON 格式）：相机、镜头、光圈、快门等';

-- ============================================================================

-- 相册-标签关联表
CREATE TABLE IF NOT EXISTS "GalleryTag" (
    "galleryId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("galleryId", "tagId")
);

-- GalleryTag 表索引
CREATE INDEX IF NOT EXISTS "idx_gallerytag_tagId" ON "GalleryTag"("tagId");

COMMENT ON TABLE "GalleryTag" IS '相册-标签关联表：多对多关系';

-- ============================================================================
-- 5. 触发器：自动更新 updatedAt
-- ============================================================================

-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加触发器
DROP TRIGGER IF EXISTS update_user_updated_at ON "User";
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_category_updated_at ON "Category";
CREATE TRIGGER update_category_updated_at
    BEFORE UPDATE ON "Category"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_post_updated_at ON "Post";
CREATE TRIGGER update_post_updated_at
    BEFORE UPDATE ON "Post"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comment_updated_at ON "Comment";
CREATE TRIGGER update_comment_updated_at
    BEFORE UPDATE ON "Comment"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_updated_at ON "PhotoGallery";
CREATE TRIGGER update_gallery_updated_at
    BEFORE UPDATE ON "PhotoGallery"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. 初始数据（可选）
-- ============================================================================

-- 插入默认分类
INSERT INTO "Category" ("id", "name", "slug", "color", "sortOrder")
VALUES
    ('cat_frontend', '前端开发', 'frontend', '#3b82f6', 1),
    ('cat_backend', '后端开发', 'backend', '#10b981', 2),
    ('cat_uiux', 'UI/UX 设计', 'ui-ux', '#ec4899', 3),
    ('cat_programming', '编程语言', 'programming-languages', '#f59e0b', 4),
    ('cat_tools', '工具与效率', 'tools', '#8b5cf6', 5)
ON CONFLICT ("slug") DO NOTHING;

-- 插入默认标签
INSERT INTO "Tag" ("id", "name", "slug")
VALUES
    ('tag_nextjs', 'Next.js', 'nextjs'),
    ('tag_react', 'React', 'react'),
    ('tag_typescript', 'TypeScript', 'typescript'),
    ('tag_tailwind', 'Tailwind CSS', 'tailwind'),
    ('tag_css', 'CSS', 'css'),
    ('tag_supabase', 'Supabase', 'supabase'),
    ('tag_postgresql', 'PostgreSQL', 'postgresql'),
    ('tag_figma', 'Figma', 'figma'),
    ('tag_design', '设计系统', 'design-system'),
    ('tag_auth', '身份认证', 'authentication')
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- 7. 数据库函数（辅助功能）
-- ============================================================================

-- 函数：计算文章阅读时间
CREATE OR REPLACE FUNCTION calculate_reading_time(word_count INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- 假设阅读速度为 250 字/分钟
    RETURN GREATEST(1, CEIL(word_count::NUMERIC / 250));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_reading_time IS '根据字数计算阅读时间（分钟）';

-- 函数：清理过期会话
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM "Session" WHERE "expires" < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_sessions IS '清理过期会话，返回删除的记录数';

-- 函数：清理过期验证令牌
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM "VerificationToken" WHERE "expires" < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_tokens IS '清理过期验证令牌，返回删除的记录数';

-- 函数：增加计数器字段
CREATE OR REPLACE FUNCTION increment(
    table_name TEXT,
    row_id TEXT,
    column_name TEXT
)
RETURNS VOID AS $$
BEGIN
    EXECUTE format(
        'UPDATE %I SET %I = %I + 1 WHERE id = $1',
        table_name,
        column_name,
        column_name
    ) USING row_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment IS '增加指定表的计数器字段（viewCount, likeCount等）';

-- ============================================================================
-- 8. 权限设置（Supabase）
-- ============================================================================

-- 为 authenticated 用户授予权限
-- 注意：在 Supabase 中，通常使用 Row Level Security (RLS) 策略而不是直接授权
-- 以下权限设置供参考，实际使用时应配置 RLS 策略

-- 示例：允许认证用户读取已发布的文章
-- ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "公开文章可被所有人查看"
-- ON "Post" FOR SELECT
-- USING ("status" = 'PUBLISHED');
--
-- CREATE POLICY "作者可以查看自己的所有文章"
-- ON "Post" FOR SELECT
-- USING (auth.uid()::TEXT = "authorId");
--
-- CREATE POLICY "作者可以更新自己的文章"
-- ON "Post" FOR UPDATE
-- USING (auth.uid()::TEXT = "authorId");

-- ============================================================================
-- 9. 完成信息
-- ============================================================================

-- 显示创建的表
DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'BlogT3 数据库初始化完成！';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '创建的表：';
    RAISE NOTICE '  用户系统: User, Account, Session, VerificationToken';
    RAISE NOTICE '  博客系统: Category, Tag, Post, PostTag, Comment, Like, PostView';
    RAISE NOTICE '  摄影系统: PhotoGallery, PhotoImage, GalleryTag';
    RAISE NOTICE '';
    RAISE NOTICE '已创建枚举类型：';
    RAISE NOTICE '  UserRole, UserStatus, PostStatus, CommentStatus, GalleryStatus, LikeTargetType';
    RAISE NOTICE '';
    RAISE NOTICE '已创建触发器：自动更新 updatedAt 字段';
    RAISE NOTICE '已创建辅助函数：calculate_reading_time, cleanup_expired_sessions, cleanup_expired_tokens';
    RAISE NOTICE '';
    RAISE NOTICE '初始数据：';
    RAISE NOTICE '  - 5 个默认分类';
    RAISE NOTICE '  - 10 个默认标签';
    RAISE NOTICE '';
    RAISE NOTICE '下一步：';
    RAISE NOTICE '  1. 在 Supabase Dashboard 配置 Row Level Security (RLS) 策略';
    RAISE NOTICE '  2. 配置 .env 文件中的 DATABASE_URL';
    RAISE NOTICE '  3. 运行 Prisma 生成客户端：pnpm prisma generate';
    RAISE NOTICE '  4. 运行种子脚本：pnpm prisma db seed';
    RAISE NOTICE '============================================================================';
END $$;

-- ============================================================================
-- SQL 脚本结束
-- ============================================================================
