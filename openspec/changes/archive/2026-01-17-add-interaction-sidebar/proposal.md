# 提案：添加文章和图片展示页面的交互侧边栏

## 概述

在文章详情页和图片展示页的右侧添加固定的交互侧边栏，提供点赞、分享和反馈功能按钮。侧边栏采用垂直布局，每个按钮显示图标和对应的数量统计。

## 动机

当前文章和图片展示页面缺少明显的用户交互入口，用户无法方便地进行点赞、分享和反馈操作。添加固定的交互侧边栏可以：

1. **提升用户参与度**：提供清晰可见的交互按钮，鼓励用户参与互动
2. **改善用户体验**：固定在右侧的侧边栏在滚动时始终可见，方便用户随时操作
3. **增强社交功能**：通过分享功能扩大内容传播范围
4. **收集用户反馈**：通过反馈按钮了解用户对内容的意见和建议

## 目标

1. 在文章详情页（`/post/[slug]`）和图片展示页（`/photography/[id]`）右侧添加固定的交互侧边栏
2. 实现点赞功能，支持用户点赞和取消点赞，实时更新点赞数量
3. 实现分享功能，支持复制链接、分享到社交平台
4. 实现反馈功能，允许用户提交对内容的反馈意见
5. 侧边栏在桌面端固定显示，在移动端自适应调整布局

## 非目标

1. 不涉及评论功能的实现（评论功能已存在于数据库模型中，但不在本次变更范围内）
2. 不涉及收藏/书签功能
3. 不涉及用户通知系统

## 设计概览

### UI 设计

参考用户提供的示例图片，交互侧边栏包含以下元素：

1. **点赞按钮**：显示竖起的大拇指图标和点赞数量（如：48）
2. **反馈按钮**：显示对话气泡图标和反馈数量（如：40）
3. **收藏按钮**：显示星星图标和收藏数量（如：36）

每个按钮采用圆形背景，图标居中显示，数量显示在右上角的小圆形徽章中。

### 技术实现

1. **组件结构**：
   - 创建 `InteractionSidebar` 组件，接收内容类型（文章/图片）和内容 ID
   - 使用 Lucide React 图标库提供图标
   - 使用 Tailwind CSS 实现样式

2. **状态管理**：
   - 使用 TanStack Query 管理点赞、反馈等交互状态
   - 实现乐观更新，提升用户体验

3. **API 设计**：
   - 扩展现有的 tRPC 路由，添加点赞、取消点赞、提交反馈等接口
   - 利用现有的 Like 模型存储点赞数据

### 响应式设计

- **桌面端（≥1024px）**：侧边栏固定在内容右侧，使用 `position: sticky` 跟随滚动
- **平板端（768px-1023px）**：侧边栏缩小尺寸，保持固定显示
- **移动端（<768px）**：侧边栏移至底部，采用横向布局，固定在屏幕底部

## 影响范围

### 前端组件

1. 新增 `src/components/interaction/InteractionSidebar.tsx` - 交互侧边栏主组件
2. 新增 `src/components/interaction/ShareDialog.tsx` - 分享对话框组件
3. 新增 `src/components/interaction/FeedbackDialog.tsx` - 反馈对话框组件
4. 修改 `src/app/(public)/post/[slug]/page.tsx` - 集成交互侧边栏
5. 修改 `src/app/(public)/photography/[id]/page.tsx` - 集成交互侧边栏

### 后端 API

1. 新增 `src/server/api/routers/like.ts` - 点赞相关 API
2. 新增 `src/server/api/routers/feedback.ts` - 反馈相关 API
3. 修改 `src/server/api/root.ts` - 注册新的路由

### 数据库

1. 利用现有的 `Like` 模型存储点赞数据
2. 新增 `Feedback` 模型存储用户反馈（需要数据库迁移）

## 功能需求确认

根据用户反馈，明确以下功能需求：

