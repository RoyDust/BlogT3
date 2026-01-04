# 技术设计：Markdown 渲染系统

## 上下文

当前项目使用 `markdown-it` 在编辑器中预览 Markdown，但前台展示页面直接使用 `whitespace-pre-line` 显示纯文本。这导致：
- 用户在编辑器中看到的格式化效果与实际发布后的展示不一致
- 无法利用 Markdown 的丰富格式（代码高亮、表格、任务列表等）
- 技术博客的代码示例缺少语法高亮，可读性差

项目已安装：
- `react-markdown@10.1.0` - React Markdown 渲染器
- `remark-gfm@4.0.1` - GitHub Flavored Markdown 支持
- `@tailwindcss/typography@0.5.19` - 优雅的排版样式

需要新增：
- `rehype-highlight` - 代码语法高亮插件

## 目标 / 非目标

### 目标
- 创建统一的 Markdown 渲染组件，在编辑器预览和前台展示中复用
- 支持 GFM 特性（表格、任务列表、删除线、自动链接等）
- 提供代码语法高亮，支持明暗主题自适应
- 使用 Tailwind Typography 提供美观简约的排版样式
- 确保编辑器预览与实际展示一致（所见即所得）

### 非目标
- 不修改编辑器本身的功能（仅更新预览渲染）
- 不引入复杂的 Markdown 扩展（如数学公式、图表等）
- 不改变现有文章的存储格式（仍为纯 Markdown 文本）

## 决策

### 决策 1：使用 react-markdown 而非 markdown-it

**选择**：使用 `react-markdown` 作为统一的渲染引擎

**理由**：
- React 生态原生支持，返回 React 组件而非 HTML 字符串
- 更好的安全性（默认不渲染危险的 HTML）
- 插件生态丰富（remark/rehype 生态系统）
- 与项目的 React 19 + Next.js 15 技术栈完美集成
- 已在项目依赖中，无需额外安装

**替代方案**：
- 继续使用 `markdown-it`：需要使用 `dangerouslySetInnerHTML`，安全性较低，且与 React 集成不够优雅
- 使用 `marked`：功能较基础，插件生态不如 remark/rehype 丰富

### 决策 2：使用 rehype-highlight 进行代码高亮

**选择**：使用 `rehype-highlight` + `highlight.js`

**理由**：
- 与 react-markdown 的 rehype 插件系统无缝集成
- 支持 190+ 编程语言的语法高亮
- 提供多种内置主题，支持明暗模式切换
- 在构建时或运行时高亮均可，性能优秀
- 社区成熟，文档完善

**替代方案**：
- `prism-react-renderer`：需要手动处理代码块，集成复杂度较高
- `react-syntax-highlighter`：包体积较大，且与 react-markdown 集成不够直接

### 决策 3：使用 @tailwindcss/typography 提供基础样式

**选择**：使用 `@tailwindcss/typography` 插件的 `prose` 类

**理由**：
- 项目已安装该插件，无需额外依赖
- 提供开箱即用的优雅排版样式
- 支持明暗模式（`prose-invert`）
- 可通过 Tailwind 配置自定义样式
- 与项目的 Tailwind CSS 4.0 完美集成
- 美观简约，符合现代设计趋势

**配置**：
- 使用 `prose prose-lg` 提供大号舒适的阅读体验
- 使用 `dark:prose-invert` 支持暗色模式
- 使用 `max-w-none` 避免宽度限制
- 通过自定义 CSS 变量适配项目主题色调系统

## 架构设计

### 组件结构

```
src/components/blog/
└── MarkdownContent.tsx    # 统一的 Markdown 渲染组件
```

**MarkdownContent 组件职责**：
- 接收 Markdown 字符串作为输入
- 使用 react-markdown + remark-gfm + rehype-highlight 渲染
- 应用 Tailwind Typography 样式
- 支持明暗主题自适应
- 提供可选的自定义组件映射（如自定义链接、图片处理）

### 集成点

1. **文章详情页** (`src/app/(public)/post/[slug]/page.tsx`)
   - 替换当前的 `whitespace-pre-line` 文本展示
   - 使用 `<MarkdownContent content={post.content} />` 渲染文章内容

