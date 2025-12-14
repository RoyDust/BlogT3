# 🔐 后台管理系统使用指南

## ✅ 已完成功能

### 1. 用户认证 (NextAuth)
- ✅ 基于 Supabase Auth 的登录系统
- ✅ JWT Session 策略
- ✅ 登录页面 (`/admin/login`)
- ✅ 中间件路由保护

### 2. 后台布局
- ✅ 侧边栏导航
- ✅ 顶部用户信息栏
- ✅ 响应式设计

### 3. 仪表板
- ✅ 统计卡片（总文章、已发布、草稿、分类数）
- ✅ 最近文章列表
- ✅ 快速操作链接

### 4. 文章管理
- ✅ 文章列表页（包含筛选、排序）
- ✅ 创建新文章
- ✅ 编辑文章
- ✅ 删除文章
- ✅ 发布/草稿状态管理
- ✅ 封面图片支持
- ✅ 分类关联

### 5. 分类管理
- ✅ 查看所有分类
- ✅ 创建新分类
- ✅ 删除分类
- ✅ 颜色选择器

## 🚀 快速开始

### 步骤 1: 在 Supabase 创建管理员账号

**方法 1: 通过 Supabase Dashboard（推荐）**

1. 访问 Supabase Auth Users 页面:
   https://supabase.com/dashboard/project/cnixcpuuwonzevnsutis/auth/users

2. 点击 **"Add User"** 按钮

3. 填写表单:
   - **Email**: 你的邮箱（例如: 3214026782@qq.com）
   - **Password**: 设置密码（例如: 123456）
   - **Auto Confirm User**: ✅ **必须勾选**（跳过邮件验证）

4. 点击 **"Create User"**

**方法 2: 使用 Supabase SQL 函数**

在 Supabase SQL Editor 中运行：

```sql
-- 使用 Supabase Auth 的内置函数创建用户
SELECT
  id,
  email,
  created_at
FROM
  auth.users
WHERE
  email = '3214026782@qq.com';

-- 如果上面查询返回空，说明用户不存在，需要通过 Dashboard 创建
-- 注意：不能直接 INSERT，必须使用 Supabase Dashboard 或 API
```

**方法 3: 使用临时注册页面（快速测试）**

创建一个临时注册页面来注册管理员（开发完成后删除）：

```typescript
// 临时文件：src/app/register/page.tsx
"use client";
import { supabase } from "~/lib/supabase";
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) alert("注册失败: " + error.message);
    else alert("注册成功！请登录");
  };

  return (
    <form onSubmit={handleRegister}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">注册</button>
    </form>
  );
}
```

访问 http://localhost:3002/register 注册后删除此文件。

### 步骤 2: 登录后台

1. 访问 http://localhost:3002/admin/login

2. 输入你在 Supabase 创建的邮箱和密码

3. 点击登录

### 步骤 3: 开始管理

登录成功后，你会看到：

- **仪表板** (`/admin`) - 查看统计数据和最近文章
- **文章管理** (`/admin/posts`) - 管理所有文章
- **分类管理** (`/admin/categories`) - 管理文章分类

## 📝 使用示例

### 创建新文章

1. 访问 `/admin/posts`
2. 点击 "新建文章"
3. 填写表单：
   - **标题**: 自动生成 slug
   - **Slug**: URL 路径
   - **摘要**: 文章简介
   - **内容**: 目前支持 HTML 格式
   - **分类**: 选择分类
   - **封面图**: 输入图片 URL
4. 点击 "保存草稿" 或 "发布文章"

### 管理分类

1. 访问 `/admin/categories`
2. 在左侧表单填写：
   - **分类名称**: 例如 "前端开发"
   - **Slug**: 自动生成，例如 "frontend"
   - **描述**: 可选
   - **颜色**: 选择标签颜色
3. 点击 "创建分类"

## 🎨 功能特性

### 文章编辑器
- 实时 Slug 生成
- HTML 内容支持
- 封面图片预览
- 草稿/发布状态切换
- 分类关联

### 文章列表
- 按创建时间排序
- 显示文章状态（已发布/草稿/已归档）
- 显示阅读数
- 快速编辑/删除操作

### 仪表板统计
- 实时数据展示
- 最近文章快速访问
- 状态分布一目了然

## 🔒 安全性

### 已实现
- ✅ NextAuth JWT 认证
- ✅ Middleware 路由保护
- ✅ Supabase RLS (Row Level Security)
- ✅ 未登录自动跳转登录页

### 注意事项
- 后台所有路由 (`/admin/*`) 都需要登录
- 登录状态由 JWT Session 维护
- 退出登录会清除 Session

## 🛠️ 技术栈

- **认证**: NextAuth v5 + Supabase Auth
- **数据库**: Supabase PostgreSQL
- **UI**: Tailwind CSS
- **路由**: Next.js 15 App Router
- **状态管理**: React useState + Server Components

## 📋 待优化功能

### 短期改进
- [ ] 集成富文本编辑器 (Tiptap/Novel/Lexical)
- [ ] 图片上传功能 (Supabase Storage)
- [ ] 批量操作 (批量删除、批量发布)
- [ ] 文章搜索功能
- [ ] 分页功能优化

### 长期计划
- [ ] 标签系统
- [ ] 文章版本历史
- [ ] 草稿自动保存
- [ ] 文章定时发布
- [ ] SEO 元数据编辑
- [ ] 媒体库管理
- [ ] 多用户角色系统
- [ ] 文章预览功能
- [ ] 导入/导出功能

## 🐛 常见问题

### Q: 无法登录？
A: 确保你已在 Supabase Auth 中创建了用户账号。

### Q: 登录后跳转回登录页？
A: 检查 `.env` 文件中的 `AUTH_SECRET` 是否设置。

### Q: 创建文章失败？
A: 检查 Supabase RLS 策略是否正确配置。

### Q: 图片不显示？
A: 确保图片 URL 可访问，或考虑使用 Supabase Storage。

## 📚 相关文档

- [NextAuth 文档](https://next-auth.js.org/)
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Next.js 15 文档](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🎯 开发建议

1. **富文本编辑器**: 推荐集成 [Novel](https://novel.sh/) 或 [Tiptap](https://tiptap.dev/)
2. **图片上传**: 使用 Supabase Storage + Upload 组件
3. **SEO**: 添加 `next-seo` 进行元数据管理
4. **性能**: 使用 React Query 缓存数据
5. **表单**: 集成 React Hook Form + Zod 验证

---

**🎉 后台管理系统已完成！** 现在可以登录并开始创建内容了。
