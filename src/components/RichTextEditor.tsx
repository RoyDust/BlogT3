"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useMemo } from "react";
import TurndownService from "turndown";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  // 创建 TurndownService 实例用于 HTML 转 Markdown
  const turndownService = useMemo(() => {
    const service = new TurndownService({
      headingStyle: "atx", // 使用 # 风格的标题
      hr: "---",
      bulletListMarker: "-",
      codeBlockStyle: "fenced", // 使用 ``` 风格的代码块
      fence: "```",
      emDelimiter: "*",
      strongDelimiter: "**",
      linkStyle: "inlined",
    });
    return service;
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Placeholder.configure({
        placeholder: "开始输入内容... 支持 Markdown 快捷键",
      }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none min-h-[400px] px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
  });

  // 当 content prop 改变时更新编辑器
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentHtml = editor.getHTML();
      const currentMarkdown = turndownService.turndown(currentHtml);
      // 只有当内容真的不同时才更新
      if (content !== currentMarkdown) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [content, editor, turndownService]);

  if (!editor) {
    return <div className="animate-pulse">加载编辑器...</div>;
  }

  return (
    <div className="rounded-lg border border-slate-300 bg-white">
      {/* 工具栏 */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
        {/* 标题 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            editor.isActive("heading", { level: 1 })
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
          title="标题 1 (输入 # 然后空格)"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
          title="标题 2 (输入 ## 然后空格)"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
          title="标题 3 (输入 ### 然后空格)"
        >
          H3
        </button>

        <div className="mx-1 w-px bg-slate-300" />

        {/* 文本样式 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-3 py-1 text-sm font-bold transition-colors ${
            editor.isActive("bold")
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
          title="粗体 (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded px-3 py-1 text-sm italic transition-colors ${
            editor.isActive("italic")
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
          title="斜体 (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`rounded px-3 py-1 text-sm line-through transition-colors ${
            editor.isActive("strike")
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
          title="删除线"
        >
          S
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`rounded px-3 py-1 text-sm font-mono transition-colors ${
            editor.isActive("code")
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
          title="行内代码"
        >
          `code`
        </button>

        <div className="mx-1 w-px bg-slate-300" />

        {/* 列表 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-3 py-1 text-sm transition-colors ${
            editor.isActive("bulletList")
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
          title="无序列表 (输入 - 然后空格)"
        >
          • 列表
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded px-3 py-1 text-sm transition-colors ${
            editor.isActive("orderedList")
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
          title="有序列表 (输入 1. 然后空格)"
        >
          1. 列表
        </button>

        <div className="mx-1 w-px bg-slate-300" />

        {/* 其他 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`rounded px-3 py-1 text-sm transition-colors ${
            editor.isActive("blockquote")
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
          title="引用 (输入 > 然后空格)"
        >
          &ldquo; 引用
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`rounded px-3 py-1 text-sm font-mono transition-colors ${
            editor.isActive("codeBlock")
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
          title="代码块 (输入 ``` 然后空格)"
        >
          {"</>"}
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="rounded bg-white px-3 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-100"
          title="分割线 (输入 --- 然后回车)"
        >
          ─ 分割线
        </button>

        <div className="mx-1 w-px bg-slate-300" />

        {/* 链接和图片 */}
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("输入链接地址:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`rounded px-3 py-1 text-sm transition-colors ${
            editor.isActive("link")
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-100"
          }`}
          title="链接"
        >
          🔗 链接
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("输入图片地址:");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="rounded bg-white px-3 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-100"
          title="图片"
        >
          🖼️ 图片
        </button>

        <div className="mx-1 w-px bg-slate-300" />

        {/* 撤销/重做 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="rounded bg-white px-3 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-30"
          title="撤销 (Ctrl+Z)"
        >
          ↶ 撤销
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="rounded bg-white px-3 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-30"
          title="重做 (Ctrl+Y)"
        >
          ↷ 重做
        </button>
      </div>

      {/* 编辑器内容 */}
      <EditorContent editor={editor} />

      {/* 提示信息 */}
      <div className="border-t border-slate-200 bg-slate-50 p-2 text-xs text-slate-500">
        <div className="mb-1 font-medium">💡 Markdown 快捷输入（输入后按空格）:</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 md:grid-cols-3">
          <div><code className="text-[10px]"># 空格</code> → 一级标题</div>
          <div><code className="text-[10px]">## 空格</code> → 二级标题</div>
          <div><code className="text-[10px]">### 空格</code> → 三级标题</div>
          <div><code className="text-[10px]">**文本**</code> → 粗体</div>
          <div><code className="text-[10px]">*文本*</code> → 斜体</div>
          <div><code className="text-[10px]">~~文本~~</code> → 删除线</div>
          <div><code className="text-[10px]">`代码`</code> → 行内代码</div>
          <div><code className="text-[10px]">- 空格</code> → 无序列表</div>
          <div><code className="text-[10px]">1. 空格</code> → 有序列表</div>
          <div><code className="text-[10px]">&gt; 空格</code> → 引用块</div>
          <div><code className="text-[10px]">``` 空格</code> → 代码块</div>
          <div><code className="text-[10px]">--- 回车</code> → 分割线</div>
        </div>
        <div className="mt-2 text-[10px] text-slate-400">
          ✓ 保存格式：Markdown | 编辑模式：富文本（所见即所得）
        </div>
      </div>
    </div>
  );
}
