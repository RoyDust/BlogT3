# 项目 上下文

## 目的
BlogT3 是一个基于 Next.js 15 和 Supabase 构建的现代化、类型安全的全栈博客平台。该项目旨在提供：
- 功能完善的博客发布和管理系统
- 相册/摄影作品展示功能
- 完整的用户认证和授权系统
- 管理后台（文章、分类、标签、相册管理）
- 响应式设计和主题切换（明暗模式）
- 优雅的阅读体验和交互界面

## 技术栈

### 核心框架
- **Next.js 15.2.3** - React 全栈框架（App Router）
- **React 19.0.0** - UI 库
- **TypeScript 5.8.2** - 类型安全的 JavaScript
- **Tailwind CSS 4.0.15** - 实用优先的 CSS 框架

### 后端技术
- **tRPC 11.0.0** - 端到端类型安全的 API
- **Prisma 6.6.0** - 类型安全的 ORM
- **PostgreSQL** - 主数据库（通过 Supabase）
- **NextAuth 5.0.0-beta.25** - 认证解决方案
- **Zod 3.24.2** - 运行时类型验证

### 状态管理与数据获取
- **TanStack Query 5.69.0** - 服务端状态管理
- **React Hook Form 7.69.0** - 表单状态管理
- **SuperJSON 2.2.1** - JSON 序列化增强

### UI 组件库
- **Radix UI** - 无样式、可访问的组件原语
- **Lucide React 0.562.0** - 图标库
- **Geist Font** - 字体系统
- **shadcn/ui** - 基于 Radix UI 的组件集合

### 云服务
- **Supabase** - BaaS 平台（数据库、认证、存储）
- **七牛云 (Qiniu)** - 图片存储和 CDN

### 开发工具
- **pnpm 10.18.2** - 包管理器
- **ESLint 9** - 代码检查
- **Prettier 3.5.3** - 代码格式化
- **TypeScript ESLint 8** - TypeScript 检查规则

## 项目约定

### 代码风格

#### TypeScript 规范
- 使用严格模式 (`strict: true`)
- 启用 `noUncheckedIndexedAccess` 防止索引访问错误
- 使用 `type` 导入语法：`import { type Foo } from 'bar'`
- 未使用的变量以下划线开头：`_unused`
- 模块系统：ESM（`type: "module"`）

#### 命名约定
- 组件文件：PascalCase（如 `PostCard.tsx`）
- 工具函数：camelCase（如 `getUserById.ts`）
- 类型定义：PascalCase（如 `type UserRole`）
- 常量：UPPER_SNAKE_CASE（如 `MAX_FILE_SIZE`）
- 私有组件文件夹：以下划线开头（如 `_components/`）

#### 格式化规则
- 使用 Prettier 自动格式化
- Tailwind CSS 类名自动排序（prettier-plugin-tailwindcss）
- 缩进：2 空格
- 单引号（由 Prettier 处理）
- 尾随逗号：es5

#### 路径别名
- `~/*` 或 `@/*` 指向 `src/*`
- 优先使用绝对路径导入：`import { api } from '~/trpc/server'`

### 架构模式

#### 分层架构
```
src/
├── app/                 # Next.js App Router 页面
│   ├── (public)/       # 公开访问的页面（博客、相册等）
│   └── admin/          # 管理后台（需要认证）
├── components/         # React 组件
│   ├── ui/            # 基础 UI 组件（shadcn/ui）
│   ├── layout/        # 布局组件（导航、侧边栏等）
│   ├── blog/          # 博客相关组件
│   └── photography/   # 摄影/相册组件
├── server/            # 服务端代码
│   ├── api/          # tRPC 路由和上下文
│   └── auth/         # NextAuth 配置
├── lib/              # 共享工具函数和配置
└── styles/           # 全局样式
```

#### 数据流模式
1. **tRPC 全栈类型安全**
   - 客户端通过 `api.post.getAll.useQuery()` 调用
   - 服务端通过 `api.post.getAll()` 调用
   - 输入输出自动类型推断

2. **服务端优先**
   - 页面数据在服务端预取（RSC）
   - 使用 `api` 从 `~/trpc/server` 直接调用
   - 客户端使用 `useQuery` 进行交互式数据获取

3. **表单处理**
   - React Hook Form + Zod 验证
   - 服务端再次验证（tRPC input）
   - 乐观更新通过 TanStack Query

#### 认证授权
- **NextAuth v5** 提供会话管理
- **Prisma Adapter** 存储会话和账户
- **角色系统**：USER, ADMIN, MODERATOR
- **中间件保护**：管理路由需要 ADMIN 角色

#### 数据库架构
- **Prisma ORM** 管理 schema
- **PostgreSQL** 通过 Supabase 托管
- **索引策略**：在查询频繁的字段上建索引
- **软删除**：USER 使用 status 字段（DELETED）

