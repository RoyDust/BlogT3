"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "~/lib/supabase";
import dynamic from "next/dynamic";

// 动态导入 RichTextEditor（避免 SSR 问题）
const RichTextEditor = dynamic(() => import("~/components/RichTextEditor"), {
  ssr: false,
});

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function PostEditorPage({
  params,
}: {
  params: Promise<{ id?: string }> | { id?: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [postId, setPostId] = useState<string | undefined>(undefined);

  // 处理 params（可能是 Promise）
  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await Promise.resolve(params);
      if (resolvedParams.id) {
        setPostId(resolvedParams.id);
      }
    }
    loadParams();
  }, [params]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    cover_image: "",
    category_id: "",
    status: "draft",
  });

  // 加载分类
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (data) setCategories(data);
    }
    loadCategories();
  }, []);

  // 如果是编辑模式，加载文章数据
  useEffect(() => {
    if (postId) {
      async function loadPost() {
        const { data } = await supabase
          .from("posts")
          .select("*")
          .eq("id", postId)
          .single();

        if (data) {
          setFormData({
            title: data.title || "",
            slug: data.slug || "",
            content: data.content || "",
            excerpt: data.excerpt || "",
            cover_image: data.cover_image || "",
            category_id: data.category_id || "",
            status: data.status || "draft",
          });
        }
      }
      loadPost();
    }
  }, [postId]);

  const generateSlug = (title: string) => {
    // 简单的 slug 生成，可以使用库如 slugify 来改进
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent, status: string) => {
    e.preventDefault();
    setLoading(true);

    try {
      const postData = {
        ...formData,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      };

      console.log(postData);

      if (postId) {
        // 更新文章
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", postId);

        if (error) throw error;
      } else {
        // 创建新文章
        const { error } = await supabase.from("posts").insert([postData]);
        if (error) throw error;
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (error) {
      console.error("保存失败:", error);
      alert("保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          {postId ? "编辑文章" : "新建文章"}
        </h1>
      </div>

      <form className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Left 2/3 */}
          <div className="space-y-6 lg:col-span-2">
            {/* Title */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <label className="block text-sm font-medium text-slate-700">
                标题
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-3 text-lg font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="输入文章标题..."
                required
              />
            </div>

            {/* Slug */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <label className="block text-sm font-medium text-slate-700">
                URL Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="article-slug"
                required
              />
              <p className="mt-1 text-sm text-slate-500">
                文章的 URL 路径，例如: /post/{formData.slug || "article-slug"}
              </p>
            </div>

            {/* Excerpt */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <label className="block text-sm font-medium text-slate-700">
                摘要
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                rows={3}
                className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="简短描述文章内容..."
              />
            </div>

            {/* Content */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                内容
              </label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
              />
            </div>
          </div>

          {/* Sidebar - Right 1/3 */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="font-medium text-slate-900">发布</h3>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "draft")}
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {loading ? "保存中..." : "保存草稿"}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "published")}
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "发布中..." : "发布文章"}
                </button>
              </div>
            </div>

            {/* Category */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <label className="block text-sm font-medium text-slate-700">
                分类
              </label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category_id: e.target.value,
                  }))
                }
                className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cover Image */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <label className="block text-sm font-medium text-slate-700">
                封面图片
              </label>
              <input
                type="url"
                value={formData.cover_image}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cover_image: e.target.value,
                  }))
                }
                className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="https://example.com/image.jpg"
              />
              {formData.cover_image && (
                <div className="mt-3">
                  <img
                    src={formData.cover_image}
                    alt="封面预览"
                    className="rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3E图片加载失败%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
