"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTag } from "../actions";
import { updateTag } from "~/server/actions/tags";
import { generateSlug } from "~/lib/slug";

interface TagFormProps {
  initialData?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function TagForm({ initialData }: TagFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
  });

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
      if (isEdit) {
        const result = await updateTag(initialData.id, formData);
        if (!result.success) {
          toast.error(result.error || "更新失败");
          return;
        }
        toast.success("标签更新成功");
        router.push("/admin/tags");
        router.refresh();
      } else {
        const result = await createTag(formData);
        if (!result.success) {
          toast.error(result.error || "创建失败");
          return;
        }
        toast.success("标签创建成功");
        setFormData({ name: "", slug: "" });
        router.refresh();
      }
    } catch (error) {
      console.error(isEdit ? "更新标签失败:" : "创建标签失败:", error);
      toast.error(isEdit ? "更新失败，请重试" : "创建失败，请重试");
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
        {loading ? (isEdit ? "更新中..." : "创建中...") : (isEdit ? "更新标签" : "创建标签")}
      </button>
    </form>
  );
}
