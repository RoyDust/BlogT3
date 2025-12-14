-- =============================================
-- 用户表（独立于 Supabase Auth）
-- =============================================

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. 自动更新 updated_at 触发器
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- 4. 启用 Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow public user registration" ON users;
DROP POLICY IF EXISTS "Allow all to view users" ON users;
DROP POLICY IF EXISTS "Allow all to update users" ON users;
DROP POLICY IF EXISTS "Allow all to delete users" ON users;

-- 6. 创建 RLS 策略
-- 允许所有人查看（因为我们用 NextAuth JWT 控制）
CREATE POLICY "Allow all to view users"
  ON users FOR SELECT
  USING (true);

-- 允许所有人更新（应用层控制权限）
CREATE POLICY "Allow all to update users"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 允许匿名用户注册（插入新用户）
CREATE POLICY "Allow public user registration"
  ON users FOR INSERT
  WITH CHECK (true);

-- 允许删除（应用层控制权限）
CREATE POLICY "Allow all to delete users"
  ON users FOR DELETE
  USING (true);

-- 7. 插入默认管理员账号
-- 密码: 123456 (使用 bcrypt hash)
INSERT INTO users (email, password_hash, name, role)
VALUES (
  'admin@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.IQ7WJv0qKNL0M0wS0a.hFw8xYw8Xee',  -- 密码: 123456
  'Admin',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- 8. 验证
SELECT id, email, name, role, created_at FROM users;

-- =============================================
-- 完成！现在可以使用自定义 users 表了
-- =============================================
