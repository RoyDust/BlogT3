# BlogT3 - 现代化博客平台

基于 Next.js 15 和 Supabase 构建的现代化博客平台，采用 RealBlog (Fuwari) 设计系统。

**🎨 核心特性**: 支持 0-360° 色相调整的动态主题系统，基于 OKLCH 色彩空间。

**📖 详细文档**: 查看 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 了解完整实施过程。

## ✨ 主要特性

- 🎨 **动态主题系统** - OKLCH 色彩空间，0-360° 色相调整，明暗模式
- ⚡ **Next.js 15** - React Server Components, Turbopack 构建
- 🎯 **TypeScript** - 完整类型安全
- 📱 **响应式设计** - 移动优先，完美适配各种屏幕
- 🖼️ **图片优化** - Next.js Image 自动优化
- 🔍 **SEO 优化** - 完整的元数据和 Open Graph 支持
- 🎭 **RealBlog 设计** - 优雅的卡片式布局

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

**注意**: 当前使用静态 mock 数据，无需配置数据库即可运行。

### 3. 体验主题定制

1. 点击右上角的调色盘图标
2. 拖动滑块调整色相（0-360°）
3. 点击太阳/月亮图标切换明暗模式
4. 尝试点击"自动"让主题跟随系统

## 📁 项目结构

```
src/
├── app/
│   ├── (public)/          # 公共页面
│   │   ├── page.tsx       # 首页
│   │   ├── blog/          # 博客列表
│   │   ├── post/[slug]/   # 文章详情
│   │   ├── archive/       # 归档页
│   │   └── about/         # 关于页
│   ├── theme-demo/        # 主题演示
│   ├── not-found.tsx      # 404 页面
│   └── layout.tsx         # 根布局
├── components/
│   ├── ui/                # 主题组件
│   ├── layout/            # 布局组件
│   └── blog/              # 博客组件
├── lib/
│   ├── theme-utils.ts     # 主题工具
│   └── mock-data.ts       # 模拟数据
└── styles/                # 样式文件
```

## 🎨 主题系统

### 色相调整
- 范围：0-360°
- 步进：5°
- 实时预览
- LocalStorage 持久化

### 明暗模式
- Light（亮色）
- Dark（暗色）
- Auto（跟随系统）

### OKLCH 色彩空间
```css
--hue: 250; /* 可调整 0-360 */
--primary: oklch(0.70 0.14 var(--hue));
```

## 📄 页面导航

| 页面 | 路由 | 描述 |
|------|------|------|
| 首页 | `/` | 欢迎页，最新文章 |
| 博客 | `/blog` | 所有文章列表 |
| 文章 | `/post/[slug]` | 文章详细内容 |
| 归档 | `/archive` | 时间线归档 |
| 关于 | `/about` | 作者信息 |
| 主题演示 | `/theme-demo` | 主题功能展示 |

## 🛠️ 技术栈

### 核心框架
- **Next.js 15.5.9** - React 全栈框架，Turbopack
- **React 19** - 最新特性
- **TypeScript 5** - 类型安全

### 样式系统
- **Tailwind CSS 4.0** - 原子化 CSS
- **OKLCH** - 感知均匀的颜色空间
- **CSS Variables** - 动态主题

### 工具库
- **Lucide React** - 图标库
- **date-fns** - 日期处理
- **Next.js Image** - 图片优化

## 📝 可用脚本

```bash
pnpm dev              # 启动开发服务器（http://localhost:3000）
pnpm build            # 构建生产版本
pnpm start            # 运行生产服务器
pnpm lint             # ESLint 代码检查
pnpm tsc --noEmit     # TypeScript 类型检查
```

## 🎯 实现功能

### 已完成 ✅
- [x] 动态主题系统（色相 + 明暗模式）
- [x] 首页（最新文章展示）
- [x] 博客列表页
- [x] 文章详情页
- [x] 归档页（时间线视图）
- [x] 关于页
- [x] 分类系统
- [x] 标签系统
- [x] 响应式设计
- [x] SEO 优化
- [x] 图片优化
- [x] 404 页面

### 待实现 📋
- [ ] Supabase 数据库集成
- [ ] 搜索功能
- [ ] 分类/标签筛选
- [ ] 分页功能
- [ ] 评论系统
- [ ] RSS 订阅
- [ ] 管理后台

## 🌐 浏览器支持

### OKLCH 色彩空间
- Chrome 111+
- Edge 111+
- Safari 15.4+
- Firefox 113+

不支持的浏览器将降级使用默认颜色。

## 📚 学习资源

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [OKLCH 色彩空间](https://oklch.com/)
- [RealBlog 参考](https://github.com/saicaca/fuwari)
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 完整实施文档

## 🤝 致谢

设计灵感来源：
- [Fuwari](https://github.com/saicaca/fuwari) - Astro 博客主题
- [RealBlog](https://github.com/saicaca/fuwari) - 设计系统

## 📄 许可证

本项目仅供学习和参考使用。

---

**开发时间**: 2025-01-19
**当前版本**: v1.0.0

