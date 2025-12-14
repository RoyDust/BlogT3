# 项目初始化指南

## 当前项目状态

项目已成功使用 create-t3-app 初始化，包含以下核心功能：

✅ Next.js 15 (App Router)
✅ TypeScript
✅ tRPC
✅ Prisma ORM
✅ NextAuth.js
✅ Tailwind CSS
✅ ESLint + Prettier

## 下一步操作

### 1. 数据库配置

#### 使用 Supabase (推荐初期)

1. 访问 [Supabase](https://supabase.com) 创建项目
2. 获取数据库连接字符串
3. 修改 `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // 改为 postgresql
  url      = env("DATABASE_URL")
}
```

4. 更新 `.env` 文件:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

5. 推送数据库 schema:

```bash
pnpm db:push
```

#### 使用本地 PostgreSQL

```bash
# 安装 PostgreSQL 后
DATABASE_URL="postgresql://username:password@localhost:5432/blog_t3"
```

### 2. 配置 NextAuth.js

编辑 `.env` 添加认证配置:

```env
# NextAuth
NEXTAUTH_SECRET="运行以下命令生成: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# 示例: GitHub OAuth (可选)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 查看效果

## 建议的开发顺序

### 阶段 1: 基础数据模型

1. 扩展 Prisma Schema (添加博客相关模型)
2. 创建 tRPC routers (文章 CRUD API)
3. 测试 API 端点

### 阶段 2: 前台页面

1. 创建首页布局
2. 文章列表页
3. 文章详情页
4. 基础样式调整

### 阶段 3: 后台管理

1. 认证保护的路由
2. 文章编辑器
3. 文章管理界面
4. 媒体上传

### 阶段 4: 优化增强

1. SEO 优化
2. 图片优化
3. 性能优化
4. 部署配置

## 常用命令

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm start            # 运行生产服务器

# 数据库
pnpm db:push          # 同步 schema 到数据库
pnpm db:studio        # 打开 Prisma Studio (数据库 GUI)

# 代码质量
pnpm lint             # ESLint 检查
pnpm format           # Prettier 格式化
```

## 项目结构说明

```
BlogT3/
├── prisma/
│   └── schema.prisma          # 数据库模型定义
├── public/                    # 静态资源
├── src/
│   ├── app/                   # Next.js App Router
│   │   └── api/auth/          # NextAuth API 路由
│   ├── pages/                 # Pages Router (tRPC API)
│   │   ├── api/trpc/          # tRPC API 端点
│   │   ├── index.tsx          # 首页 (临时)
│   │   └── _app.tsx           # App 包装器
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/       # tRPC routers
│   │   │   │   └── post.ts    # 示例 Post API
│   │   │   ├── root.ts        # Root router
│   │   │   └── trpc.ts        # tRPC 配置
│   │   ├── auth/
│   │   │   ├── config.ts      # Auth 配置
│   │   │   └── index.ts       # Auth 导出
│   │   └── db.ts              # Prisma client
│   └── utils/
│       └── api.ts             # tRPC 客户端工具
├── .env                       # 环境变量 (本地)
├── .env.example               # 环境变量示例
├── package.json               # 项目依赖
├── README.md                  # 项目说明
└── TECH_STACK.md              # 技术栈文档
```

## 注意事项

1. **不要提交 .env 文件** - 已在 .gitignore 中
2. **数据库 Provider** - 默认使用 SQLite，建议改为 PostgreSQL
3. **认证配置** - 需要配置 OAuth 提供商或使用邮箱登录
4. **类型安全** - 充分利用 tRPC 的端到端类型推导

## 故障排查

### 数据库连接失败
- 检查 `.env` 中的 `DATABASE_URL` 是否正确
- 确保数据库服务已启动
- 运行 `pnpm db:push` 同步 schema

### tRPC 错误
- 检查 `src/server/api/routers` 中的 router 是否正确导出
- 确认 `src/server/api/root.ts` 中已注册 router

### NextAuth 错误
- 确保 `NEXTAUTH_SECRET` 已设置
- 检查 OAuth provider 配置是否正确

## 下一步建议

1. 阅读 [TECH_STACK.md](./TECH_STACK.md) 了解完整技术栈
2. 规划数据模型 (博客、分类、标签等)
3. 设置版本控制 (`git init`)
4. 开始开发核心功能

---

**创建时间**: 2025-12-14
**状态**: 基础脚手架已完成，待开发功能
