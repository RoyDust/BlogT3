# 规范：数据访问层

## 新增需求

### 需求：DATA-001 - 统一使用 Prisma 进行数据库操作

所有数据库写操作必须通过 Prisma Client,废弃直接使用 Supabase 客户端写入。

#### 场景：Server Actions 使用 Prisma 创建数据

**前置条件**:
- Server Action 需要创建数据库记录

**操作**:
- 调用 `prisma.post.create()`

**预期结果**:
- 数据成功写入数据库
- 返回创建的记录
- 使用 PascalCase 表名（Post, Category, Tag）

#### 场景：禁止客户端直接使用 Supabase 写入

**前置条件**:
- 客户端组件尝试使用 Supabase 客户端写入

**操作**:
- 调用 `supabase.from('Post').insert()`

**预期结果**:
- 操作失败（通过 RLS 或应用层阻止）
- 提示使用 Server Actions

### 需求：DATA-002 - 公开 API 只返回已发布内容

前台公开访问的 API 必须过滤未发布内容。

#### 场景：公开获取文章列表只返回已发布文章

**前置条件**:
- 前台页面调用 `getPublicPosts()`

**操作**:
- 获取文章列表

**预期结果**:
- 只返回 status 为 PUBLISHED 的文章
- 不返回 DRAFT 或 ARCHIVED 状态的文章
- 按发布时间倒序排列

#### 场景：通过 slug 获取文章必须验证状态

**前置条件**:
- 前台页面调用 `getPostBySlug(slug)`

**操作**:
- 提供文章 slug

**预期结果**:
- 如果文章状态为 PUBLISHED,返回文章内容
- 如果文章状态为 DRAFT 或 ARCHIVED,返回 404 错误
- 不暴露草稿内容

### 需求：DATA-003 - 后台 API 可以访问所有状态的内容

管理后台的 API 可以访问所有状态的内容,但必须验证权限。

#### 场景：管理员可以获取所有状态的文章

**前置条件**:
- 用户是 ADMIN
- 调用 `getAdminPosts()`

**操作**:
- 获取文章列表

**预期结果**:
- 返回所有状态的文章（DRAFT, PUBLISHED, ARCHIVED）
- 包含状态筛选选项
- 支持按状态排序和过滤

#### 场景：管理员可以预览草稿文章

**前置条件**:
- 用户是 ADMIN
- 调用 `getPostBySlug(slug, { preview: true })`

**操作**:
- 提供草稿文章的 slug

**预期结果**:
- 返回草稿文章内容
- 显示预览标识
- 不影响公开访问

### 需求：DATA-004 - 自动绑定当前登录用户

创建内容时必须自动绑定当前登录用户,不信任客户端传入的 authorId。

#### 场景：创建文章自动绑定作者

**前置条件**:
- 管理员调用 `createPost()`

**操作**:
- 提交文章数据（可能包含或不包含 authorId）

**预期结果**:
- 文章的 authorId 设置为当前登录用户的 ID
- 忽略客户端传入的 authorId
- 记录创建时间和创建者

#### 场景：创建相册自动绑定作者

**前置条件**:
- 管理员调用 `createGallery()`

**操作**:
- 提交相册数据

**预期结果**:
- 相册的 authorId 设置为当前登录用户的 ID
- 不使用"第一个用户"作为兜底
- 确保内容归属清晰

## 修改需求

### 需求：DATA-005 - 移除客户端 Supabase 写操作

必须移除所有客户端组件中的 Supabase 写操作,迁移到 Server Actions。

#### 场景：分类管理迁移到 Server Actions

**前置条件**:
- CategoryForm 组件需要创建分类

**操作**:
- 调用 `createCategory()` Server Action

**预期结果**:
- 通过 Server Action 创建分类
- 不直接使用 Supabase 客户端
- 自动验证权限

#### 场景：文章删除迁移到 Server Actions

**前置条件**:
- DeletePostButton 组件需要删除文章

**操作**:
- 调用 `deletePost(id)` Server Action

**预期结果**:
- 通过 Server Action 删除文章
- 验证管理员权限
- 记录审计日志
