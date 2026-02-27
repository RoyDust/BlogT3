# 提案：完善后台管理功能

## 概述

本提案旨在完善个人博客后台管理系统的核心功能，包括文章标签选择、分类标签编辑、相册删除、批量操作等中优先级功能。这些功能将显著提升内容管理的效率和用户体验。

## 为什么

当前后台管理系统存在以下问题：

1. **文章管理不完整**：文章编辑页面缺少标签选择功能，无法在创建/编辑文章时关联标签，需要手动在数据库中操作。

2. **编辑功能缺失**：分类和标签只能创建和删除，无法编辑已有的分类/标签信息，导致修改时需要删除重建。

3. **相册管理不完善**：相册列表页面缺少删除按钮，无法通过界面删除相册，只能通过数据库操作。

4. **批量操作缺失**：文章、分类、标签等列表页面不支持批量操作，管理大量内容时效率低下。

5. **搜索筛选功能弱**：缺少高级搜索和筛选功能，难以快速定位特定内容。

## 变更内容

### 1. 文章管理增强
- 添加标签多选组件到文章编辑页面
- 实现文章批量删除功能
- 实现文章批量修改状态功能
- 添加文章搜索和筛选功能

### 2. 分类和标签管理增强
- 创建分类编辑页面
- 创建标签编辑页面
- 添加分类/标签使用统计显示
- 实现分类/标签批量删除功能

### 3. 相册管理增强
- 添加相册删除按钮和确认对话框
- 优化图片批量上传功能
- 添加图片拖拽排序功能
- 实现相册标签选择功能

### 4. 仪表板增强
- 添加更丰富的统计数据（总浏览量、总点赞数等）
- 实现数据可视化图表（文章发布趋势、浏览量趋势等）
- 添加快速操作面板

## 目标

### 短期目标

- 完善文章、分类、标签、相册的基础 CRUD 功能
- 提升内容管理效率
- 改善用户体验

### 长期目标

- 为后续的高级功能（数据分析、媒体库等）奠定基础
- 建立统一的管理界面模式
- 提高代码复用性

## 范围

### 包含

- 文章标签选择组件
- 分类/标签编辑页面
- 相册删除功能
- 批量操作功能（删除、修改状态）
- 搜索和筛选功能
- 仪表板数据可视化

### 不包含

- 评论管理系统（个人博客暂不需要）
- 用户管理系统（仅作者一人使用）
- 权限控制系统（个人博客无需复杂权限）
- 媒体库管理（低优先级功能）
- 数据分析和报表（低优先级功能）

## 约束

- 必须保持现有功能正常工作
- 必须使用 Prisma ORM 进行数据操作
- 必须使用 Toast 通知显示操作结果
- 必须保持与现有 UI 风格一致
- 删除操作必须有确认对话框

## 成功标准

1. 文章编辑页面可以选择和管理标签
2. 分类和标签可以通过界面编辑
3. 相册可以通过界面删除
4. 支持文章批量删除和状态修改
5. 搜索和筛选功能正常工作
6. 仪表板显示丰富的统计数据
7. 所有功能类型检查通过（`pnpm typecheck`）
8. 构建成功（`pnpm build`）
9. 代码检查通过（`pnpm lint`）

## 影响

### 受影响的文件类别

1. **文章管理**（约 3 个文件）
   - `src/app/admin/(dashboard)/posts/new/page.tsx`
   - `src/app/admin/(dashboard)/posts/page.tsx`
   - `src/server/actions/posts.ts`

2. **分类管理**（约 4 个文件）
   - `src/app/admin/(dashboard)/categories/page.tsx`
   - `src/app/admin/(dashboard)/categories/edit/[id]/page.tsx`（新建）
   - `src/app/admin/(dashboard)/categories/_components/CategoryForm.tsx`
   - `src/server/actions/categories.ts`

3. **标签管理**（约 4 个文件）
   - `src/app/admin/(dashboard)/tags/page.tsx`
   - `src/app/admin/(dashboard)/tags/edit/[id]/page.tsx`（新建）
   - `src/app/admin/(dashboard)/tags/_components/TagForm.tsx`
   - `src/server/actions/tags.ts`

4. **相册管理**（约 3 个文件）
   - `src/app/admin/(dashboard)/galleries/page.tsx`
   - `src/app/admin/(dashboard)/galleries/_components/DeleteGalleryButton.tsx`（新建）
   - `src/server/actions/galleries.ts`

5. **仪表板**（约 2 个文件）
   - `src/app/admin/(dashboard)/page.tsx`
   - `src/server/actions/stats.ts`（新建）

6. **共享组件**（约 3 个文件）
   - `src/components/admin/TagSelector.tsx`（新建）
   - `src/components/admin/BatchActions.tsx`（新建）
   - `src/components/admin/SearchFilter.tsx`（新建）

### 新增依赖

可能需要添加以下依赖：
- `recharts` - 用于数据可视化图表
- `react-select` 或 `@radix-ui/react-select` - 用于标签多选组件
- `@dnd-kit/core` - 用于拖拽排序功能

### 数据库变更

无需修改数据库 schema，使用现有的 PostTag、GalleryTag 等关系表。

## 风险

### 技术风险

1. **性能问题**：批量操作可能导致数据库压力，需要优化查询和使用事务。
2. **UI 复杂度**：标签选择、批量操作等组件可能增加 UI 复杂度。
3. **数据一致性**：批量操作需要确保数据一致性，避免部分成功部分失败。

### 缓解措施

1. 使用 Prisma 事务处理批量操作
2. 使用成熟的 UI 组件库（Radix UI）
3. 添加详细的错误处理和用户反馈
4. 实现操作撤销功能（如果可能）

## 时间线

本提案不设定具体时间线，按功能模块逐步实现：

1. **第一阶段**：文章标签选择 + 分类标签编辑
2. **第二阶段**：相册删除 + 批量操作
3. **第三阶段**：搜索筛选 + 仪表板增强

## 替代方案

### 方案 A：分阶段实现（推荐）
按照上述时间线，逐步实现各个功能模块。

**优点**：
- 风险可控，每个阶段可以独立测试
- 可以根据实际使用情况调整优先级
- 开发压力较小

**缺点**：
- 完整功能需要较长时间
- 可能出现功能不一致的情况

### 方案 B：一次性实现
同时开发所有功能模块。

**优点**：
- 功能一致性好
- 可以统一设计 UI 和交互

**缺点**：
- 开发周期长
- 风险较高
- 测试工作量大

**推荐方案**：方案 A（分阶段实现）

## 相关文档

- [项目分析和下一步计划](../../../docs/PROJECT_ANALYSIS_AND_NEXT_STEPS.md)
- [Prisma Schema](../../../prisma/schema.prisma)
- [OpenSpec 项目上下文](../../project.md)
