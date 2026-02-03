# 提案：迁移到 Prisma 客户端并移除 Supabase 依赖

## 概述

本提案旨在将项目中所有使用 Supabase 客户端的代码迁移到 Prisma 客户端，并完全移除 Supabase JavaScript SDK 依赖。项目将继续使用 Supabase 托管的 PostgreSQL 数据库，但所有数据库操作将通过 Prisma ORM 进行。

## 为什么

当前项目存在数据访问层不统一的问题：

1. **双重数据访问模式**：部分代码使用 Supabase 客户端（`supabase.from().select()`），部分代码使用 Prisma（`prisma.post.findMany()`），导致代码风格不一致。

2. **类型安全性不足**：Supabase 客户端的类型推断不如 Prisma 完善，容易出现运行时错误。

3. **维护成本高**：需要同时维护两套数据访问代码，增加了学习曲线和维护负担。

4. **架构不清晰**：项目已经使用 Prisma 作为主要 ORM，但仍然保留 Supabase 客户端调用，造成架构混乱。

5. **安全风险**：客户端直接使用 Supabase anon key 进行数据库操作，绕过了服务端的权限控制。

## 变更内容

- 将所有 `supabase.from()` 调用替换为对应的 Prisma 查询
- 移除 `src/lib/supabase.ts` 文件
- 从 `package.json` 中移除 `@supabase/supabase-js` 依赖
- 更新所有导入 Supabase 客户端的文件
- 清理环境变量配置（移除 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`）
- 更新 `.env.example` 文件
- 保留 `DATABASE_URL`（继续使用 Supabase 托管的 PostgreSQL）
- 删除测试文件（`test-supabase.ts`、`test-supabase-simple.ts`）

## 目标

### 短期目标

- 统一数据访问层，所有数据库操作通过 Prisma 进行
- 提高代码的类型安全性和可维护性
- 减少依赖包大小

### 长期目标

- 为后续的数据库优化和缓存策略奠定基础
- 简化新开发者的学习曲线
- 提高代码质量和一致性

## 范围

### 包含

- Server Actions 中的 Supabase 调用迁移
- tRPC 路由中的 Supabase 调用迁移
- 客户端组件中的 Supabase 调用迁移（改为调用 Server Actions）
- 管理后台组件中的 Supabase 调用迁移
- API 路由中的 Supabase 调用迁移
- 依赖清理和环境变量更新

### 不包含

- 数据库 schema 变更（保持现有 Prisma schema 不变）
- 迁移到其他数据库托管服务
- Supabase Auth 功能（项目已使用 NextAuth）
- Supabase Storage 功能（项目已使用七牛云）

## 约束

- 必须保持所有现有功能正常工作
- 不能破坏现有的 API 接口
- 必须保持与现有 Prisma schema 的兼容性
- 迁移过程中不能影响数据库数据
- 继续使用 Supabase 托管的 PostgreSQL 数据库

## 成功标准

1. 代码库中不再有 `import.*supabase` 的导入语句（除了 generated 文件）
2. `package.json` 中不再包含 `@supabase/supabase-js` 依赖
3. 所有数据库操作通过 Prisma 客户端进行
4. 所有现有功能测试通过
5. 类型检查通过（`pnpm typecheck`）
6. 构建成功（`pnpm build`）
7. 代码检查通过（`pnpm lint`）

## 影响

### 受影响的文件类别

1. **Server Actions**（约 6 个文件）
   - `src/server/actions/posts.ts`
   - `src/server/actions/categories.ts`
   - `src/server/actions/tags.ts`
   - `src/server/actions/galleries.ts`
   - `src/server/actions/comments.ts`
   - `src/server/actions/likes.ts`

2. **tRPC 路由**（约 4 个文件）
   - `src/server/api/routers/post.ts`
   - `src/server/api/routers/category.ts`
   - `src/server/api/routers/like.ts`
   - `src/server/api/routers/feedback.ts`

3. **客户端组件**（约 7 个文件）
   - `src/app/admin/(dashboard)/posts/_components/DeletePostButton.tsx`
   - `src/app/admin/(dashboard)/categories/_components/DeleteCategoryButton.tsx`
   - `src/app/admin/(dashboard)/categories/_components/CategoryForm.tsx`
   - `src/app/admin/(dashboard)/tags/_components/DeleteTagButton.tsx`
   - `src/app/admin/(dashboard)/tags/_components/TagForm.tsx`
   - `src/components/admin/GalleryImageManager.tsx`

4. **页面组件**（约 8 个文件）
   - `src/app/(public)/page.tsx`
   - `src/app/(public)/post/[slug]/page.tsx`
   - `src/app/(public)/archive/page.tsx`
   - `src/app/admin/(dashboard)/page.tsx`
   - `src/app/admin/(dashboard)/posts/page.tsx`
   - `src/app/admin/(dashboard)/posts/new/page.tsx`
   - `src/app/admin/(dashboard)/categories/page.tsx`
   - `src/app/admin/(dashboard)/tags/page.tsx`
   - `src/app/admin/(dashboard)/galleries/page.tsx`
   - `src/app/admin/(dashboard)/galleries/new/page.tsx`

5. **API 路由**（约 1 个文件）
   - `src/app/api/auth/register/route.ts`

6. **配置和工具文件**
   - `src/lib/supabase.ts`（删除）
   - `package.json`
   - `.env.example`
   - `test-supabase.ts`（删除）
   - `test-supabase-simple.ts`（删除）
   - `test-users.js`（可能需要更新）

### 受影响的功能

- 文章管理（创建、读取、更新、删除）
- 分类管理（创建、读取、更新、删除）
- 标签管理（创建、读取、更新、删除）
- 相册管理（创建、读取、更新、删除）
- 评论管理
- 点赞功能
- 用户注册

## 风险

1. **功能回归风险**：迁移过程中可能引入 bug
   - **缓解措施**：逐个文件迁移，每次迁移后进行功能测试

2. **查询性能差异**：Prisma 查询可能与 Supabase 查询性能不同
   - **缓解措施**：关注关键查询的性能，必要时添加索引

3. **类型不匹配**：Supabase 和 Prisma 的类型定义可能不完全一致
   - **缓解措施**：仔细检查类型定义，必要时添加类型转换

4. **测试覆盖不足**：项目缺少自动化测试
   - **缓解措施**：手动测试所有受影响的功能

## 替代方案

### 方案 A：保持现状（不推荐）

**优点**：
- 无需改动代码
- 无迁移风险

**缺点**：
- 继续维护双重数据访问模式
- 代码质量和一致性问题持续存在
- 安全风险未解决

### 方案 B：完全迁移到 Supabase 客户端（不推荐）

**优点**：
- Supabase 提供实时订阅等高级功能
- 与 Supabase 生态系统深度集成

**缺点**：
- 需要重写所有 Prisma 代码
- 失去 Prisma 的类型安全优势
- 与项目现有架构不符

### 方案 C：迁移到 Prisma（推荐）

**优点**：
- 统一数据访问层
- 更好的类型安全
- 与项目现有架构一致
- 减少依赖和维护成本

**缺点**：
- 需要迁移现有代码
- 短期内有一定工作量

## 依赖

- Prisma 6.6.0（已安装）
- PostgreSQL 数据库（Supabase 托管）
- Next.js 15.2.3
- TypeScript 5.8.2

## 时间线

本提案不提供具体时间估算，但建议按以下顺序实施：

1. **阶段 1**：Server Actions 和 tRPC 路由迁移（优先级最高）
2. **阶段 2**：客户端组件迁移
3. **阶段 3**：页面组件迁移
4. **阶段 4**：清理和验证

## 相关文档

- [项目上下文](../../openspec/project.md)
- [Prisma Schema](../../prisma/schema.prisma)
- [后台管理分析文档](../../docs/ADMIN_BACKEND_ANALYSIS.md)
- [Prisma 官方文档](https://www.prisma.io/docs)
