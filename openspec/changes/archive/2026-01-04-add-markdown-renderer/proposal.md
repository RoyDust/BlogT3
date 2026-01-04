# 变更：添加统一的 Markdown 渲染系统

## 为什么

当前博客系统存在以下问题：
1. **编辑器与展示不一致**：管理后台使用 `markdown-it` 进行预览，但前台文章展示页面直接使用 `whitespace-pre-line` 显示纯文本，导致 Markdown 格式无法正确渲染
2. **缺少代码高亮**：文章中的代码块没有语法高亮，影响技术博客的阅读体验
3. **样式不统一**：编辑器预览样式与实际展示样式不一致，所见非所得
4. **功能受限**：无法支持 GitHub Flavored Markdown (GFM) 特性，如表格、任务列表、删除线等

需要引入一个统一的、功能完善的 Markdown 渲染方案，提升内容展示质量和用户体验。

## 变更内容

- 引入 `react-markdown` + `remark-gfm` + `rehype-highlight` + `@tailwindcss/typography` 技术栈
- 创建统一的 `MarkdownContent` 组件用于渲染 Markdown 内容
- 更新文章详情页使用新的 Markdown 渲染组件
- 更新编辑器预览使用相同的渲染逻辑，确保所见即所得
- 配置代码高亮主题，支持明暗模式自适应
- 应用 Tailwind Typography 插件提供优雅的排版样式

## 影响

- **受影响规范**：新增 `markdown-rendering` 功能规范
- **受影响代码**：
  - `src/components/RichTextEditor.tsx` - 需要更新预览渲染逻辑
  - `src/app/(public)/post/[slug]/page.tsx` - 需要使用新的渲染组件
  - `src/components/blog/MarkdownContent.tsx` - 新建组件
  - `src/styles/markdown.css` - 新建样式文件（可选）
  - `package.json` - 需要添加 `rehype-highlight` 依赖（其他依赖已存在）
- **用户体验提升**：文章展示更加美观，代码高亮提升可读性，支持更丰富的 Markdown 语法
- **向后兼容**：现有文章内容无需修改，自动获得更好的渲染效果
