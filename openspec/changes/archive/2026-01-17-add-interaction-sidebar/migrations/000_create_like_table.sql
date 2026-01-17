-- 迁移：添加点赞功能的数据库表
-- 日期：2026-01-18
-- 描述：创建 Like 表和 LikeTargetType 枚举类型

-- 创建点赞目标类型枚举（如果不存在）
DO $$ BEGIN
    CREATE TYPE "LikeTargetType" AS ENUM ('POST', 'COMMENT', 'GALLERY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 启用 uuid-ossp 扩展（如果尚未启用）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建点赞表
CREATE TABLE "Like" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "userId" TEXT NOT NULL,
  "targetType" "LikeTargetType" NOT NULL,
  "targetId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- 创建唯一索引，确保同一用户对同一目标只能点赞一次
CREATE UNIQUE INDEX "Like_userId_targetType_targetId_key" ON "Like"("userId", "targetType", "targetId");

-- 创建索引以优化查询性能
CREATE INDEX "Like_targetType_targetId_idx" ON "Like"("targetType", "targetId");
CREATE INDEX "Like_userId_idx" ON "Like"("userId");

-- 添加注释
COMMENT ON TABLE "Like" IS '点赞表，存储用户对文章、评论和图片的点赞信息';
COMMENT ON COLUMN "Like"."targetType" IS '目标类型：POST(文章)、COMMENT(评论) 或 GALLERY(图片集)';
COMMENT ON COLUMN "Like"."targetId" IS '目标内容的 ID';
