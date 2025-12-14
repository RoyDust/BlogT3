# BlogT3 技术栈文档

## 项目概述

基于 create-t3-app 的全栈博客系统，包含前台博客展示和后台内容管理功能。

**目标**: 构建一个现代化的博客平台，初期使用 Supabase，后期可无缝迁移至国内云服务。

---

## 核心技术栈

### 1. 框架 & 运行时

| 技术 | 版本 | 说明 |
|------|------|------|
| **Next.js** | 15.5.9 | React 全栈框架，支持 App Router 和 Server Components |
| **React** | 19.2.3 | UI 库 |
| **TypeScript** | 5.9.3 | 类型安全的 JavaScript 超集 |
| **Node.js** | >= 18.x | 运行时环境 |

### 2. 后端核心 (T3 Stack)

| 技术 | 版本 | 用途 |
|------|------|------|
| **tRPC** | 11.8.0 | 端到端类型安全的 API，无需手写接口文档 |
| **Prisma** | 6.19.1 | 现代化 ORM，用于数据库操作 |
| **NextAuth.js** | 5.0.0-beta.25 | 身份认证和会话管理 |
| **Zod** | 3.25.76 | 运行时类型验证和 Schema 定义 |
| **TanStack Query** | 5.90.12 | 数据获取、缓存和状态管理 |
| **SuperJSON** | 2.2.6 | 序列化库，支持 Date、Map、Set 等特殊类型 |

### 3. 数据库 & 存储

#### 初期方案 (Supabase)
- **Supabase PostgreSQL** - 关系型数据库
- **Supabase Storage** - 图片和媒体文件存储
- **Supabase Auth** (可选) - 可与 NextAuth.js 配合使用

#### 国内迁移方案
- **数据库**: 阿里云 RDS PostgreSQL / 腾讯云 PostgreSQL
- **对象存储**: 阿里云 OSS / 腾讯云 COS
- **认证**: 保留 NextAuth.js (独立于云服务商)

### 4. UI & 样式

| 技术 | 版本 | 说明 |
|------|------|------|
| **Tailwind CSS** | 4.1.18 | 原子化 CSS 框架 |
| **PostCSS** | 8.5.6 | CSS 预处理器 |
| **@tailwindcss/postcss** | 4.1.18 | Tailwind CSS PostCSS 插件 |

**推荐添加**:
- `shadcn/ui` - 可定制的 UI 组件库
- `Lucide Icons` - 现代图标库
- `clsx` + `tailwind-merge` - 样式工具函数

### 5. 代码质量

| 工具 | 版本 | 用途 |
|------|------|------|
| **ESLint** | 9.39.2 | 代码检查 |
| **Prettier** | 3.7.4 | 代码格式化 |
| **TypeScript ESLint** | 8.49.0 | TypeScript 代码规范 |
| **prettier-plugin-tailwindcss** | 0.6.14 | Tailwind 类名自动排序 |

---

## 待添加功能模块

### 内容编辑 (后台)

**富文本编辑器** (选择其一):
- **Novel** - Notion 风格的现代编辑器
- **Tiptap** - 灵活强大的无头编辑器
- **MDXEditor** - MDX 格式编辑器

### 内容处理

```bash
# MDX 支持
pnpm add next-mdx-remote gray-matter

# Markdown 处理
pnpm add remark-gfm rehype-highlight rehype-slug rehype-autolink-headings

# 语法高亮
pnpm add shiki
```

### 文件上传

```bash
# 文件上传解决方案
pnpm add uploadthing

# 或使用 Supabase Storage
pnpm add @supabase/supabase-js
```

### 状态管理 (可选)

```bash
# 轻量级状态管理
pnpm add zustand
# 或
pnpm add jotai
```

### 表单处理

```bash
# 表单管理 (Zod 已包含在 T3)
pnpm add react-hook-form
```

### SEO & 分析

```bash
pnpm add next-seo
pnpm add @vercel/analytics
```

### 工具库

```bash
# 日期处理
pnpm add date-fns

# 样式工具
pnpm add clsx tailwind-merge
```

---

## 项目结构