2. **编辑器预览** (`src/components/RichTextEditor.tsx`)
   - 替换 `markdown-it` 的 `renderHTML` 方法
   - 使用 `<MarkdownContent content={text} />` 保持预览与展示一致

### 代码高亮主题策略

**明亮模式**：使用 `github` 或 `atom-one-light` 主题
**暗色模式**：使用 `github-dark` 或 `atom-one-dark` 主题

**实现方式**：

#### 方案 1：全局样式导入（推荐）
在 `src/app/globals.css` 或 `src/styles/globals.css` 中导入主题 CSS：

```css
/* 明亮模式主题 */
@import 'highlight.js/styles/github.css' layer(highlight-light);

/* 暗色模式主题 */
@media (prefers-color-scheme: dark) {
  @import 'highlight.js/styles/github-dark.css' layer(highlight-dark);
}

/* 或使用类名切换（配合 next-themes） */
:root {
  @import 'highlight.js/styles/github.css';
}

.dark {
  @import 'highlight.js/styles/github-dark.css';
}
```

#### 方案 2：动态导入
在 `src/app/layout.tsx` 中根据主题动态导入：

```typescript
import 'highlight.js/styles/github.css';
// 或在客户端组件中使用 useTheme 动态切换
```

**关键点**：
- `rehype-highlight` 只添加 CSS 类名，不包含样式
- **必须**手动导入 highlight.js 的 CSS 主题文件才能显示颜色
- 推荐使用方案 1，通过 CSS 媒体查询或类名自动切换主题

### 组件实现示例

**MarkdownContent 组件基本结构**：

```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

**全局样式配置**（`src/app/globals.css`）：

```css
/* 导入 highlight.js 主题 */
@import 'highlight.js/styles/github.css';

/* 暗色模式主题 */
.dark {
  @import 'highlight.js/styles/github-dark.css';
}

/* 或使用媒体查询 */
@media (prefers-color-scheme: dark) {
  @import 'highlight.js/styles/github-dark.css';
}
```

## 风险 / 权衡

### 风险 1：包体积增加
- **风险**：`rehype-highlight` 和 `highlight.js` 会增加客户端包体积
- **缓解措施**：
  - 仅导入需要的语言支持（按需加载）
  - 使用 Next.js 的代码分割自动优化
  - 考虑使用 `lowlight`（highlight.js 的轻量级版本）

### 风险 2：编辑器预览性能
- **风险**：在编辑器中实时渲染 Markdown 可能影响输入性能
- **缓解措施**：
  - 使用防抖（debounce）延迟渲染
  - 考虑使用 `useMemo` 缓存渲染结果
  - 如果性能问题严重，编辑器预览可保留 `markdown-it`，仅前台使用 `react-markdown`

### 风险 3：XSS 安全性
- **风险**：用户输入的 Markdown 可能包含恶意脚本
- **缓解措施**：
  - `react-markdown` 默认不渲染 HTML 标签，安全性较高
  - 不启用 `rehype-raw` 插件（该插件允许渲染原始 HTML）
  - 管理员权限控制确保只有可信用户可以发布内容

## 迁移计划

### 阶段 1：创建新组件
1. 安装 `rehype-highlight` 依赖
2. 创建 `MarkdownContent` 组件
3. 配置代码高亮主题样式

### 阶段 2：更新文章详情页
1. 在文章详情页引入 `MarkdownContent` 组件
2. 替换现有的文本展示逻辑
3. 测试各种 Markdown 语法的渲染效果

### 阶段 3：更新编辑器预览
1. 修改 `RichTextEditor` 组件的 `renderHTML` 方法
2. 使用 `MarkdownContent` 替代 `markdown-it`
3. 测试编辑器预览性能和一致性

### 阶段 4：样式优化
1. 根据实际效果调整 Typography 配置
2. 优化代码高亮主题与整体设计的协调性
3. 确保响应式设计在移动端的表现

### 回滚策略
- 保留原有的渲染逻辑作为备份
- 通过功能开关控制新旧渲染方式
- 如果出现严重问题，可快速回退到 `whitespace-pre-line` 展示

## 待决问题

1. **代码高亮主题选择**：需要在实际效果中选择最适合的明暗主题组合
2. **编辑器预览性能**：需要实际测试后决定是否需要防抖或保留 `markdown-it`
3. **自定义组件映射**：是否需要自定义链接、图片等元素的渲染方式
