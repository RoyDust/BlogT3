"use client";

import { useState, useEffect, useRef } from "react";
import { getTags } from "~/server/actions/tags";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export default function TagSelector({ selectedTagIds, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadTags() {
      const result = await getTags();
      if (result.success && result.data) {
        setTags(result.data);
      }
    }
    void loadTags();
  }, []);

  // 点击外部关闭下拉
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = tags.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedTagIds.includes(t.id)
  );

  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  const handleSelect = (tagId: string) => {
    onChange([...selectedTagIds, tagId]);
    setSearch("");
  };

  const handleRemove = (tagId: string) => {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  return (
    <div ref={ref} className="relative">
      {/* 已选标签 */}
      {selectedTags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemove(tag.id)}
                className="ml-0.5 text-blue-400 hover:text-blue-600"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 搜索输入 */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="搜索标签..."
        className="block w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {selectedTagIds.length > 0 && (
        <p className="mt-1 text-xs text-slate-500">
          已选 {selectedTagIds.length} 个标签
        </p>
      )}

      {/* 下拉列表 */}
      {open && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {filtered.length > 0 ? (
            filtered.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleSelect(tag.id)}
                className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50"
              >
                {tag.name}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-slate-500">
              {search ? "未找到匹配标签" : "没有更多标签"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