```
BlogT3/
├── src/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── (public)/            # 前台路由组 (博客展示)
│   │   │   ├── page.tsx         # 首页
│   │   │   ├── blog/            # 博客列表页
│   │   │   └── post/[slug]/     # 博客详情页
│   │   ├── (admin)/             # 后台路由组 (管理面板)
│   │   │   ├── layout.tsx       # 后台布局
│   │   │   ├── dashboard/       # 仪表盘
│   │   │   ├── posts/           # 文章管理
│   │   │   └── media/           # 媒体库管理
│   │   ├── api/                 # API 路由
│   │   │   ├── auth/[...nextauth]/  # NextAuth 端点
│   │   │   └── trpc/[trpc]/     # tRPC 端点
│   │   ├── layout.tsx           # 根布局
│   │   └── globals.css          # 全局样式
│   ├── components/
│   │   ├── ui/                  # shadcn 组件
│   │   ├── editor/              # 编辑器组件
│   │   ├── layout/              # 布局组件
│   │   └── blog/                # 博客展示组件
│   ├── server/
│   │   ├── api/                 # tRPC routers
│   │   │   ├── root.ts          # 根 router
│   │   │   └── routers/
│   │   │       ├── post.ts      # 文章相关 API
│   │   │       └── user.ts      # 用户相关 API
│   │   ├── auth/                # NextAuth 配置
│   │   │   ├── config.ts        # Auth.js 配置
│   │   │   └── index.ts         # Auth 导出
│   │   └── db/                  # 数据库
│   │       └── index.ts         # Prisma client
│   ├── lib/
│   │   ├── utils.ts             # 工具函数
│   │   └── constants.ts         # 常量定义
│   ├── styles/                  # 额外样式文件
│   ├── types/                   # TypeScript 类型定义
│   └── env.js                   # 环境变量验证
├── prisma/
│   └── schema.prisma            # Prisma 数据模型
├── public/                      # 静态资源
├── .env                         # 环境变量 (不提交)
├── .env.example                 # 环境变量示例
├── next.config.ts               # Next.js 配置
├── tailwind.config.ts           # Tailwind 配置
├── tsconfig.json                # TypeScript 配置
└── package.json                 # 项目依赖
```

---

## 环境变量配置

### 基础配置 (.env)

```env
# 数据库
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Supabase (初期)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# 文件上传 (可选)
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

### 国内迁移配置

```env
# 阿里云 OSS / 腾讯云 COS
OSS_ACCESS_KEY_ID=""
OSS_ACCESS_KEY_SECRET=""
OSS_BUCKET=""
OSS_REGION=""
OSS_ENDPOINT=""
```

---

## 部署方案

### 开发环境
```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 运行生产服务器
```

### 初期部署 (Vercel + Supabase)
1. **前端**: Vercel (零配置部署)
2. **数据库**: Supabase PostgreSQL
3. **存储**: Supabase Storage

### 国内迁移部署

#### 方案 1: 云服务器 Docker 部署
```bash
# Dockerfile 部署到阿里云 / 腾讯云
docker build -t blog-t3 .
docker run -p 3000:3000 blog-t3
```

#### 方案 2: Serverless 部署
- **Vercel 中国区** (如可用)
- **Railway** / **Zeabur** (支持国内访问)

---

## 迁移注意事项

### 1. 数据库迁移
- 使用 Prisma Migrate 导出/导入数据
- 提前准备国内数据库连接配置

### 2. 文件存储迁移
- 创建统一的存储接口抽象层
- 支持多种存储后端 (Supabase / OSS / COS)

### 3. 认证独立性
- 使用 NextAuth.js 而非 Supabase Auth
- 避免强依赖特定云服务商

### 4. API 抽象
- tRPC 保持类型安全
- 通过 Prisma 抽象数据库访问
- 避免直接调用 Supabase SDK

---

## 开发规范

### Git 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试
chore: 构建/工具链更新
```

### 代码规范
- 使用 ESLint + Prettier 自动格式化
- TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 优先使用 Server Components (RSC)

---

## 技术选型原则

1. **类型安全优先** - 全栈 TypeScript，tRPC 端到端类型
2. **可迁移性** - 避免强绑定特定云服务商
3. **开发体验** - 使用现代化工具链，减少样板代码
4. **性能优化** - RSC、图片优化、代码分割
5. **渐进式增强** - 从简单开始，按需添加功能

---

## 参考文档

- [Next.js Documentation](https://nextjs.org/docs)
- [T3 Stack](https://create.t3.gg/)
- [tRPC Documentation](https://trpc.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/docs)

---

**最后更新**: 2025-12-14
**维护者**: Your Name
**项目版本**: 0.1.0
