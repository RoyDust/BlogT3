"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "~/lib/supabase";
import ImageUpload from "~/components/admin/ImageUpload";
import GalleryImageManager from "~/components/admin/GalleryImageManager";
import { Trash2, GripVertical } from "lucide-react";

interface PendingImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export default function GalleryEditorPage({
  params,
}: {
  params: Promise<{ id?: string }> | { id?: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [galleryId, setGalleryId] = useState<string | undefined>(undefined);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    coverImage: "",
    location: "",
    captureDate: "",
    status: "DRAFT",
  });

  // 处理 params（可能是 Promise）
  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await Promise.resolve(params);
      if (resolvedParams.id) {
        setGalleryId(resolvedParams.id);
      }
    }
    void loadParams();
  }, [params]);

  // 如果是编辑模式，加载相册数据
  useEffect(() => {
    if (galleryId) {
      async function loadGallery() {
        const { data } = await supabase
          .from("PhotoGallery")
          .select("*")
          .eq("id", galleryId)
          .single();

        if (data) {
          setFormData({
            title: data.title ?? "",
            slug: data.slug ?? "",
            description: data.description ?? "",
            coverImage: data.coverImage ?? "",
            location: data.location ?? "",
            captureDate: data.captureDate
              ? new Date(data.captureDate).toISOString().split("T")[0]
              : "",
            status: data.status ?? "DRAFT",
          });
        }
      }
      void loadGallery();
    }
  }, [galleryId]);

  const generateSlug = (title: string) => {
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

  // 处理新建模式下的图片上传
  const handlePendingImageUpload = (url: string) => {
    const newImage: PendingImage = {
      id: `temp-${Date.now()}`,
      url,
      alt: "",
      sortOrder: pendingImages.length,
    };
    setPendingImages((prev) => [...prev, newImage]);
  };

  // 处理多选图片上传
  const handleMultipleImageUpload = (urls: string[]) => {
    const newImages: PendingImage[] = urls.map((url, index) => ({
      id: `temp-${Date.now()}-${index}`,
      url,
      alt: "",
      sortOrder: pendingImages.length + index,
    }));
    setPendingImages((prev) => [...prev, ...newImages]);
  };

  // 删除待上传的图片
  const handleRemovePendingImage = (id: string) => {
    setPendingImages((prev) => prev.filter((img) => img.id !== id));
  };

  // 更新待上传图片的描述
  const handleUpdatePendingImageAlt = (id: string, alt: string) => {
    setPendingImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, alt } : img)),
    );
  };

  const handleSubmit = async (e: React.FormEvent, status: string) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 获取第一个用户作为作者
      let authorId = "default-author-id";
      const { data: users } = await supabase.from("User").select("id").limit(1);

      if (users && users.length > 0 && users[0]) {
        authorId = users[0].id;
      }

      const galleryData = {
        ...formData,
        status,
        authorId,
        publishedAt: status === "PUBLISHED" ? new Date().toISOString() : null,
        captureDate: formData.captureDate || null,
        imageCount: galleryId ? undefined : pendingImages.length, // 新建时设置图片数量
      };

      let finalGalleryId = galleryId;

      if (galleryId) {
        // 更新相册
        const { error } = await supabase
          .from("PhotoGallery")
          .update(galleryData)
          .eq("id", galleryId);

        if (error) throw error;
      } else {
        // 创建新相册
        const { data, error } = await supabase
          .from("PhotoGallery")
          .insert([galleryData])
          .select()
          .single();

        if (error) throw error;
        finalGalleryId = data.id;

        // 如果有待上传的图片，批量插入
        if (pendingImages.length > 0) {
          const imageInserts = pendingImages.map((img) => ({
            galleryId: finalGalleryId,
            url: img.url,
            thumbnail: img.url,
            alt: img.alt || null,
            sortOrder: img.sortOrder,
          }));

          const { error: imagesError } = await supabase
            .from("PhotoImage")
            .insert(imageInserts);

          if (imagesError) throw imagesError;
        }
      }

      router.push("/admin/galleries");
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
          {galleryId ? "编辑相册" : "新建相册"}
        </h1>
      </div>

      <form className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Left 2/3 */}
          <div className="space-y-6 lg:col-span-2">
            {/* Title */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <label className="block text-sm font-medium text-slate-700">
                相册标题
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-3 text-lg font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="输入相册标题..."
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
                placeholder="gallery-slug"
                required
              />
              <p className="mt-1 text-sm text-slate-500">
                相册的 URL 路径，例如: /photography/
                {formData.slug || "gallery-slug"}
              </p>
            </div>

            {/* Description */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <label className="block text-sm font-medium text-slate-700">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="简短描述相册内容..."
              />
            </div>

            {/* Location */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <label className="block text-sm font-medium text-slate-700">
                拍摄地点
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="例如：北京·故宫"
              />
            </div>

            {/* Capture Date */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <label className="block text-sm font-medium text-slate-700">
                拍摄日期
              </label>
              <input
                type="date"
                value={formData.captureDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    captureDate: e.target.value,
                  }))
                }
                className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  onClick={(e) => handleSubmit(e, "DRAFT")}
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {loading ? "保存中..." : "保存草稿"}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "PUBLISHED")}
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "发布中..." : "发布相册"}
                </button>
              </div>
            </div>

            {/* Cover Image */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <label className="block text-sm font-medium text-slate-700">
                封面图片
              </label>
              <div className="mt-2">
                <ImageUpload
                  value={formData.coverImage}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, coverImage: url }))
                  }
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                支持 JPG、PNG、GIF、WebP，最大 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Images */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            相册图片管理
          </h2>

          {galleryId ? (
            // 编辑模式：使用 GalleryImageManager 组件
            <GalleryImageManager galleryId={galleryId} />
          ) : (
            // 新建模式：使用本地状态管理图片
            <div className="space-y-6">
              {/* 上传区域 */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-slate-700">
                  上传新图片
                </h3>
                <ImageUpload
                  value=""
                  onChange={handlePendingImageUpload}
                  multiple={true}
                  onMultipleChange={handleMultipleImageUpload}
                />
              </div>

              {/* 图片列表 */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-slate-700">
                  图片列表 ({pendingImages.length} 张)
                </h3>

                {pendingImages.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-600">
                    暂无图片，请上传第一张图片
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pendingImages.map((image) => (
                      <div
                        key={image.id}
                        className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white"
                      >
                        {/* 图片 */}
                        <div className="aspect-video w-full overflow-hidden bg-slate-100">
                          <img
                            src={image.url}
                            alt={image.alt || ""}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* 信息和操作 */}
                        <div className="p-3">
                          <input
                            type="text"
                            value={image.alt}
                            onChange={(e) =>
                              handleUpdatePendingImageAlt(
                                image.id,
                                e.target.value,
                              )
                            }
                            placeholder="图片描述（可选）"
                            className="w-full rounded border border-slate-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                          />

                          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                            <span>排序: {image.sortOrder}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePendingImage(image.id)}
                              className="flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-red-600 transition-colors hover:bg-red-100"
                            >
                              <Trash2 className="h-3 w-3" />
                              删除
                            </button>
                          </div>
                        </div>

                        {/* 拖拽手柄（预留） */}
                        <div className="absolute top-2 left-2 cursor-move rounded bg-white/80 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                          <GripVertical className="h-4 w-4 text-slate-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                💡
                提示：图片已上传到七牛云，点击&ldquo;保存草稿&rdquo;或&ldquo;发布相册&rdquo;后将保存到数据库
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
