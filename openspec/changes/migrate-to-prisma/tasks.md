# 任务清单：迁移到 Prisma 客户端并移除 Supabase 依赖

本文档列出了将项目从 Supabase 客户端迁移到 Prisma 客户端的具体任务，按优先级和依赖关系排序。

## 阶段 1：Server Actions 迁移（优先级最高）

### 任务 1.1：迁移文章 Server Actions

- [ ] 1.1.1 更新 `src/server/actions/posts.ts`
  - 将所有 `supabase.from('Post')` 调用替换为 `prisma.post`
  - 更新 `createPost` 函数使用 Prisma 语法
  - 更新 `updatePost` 函数使用 Prisma 语法
  - 更新 `deletePost` 函数使用 Prisma 语法
  - 更新 `getPostBySlug` 函数使用 Prisma 语法
  - 更新 `getAllPosts` 函数使用 Prisma 语法
  - 移除 `import { supabase }` 语句
  - **验证**：测试文章的创建、读取、更新、删除功能

### 任务 1.2：迁移分类 Server Actions

- [ ] 1.2.1 更新 `src/server/actions/categories.ts`
  - 将所有 `supabase.from('Category')` 调用替换为 `prisma.category`
  - 更新 `createCategory` 函数使用 Prisma 语法
  - 更新 `updateCategory` 函数使用 Prisma 语法
  - 更新 `deleteCategory` 函数使用 Prisma 语法
  - 更新 `getAllCategories` 函数使用 Prisma 语法
  - 移除 `import { supabase }` 语句
  - **验证**：测试分类的创建、读取、更新、删除功能

### 任务 1.3：迁移标签 Server Actions

- [ ] 1.3.1 更新 `src/server/actions/tags.ts`
  - 将所有 `supabase.from('Tag')` 调用替换为 `prisma.tag`
  - 更新 `createTag` 函数使用 Prisma 语法
  - 更新 `updateTag` 函数使用 Prisma 语法
  - 更新 `deleteTag` 函数使用 Prisma 语法
  - 更新 `getAllTags` 函数使用 Prisma 语法
  - 移除 `import { supabase }` 语句
  - **验证**：测试标签的创建、读取、更新、删除功能

### 任务 1.4：迁移相册 Server Actions

- [ ] 1.4.1 更新 `src/server/actions/galleries.ts`
  - 将所有 `supabase.from('PhotoGallery')` 调用替换为 `prisma.photoGallery`
  - 将所有 `supabase.from('PhotoImage')` 调用替换为 `prisma.photoImage`
  - 更新 `createGallery` 函数使用 Prisma 语法
  - 更新 `updateGallery` 函数使用 Prisma 语法
  - 更新 `deleteGallery` 函数使用 Prisma 语法
  - 更新 `getAllGalleries` 函数使用 Prisma 语法
  - 移除 `import { supabase }` 语句
  - **验证**：测试相册的创建、读取、更新、删除功能

### 任务 1.5：迁移评论 Server Actions

- [ ] 1.5.1 更新 `src/server/actions/comments.ts`
  - 将所有 `supabase.from('Comment')` 调用替换为 `prisma.comment`
  - 更新所有评论相关函数使用 Prisma 语法
  - 移除 `import { supabase }` 语句
  - **验证**：测试评论功能

### 任务 1.6：迁移点赞 Server Actions

- [ ] 1.6.1 更新 `src/server/actions/likes.ts`
  - 将所有 `supabase.from('Like')` 调用替换为 `prisma.like`
  - 更新所有点赞相关函数使用 Prisma 语法
  - 移除 `import { supabase }` 语句
  - **验证**：测试点赞功能

---

## 阶段 2：tRPC 路由迁移

### 任务 2.1：迁移文章 tRPC 路由

- [ ] 2.1.1 更新 `src/server/api/routers/post.ts`
  - 将所有 `supabase.from('Post')` 调用替换为 `ctx.db.post`
  - 更新所有查询使用 Prisma 语法
  - 移除 `import { supabase }` 语句
  - **验证**：测试 tRPC 文章查询功能

### 任务 2.2：迁移分类 tRPC 路由

- [ ] 2.2.1 更新 `src/server/api/routers/category.ts`
  - 将所有 `supabase.from('Category')` 调用替换为 `ctx.db.category`
  - 更新所有查询使用 Prisma 语法
  - 移除 `import { supabase }` 语句
  - **验证**：测试 tRPC 分类查询功能

### 任务 2.3：迁移点赞 tRPC 路由

- [ ] 2.3.1 更新 `src/server/api/routers/like.ts`
  - 将所有 `supabase.from('Like')` 调用替换为 `ctx.db.like`
  - 更新所有查询使用 Prisma 语法
  - 移除 `import { supabase }` 语句
  - **验证**：测试 tRPC 点赞功能

