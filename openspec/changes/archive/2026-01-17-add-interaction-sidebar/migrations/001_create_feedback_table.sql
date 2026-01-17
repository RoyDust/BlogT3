-- 迁移：添加反馈功能的数据库表
-- 日期：2026-01-17
-- 描述：创建 Feedback 表和 FeedbackType 枚举类型

-- 创建反馈类型枚举
CREATE TYPE "FeedbackType" AS ENUM ('BUG_REPORT', 'SUGGESTION', 'OTHER');

-- 启用 uuid-ossp 扩展（如果尚未启用）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建反馈表
CREATE TABLE "Feedback" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "content" TEXT NOT NULL,
  "type" "FeedbackType" NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "userIp" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- 创建索引以优化查询性能
CREATE INDEX "Feedback_targetType_targetId_idx" ON "Feedback"("targetType", "targetId");
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- 添加注释
COMMENT ON TABLE "Feedback" IS '用户反馈表，存储对文章和图片的反馈信息';
COMMENT ON COLUMN "Feedback"."type" IS '反馈类型：BUG_REPORT(问题报告)、SUGGESTION(建议)、OTHER(其他)';
COMMENT ON COLUMN "Feedback"."targetType" IS '目标类型：POST(文章) 或 GALLERY(图片集)';
COMMENT ON COLUMN "Feedback"."targetId" IS '目标内容的 ID';
