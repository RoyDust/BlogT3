"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCategory } from "../actions";
import { updateCategory } from "~/server/actions/categories";

interface CategoryFormProps {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string;
  };
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    color: initialData?.color ?? "#3B82F6",
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
      if (isEdit) {
        const result = await updateCategory(initialData.id, formData);
        if (!result.success) {
          toast.error(result.error || "更新失败");
          return;
        }
        toast.success("分类更新成功");
        router.push("/admin/categories");
        router.refresh();
      } else {
        const result = await createCategory(formData);
        if (!result.success) {
          toast.error(result.error || "创建失败");
          return;
        }
        toast.success("分类创建成功");
        setFormData({ name: "", slug: "", description: "", color: "#3B82F6" });
        router.refresh();
      }
    } catch (error) {
      console.error(isEdit ? "更新分类失败:" : "创建分类失败:", error);
      toast.error(isEdit ? "更新失败，请重试" : "创建失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          分类名称
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="技术"
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
          placeholder="tech"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          描述
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={2}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="分类描述（可选）"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          颜色
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="color"
            value={formData.color}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, color: e.target.value }))
            }
            className="h-10 w-16 rounded border border-slate-300"
          />
          <input
            type="text"
            value={formData.color}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, color: e.target.value }))
            }
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#3B82F6"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? (isEdit ? "更新中..." : "创建中...") : (isEdit ? "更新分类" : "创建分类")}
      </button>
    </form>
  );
}