### 任务 2.4：迁移反馈 tRPC 路由

- [ ] 2.4.1 更新 `src/server/api/routers/feedback.ts`
  - 将所有 `supabase.from('Feedback')` 调用替换为 `ctx.db.feedback`
  - 更新所有查询使用 Prisma 语法
  - 移除 `import { supabase }` 语句
  - **验证**：测试 tRPC 反馈功能

---

## 阶段 3：客户端组件迁移

### 任务 3.1：迁移文章管理组件

- [ ] 3.1.1 更新 `src/app/admin/(dashboard)/posts/_components/DeletePostButton.tsx`
  - 移除 `import { supabase }` 语句
  - 将 `supabase.from('Post').delete()` 调用改为调用 Server Action
  - 使用 `deletePost` Server Action
  - **验证**：测试文章删除功能

### 任务 3.2：迁移分类管理组件

- [ ] 3.2.1 更新 `src/app/admin/(dashboard)/categories/_components/DeleteCategoryButton.tsx`
  - 移除 `import { supabase }` 语句
  - 将 `supabase.from('Category').delete()` 调用改为调用 Server Action
  - 使用 `deleteCategory` Server Action
  - **验证**：测试分类删除功能

- [ ] 3.2.2 更新 `src/app/admin/(dashboard)/categories/_components/CategoryForm.tsx`
  - 移除 `import { supabase }` 语句
  - 将所有 Supabase 调用改为调用 Server Actions
  - **验证**：测试分类创建和编辑功能

### 任务 3.3：迁移标签管理组件

- [ ] 3.3.1 更新 `src/app/admin/(dashboard)/tags/_components/DeleteTagButton.tsx`
  - 移除 `import { supabase }` 语句
  - 将 `supabase.from('Tag').delete()` 调用改为调用 Server Action
  - 使用 `deleteTag` Server Action
  - **验证**：测试标签删除功能

- [ ] 3.3.2 更新 `src/app/admin/(dashboard)/tags/_components/TagForm.tsx`
  - 移除 `import { supabase }` 语句
  - 将所有 Supabase 调用改为调用 Server Actions
  - **验证**：测试标签创建和编辑功能

### 任务 3.4：迁移相册管理组件

- [ ] 3.4.1 更新 `src/components/admin/GalleryImageManager.tsx`
  - 移除 `import { supabase }` 语句
  - 将所有 Supabase 调用改为调用 Server Actions
  - **验证**：测试图片上传和管理功能

---

## 阶段 4：页面组件迁移

### 任务 4.1：迁移公开页面

- [ ] 4.1.1 更新 `src/app/(public)/page.tsx`
  - 移除 `import { supabase }` 语句（如果存在）
  - 确保使用 Prisma 查询或 Server Actions
  - **验证**：测试首页显示

- [ ] 4.1.2 更新 `src/app/(public)/post/[slug]/page.tsx`
  - 移除 `import { supabase }` 语句（如果存在）
  - 确保使用 Prisma 查询或 Server Actions
  - **验证**：测试文章详情页显示

- [ ] 4.1.3 更新 `src/app/(public)/archive/page.tsx`
  - 移除 `import { supabase }` 语句（如果存在）
  - 确保使用 Prisma 查询或 Server Actions
  - **验证**：测试归档页显示

### 任务 4.2：迁移管理后台页面

- [ ] 4.2.1 更新 `src/app/admin/(dashboard)/page.tsx`
  - 移除 `import { supabase }` 语句（如果存在）
  - 确保使用 Prisma 查询或 Server Actions
  - **验证**：测试管理后台首页

- [ ] 4.2.2 更新 `src/app/admin/(dashboard)/posts/page.tsx`
  - 移除 `import { supabase }` 语句（如果存在）
  - 确保使用 Prisma 查询或 Server Actions
  - **验证**：测试文章列表页

- [ ] 4.2.3 更新 `src/app/admin/(dashboard)/posts/new/page.tsx`
  - 移除 `import { supabase }` 语句（如果存在）
  - 确保使用 Server Actions
  - **验证**：测试文章创建页

- [ ] 4.2.4 更新 `src/app/admin/(dashboard)/categories/page.tsx`
  - 移除 `import { supabase }` 语句（如果存在）
  - 确保使用 Prisma 查询或 Server Actions
  - **验证**：测试分类列表页

- [ ] 4.2.5 更新 `src/app/admin/(dashboard)/tags/page.tsx`
  - 移除 `import { supabase }` 语句（如果存在）
  - 确保使用 Prisma 查询或 Server Actions
  - **验证**：测试标签列表页

