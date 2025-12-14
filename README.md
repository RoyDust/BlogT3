# BlogT3 - 现代化全栈博客系统

基于 [T3 Stack](https://create.t3.gg/) 构建的类型安全博客平台，包含前台展示和后台管理功能。

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 并重命名为 `.env`，填入你的 Supabase 配置：

```bash
cp .env.example .env
```

在 `.env` 中添加：
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 初始化 Supabase 数据库

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 打开 SQL Editor
3. 运行 `supabase-init.sql` 文件中的 SQL 脚本
4. 测试连接：`npx tsx test-supabase-simple.ts`

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 技术栈

详细技术栈文档请查看 [TECH_STACK.md](./TECH_STACK.md)

### 核心技术
- **Next.js 15** - React 全栈框架
- **TypeScript** - 类型安全
- **Supabase** - 后端即服务 (数据库 + 认证 + 存储)
- **tRPC** - 端到端类型安全 API
- **NextAuth.js** - 身份认证
- **Tailwind CSS** - 原子化 CSS
- **TanStack Query** - 数据获取和缓存

## 项目结构

```
src/
├── app/              # Next.js App Router
│   ├── (public)/    # 前台博客
│   └── (admin)/     # 后台管理
├── components/       # React 组件
├── server/          # 后端逻辑
│   ├── api/         # tRPC routers
│   ├── auth/        # 认证配置
│   └── db/          # 数据库 client
└── lib/             # 工具函数
```

## 可用脚本

```bash
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm start            # 运行生产服务器
pnpm lint             # 代码检查
pnpm format           # 代码格式化

# Supabase 测试
npx tsx test-supabase-simple.ts  # 测试 Supabase 连接
```

## 功能规划

### 前台功能
- [ ] 博客首页
- [ ] 文章列表
- [ ] 文章详情页
- [ ] 分类/标签筛选
- [ ] 搜索功能
- [ ] RSS 订阅

### 后台功能
- [ ] 用户认证
- [ ] 文章管理 (CRUD)
- [ ] 富文本编辑器
- [ ] 媒体库管理
- [ ] 分类/标签管理
- [ ] 草稿/发布状态

## 部署

### Vercel 部署 (推荐)

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

### Docker 部署

```bash
docker build -t blog-t3 .
docker run -p 3000:3000 blog-t3
```

## 学习资源

- [Next.js Documentation](https://nextjs.org)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase 使用指南](./SUPABASE_GUIDE.md)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [tRPC Documentation](https://trpc.io)
- [T3 Stack Documentation](https://create.t3.gg/)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT

---

更多信息请查看 [技术栈文档](./TECH_STACK.md)