### 测试策略
目前项目未实施自动化测试，但建议的测试策略：
- **单元测试**：工具函数使用 Vitest
- **组件测试**：React Testing Library
- **E2E 测试**：Playwright
- **类型检查**：`pnpm typecheck` 确保类型安全
- **代码检查**：`pnpm lint` 运行 ESLint

### Git工作流

#### 分支策略
- `main` - 主分支（生产环境）
- 功能开发直接在 main 上进行或使用短期特性分支

#### 提交约定
使用语义化提交消息（Conventional Commits）：
```
feat: 添加用户头像上传功能
fix: 修复文章分类显示错误
refactor: 重构相册组件结构
docs: 更新 API 文档
style: 格式化代码
chore: 更新依赖包
```

#### 提交要求
- 每次提交前运行 `pnpm check`（lint + typecheck）
- 提交信息使用中文（根据 CLAUDE.md 指示）
- 确保构建成功：`pnpm build`

## 领域上下文

### 内容管理
- **文章（Post）**：支持草稿、已发布、归档三种状态
- **分类（Category）**：使用 UUID 作为 ID，支持描述和排序
- **标签（Tag）**：多对多关系，灵活的内容分类
- **相册（PhotoGallery）**：支持多图片管理，每张图片可单独描述

### 用户系统
- **角色权限**：USER（普通用户）、ADMIN（管理员）、MODERATOR（版主）
- **账户状态**：ACTIVE（活跃）、BANNED（封禁）、DELETED（已删除）
- **社交功能**：点赞、评论、浏览统计

### 图片管理
- **七牛云存储**：所有用户上传的图片存储在七牛云
- **封面图片**：文章和相册都支持封面图
- **相册图片**：支持多图上传、排序、描述编辑
- **图片浏览**：使用 Lightbox 提供沉浸式查看体验

### 主题系统
- **明暗模式**：支持 light/dark/system 三种模式
- **色调调整**：支持自定义 hue 值（0-360）
- **持久化**：主题偏好保存在 localStorage
- **SSR 友好**：防止闪烁的服务端渲染

## 重要约束

### 技术约束
- **Node.js 版本**：需要 Node.js 20+ 以支持 Next.js 15
- **数据库**：必须使用 PostgreSQL（Supabase）
- **包管理器**：必须使用 pnpm 10.18.2
- **TypeScript 严格模式**：不允许绕过类型检查
- **ESM Only**：项目使用纯 ESM，不支持 CommonJS

### 业务约束
- **管理员功能**：只有 ADMIN 角色可以访问管理后台
- **内容审核**：评论需要审核（PENDING -> APPROVED/REJECTED）
- **用户状态**：BANNED 或 DELETED 用户不能登录或操作
- **文章可见性**：只有 PUBLISHED 状态的文章对公众可见

### 性能约束
- **图片优化**：使用 Next.js Image 组件自动优化
- **分页加载**：列表数据必须分页（默认 10-20 条/页）
- **客户端打包**：避免在客户端组件中导入大型库
- **服务端缓存**：使用 React Cache 和 Next.js 缓存机制

### 安全约束
- **密码加密**：使用 bcryptjs 加密存储
- **环境变量**：敏感信息存储在 .env（不提交到 Git）
- **CSRF 保护**：NextAuth 自动处理
- **XSS 防护**：React 自动转义，Markdown 需要消毒处理
- **SQL 注入**：Prisma 自动防护参数化查询

## 外部依赖

### Supabase
- **用途**：PostgreSQL 数据库托管、认证后备、未来可能的存储
- **配置**：需要 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`
- **连接字符串**：`DATABASE_URL` 指向 Supabase PostgreSQL

### 七牛云 (Qiniu Cloud)
- **用途**：图片存储和 CDN 加速
- **配置**：需要 `QINIU_ACCESS_KEY`、`QINIU_SECRET_KEY`、`QINIU_BUCKET`、`QINIU_DOMAIN`
- **SDK**：使用 `qiniu` npm 包（v7.14.0）
- **上传流程**：服务端生成上传 token -> 客户端直传 -> 返回图片 URL

### NextAuth (Auth.js)
- **用途**：用户认证和会话管理
- **配置**：需要 `AUTH_SECRET`
- **OAuth 提供商**：支持 Discord（需要 `AUTH_DISCORD_ID` 和 `AUTH_DISCORD_SECRET`）
- **数据库适配器**：使用 Prisma Adapter

### 开发依赖
- **Prisma Studio**：数据库可视化工具（`pnpm db:studio`）
- **Next.js DevTools**：开发时自动启用
- **Turbopack**：开发服务器使用 `--turbo` 标志加速
