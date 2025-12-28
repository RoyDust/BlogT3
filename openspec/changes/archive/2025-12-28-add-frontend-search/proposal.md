# 变更：为前台页面添加搜索功能

## 为什么
当前博客平台缺少搜索功能，用户无法快速查找感兴趣的内容。导航栏中的搜索按钮仅是占位符，未实现实际功能。随着内容增多，用户需要高效的搜索和筛选机制来发现文章和摄影作品。

## 变更内容
- 实现全局搜索对话框组件，支持关键词搜索文章和相册
- 为博客页面添加搜索和筛选功能（按分类、标签、关键词）
- 为摄影页面添加搜索和筛选功能（按关键词）
- 扩展后端 API 支持全文搜索（标题、摘要、内容）
- 在导航栏搜索按钮上绑定搜索对话框
- 支持快捷键（Ctrl/Cmd + K）唤起搜索
- 搜索结果实时显示，支持键盘导航

## 影响
- 受影响规范：
  - `search`（新增功能）
  - `blog-display`（需要新增或修改相关需求）
  - `gallery-display`（需要新增或修改相关需求）

- 受影响代码：
  - `src/components/layout/Navbar.tsx` - 绑定搜索对话框
  - `src/components/search/` - 新增搜索相关组件
  - `src/server/actions/posts.ts` - 扩展 getPosts 支持搜索
  - `src/server/actions/galleries.ts` - 扩展 getGalleries 支持搜索
  - `src/app/(public)/blog/page.tsx` - 添加搜索和筛选 UI
  - `src/app/(public)/photography/page.tsx` - 添加搜索 UI
  - Prisma 数据库查询 - 使用全文搜索或 ILIKE 查询

## 技术考虑
- 使用客户端组件实现搜索对话框（需要交互状态）
- 搜索 API 调用使用防抖优化性能
- PostgreSQL 支持 ILIKE 进行不区分大小写的模糊匹配
- 未来可考虑使用 PostgreSQL 全文搜索（ts_vector）或 Algolia 等搜索引擎
