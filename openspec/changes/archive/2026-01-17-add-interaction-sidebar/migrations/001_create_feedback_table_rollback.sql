-- 回滚迁移：删除反馈功能的数据库表
-- 日期：2026-01-17
-- 描述：删除 Feedback 表和 FeedbackType 枚举类型

-- 删除反馈表
DROP TABLE IF EXISTS "Feedback";

-- 删除反馈类型枚举
DROP TYPE IF EXISTS "FeedbackType";