- [ ] 4.2.6 更新 `src/app/admin/(dashboard)/galleries/page.tsx`
  - 移除 `import { supabase }` 语句（如果存在）
  - 确保使用 Prisma 查询或 Server Actions
  - **验证**：测试相册列表页

- [ ] 4.2.7 更新 `src/app/admin/(dashboard)/galleries/new/page.tsx`
  - 移除 `import { supabase }` 语句（如果存在）
  - 确保使用 Server Actions
  - **验证**：测试相册创建页

---

## 阶段 5：API 路由和其他文件迁移

### 任务 5.1：迁移 API 路由

- [ ] 5.1.1 更新 `src/app/api/auth/register/route.ts`
  - 移除 `import { supabase }` 语句（如果存在）
  - 确保使用 Prisma 进行用户创建
  - **验证**：测试用户注册功能

### 任务 5.2：更新其他文件

- [ ] 5.2.1 检查并更新 `src/app/register/actions.ts`
  - 移除 `import { supabase }` 语句（如果存在）
  - 确保使用 Prisma
  - **验证**：测试注册功能

- [ ] 5.2.2 检查并更新 `src/server/auth/config.ts`
  - 移除 `import { supabase }` 语句（如果存在）
  - 确保使用 Prisma Adapter
  - **验证**：测试认证功能

---

## 阶段 6：清理和验证

### 任务 6.1：删除 Supabase 相关文件

- [ ] 6.1.1 删除 `src/lib/supabase.ts`
  - **验证**：确认文件已删除

- [ ] 6.1.2 删除测试文件
  - 删除 `test-supabase.ts`
  - 删除 `test-supabase-simple.ts`
  - **验证**：确认文件已删除

- [ ] 6.1.3 检查并更新 `test-users.js`
  - 如果使用 Supabase，改为使用 Prisma
  - 如果不再需要，删除该文件
  - **验证**：确认文件正确更新或删除

### 任务 6.2：更新依赖和配置

- [ ] 6.2.1 更新 `package.json`
  - 移除 `@supabase/supabase-js` 依赖
  - 运行 `pnpm install` 清理依赖
  - **验证**：确认依赖已移除

- [ ] 6.2.2 更新 `.env.example`
  - 移除 `NEXT_PUBLIC_SUPABASE_URL`
  - 移除 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - 移除 `SUPABASE_SERVICE_ROLE_KEY`
  - 保留 `DATABASE_URL`（Supabase PostgreSQL 连接字符串）
  - 添加注释说明继续使用 Supabase 托管的数据库
  - **验证**：确认环境变量配置正确

- [ ] 6.2.3 更新项目文档
  - 更新 `openspec/project.md` 中关于 Supabase 的描述
  - 说明项目仅使用 Supabase 托管的 PostgreSQL，不使用 Supabase SDK
  - **验证**：文档准确反映当前架构

### 任务 6.3：全面验证

- [ ] 6.3.1 运行类型检查
  - 执行 `pnpm typecheck`
  - 修复所有类型错误
  - **验证**：类型检查通过

- [ ] 6.3.2 运行代码检查
  - 执行 `pnpm lint`
  - 修复所有 lint 错误
  - **验证**：代码检查通过

- [ ] 6.3.3 运行构建
  - 执行 `pnpm build`
  - 修复所有构建错误
  - **验证**：构建成功

- [ ] 6.3.4 搜索残留的 Supabase 引用
  - 使用 `grep -r "supabase" src/` 搜索
  - 使用 `grep -r "@supabase" src/` 搜索
  - 确认没有遗漏的 Supabase 引用（除了注释）
  - **验证**：无残留引用

- [ ] 6.3.5 功能测试
  - 测试文章的 CRUD 操作
  - 测试分类的 CRUD 操作
  - 测试标签的 CRUD 操作
  - 测试相册的 CRUD 操作
  - 测试评论功能
  - 测试点赞功能
  - 测试用户注册和登录
  - 测试管理后台所有功能
  - **验证**：所有功能正常工作

---

## 依赖关系

- 阶段 1 必须在阶段 3 之前完成（客户端组件依赖 Server Actions）
- 阶段 2 可以与阶段 1 并行进行
- 阶段 3 和阶段 4 可以并行进行
- 阶段 5 可以在阶段 1-4 之后进行
- 阶段 6 必须在所有其他阶段完成后进行

## 验证策略

每个任务完成后必须进行验证：
1. **功能验证**：手动测试功能是否正常
2. **类型验证**：确保 TypeScript 类型正确
3. **代码验证**：确保代码风格一致
4. **回归验证**：确保现有功能未被破坏

## 回滚计划

如果迁移过程中出现严重问题：
1. 使用 Git 回滚到迁移前的提交
2. 分析问题原因
3. 修复问题后重新开始迁移
4. 考虑分阶段提交，每个阶段完成后创建一个提交点
