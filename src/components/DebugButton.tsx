"use client";

export default function DebugButton({ content }: { content: string }) {
  return (
    <button
      onClick={() => {
        console.log("Post content:", content);
        console.log("Content type:", typeof content);
        console.log("Content length:", content?.length);
      }}
      className="my-4 rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
    >
      🐛 调试：打印文章内容
    </button>
  );
}
