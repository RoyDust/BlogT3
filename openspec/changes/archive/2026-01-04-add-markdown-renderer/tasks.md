# 实施任务清单

## 1. 环境准备

- [x] 1.1 安装 `rehype-highlight` 依赖包
  ```bash
  pnpm add rehype-highlight
  ```
- [x] 1.2 验证现有依赖版本（`react-markdown`, `remark-gfm`, `@tailwindcss/typography`）

## 2. 创建 Markdown 渲染组件

- [x] 2.1 创建 `src/components/blog/MarkdownContent.tsx` 组件文件
- [x] 2.2 实现基础组件结构，接收 `content` 属性
- [x] 2.3 配置 `react-markdown` 使用 `remark-gfm` 插件
- [x] 2.4 配置 `rehype-highlight` 插件进行代码高亮
- [x] 2.5 应用 Tailwind Typography 样式类（`prose prose-lg dark:prose-invert max-w-none`）
- [x] 2.6 实现自定义组件映射（链接添加 `rel` 和 `target` 属性）

## 3. 配置代码高亮样式

- [x] 3.1 选择合适的代码高亮主题（推荐：明亮模式用 `github`，暗色模式用 `github-dark`）
- [x] 3.2 在全局样式文件（`src/app/globals.css` 或 `src/styles/globals.css`）中导入 highlight.js 主题 CSS
  ```css
  /* 方案 1：使用媒体查询 */
  @import 'highlight.js/styles/github.css';
  @media (prefers-color-scheme: dark) {
    @import 'highlight.js/styles/github-dark.css';
  }

  /* 方案 2：使用类名切换（配合 next-themes） */
  :root { @import 'highlight.js/styles/github.css'; }
  .dark { @import 'highlight.js/styles/github-dark.css'; }
  ```
- [x] 3.3 验证 CSS 导入成功（检查浏览器开发者工具中是否加载了 highlight.js 样式）
- [x] 3.4 测试代码高亮在明暗模式下的显示效果

## 4. 更新文章详情页

- [x] 4.1 在 `src/app/(public)/post/[slug]/page.tsx` 中导入 `MarkdownContent` 组件
- [x] 4.2 替换现有的 `whitespace-pre-line` 文本展示为 `<MarkdownContent content={post.content} />`
- [x] 4.3 移除不再需要的 `prose` 相关类名（已在组件内部应用）
- [x] 4.4 测试文章详情页的渲染效果
- [x] 4.5 验证响应式设计在移动端的表现

## 5. 更新编辑器预览

- [x] 5.1 在 `src/components/RichTextEditor.tsx` 中导入 `MarkdownContent` 组件
- [x] 5.2 修改编辑器配置，将预览渲染从 `markdown-it` 切换到 `MarkdownContent`
- [x] 5.3 调整编辑器预览区域的样式以适配新的渲染组件
- [x] 5.4 测试编辑器预览的实时更新性能
- [x] 5.5 验证预览效果与前台展示的一致性（所见即所得）

## 6. 功能测试

- [x] 6.1 测试基础 Markdown 语法渲染（标题、段落、列表、粗体、斜体、链接、图片）
- [x] 6.2 测试 GFM 特性渲染（表格、任务列表、删除线、自动链接）
- [x] 6.3 测试代码块语法高亮（多种编程语言）
- [x] 6.4 测试行内代码的显示效果
- [x] 6.5 测试明暗主题切换时的样式适配
- [x] 6.6 测试外部链接的安全属性（`rel` 和 `target`）
- [x] 6.7 测试 HTML 标签的安全过滤（确保不渲染原始 HTML）

## 7. 性能优化（可选）

- [x] 7.1 评估编辑器预览的性能表现
- [x] 7.2 如需要，实现防抖（debounce）延迟渲染
- [x] 7.3 如需要，使用 `useMemo` 缓存渲染结果
- [x] 7.4 评估包体积，考虑按需加载语言支持

## 8. 文档和清理

- [x] 8.1 更新项目文档，说明 Markdown 渲染的使用方式
- [x] 8.2 移除不再使用的 `markdown-it` 相关代码（如果完全替换）
- [x] 8.3 运行 `pnpm check` 确保代码质量
- [x] 8.4 运行 `pnpm build` 确保构建成功

## 依赖关系说明

- 任务 2 必须在任务 1 完成后进行
- 任务 3 可以与任务 2 并行进行
- 任务 4 和任务 5 依赖任务 2 和任务 3 完成
- 任务 6 依赖任务 4 和任务 5 完成
- 任务 7 和任务 8 在所有功能完成后进行
