# 🔐 自定义用户认证系统

## ✅ 已改为自定义 Users 表

**重要变更**: 不再使用 Supabase Auth，改为自定义的 `users` 表，方便后续迁移到国内服务器。

## 🚀 快速开始

### 步骤 1: 初始化 users 表

在 Supabase SQL Editor 中运行 [supabase-users-table.sql](./supabase-users-table.sql):

1. 访问 https://supabase.com/dashboard/project/cnixcpuuwonzevnsutis/sql

2. 点击 **"New query"**

3. 复制 `supabase-users-table.sql` 的**所有内容**

4. 粘贴到 SQL Editor 并点击 **"Run"**

**完成！** 数据库已创建 `users` 表，包含：
- ✅ users 表（id, email, password_hash, name, role, is_active...）
- ✅ 自动更新 updated_at 触发器
- ✅ RLS 安全策略
- ✅ 索引优化

### 步骤 2: 创建管理员账号

**方法 1: 使用注册页面（推荐，简单快速）**

1. 访问 http://localhost:3002/register

2. 填写表单:
   - **邮箱**: 你的邮箱（例如: 3214026782@qq.com）
   - **姓名**: 可选（例如: Admin）
   - **密码**: 至少 6 位（例如: 123456）
   - **确认密码**: 再次输入密码

3. 点击 **"注册"**

4. 注册成功后，**删除注册页面**（生产环境必须删除）:
   ```bash
   # 删除注册相关文件
   rm src/app/register/page.tsx
   rm src/app/register/actions.ts
   ```

**方法 2: 直接在数据库插入**

在 Supabase SQL Editor 中运行：

```sql
-- 使用 bcrypt 生成密码哈希（在线工具：https://bcrypt-generator.com/）
-- 示例密码 "123456" 的 hash:
INSERT INTO users (email, password_hash, name, role)
VALUES (
  '3214026782@qq.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.IQ7WJv0qKNL0M0wS0a.hFw8xYw8Xee',  -- 123456
  'Admin',
  'admin'
);
```

### 步骤 3: 登录后台

1. 访问 http://localhost:3002/admin/login

2. 输入注册的邮箱和密码

3. 开始使用后台管理系统！

## 📋 技术实现

### 1. 数据库表结构

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,  -- bcrypt 加密
  name TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'admin',    -- admin/editor/viewer
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);
```

### 2. 认证流程

1. 用户输入邮箱密码
2. NextAuth Credentials Provider 验证
3. 从 `users` 表查询用户
4. 使用 bcrypt 验证密码哈希
5. 创建 JWT Session
6. 更新 last_login_at 时间戳

### 3. 密码加密

使用 `bcryptjs` 库：
```typescript
// 注册时加密
const passwordHash = await bcrypt.hash(password, 10);

// 登录时验证
const isValid = await bcrypt.compare(password, user.password_hash);
```

### 4. Session 管理

- **策略**: JWT (JSON Web Token)
- **存储**: HTTP-only Cookie
- **有效期**: 30 天（默认）
- **自动刷新**: 支持

## 🔒 安全特性

### 已实现
- ✅ bcrypt 密码加密（10 轮）
- ✅ JWT Session Token
- ✅ HTTP-only Cookie
- ✅ Row Level Security (RLS)
- ✅ 邮箱唯一性约束
- ✅ is_active 状态控制
- ✅ Middleware 路由保护

### 安全建议
- 🔐 生产环境必须删除注册页面
- 🔐 使用强密码（建议 12 位以上）
- 🔐 定期更换密码
- 🔐 限制登录尝试次数（TODO）
- 🔐 启用双因素认证（TODO）

## 📁 相关文件

### 核心文件
- [src/server/auth/config.ts](src/server/auth/config.ts) - NextAuth 配置
- [src/types/database.types.ts](src/types/database.types.ts) - 数据库类型定义
- [supabase-users-table.sql](supabase-users-table.sql) - 数据库初始化脚本

### 临时文件（生产需删除）
- [src/app/register/page.tsx](src/app/register/page.tsx) - 注册页面
- [src/app/register/actions.ts](src/app/register/actions.ts) - 注册 Server Action

### 认证相关
- [src/app/admin/login/page.tsx](src/app/admin/login/page.tsx) - 登录页面
- [src/middleware.ts](src/middleware.ts) - 路由保护中间件

## 🎯 用户角色系统

### 角色类型
- **admin**: 管理员，完全权限
- **editor**: 编辑，可创建/编辑文章
- **viewer**: 查看者，仅查看权限

### 实现（TODO）
```typescript
// 在 middleware.ts 中检查角色
if (pathname.startsWith("/admin/users") && user.role !== "admin") {
  return NextResponse.redirect(new URL("/admin", req.url));
}
```

## 🔄 迁移到其他数据库

由于使用自定义 `users` 表，迁移非常简单：

### 1. 导出数据
```sql
-- 在 Supabase SQL Editor 中
COPY users TO '/tmp/users.csv' WITH CSV HEADER;
```

### 2. 导入到新数据库
```sql
-- 在新数据库中
CREATE TABLE users (...);  -- 使用相同的表结构
COPY users FROM '/path/to/users.csv' WITH CSV HEADER;
```

### 3. 更新环境变量
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-new-db.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-key
```

或者直接替换为其他数据库（PostgreSQL, MySQL 等），只需：
1. 修改 `src/lib/supabase.ts` 改用其他数据库客户端
2. 保持相同的表结构和字段
3. NextAuth 配置无需改动

## ⚠️ 重要提醒

### 生产环境部署前
1. ✅ 删除注册页面：`rm -rf src/app/register`
2. ✅ 设置强密码（至少 12 位）
3. ✅ 启用 HTTPS
4. ✅ 配置 `AUTH_SECRET` 环境变量
5. ✅ 限制数据库访问 IP
6. ✅ 启用 Supabase RLS 策略

### 环境变量
```env
# .env.local
AUTH_SECRET=your-very-long-random-secret-string
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

生成 AUTH_SECRET:
```bash
openssl rand -base64 32
```

## 🆚 对比 Supabase Auth

| 特性 | Supabase Auth | 自定义 Users 表 |
|------|---------------|-----------------|
| 迁移难度 | 困难（绑定平台） | 简单（标准 SQL） |
| 密码重置 | 内置支持 | 需自己实现 |
| 社交登录 | 内置支持 | 需自己集成 |
| 灵活性 | 受限 | 完全控制 |
| 维护成本 | 低 | 中等 |
| 适用场景 | 快速原型 | 长期项目 |

**选择建议**:
- 如果需要快速上线 → Supabase Auth
- 如果计划迁移到国内 → 自定义 Users 表 ✅

## 📚 参考文档

- [NextAuth.js 文档](https://next-auth.js.org/)
- [bcryptjs 文档](https://github.com/dcodeIO/bcrypt.js)
- [JWT 标准](https://jwt.io/)
- [OWASP 认证指南](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**✅ 自定义认证系统已完成！** 现在可以注册账号并登录使用后台了。
