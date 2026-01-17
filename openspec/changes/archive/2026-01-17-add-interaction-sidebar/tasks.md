# 任务清单

本文档列出实施交互侧边栏功能的具体任务，按照实施顺序排列。

## 1. 执行数据库迁移

**任务描述**：在 Supabase 服务器上执行 SQL 迁移脚本

**具体内容**：
- 在 Supabase Dashboard 的 SQL Editor 中执行 `openspec/changes/add-interaction-sidebar/migrations/001_create_feedback_table.sql`
- 创建 `FeedbackType` 枚举类型
- 创建 `Feedback` 表及相关索引
- 更新 Prisma schema 文件添加 Feedback 模型定义
- 运行 `pnpm db:pull` 同步数据库结构到 Prisma
- 运行 `pnpm prisma generate` 生成类型定义

**验证方式**：
- 在 Supabase Table Editor 中查看 `Feedback` 表
- 确认所有字段和索引都已创建
- 运行 `pnpm typecheck` 确保类型定义正确

**依赖**：无

**注意事项**：
- 如需回滚，执行 `001_create_feedback_table_rollback.sql`
- SQL 文件位于 `openspec/changes/add-interaction-sidebar/migrations/` 目录

---

## 2. 创建点赞 API 路由

**任务描述**：实现点赞相关的 tRPC 路由

**具体内容**：
- 创建 `src/server/api/routers/like.ts`
- 实现 `toggleLike` 方法（点赞/取消点赞）
- 实现 `getLikeStatus` 方法（获取点赞状态）
- 实现 `getLikeCount` 方法（获取点赞数量）
- 添加 IP 限流保护（1 秒间隔）

**验证方式**：
- 使用 tRPC 客户端测试 API 调用
- 验证点赞数量正确更新
- 验证限流机制生效

**依赖**：任务 1

---

## 3. 创建反馈 API 路由

**任务描述**：实现反馈相关的 tRPC 路由

**具体内容**：
- 创建 `src/server/api/routers/feedback.ts`
- 实现 `submitFeedback` 方法（提交反馈）
- 实现 `getFeedbackCount` 方法（获取反馈数量）
- 添加内容验证（10-500 字符）
- 添加 IP 限流保护（每小时 10 条）

**验证方式**：
- 测试反馈提交成功
- 验证内容长度限制
- 验证限流机制生效

**依赖**：任务 1

---

## 4. 注册 API 路由

**任务描述**：在 tRPC root 中注册新的路由

**具体内容**：
- 修改 `src/server/api/root.ts`
- 导入并注册 `like` 和 `feedback` 路由

**验证方式**：
- 运行 `pnpm typecheck` 无错误
- 客户端可以正常调用新 API

**依赖**：任务 2、任务 3

---

## 5. 创建 InteractionSidebar 组件

**任务描述**：创建交互侧边栏主组件

**具体内容**：
- 创建 `src/components/interaction/InteractionSidebar.tsx`
- 实现点赞按钮和反馈按钮
- 实现桌面端固定布局（position: sticky）
- 实现移动端底部固定布局
- 集成 TanStack Query 进行数据获取
- 实现乐观更新

**验证方式**：
- 组件在桌面端正确显示在右侧
- 组件在移动端正确显示在底部
- 点赞和反馈按钮可点击

**依赖**：任务 4

---

## 6. 创建 ShareDialog 组件

**任务描述**：创建分享对话框组件

**具体内容**：
- 创建 `src/components/interaction/ShareDialog.tsx`
- 使用 shadcn/ui Dialog 组件
- 实现复制链接功能
- 显示成功提示

**验证方式**：
- 点击分享按钮打开对话框
- 点击复制按钮成功复制链接
- 显示成功提示信息

**依赖**：无（可并行）

---

## 7. 创建 FeedbackDialog 组件

**任务描述**：创建反馈对话框组件

**具体内容**：
- 创建 `src/components/interaction/FeedbackDialog.tsx`
- 使用 shadcn/ui Dialog 和 Form 组件
- 实现反馈类型选择（问题报告/建议/其他）
- 实现文本输入框（10-500 字符限制）
- 集成表单验证

**验证方式**：
- 点击反馈按钮打开对话框
- 表单验证正常工作
- 提交成功显示提示信息

**依赖**：任务 4

---

## 8. 集成到文章详情页

**任务描述**：在文章详情页集成交互侧边栏

**具体内容**：
- 修改 `src/app/(public)/post/[slug]/page.tsx`
- 添加 InteractionSidebar 组件
- 调整页面布局以容纳侧边栏
- 确保响应式布局正常工作

**验证方式**：
- 访问文章详情页，侧边栏正确显示
- 桌面端和移动端布局正常
- 所有交互功能正常工作

**依赖**：任务 5、任务 6、任务 7

---

## 9. 集成到图片展示页

**任务描述**：在图片展示页集成交互侧边栏

**具体内容**：
- 修改 `src/app/(public)/photography/[id]/page.tsx`
- 添加 InteractionSidebar 组件
- 调整页面布局以容纳侧边栏
- 确保响应式布局正常工作

**验证方式**：
- 访问图片展示页，侧边栏正确显示
- 桌面端和移动端布局正常
- 所有交互功能正常工作

**依赖**：任务 5、任务 6、任务 7

---

## 10. 测试和优化

**任务描述**：全面测试功能并优化性能

**具体内容**：
- 测试所有交互功能（点赞、分享、反馈）
- 测试限流机制
- 测试响应式布局
- 优化性能（减少不必要的重渲染）
- 测试错误处理

**验证方式**：
- 所有功能正常工作
- 无明显性能问题
- 错误提示清晰友好

**依赖**：任务 8、任务 9

---

## 任务依赖关系图

```
任务 1 (数据库迁移)
  ├─> 任务 2 (点赞 API)
  │     └─> 任务 4 (注册路由)
  └─> 任务 3 (反馈 API)
        └─> 任务 4 (注册路由)

任务 4 (注册路由)
  ├─> 任务 5 (InteractionSidebar 组件)
  └─> 任务 7 (FeedbackDialog 组件)

任务 6 (ShareDialog 组件) [可并行]

任务 5、6、7
  ├─> 任务 8 (集成到文章详情页)
  └─> 任务 9 (集成到图片展示页)

任务 8、9
  └─> 任务 10 (测试和优化)
```
