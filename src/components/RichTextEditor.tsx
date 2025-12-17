"use client";

import { useEffect, useState } from "react";
import type MarkdownIt from "markdown-it";
import type MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const [Editor, setEditor] = useState<typeof MdEditor | null>(null);
  const [mdParser, setMdParser] = useState<MarkdownIt | null>(null);

  useEffect(() => {
    // 动态导入编辑器和 MarkdownIt
    void Promise.all([
      import("react-markdown-editor-lite"),
      import("markdown-it"),
    ]).then(([editorModule, markdownItModule]) => {
      setEditor(() => editorModule.default);
      const md = new markdownItModule.default({
        html: true,
        linkify: true, // 自动转换URL为链接
        typographer: true,
      });
      setMdParser(md);
    });
  }, []);

  const handleEditorChange = ({ text }: { text: string }) => {
    onChange(text);
  };

  if (!Editor || !mdParser) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-lg border border-slate-300 bg-slate-50">
        <div className="text-center">
          <div className="mb-2 text-lg font-medium text-slate-700">
            加载编辑器...
          </div>
          <div className="text-sm text-slate-500">请稍候</div>
        </div>
      </div>
    );
  }

  return (
    <div className="markdown-editor-container">
      <Editor
        value={content}
        style={{ height: "600px" }}
        renderHTML={(text) => mdParser.render(text)}
        onChange={handleEditorChange}
        placeholder="开始输入 Markdown 内容..."
        config={{
          view: {
            menu: true,
            md: true,
            html: true,
          },
          canView: {
            menu: true,
            md: true,
            html: true,
            fullScreen: true,
            hideMenu: false,
          },
        }}
      />
      <style jsx global>{`
        /* 编辑器容器样式 */
        .markdown-editor-container {
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        /* 编辑器主体 */
        .rc-md-editor {
          border: none !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;
        }

        /* 工具栏样式 */
        .rc-md-editor .rc-md-navigation {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 8px;
        }

        .rc-md-editor .button {
          color: #475569;
          transition: all 0.2s;
        }

        .rc-md-editor .button:hover {
          color: #0f172a;
          background-color: #e2e8f0;
        }

        /* 编辑区域 */
        .rc-md-editor .editor-container {
          background-color: #ffffff;
        }

        .rc-md-editor .editor-container > section {
          padding: 16px;
        }

        .rc-md-editor .sec-md .input {
          font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono",
            Consolas, "Courier New", monospace;
          font-size: 14px;
          line-height: 1.6;
          color: #1e293b;
        }

        /* 预览区域样式 */
        .rc-md-editor .custom-html-style {
          padding: 16px;
          background-color: #ffffff;
          font-size: 14px;
          line-height: 1.6;
          color: #1e293b;
        }

        /* Markdown 渲染样式 */
        .custom-html-style h1,
        .custom-html-style h2,
        .custom-html-style h3,
        .custom-html-style h4,
        .custom-html-style h5,
        .custom-html-style h6 {
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.25;
          color: #0f172a;
        }

        .custom-html-style h1 {
          font-size: 2em;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
        }

        .custom-html-style h2 {
          font-size: 1.5em;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
        }

        .custom-html-style h3 {
          font-size: 1.25em;
        }

        .custom-html-style p {
          margin-top: 0;
          margin-bottom: 16px;
        }

        .custom-html-style ul,
        .custom-html-style ol {
          padding-left: 2em;
          margin-bottom: 16px;
        }

        .custom-html-style li {
          margin-bottom: 4px;
        }

        .custom-html-style code {
          padding: 2px 6px;
          margin: 0 2px;
          font-size: 85%;
          background-color: rgba(175, 184, 193, 0.2);
          border-radius: 3px;
          font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono",
            Consolas, "Courier New", monospace;
          color: #ec4899;
        }

        .custom-html-style pre {
          padding: 16px;
          overflow: auto;
          font-size: 85%;
          line-height: 1.45;
          background-color: #1e293b;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .custom-html-style pre code {
          padding: 0;
          margin: 0;
          background-color: transparent;
          color: #f1f5f9;
        }

        .custom-html-style blockquote {
          padding: 0 1em;
          color: #64748b;
          border-left: 4px solid #e2e8f0;
          margin: 0 0 16px 0;
        }

        .custom-html-style blockquote p {
          margin-bottom: 0;
        }

        .custom-html-style a {
          color: #2563eb;
          text-decoration: none;
        }

        .custom-html-style a:hover {
          text-decoration: underline;
        }

        .custom-html-style img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
          margin: 16px 0;
        }

        .custom-html-style hr {
          height: 2px;
          padding: 0;
          margin: 24px 0;
          background-color: #e2e8f0;
          border: 0;
        }

        .custom-html-style table {
          border-spacing: 0;
          border-collapse: collapse;
          margin-bottom: 16px;
          width: 100%;
          overflow: auto;
        }

        .custom-html-style table th,
        .custom-html-style table td {
          padding: 6px 13px;
          border: 1px solid #e2e8f0;
        }

        .custom-html-style table th {
          font-weight: 600;
          background-color: #f8fafc;
        }

        .custom-html-style table tr:nth-child(2n) {
          background-color: #f8fafc;
        }

        /* 全屏模式 */
        .rc-md-editor.full {
          z-index: 9999;
        }
      `}</style>
    </div>
  );
}
