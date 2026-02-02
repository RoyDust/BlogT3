-- 注意：此脚本需要使用 PostgreSQL 超级用户（如 postgres）执行

-- 授予 blogt3 用户对 public schema 的所有权限
GRANT ALL ON SCHEMA public TO blogt3;

-- 授予 blogt3 用户对数据库的所有权限
GRANT ALL PRIVILEGES ON DATABASE blogt3 TO blogt3;

-- 授予对现有表和序列的权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO blogt3;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO blogt3;

-- 授予对未来创建的表和序列的默认权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO blogt3;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO blogt3;

-- 授予创建数据库权限（用于 Prisma Migrate 的 shadow database）
-- 注意：此命令需要超级用户权限
ALTER USER blogt3 CREATEDB;
