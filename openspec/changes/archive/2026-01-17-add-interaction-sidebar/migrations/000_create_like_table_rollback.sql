-- 回滚：删除点赞功能的数据库表
-- 日期：2026-01-18
-- 描述：删除 Like 表和 LikeTargetType 枚举类型

-- 删除点赞表
DROP TABLE IF EXISTS "Like";

-- 删除点赞目标类型枚举
DROP TYPE IF EXISTS "LikeTargetType";
