# 提案：完善标签和分类的文章搜索功能

## 变更 ID
`improve-tag-category-search`

## 概述
修复侧边栏的标签和分类搜索功能，使其能够正确筛选文章。当前问题是侧边栏使用硬编码的 Mock 数据，且 URL 参数与 BlogSearch 组件期望的参数不匹配，导致点击侧边栏的分类和标签无法正确筛选文章。

## 问题描述

### 当前问题
1. **侧边栏使用 Mock 数据**：`Sidebar.tsx` 组件使用硬编码的分类和标签数据，而不是从数据库获取真实数据
2. **URL 参数不匹配**：
   - 侧边栏传递的是 `?category=slug` 和 `?tag=name`
   - BlogSearch 组件期望的是 `?category=id` 和 `?tags=id`
   - 导致筛选功能完全失效
3. **组件类型不一致**：侧边栏是客户端组件，无法直接获取服务端数据

### 影响范围
- 用户无法通过侧边栏的分类和标签链接筛选文章
- 文章卡片上的分类徽章和标签链接也存在同样的问题
- 搜索功能的用户体验受到严重影响

## 解决方案

### 1. 侧边栏数据获取
- 将 `Sidebar.tsx` 从客户端组件改为服务器组件
- 使用 `getCategories()` 和 `getTags()` 获取真实数据
- 动态计算每个分类的文章数量

### 2. URL 参数统一
- 统一使用 ID 作为 URL 参数：
  - 分类：`/blog?category={categoryId}`
  - 标签：`/blog?tags={tagId}` (支持多选，用逗号分隔)
- 更新所有相关组件使用统一的参数格式

### 3. 组件类型更新
- 更新 `CategoryBadge` 和 `PostMeta` 组件的类型定义
- 添加 `id` 字段支持
- 保持向后兼容（使用 `id || slug` 作为后备）

## 受影响的组件
- `src/components/layout/Sidebar.tsx` - 侧边栏组件
- `src/components/blog/CategoryBadge.tsx` - 分类徽章组件
- `src/components/blog/PostMeta.tsx` - 文章元数据组件
- `src/components/blog/BlogSearch.tsx` - 博客搜索组件（已正确实现，无需修改）

## 技术细节

### 数据流
```
用户点击侧边栏分类/标签
  ↓
URL 更新 (?category=id 或 ?tags=id)
  ↓
BlogSearch 组件读取 searchParams
  ↓
React Query 调用 getPosts({ categoryId, tagIds })
  ↓
Supabase 数据库查询
  ↓
返回筛选结果并更新 UI
```

### API 兼容性
现有的 `getPosts` API 已经支持 `categoryId` 和 `tagIds` 参数，无需修改后端代码。

## 验证标准
1. 点击侧边栏的分类链接，应正确筛选该分类的文章
2. 点击侧边栏的标签链接，应正确筛选包含该标签的文章
3. 点击文章卡片上的分类徽章，应正确跳转并筛选
4. 点击文章卡片上的标签，应正确跳转并筛选
5. URL 参数应正确反映当前的筛选条件
6. 刷新页面后筛选状态应保持
7. 侧边栏显示的分类文章数量应准确

## 风险评估
- **低风险**：主要是修复现有功能，不涉及新功能开发
- **向后兼容**：使用 `id || slug` 确保旧数据仍能工作
- **性能影响**：侧边栏改为服务器组件后，每次页面加载会查询数据库，但数据量小且可缓存

## 依赖关系
- 依赖现有的 `getCategories()`、`getTags()` 和 `getPosts()` API
- 依赖 BlogSearch 组件的现有实现
- 无需数据库 schema 变更

## 后续优化建议
1. 为侧边栏数据添加缓存机制（React Cache 或 Next.js 缓存）
2. 考虑使用 Suspense 优化加载体验
3. 添加分类和标签的热度排序（按文章数量）
