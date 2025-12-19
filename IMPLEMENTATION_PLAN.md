# BlogT3 样式实现计划 - 基于 RealBlog 设计系统

## 项目概述

本文档详细说明如何将 RealBlog (Fuwari 主题) 的核心设计元素应用到 BlogT3 项目中。实现包括动态主题色（Hue）切换功能，使用静态数据展示，专注于前台页面样式。

---

## 目录

1. [技术栈对比](#技术栈对比)
2. [核心设计元素分析](#核心设计元素分析)
3. [实现步骤](#实现步骤)
4. [组件清单](#组件清单)
5. [静态数据示例](#静态数据示例)
6. [详细实现指南](#详细实现指南)

---

## 技术栈对比

### RealBlog (源项目)
- **框架**: Astro 5.16.5 + Svelte 5.39.8
- **样式**: Tailwind CSS + Stylus (CSS Variables) + Standard CSS
- **色彩模型**: OKLCH 色彩空间
- **图标**: @iconify/svelte + astro-icon
- **特性**: 静态站点生成、页面过渡动画、自定义滚动条

### BlogT3 (目标项目)
- **框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS 4.0.15
- **数据**: Supabase + Prisma
- **特性**: 服务端渲染、tRPC API

### 实现策略
- 使用 **CSS Variables + OKLCH** 实现动态主题色
- 将 Stylus 变量转换为标准 CSS Variables
- 使用 **React 组件** 替代 Svelte 组件
- 保持 Tailwind 作为主要样式系统
- 使用 **lucide-react** 或 **react-icons** 替代 iconify

---

## 核心设计元素分析

### 1. 色彩系统 (OKLCH)

RealBlog 使用 OKLCH 色彩空间，提供感知均匀的颜色系统。

#### 核心 CSS Variables

```css
/* 主题色 - 基于 --hue (0-360) */
--primary: oklch(0.70 0.14 var(--hue))           /* Light */
--primary: oklch(0.75 0.14 var(--hue))           /* Dark */

/* 背景色 */
--page-bg: oklch(0.95 0.01 var(--hue))           /* Light */
--page-bg: oklch(0.16 0.014 var(--hue))          /* Dark */

/* 卡片背景 */
--card-bg: white                                  /* Light */
--card-bg: oklch(0.23 0.015 var(--hue))          /* Dark */

/* 按钮样式 */
--btn-content: oklch(0.55 0.12 var(--hue))       /* Light */
--btn-content: oklch(0.75 0.1 var(--hue))        /* Dark */

--btn-regular-bg: oklch(0.95 0.025 var(--hue))   /* Light */
--btn-regular-bg: oklch(0.33 0.035 var(--hue))   /* Dark */

/* 代码块 */
--codeblock-bg: oklch(0.17 0.015 var(--hue))     /* 两种模式相同 */
```

#### Hue 调色板
```
默认 Hue: 250 (紫蓝色)
范围: 0-360 度
步长: 5 度
示例:
- 0° = 红色
- 120° = 绿色
- 180° = 青色
- 250° = 紫蓝色
- 310° = 洋红色
```

### 2. 排版系统

```css
/* 字体 */
--font-family: Roboto, ui-sans-serif, system-ui, sans-serif
--font-weights: 400 (Regular), 500 (Medium), 700 (Bold)
--code-font: JetBrains Mono Variable

/* 文字不透明度类 */
.text-90 → text-black/90 dark:text-white/90
.text-75 → text-black/75 dark:text-white/75
.text-50 → text-black/50 dark:text-white/50
.text-30 → text-black/30 dark:text-white/30
.text-25 → text-black/25 dark:text-white/25

/* 基础字号 */
Mobile: 14px
Desktop: 16px
```

### 3. 间距与圆角

```css
/* 圆角 */
--radius-large: 1rem (16px)
--radius-medium: 0.75rem (12px)

/* 容器宽度 */
--page-width: 75rem (1200px)
```

### 4. 按钮系统

#### `.btn-plain` - 透明按钮
```css
- 背景: 透明
- 文字: black/75 → hover: primary
- Hover: --btn-plain-bg-hover
- Active: --btn-plain-bg-active
- Active Scale: 0.90
```

#### `.btn-card` - 卡片样式按钮
```css
- 背景: --card-bg
- Hover: --btn-card-bg-hover
- Active: --btn-card-bg-active
- Active Scale: 0.95
```

#### `.btn-regular` - 常规按钮
```css
- 背景: --btn-regular-bg
- 文字: --btn-content
- Hover: --btn-regular-bg-hover
- Active: --btn-regular-bg-active
- Active Scale: 0.95
```

#### `.expand-animation` - 扩展动画
```css
- 使用 ::before 伪元素
- Scale from 0.85 to 1.0
- Z-index layering
```

### 5. 卡片系统

#### `.card-base` 基础类
```css
- Border Radius: var(--radius-large)
- Background: var(--card-bg)
- Overflow: hidden
- Transition: all properties
```

#### `.card-shadow` 阴影
```css
- Drop shadow: 0 2px 4px rgba(0,0,0,0.005)
- 非常轻微的阴影效果
```

### 6. 动画系统

#### 页面加载动画
```css
Navbar:    0ms delay
Sidebar:   100ms delay
Content:   150ms delay (--content-delay)
Footer:    250ms delay
子元素:     每个增加 50ms
```

#### 过渡效果
```css
- 所有文本元素添加 transition
- 按钮 active 状态 scale 变换
- Hover 时背景色和文字色过渡
```

---

## 实现步骤

### 阶段 1: 基础设施搭建

#### 1.1 安装依赖
```bash
pnpm add lucide-react
# 或
pnpm add react-icons
```

#### 1.2 创建目录结构
```
src/
├── styles/
│   ├── theme-variables.css      # OKLCH 色彩变量
│   ├── components.css            # 组件样式类
│   └── animations.css            # 动画定义
├── components/
│   ├── ui/
│   │   ├── ThemeProvider.tsx    # 主题上下文
│   │   ├── ThemeSwitch.tsx      # 明暗模式切换
│   │   ├── HuePicker.tsx        # 色相选择器
│   │   └── Button.tsx            # 按钮组件
│   ├── layout/
│   │   ├── Navbar.tsx            # 导航栏
│   │   ├── Sidebar.tsx           # 侧边栏
│   │   └── Footer.tsx            # 页脚
│   └── blog/
│       ├── PostCard.tsx          # 文章卡片
│       ├── PostMeta.tsx          # 文章元数据
│       └── CategoryBadge.tsx     # 分类徽章
├── hooks/
│   ├── useTheme.ts               # 主题 Hook
│   └── useHue.ts                 # 色相 Hook
├── lib/
│   ├── theme-utils.ts            # 主题工具函数
│   └── mock-data.ts              # 静态数据
└── types/
    └── theme.ts                  # 类型定义
```

### 阶段 2: 样式系统

#### 2.1 创建 CSS Variables (`styles/theme-variables.css`)

定义所有 OKLCH 色彩变量，支持亮色/暗色模式切换。

#### 2.2 创建组件样式类 (`styles/components.css`)

移植 RealBlog 的 Tailwind 组件类：
- `.card-base`
- `.btn-plain`, `.btn-card`, `.btn-regular`
- `.expand-animation`
- `.text-{opacity}` 系列
- `.link-underline`

#### 2.3 创建动画 (`styles/animations.css`)

定义页面加载动画和过渡效果。

### 阶段 3: 主题系统

#### 3.1 主题上下文 (`ThemeProvider.tsx`)

创建 React Context 管理：
- 当前主题模式 (light/dark/auto)
- 当前 Hue 值 (0-360)
- LocalStorage 持久化
- 系统偏好监听

#### 3.2 主题工具函数 (`theme-utils.ts`)

```typescript
- applyThemeToDocument(): 应用主题到 DOM
- applyHueToDocument(): 应用色相到 DOM
- getStoredTheme(): 获取存储的主题
- setStoredTheme(): 保存主题
- getStoredHue(): 获取存储的色相
- setStoredHue(): 保存色相
```

#### 3.3 主题切换组件 (`ThemeSwitch.tsx`)

实现三种模式切换：
- Light Mode (太阳图标)
- Dark Mode (月亮图标)
- Auto Mode (半圆图标)

悬停时显示浮动面板。

#### 3.4 色相选择器 (`HuePicker.tsx`)

实现彩虹渐变滑块：
- 范围输入 (0-360)
- 实时预览当前值
- 重置按钮恢复默认
- 浮动面板样式

### 阶段 4: 布局组件

#### 4.1 导航栏 (`Navbar.tsx`)

- 固定顶部 (sticky)
- Home 链接 + Logo
- 导航链接 (响应式)
- 搜索按钮 (占位)
- 色相选择器按钮
- 主题切换按钮
- 移动端菜单按钮
- 卡片样式背景
- 高度: 4.5rem (72px)

#### 4.2 侧边栏 (`Sidebar.tsx`)

- 宽度: 17.5rem (280px)
- Sticky 定位
- 个人资料卡片
- 分类列表
- 标签云 (可选)
- 归档链接

#### 4.3 页脚 (`Footer.tsx`)

- 版权信息
- 社交链接
- 站点统计
- 底部导航

### 阶段 5: 博客组件

#### 5.1 文章卡片 (`PostCard.tsx`)

大卡片布局：
- 封面图片 (28% 宽度，可选)
- 标题 (左侧带紫色竖线)
- 元数据 (日期、分类、标签)
- 摘要 (限制行数)
- 字数和阅读时间
- Hover 时显示箭头动画
- 响应式布局 (移动端竖向)

#### 5.2 文章元数据 (`PostMeta.tsx`)

- 发布日期
- 更新日期 (可选)
- 分类徽章
- 标签列表
- 分隔符样式 (斜杠)

#### 5.3 分类徽章 (`CategoryBadge.tsx`)

- 圆角矩形
- 背景色基于分类色值 + 透明度
- 字体颜色为分类色
- 小字号

### 阶段 6: 页面布局

#### 6.1 主布局 (`layout.tsx`)

更新根布局：
- 添加 `suppressHydrationWarning` 防止主题闪烁
- 注入主题初始化脚本 (在 <head> 中)
- 包裹 `<ThemeProvider>`
- 导入主题样式表

#### 6.2 公共页面布局 (`(public)/layout.tsx`)

Grid 布局：
- Navbar (顶部固定)
- Sidebar (左侧 17.5rem)
- Main Content (自动宽度)
- Footer (底部)

最大宽度: 75rem

#### 6.3 首页 (`page.tsx`)

- Hero Section (标题 + 描述)
- 分类标签云
- 最新文章网格 (3 列)
- "查看所有文章" 按钮

#### 6.4 博客列表页 (`blog/page.tsx`)

- 面包屑导航
- 筛选器 (分类/标签)
- 文章列表
- 分页组件

#### 6.5 文章详情页 (`post/[slug]/page.tsx`)

- 文章标题 (大字号 + 左侧竖线)
- 元数据徽章
- 封面图 (可选)
- Markdown 内容
- 目录 (TOC，右侧固定)
- 上一篇/下一篇导航

---

## 组件清单

### UI 组件

| 组件名 | 文件路径 | 功能描述 |
|--------|----------|----------|
| ThemeProvider | `components/ui/ThemeProvider.tsx` | 主题上下文提供者 |
| ThemeSwitch | `components/ui/ThemeSwitch.tsx` | 明暗模式切换 (三种模式) |
| HuePicker | `components/ui/HuePicker.tsx` | 色相选择器 (0-360 滑块) |
| Button | `components/ui/Button.tsx` | 按钮组件 (plain/card/regular) |

### 布局组件

| 组件名 | 文件路径 | 功能描述 |
|--------|----------|----------|
| Navbar | `components/layout/Navbar.tsx` | 导航栏 |
| Sidebar | `components/layout/Sidebar.tsx` | 侧边栏 |
| Footer | `components/layout/Footer.tsx` | 页脚 |
| MainLayout | `components/layout/MainLayout.tsx` | 主布局容器 |

### 博客组件

| 组件名 | 文件路径 | 功能描述 |
|--------|----------|----------|
| PostCard | `components/blog/PostCard.tsx` | 文章卡片 |
| PostMeta | `components/blog/PostMeta.tsx` | 文章元数据 |
| CategoryBadge | `components/blog/CategoryBadge.tsx` | 分类徽章 |
| TagBadge | `components/blog/TagBadge.tsx` | 标签徽章 |

### 工具模块

| 模块名 | 文件路径 | 功能描述 |
|--------|----------|----------|
| theme-utils | `lib/theme-utils.ts` | 主题工具函数 |
| mock-data | `lib/mock-data.ts` | 静态展示数据 |
| useTheme | `hooks/useTheme.ts` | 主题 Hook |
| useHue | `hooks/useHue.ts` | 色相 Hook |

---

## 静态数据示例

### 文章数据 (`lib/mock-data.ts`)

```typescript
export const mockPosts = [
  {
    id: '1',
    slug: 'getting-started-with-nextjs',
    title: 'Next.js 15 完全指南：构建现代化 Web 应用',
    excerpt: 'Next.js 15 带来了诸多革命性的特性，包括 React Server Components、Turbopack 和改进的性能优化。本文将深入探讨如何利用这些新特性构建高性能的 Web 应用。',
    content: '# Next.js 15 完全指南\n\nNext.js 15 是一个里程碑版本...',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    publishedAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-16T14:20:00Z',
    category: {
      name: '前端开发',
      slug: 'frontend',
      color: '#3b82f6', // Blue
    },
    tags: [
      { name: 'Next.js', slug: 'nextjs' },
      { name: 'React', slug: 'react' },
      { name: 'TypeScript', slug: 'typescript' },
    ],
    author: {
      name: 'Zhang Wei',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    viewCount: 1248,
    wordCount: 3250,
    readingTime: 13, // minutes
  },
  {
    id: '2',
    slug: 'mastering-tailwind-css',
    title: '精通 Tailwind CSS：从零到高级实战技巧',
    excerpt: 'Tailwind CSS 已经成为现代前端开发的首选工具。通过实用优先的方法，它极大地提升了开发效率。本文将分享从基础到高级的实战技巧。',
    content: '# 精通 Tailwind CSS\n\nTailwind CSS 采用了实用优先的方法...',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    publishedAt: '2025-01-12T09:15:00Z',
    category: {
      name: '前端开发',
      slug: 'frontend',
      color: '#3b82f6',
    },
    tags: [
      { name: 'CSS', slug: 'css' },
      { name: 'Tailwind', slug: 'tailwind' },
      { name: '设计系统', slug: 'design-system' },
    ],
    author: {
      name: 'Li Hua',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    viewCount: 892,
    wordCount: 2800,
    readingTime: 11,
  },
  {
    id: '3',
    slug: 'supabase-authentication-guide',
    title: 'Supabase 身份认证完整实现指南',
    excerpt: 'Supabase 提供了强大的身份认证功能，包括邮箱登录、OAuth、魔法链接等多种方式。本文将详细介绍如何在 Next.js 项目中集成 Supabase 认证。',
    content: '# Supabase 身份认证指南\n\nSupabase 是一个开源的 Firebase 替代方案...',
    coverImage: null, // No cover image
    publishedAt: '2025-01-10T16:45:00Z',
    category: {
      name: '后端开发',
      slug: 'backend',
      color: '#10b981', // Green
    },
    tags: [
      { name: 'Supabase', slug: 'supabase' },
      { name: '身份认证', slug: 'authentication' },
      { name: 'PostgreSQL', slug: 'postgresql' },
    ],
    author: {
      name: 'Wang Min',
      avatar: 'https://i.pravatar.cc/150?img=33',
    },
    viewCount: 654,
    wordCount: 4100,
    readingTime: 16,
  },
  {
    id: '4',
    slug: 'typescript-advanced-patterns',
    title: 'TypeScript 高级类型系统：泛型与工具类型深度解析',
    excerpt: 'TypeScript 的类型系统是其最强大的特性之一。掌握泛型、条件类型和工具类型，可以写出更安全、更灵活的代码。',
    content: '# TypeScript 高级类型系统\n\n泛型是 TypeScript 中最重要的概念之一...',
    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    publishedAt: '2025-01-08T11:20:00Z',
    category: {
      name: '编程语言',
      slug: 'programming-languages',
      color: '#f59e0b', // Amber
    },
    tags: [
      { name: 'TypeScript', slug: 'typescript' },
      { name: '类型系统', slug: 'type-system' },
      { name: '泛型', slug: 'generics' },
    ],
    author: {
      name: 'Chen Jie',
      avatar: 'https://i.pravatar.cc/150?img=8',
    },
    viewCount: 1567,
    wordCount: 5200,
    readingTime: 21,
  },
  {
    id: '5',
    slug: 'design-system-with-figma',
    title: '用 Figma 构建企业级设计系统：最佳实践分享',
    excerpt: '设计系统是保证产品一致性的关键。本文将分享如何使用 Figma 构建可扩展的企业级设计系统，包括组件库、颜色系统和文档规范。',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    publishedAt: '2025-01-05T14:00:00Z',
    category: {
      name: 'UI/UX 设计',
      slug: 'ui-ux',
      color: '#ec4899', // Pink
    },
    tags: [
      { name: 'Figma', slug: 'figma' },
      { name: '设计系统', slug: 'design-system' },
      { name: 'UI 设计', slug: 'ui-design' },
    ],
    author: {
      name: 'Liu Yang',
      avatar: 'https://i.pravatar.cc/150?img=15',
    },
    viewCount: 723,
    wordCount: 3600,
    readingTime: 14,
  },
  {
    id: '6',
    slug: 'react-server-components-explained',
    title: 'React Server Components 深度剖析：原理与实践',
    excerpt: 'React Server Components 是 React 18 引入的革命性特性，它改变了我们构建 React 应用的方式。本文将深入探讨其工作原理和实际应用。',
    coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800',
    publishedAt: '2025-01-03T09:30:00Z',
    updatedAt: '2025-01-04T10:15:00Z',
    category: {
      name: '前端开发',
      slug: 'frontend',
      color: '#3b82f6',
    },
    tags: [
      { name: 'React', slug: 'react' },
      { name: 'Server Components', slug: 'server-components' },
      { name: 'Next.js', slug: 'nextjs' },
    ],
    author: {
      name: 'Zhao Qiang',
      avatar: 'https://i.pravatar.cc/150?img=68',
    },
    viewCount: 2103,
    wordCount: 4850,
    readingTime: 19,
  },
];

export const mockCategories = [
  { id: '1', name: '前端开发', slug: 'frontend', color: '#3b82f6', count: 12 },
  { id: '2', name: '后端开发', slug: 'backend', color: '#10b981', count: 8 },
  { id: '3', name: 'UI/UX 设计', slug: 'ui-ux', color: '#ec4899', count: 5 },
  { id: '4', name: '编程语言', slug: 'programming-languages', color: '#f59e0b', count: 7 },
  { id: '5', name: '工具与效率', slug: 'tools', color: '#8b5cf6', count: 6 },
];

export const mockTags = [
  'Next.js', 'React', 'TypeScript', 'Tailwind', 'CSS',
  'Supabase', 'PostgreSQL', 'Figma', 'UI 设计', '设计系统',
  '身份认证', '泛型', 'Server Components'
];

export const mockProfile = {
  name: 'Zhang Wei',
  avatar: 'https://github.com/shadcn.png',
  bio: '全栈开发者，热爱开源和技术分享。专注于 React 生态和现代 Web 开发。',
  links: [
    { name: 'GitHub', url: 'https://github.com', icon: 'github' },
    { name: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
    { name: 'Email', url: 'mailto:example@example.com', icon: 'mail' },
  ],
};
```

---

## 详细实现指南

### 1. CSS Variables 实现

#### `src/styles/theme-variables.css`

```css
/* ============================================
   OKLCH Color System - Theme Variables
   ============================================ */

:root {
  /* Default Hue */
  --hue: 250;

  /* Layout */
  --radius-large: 1rem;
  --page-width: 75rem;
  --content-delay: 150ms;

  /* Light Mode Colors */
  --primary: oklch(0.70 0.14 var(--hue));
  --page-bg: oklch(0.95 0.01 var(--hue));
  --card-bg: white;

  --btn-content: oklch(0.55 0.12 var(--hue));
  --btn-regular-bg: oklch(0.95 0.025 var(--hue));
  --btn-regular-bg-hover: oklch(0.9 0.05 var(--hue));
  --btn-regular-bg-active: oklch(0.85 0.08 var(--hue));

  --btn-plain-bg-hover: oklch(0.95 0.025 var(--hue));
  --btn-plain-bg-active: oklch(0.98 0.01 var(--hue));

  --btn-card-bg-hover: oklch(0.98 0.005 var(--hue));
  --btn-card-bg-active: oklch(0.9 0.03 var(--hue));

  --title-active: oklch(0.6 0.1 var(--hue));
  --line-color: rgba(0, 0, 0, 0.1);
  --meta-divider: rgba(0, 0, 0, 0.2);

  --inline-code-bg: var(--btn-regular-bg);
  --inline-code-color: var(--btn-content);

  --selection-bg: oklch(0.90 0.05 var(--hue));

  --link-underline: oklch(0.93 0.04 var(--hue));
  --link-hover: oklch(0.95 0.025 var(--hue));
  --link-active: oklch(0.90 0.05 var(--hue));

  --float-panel-bg: white;

  /* Rainbow gradient for hue picker */
  --color-selection-bar: linear-gradient(
    to right,
    oklch(0.80 0.10 0),
    oklch(0.80 0.10 30),
    oklch(0.80 0.10 60),
    oklch(0.80 0.10 90),
    oklch(0.80 0.10 120),
    oklch(0.80 0.10 150),
    oklch(0.80 0.10 180),
    oklch(0.80 0.10 210),
    oklch(0.80 0.10 240),
    oklch(0.80 0.10 270),
    oklch(0.80 0.10 300),
    oklch(0.80 0.10 330),
    oklch(0.80 0.10 360)
  );
}

/* Dark Mode Colors */
:root.dark {
  --primary: oklch(0.75 0.14 var(--hue));
  --page-bg: oklch(0.16 0.014 var(--hue));
  --card-bg: oklch(0.23 0.015 var(--hue));

  --btn-content: oklch(0.75 0.1 var(--hue));
  --btn-regular-bg: oklch(0.33 0.035 var(--hue));
  --btn-regular-bg-hover: oklch(0.38 0.04 var(--hue));
  --btn-regular-bg-active: oklch(0.43 0.045 var(--hue));

  --btn-plain-bg-hover: oklch(0.30 0.035 var(--hue));
  --btn-plain-bg-active: oklch(0.27 0.025 var(--hue));

  --btn-card-bg-hover: oklch(0.3 0.03 var(--hue));
  --btn-card-bg-active: oklch(0.35 0.035 var(--hue));

  --line-color: rgba(255, 255, 255, 0.1);
  --meta-divider: rgba(255, 255, 255, 0.2);

  --selection-bg: oklch(0.40 0.08 var(--hue));

  --link-underline: oklch(0.40 0.08 var(--hue));
  --link-hover: oklch(0.40 0.08 var(--hue));
  --link-active: oklch(0.35 0.07 var(--hue));

  --float-panel-bg: oklch(0.19 0.015 var(--hue));

  --color-selection-bar: linear-gradient(
    to right,
    oklch(0.70 0.10 0),
    oklch(0.70 0.10 30),
    oklch(0.70 0.10 60),
    oklch(0.70 0.10 90),
    oklch(0.70 0.10 120),
    oklch(0.70 0.10 150),
    oklch(0.70 0.10 180),
    oklch(0.70 0.10 210),
    oklch(0.70 0.10 240),
    oklch(0.70 0.10 270),
    oklch(0.70 0.10 300),
    oklch(0.70 0.10 330),
    oklch(0.70 0.10 360)
  );
}

/* Apply background */
body {
  background-color: var(--page-bg);
  transition: background-color 0.3s ease;
}
```

#### `src/styles/components.css`

```css
@layer components {
  /* ============================================
     Card System
     ============================================ */

  .card-base {
    @apply rounded-[var(--radius-large)] overflow-hidden bg-[var(--card-bg)] transition-all;
  }

  .card-shadow {
    @apply drop-shadow-[0_2px_4px_rgba(0,0,0,0.005)];
  }

  /* ============================================
     Button System
     ============================================ */

  .btn-plain {
    @apply transition relative flex items-center justify-center bg-transparent
           text-black/75 hover:text-[var(--primary)]
           dark:text-white/75 dark:hover:text-[var(--primary)]
           hover:bg-[var(--btn-plain-bg-hover)]
           active:bg-[var(--btn-plain-bg-active)];
  }

  .btn-card {
    @apply transition flex items-center justify-center
           bg-[var(--card-bg)]
           hover:bg-[var(--btn-card-bg-hover)]
           active:bg-[var(--btn-card-bg-active)];
  }

  .btn-regular {
    @apply transition flex items-center justify-center
           bg-[var(--btn-regular-bg)]
           hover:bg-[var(--btn-regular-bg-hover)]
           active:bg-[var(--btn-regular-bg-active)]
           text-[var(--btn-content)];
  }

  /* ============================================
     Animation System
     ============================================ */

  .expand-animation {
    @apply relative z-0
           before:absolute before:rounded-[inherit] before:inset-0
           before:scale-[0.85] before:-z-10
           before:transition before:ease-out
           hover:before:scale-100
           active:bg-none
           hover:before:bg-[var(--btn-plain-bg-hover)]
           active:before:bg-[var(--btn-plain-bg-active)];
  }

  .scale-animation {
    @apply transition-transform active:scale-90;
  }

  /* ============================================
     Text Opacity Utilities
     ============================================ */

  .text-90 {
    @apply text-black/90 dark:text-white/90;
  }

  .text-75 {
    @apply text-black/75 dark:text-white/75;
  }

  .text-50 {
    @apply text-black/50 dark:text-white/50;
  }

  .text-30 {
    @apply text-black/30 dark:text-white/30;
  }

  .text-25 {
    @apply text-black/25 dark:text-white/25;
  }

  /* ============================================
     Link Styles
     ============================================ */

  .link-underline {
    @apply transition underline decoration-2 decoration-dashed
           decoration-[var(--link-underline)]
           hover:decoration-[var(--link-hover)]
           active:decoration-[var(--link-active)]
           underline-offset-[0.25rem];
  }

  /* ============================================
     Float Panel
     ============================================ */

  .float-panel {
    @apply rounded-[var(--radius-large)] overflow-hidden
           bg-[var(--float-panel-bg)]
           transition-all shadow-xl dark:shadow-none;
  }

  .float-panel-closed {
    @apply -translate-y-1 opacity-0 pointer-events-none;
  }

  /* ============================================
     Metadata Divider
     ============================================ */

  .with-divider {
    @apply before:content-['/'] before:ml-1.5 before:mr-1.5
           before:text-[var(--meta-divider)] before:text-sm
           before:font-medium before:first-of-type:hidden before:transition;
  }
}

/* ============================================
   Selection Style
   ============================================ */

::selection {
  background-color: var(--selection-bg);
}

/* ============================================
   Smooth Transitions on All Text
   ============================================ */

h1, h2, h3, h4, h5, h6, p, a, span, li, ul, ol,
blockquote, code, pre, table, th, td, strong {
  @apply transition-colors;
}
```

#### `src/styles/animations.css`

```css
/* ============================================
   Onload Animations
   ============================================ */

.onload-animation {
  animation: fade-in-up 0.3s ease-out backwards;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered animation delays */
#navbar {
  animation-delay: 0ms;
}

#sidebar {
  animation-delay: 100ms;
}

#main-content {
  animation-delay: var(--content-delay);
}

#footer {
  animation-delay: 250ms;
}

/* Children stagger */
.stagger-children > * {
  animation: fade-in-up 0.3s ease-out backwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 50ms; }
.stagger-children > *:nth-child(3) { animation-delay: 100ms; }
.stagger-children > *:nth-child(4) { animation-delay: 150ms; }
.stagger-children > *:nth-child(5) { animation-delay: 200ms; }
.stagger-children > *:nth-child(6) { animation-delay: 250ms; }
```

### 2. 主题系统实现

#### `src/types/theme.ts`

```typescript
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  mode: ThemeMode;
  hue: number;
}

export interface ThemeContextValue {
  mode: ThemeMode;
  hue: number;
  setMode: (mode: ThemeMode) => void;
  setHue: (hue: number) => void;
  toggleMode: () => void;
  resetHue: () => void;
}
```

#### `src/lib/theme-utils.ts`

```typescript
export const DEFAULT_HUE = 250;
export const THEME_STORAGE_KEY = 'theme-mode';
export const HUE_STORAGE_KEY = 'theme-hue';

export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * Get system color scheme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply theme mode to document
 */
export function applyThemeToDocument(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;

  const effectiveTheme = mode === 'auto' ? getSystemTheme() : mode;

  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Apply hue value to document
 */
export function applyHueToDocument(hue: number): void {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--hue', hue.toString());
}

/**
 * Get stored theme from localStorage
 */
export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'auto';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored;
  }
  return 'auto';
}

/**
 * Save theme to localStorage
 */
export function setStoredTheme(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, mode);
}

/**
 * Get stored hue from localStorage
 */
export function getStoredHue(): number {
  if (typeof window === 'undefined') return DEFAULT_HUE;
  const stored = localStorage.getItem(HUE_STORAGE_KEY);
  const parsed = stored ? parseInt(stored, 10) : DEFAULT_HUE;
  return isNaN(parsed) ? DEFAULT_HUE : Math.max(0, Math.min(360, parsed));
}

/**
 * Save hue to localStorage
 */
export function setStoredHue(hue: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HUE_STORAGE_KEY, hue.toString());
}

/**
 * Initialize theme (call in <head> to prevent flash)
 */
export function initTheme(): string {
  return `
    (function() {
      try {
        const storedTheme = localStorage.getItem('${THEME_STORAGE_KEY}') || 'auto';
        const storedHue = localStorage.getItem('${HUE_STORAGE_KEY}') || '${DEFAULT_HUE}';

        // Apply theme
        const effectiveTheme = storedTheme === 'auto'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : storedTheme;

        if (effectiveTheme === 'dark') {
          document.documentElement.classList.add('dark');
        }

        // Apply hue
        const hue = parseInt(storedHue, 10);
        if (!isNaN(hue)) {
          document.documentElement.style.setProperty('--hue', hue.toString());
        }
      } catch (e) {
        console.error('Failed to initialize theme:', e);
      }
    })();
  `;
}
```

#### `src/components/ui/ThemeProvider.tsx`

```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  applyThemeToDocument,
  applyHueToDocument,
  getStoredTheme,
  setStoredTheme,
  getStoredHue,
  setStoredHue,
  getSystemTheme,
  DEFAULT_HUE,
} from '~/lib/theme-utils';
import type { ThemeMode, ThemeContextValue } from '~/types/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [hue, setHueState] = useState<number>(DEFAULT_HUE);
  const [mounted, setMounted] = useState(false);

  // Initialize on mount
  useEffect(() => {
    const storedMode = getStoredTheme();
    const storedHue = getStoredHue();

    setModeState(storedMode);
    setHueState(storedHue);

    applyThemeToDocument(storedMode);
    applyHueToDocument(storedHue);

    setMounted(true);
  }, []);

  // Listen to system color scheme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'auto') {
        applyThemeToDocument('auto');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, mounted]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    setStoredTheme(newMode);
    applyThemeToDocument(newMode);
  };

  const setHue = (newHue: number) => {
    const clampedHue = Math.max(0, Math.min(360, newHue));
    setHueState(clampedHue);
    setStoredHue(clampedHue);
    applyHueToDocument(clampedHue);
  };

  const toggleMode = () => {
    const sequence: ThemeMode[] = ['light', 'dark', 'auto'];
    const currentIndex = sequence.indexOf(mode);
    const nextMode = sequence[(currentIndex + 1) % sequence.length]!;
    setMode(nextMode);
  };

  const resetHue = () => {
    setHue(DEFAULT_HUE);
  };

  const value: ThemeContextValue = {
    mode,
    hue,
    setMode,
    setHue,
    toggleMode,
    resetHue,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

#### `src/components/ui/ThemeSwitch.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { Sun, Moon, Circle } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeSwitch() {
  const { mode, setMode } = useTheme();
  const [showPanel, setShowPanel] = useState(false);

  const getIcon = () => {
    switch (mode) {
      case 'light': return <Sun className="h-5 w-5" />;
      case 'dark': return <Moon className="h-5 w-5" />;
      case 'auto': return <Circle className="h-5 w-5" />;
    }
  };

  const getModeLabel = (m: typeof mode) => {
    switch (m) {
      case 'light': return '浅色模式';
      case 'dark': return '深色模式';
      case 'auto': return '跟随系统';
    }
  };

  return (
    <div
      className="relative z-50"
      onMouseEnter={() => setShowPanel(true)}
      onMouseLeave={() => setShowPanel(false)}
    >
      <button
        aria-label="切换主题"
        className="btn-plain scale-animation h-11 w-11 rounded-lg"
        onClick={() => {
          const sequence: Array<typeof mode> = ['light', 'dark', 'auto'];
          const currentIndex = sequence.indexOf(mode);
          const nextMode = sequence[(currentIndex + 1) % sequence.length]!;
          setMode(nextMode);
        }}
      >
        {getIcon()}
      </button>

      {/* Floating Panel */}
      <div
        className={`
          absolute top-11 -right-2 pt-5
          hidden lg:block
          transition-all
          ${showPanel ? '' : 'float-panel-closed'}
        `}
      >
        <div className="card-base float-panel p-2 min-w-[10rem]">
          {(['light', 'dark', 'auto'] as const).map((m) => (
            <button
              key={m}
              className={`
                flex items-center justify-start w-full
                btn-plain scale-animation rounded-lg h-9 px-3
                font-medium mb-0.5 last:mb-0
                ${mode === m ? 'text-[var(--primary)] before:scale-100 before:opacity-100 before:bg-[var(--btn-plain-bg-hover)]' : ''}
              `}
              onClick={() => setMode(m)}
            >
              {m === 'light' && <Sun className="h-5 w-5 mr-3" />}
              {m === 'dark' && <Moon className="h-5 w-5 mr-3" />}
              {m === 'auto' && <Circle className="h-5 w-5 mr-3" />}
              {getModeLabel(m)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### `src/components/ui/HuePicker.tsx`

```typescript
'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { DEFAULT_HUE } from '~/lib/theme-utils';

interface HuePickerProps {
  isOpen: boolean;
}

export function HuePicker({ isOpen }: HuePickerProps) {
  const { hue, setHue, resetHue } = useTheme();

  return (
    <div
      id="hue-picker-panel"
      className={`
        absolute top-[5.25rem] right-4 w-80
        float-panel px-4 py-4
        transition-all
        ${isOpen ? '' : 'float-panel-closed'}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-bold text-lg text-90 relative ml-3">
          {/* Accent bar */}
          <div className="absolute -left-3 top-[0.33rem] w-1 h-4 rounded-md bg-[var(--primary)]" />
          主题色

          <button
            aria-label="重置为默认"
            className={`
              btn-regular w-7 h-7 rounded-md
              transition-all
              ${hue === DEFAULT_HUE ? 'opacity-0 pointer-events-none' : ''}
            `}
            onClick={resetHue}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="bg-[var(--btn-regular-bg)] w-10 h-7 rounded-md flex items-center justify-center font-bold text-sm text-[var(--btn-content)] transition">
          {hue}
        </div>
      </div>

      {/* Rainbow Slider */}
      <div className="relative w-full h-6 rounded select-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'var(--color-selection-bar)'
          }}
        />
        <input
          type="range"
          min="0"
          max="360"
          step="5"
          value={hue}
          onChange={(e) => setHue(parseInt(e.target.value, 10))}
          aria-label="主题色相"
          className="
            absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-2
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-sm
            [&::-webkit-slider-thumb]:bg-white/70
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:hover:bg-white/80
            [&::-webkit-slider-thumb]:active:bg-white/60
            [&::-webkit-slider-thumb]:transition
            [&::-moz-range-thumb]:w-2
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-sm
            [&::-moz-range-thumb]:bg-white/70
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:hover:bg-white/80
            [&::-moz-range-thumb]:active:bg-white/60
            [&::-moz-range-thumb]:transition
          "
        />
      </div>
    </div>
  );
}
```

### 3. 布局组件实现

#### `src/components/layout/Navbar.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Search, Palette, Menu } from 'lucide-react';
import { ThemeSwitch } from '../ui/ThemeSwitch';
import { HuePicker } from '../ui/HuePicker';

const navLinks = [
  { name: '首页', href: '/' },
  { name: '博客', href: '/blog' },
  { name: '归档', href: '/archive' },
  { name: '关于', href: '/about' },
];

export function Navbar() {
  const [showHuePicker, setShowHuePicker] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div id="navbar" className="z-50 onload-animation">
      {/* Top spacer for animation */}
      <div className="absolute h-8 left-0 right-0 -top-8 bg-[var(--card-bg)] transition" />

      <div className="card-base !overflow-visible max-w-[var(--page-width)] h-[4.5rem] !rounded-t-none mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="btn-plain scale-animation rounded-lg h-[3.25rem] px-5 font-bold"
        >
          <div className="flex items-center text-[var(--primary)] text-md">
            <Home className="h-7 w-7 mr-2 -mb-1" />
            BlogT3
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="btn-plain scale-animation rounded-lg h-11 px-5 font-bold"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center">
          {/* Search (Placeholder) */}
          <button
            aria-label="搜索"
            className="btn-plain scale-animation rounded-lg h-11 w-11"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Hue Picker */}
          <button
            aria-label="主题色设置"
            className="btn-plain scale-animation rounded-lg h-11 w-11"
            onClick={() => setShowHuePicker(!showHuePicker)}
          >
            <Palette className="h-5 w-5" />
          </button>

          {/* Theme Switch */}
          <ThemeSwitch />

          {/* Mobile Menu Button */}
          <button
            aria-label="菜单"
            className="btn-plain scale-animation rounded-lg h-11 w-11 md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {showMobileMenu && (
          <div className="absolute top-[5.25rem] left-4 right-4 card-base float-panel p-2 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="btn-plain scale-animation rounded-lg h-11 px-4 font-bold flex items-center justify-start w-full"
                onClick={() => setShowMobileMenu(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}

        {/* Hue Picker Panel */}
        <HuePicker isOpen={showHuePicker} />
      </div>
    </div>
  );
}
```

#### `src/components/blog/PostCard.tsx`

```typescript
import React from 'react';
import Link from 'link';
import Image from 'next/image';
import { Calendar, Clock, Eye, ChevronRight } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import type { Post } from '~/lib/mock-data';

interface PostCardProps {
  post: Post;
  className?: string;
}

export function PostCard({ post, className = '' }: PostCardProps) {
  const hasCover = !!post.coverImage;
  const coverWidth = '28%';

  return (
    <div className={`card-base flex flex-col-reverse md:flex-col w-full relative ${className}`}>
      {/* Content Area */}
      <div
        className={`
          pl-6 md:pl-9 pr-6 md:pr-2 pt-6 md:pt-7 pb-6 relative
          ${hasCover ? 'w-full md:w-[calc(100%-28%-12px)]' : 'w-full md:w-[calc(100%-52px-12px)]'}
        `}
      >
        {/* Title with accent bar */}
        <Link
          href={`/post/${post.slug}`}
          className="
            group transition w-full block font-bold mb-3 text-3xl text-90
            hover:text-[var(--primary)] dark:hover:text-[var(--primary)]
            active:text-[var(--title-active)] dark:active:text-[var(--title-active)]
            before:w-1 before:h-5 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:top-[35px] before:left-[18px] before:hidden md:before:block
          "
        >
          {post.title}

          {/* Mobile chevron */}
          <ChevronRight className="inline h-8 w-8 text-[var(--primary)] md:hidden translate-y-0.5 absolute" />

          {/* Desktop chevron with animation */}
          <ChevronRight className="
            text-[var(--primary)] h-8 w-8 transition hidden md:inline
            absolute translate-y-0.5 opacity-0 group-hover:opacity-100
            -translate-x-1 group-hover:translate-x-0
          " />
        </Link>

        {/* Metadata */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {post.category && <CategoryBadge category={post.category} />}

          <div className="flex items-center gap-2 text-sm text-50">
            <Calendar className="h-4 w-4" />
            {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
          </div>

          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag.slug} className="text-sm text-50 with-divider">
              {tag.name}
            </span>
          ))}
        </div>

        {/* Excerpt */}
        <div className="transition text-75 mb-3.5 pr-4 line-clamp-2 md:line-clamp-1">
          {post.excerpt}
        </div>

        {/* Word count and read time */}
        <div className="text-sm text-30 flex gap-4 transition">
          <div>{post.wordCount} 字</div>
          <div>|</div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime} 分钟
          </div>
          {post.viewCount > 0 && (
            <>
              <div>|</div>
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {post.viewCount}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cover Image */}
      {hasCover && (
        <Link
          href={`/post/${post.slug}`}
          aria-label={post.title}
          className="
            group
            max-h-[20vh] md:max-h-none mx-4 mt-4 -mb-2 md:mb-0 md:mx-0 md:mt-0
            md:w-[28%] relative md:absolute md:top-3 md:bottom-3 md:right-3
            rounded-xl overflow-hidden active:scale-95 transition-transform
          "
        >
          <div className="absolute pointer-events-none z-10 w-full h-full group-hover:bg-black/30 group-active:bg-black/50 transition" />
          <div className="absolute pointer-events-none z-20 w-full h-full flex items-center justify-center">
            <ChevronRight className="
              transition opacity-0 group-hover:opacity-100
              scale-50 group-hover:scale-100 text-white text-5xl
            " />
          </div>
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
          />
        </Link>
      )}

      {/* Enter Button (when no cover) */}
      {!hasCover && (
        <Link
          href={`/post/${post.slug}`}
          aria-label={post.title}
          className="
            !hidden md:!flex btn-regular w-[3.25rem]
            absolute right-3 top-3 bottom-3 rounded-xl
            bg-[var(--enter-btn-bg)]
            hover:bg-[var(--enter-btn-bg-hover)]
            active:bg-[var(--enter-btn-bg-active)]
            active:scale-95
          "
        >
          <ChevronRight className="text-[var(--primary)] text-4xl mx-auto" />
        </Link>
      )}
    </div>
  );
}
```

---

## 总结

### 核心特性
1. **OKLCH 色彩系统**: 提供感知均匀的色彩，支持 0-360° Hue 调整
2. **三种主题模式**: Light / Dark / Auto (跟随系统)
3. **卡片化设计**: 所有主要内容使用卡片容器
4. **动画系统**: 页面加载动画、Hover 效果、Active 状态缩放
5. **响应式布局**: Grid 布局 + Tailwind 响应式工具
6. **按钮系统**: Plain / Card / Regular 三种样式
7. **静态数据**: 使用 Lorem Ipsum 风格的真实感数据

### 实现优先级
1. **第一阶段**: CSS Variables + 主题系统 (基础设施)
2. **第二阶段**: 导航栏 + 主题切换组件 (核心功能)
3. **第三阶段**: 文章卡片 + 布局组件 (内容展示)
4. **第四阶段**: 页面整合 + 动画完善 (最终打磨)

### 技术要点
- **CSS Variables** 实现动态主题
- **LocalStorage** 持久化用户偏好
- **React Context** 管理全局主题状态
- **Tailwind 4.0** 使用 `@theme` 指令
- **TypeScript** 保证类型安全

---

## 附录

### A. 推荐字体

```css
/* 主字体 */
font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI",
             "Helvetica Neue", Arial, sans-serif;

/* 代码字体 */
font-family: "JetBrains Mono Variable", "Fira Code", "Cascadia Code",
             Consolas, Monaco, monospace;
```

### B. 图标方案

**选项 1: lucide-react (推荐)**
```bash
pnpm add lucide-react
```

**选项 2: react-icons**
```bash
pnpm add react-icons
```

### C. 颜色示例

| Hue | 颜色名 | 示例场景 |
|-----|--------|----------|
| 0   | 红色   | 错误提示、警告 |
| 120 | 绿色   | 成功状态、环保主题 |
| 180 | 青色   | 清新、科技感 |
| 250 | 紫蓝色 | 默认主题 (RealBlog) |
| 310 | 洋红色 | 创意、设计类 |

### D. 浏览器兼容性

OKLCH 颜色空间支持情况:
- Chrome 111+
- Edge 111+
- Safari 15.4+
- Firefox 113+

对于不支持的浏览器，可以提供 fallback:
```css
background: #8b5cf6; /* fallback */
background: oklch(0.70 0.14 var(--hue));
```

---

**文档版本**: 1.0
**创建日期**: 2025-01-19
**目标项目**: BlogT3
**参考项目**: RealBlog (Fuwari Theme)
