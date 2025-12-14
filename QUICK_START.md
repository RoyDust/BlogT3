# 🚀 快速启动指南

## ✅ 当前状态

- ✅ 开发服务器运行中: http://localhost:3002
- ✅ Supabase 已配置
- ✅ 所有页面代码已完成
- ⏳ 待初始化数据库

## 📋 立即执行（2分钟完成）

### 步骤 1: 初始化 Supabase 数据库

1. 打开 **Supabase Dashboard**
   - 访问: https://supabase.com/dashboard/project/cnixcpuuwonzevnsutis/sql

2. 点击 **"New query"**

3. 复制 [supabase-init-with-data.sql](./supabase-init-with-data.sql) 的**所有内容**

4. 粘贴到 SQL Editor 中

5. 点击 **"Run"** 按钮 ▶️

**完成！** 数据库已创建，包含：
- ✅ 4个数据表 (posts, categories, tags, post_tags)
- ✅ 3个示例分类
- ✅ 5个示例标签
- ✅ 4篇测试文章（含封面图）
- ✅ 所有索引和触发器
- ✅ RLS 安全策略

### 步骤 2: 查看效果

打开浏览器访问：

- **首页**: http://localhost:3002
  - 将显示 4 篇文章
  - 3 个分类标签

- **博客列表**: http://localhost:3002/blog
  - 完整文章列表
  - 分类筛选功能

- **文章详情**: http://localhost:3002/post/welcome-to-blogt3
  - 完整的文章内容
  - 阅读计数

## 🎨 已创建的测试文章

1. **Welcome to BlogT3**
   - Slug: welcome-to-blogt3
   - 分类: 技术
   - 有封面图

2. **Next.js 15 新特性介绍**
   - Slug: nextjs-15-features
   - 分类: 技术
   - 有封面图

3. **TypeScript 最佳实践**
   - Slug: typescript-best-practices
   - 分类: 教程
   - 有封面图

4. **Supabase 入门指南**
   - Slug: supabase-getting-started
   - 分类: 教程
   - 有封面图

## 🎯 测试功能

### 测试分类筛选
- http://localhost:3002/blog?category=tech (技术分类)
- http://localhost:3002/blog?category=tutorial (教程分类)
- http://localhost:3002/blog?category=life (生活分类)

### 测试文章详情
- http://localhost:3002/post/welcome-to-blogt3
- http://localhost:3002/post/nextjs-15-features
- http://localhost:3002/post/typescript-best-practices

### 测试阅读计数
- 多次访问同一篇文章，查看阅读数增加

## ✨ 下一步开发

完成基础测试后，可以：

1. **后台管理**
   - 创建文章编辑器
   - 实现 CRUD 界面
   - 图片上传功能

2. **功能增强**
   - 搜索功能
   - 标签系统
   - 评论系统
   - RSS 订阅

3. **部署上线**
   - 推送到 GitHub
   - 连接 Vercel
   - 配置生产环境变量

## 📚 项目文档

- [README.md](./README.md) - 项目说明
- [TECH_STACK.md](./TECH_STACK.md) - 技术栈详情
- [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md) - Supabase 使用指南
- [SUMMARY.md](./SUMMARY.md) - 项目总结

## 🛠️ 常用命令

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm lint             # 代码检查

# 测试
npx tsx test-supabase-simple.ts   # 测试 Supabase 连接
```

---

**就这么简单！** 运行 SQL 脚本 → 刷新浏览器 → 开始使用 🎉
