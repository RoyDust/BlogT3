"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "~/lib/supabase";

export default function TagForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("Tag").insert([formData]);

      if (error) throw error;

      // Reset form
      setFormData({
        name: "",
        slug: "",
      });

      router.refresh();
    } catch (error) {
      console.error("创建标签失败:", error);
      if (error && typeof error === 'object' && 'code' in error && error.code === "23505") {
        alert("标签名称或 Slug 已存在");
      } else {
        alert("创建失败，请重试");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          标签名称
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="JavaScript"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Slug
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, slug: e.target.value }))
          }
          required
          className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="javascript"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "创建中..." : "创建标签"}
      </button>
    </form>
  );
}