1. **反馈功能**：采用分类反馈形式，用户需要选择反馈类型（问题报告、建议、其他等）
2. **收藏功能**：暂不实现，本次变更只包含点赞和反馈功能
3. **用户认证**：所有交互功能无需登录，通过 IP 地址限制防止滥用
4. **分享功能**：仅支持复制链接方式

## 实施方案

### 数据库设计

需要新增 `Feedback` 表和 `FeedbackType` 枚举类型。

**SQL 迁移文件**（将在 `openspec/changes/add-interaction-sidebar/migrations/` 目录下生成）：

```sql
-- 创建反馈类型枚举
CREATE TYPE "FeedbackType" AS ENUM ('BUG_REPORT', 'SUGGESTION', 'OTHER');

-- 创建反馈表
CREATE TABLE "Feedback" (
  "id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "type" "FeedbackType" NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "userIp" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- 创建索引
CREATE INDEX "Feedback_targetType_targetId_idx" ON "Feedback"("targetType", "targetId");
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");
```

**对应的 Prisma Schema 更新**（用于类型生成，不执行迁移）：

```prisma
enum FeedbackType {
  BUG_REPORT      // 问题报告
  SUGGESTION      // 建议
  OTHER           // 其他
}

model Feedback {
  id          String       @id @default(cuid())
  content     String
  type        FeedbackType
  targetType  String       // POST 或 GALLERY
  targetId    String
  userIp      String?
  userAgent   String?
  createdAt   DateTime     @default(now())

  @@index([targetType, targetId])
  @@index([createdAt])
  @@map("Feedback")
}
```

### API 设计

1. **点赞 API**（`src/server/api/routers/like.ts`）：
   - `toggleLike` - 切换点赞状态（点赞/取消点赞）
   - `getLikeStatus` - 获取当前用户的点赞状态
   - `getLikeCount` - 获取点赞数量

2. **反馈 API**（`src/server/api/routers/feedback.ts`）：
   - `submitFeedback` - 提交反馈
   - `getFeedbackCount` - 获取反馈数量（按目标内容）

### 组件设计

1. **InteractionSidebar 组件**：
   - 接收 `targetType`（POST/GALLERY）和 `targetId` 参数
   - 显示点赞和反馈按钮
   - 桌面端固定在右侧，移动端固定在底部
   - 使用 `position: sticky` 实现跟随滚动

2. **ShareDialog 组件**：
   - 点击分享按钮时弹出对话框
   - 显示当前页面链接
   - 提供复制链接按钮
   - 复制成功后显示提示信息

3. **FeedbackDialog 组件**：
   - 点击反馈按钮时弹出对话框
   - 提供反馈类型选择（问题报告、建议、其他）
   - 提供文本输入框
   - 提交后显示成功提示

### 防滥用策略

由于功能无需登录，需要实现以下防滥用措施：

1. **IP 限流**：
   - 同一 IP 地址对同一内容的点赞操作间隔至少 1 秒
   - 同一 IP 地址每小时最多提交 10 条反馈
   - 使用 Redis 或内存缓存实现限流

2. **客户端标识**：
   - 使用 localStorage 存储用户的点赞状态
   - 防止用户频繁点击造成不必要的请求

3. **数据验证**：
   - 反馈内容长度限制（10-500 字符）
   - 过滤恶意内容和垃圾信息

## 风险评估

### 技术风险

1. **性能影响**：固定侧边栏可能影响页面滚动性能
   - 缓解措施：使用 CSS `position: sticky` 而非 JavaScript 监听滚动事件

2. **数据一致性**：点赞数量可能出现不一致
   - 缓解措施：使用数据库事务确保计数准确性

### 用户体验风险

1. **移动端布局**：底部固定栏可能遮挡内容
   - 缓解措施：为内容区域添加底部 padding，确保不被遮挡

2. **无登录限制**：可能导致垃圾反馈
   - 缓解措施：实施严格的 IP 限流和内容验证

## 成功指标

1. 用户点赞率提升 20% 以上
2. 每篇文章/图片集平均收到 2+ 条有效反馈
3. 分享功能使用率达到 5% 以上
4. 无明显的性能下降（页面加载时间增加 <100ms）
