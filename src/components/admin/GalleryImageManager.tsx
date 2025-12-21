"use client";

import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import ImageUpload from "~/components/admin/ImageUpload";
import { Trash2, GripVertical } from "lucide-react";

interface PhotoImage {
  id: string;
  url: string;
  thumbnail: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  createdAt: string;
}

interface GalleryImageManagerProps {
  galleryId: string;
  onImageCountChange?: (count: number) => void;
}

export default function GalleryImageManager({
  galleryId,
  onImageCountChange,
}: GalleryImageManagerProps) {
  const [images, setImages] = useState<PhotoImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (galleryId) {
      void loadImages();
    }
  }, [galleryId]);

  const loadImages = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("PhotoImage")
        .select("*")
        .eq("galleryId", galleryId)
        .order("sortOrder", { ascending: true });

      if (error) throw error;
      setImages(data || []);

      if (onImageCountChange) {
        onImageCountChange(data?.length || 0);
      }
    } catch (error) {
      console.error("加载图片失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (url: string) => {
    try {
      setUploading(true);

      // 获取当前最大的 sortOrder
      const maxSortOrder =
        images.length > 0
          ? Math.max(...images.map((img) => img.sortOrder))
          : -1;

      // 插入新图片
      const { data, error } = await supabase
        .from("PhotoImage")
        .insert([
          {
            galleryId,
            url,
            thumbnail: url, // 暂时使用原图作为缩略图
            alt: null,
            sortOrder: maxSortOrder + 1,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 更新相册的图片数量
      await supabase
        .from("PhotoGallery")
        .update({ imageCount: images.length + 1 })
        .eq("id", galleryId);

      // 重新加载图片列表
      await loadImages();

      alert("图片上传成功！");
    } catch (error) {
      console.error("上传失败:", error);
      alert("上传失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("确定要删除这张图片吗？")) return;

    try {
      const { error } = await supabase
        .from("PhotoImage")
        .delete()
        .eq("id", imageId);

      if (error) throw error;

      // 更新相册的图片数量
      await supabase
        .from("PhotoGallery")
        .update({ imageCount: images.length - 1 })
        .eq("id", galleryId);

      // 重新加载图片列表
      await loadImages();

      alert("图片删除成功！");
    } catch (error) {
      console.error("删除失败:", error);
      alert("删除失败，请重试");
    }
  };

  const handleUpdateAlt = async (imageId: string, alt: string) => {
    try {
      const { error } = await supabase
        .from("PhotoImage")
        .update({ alt })
        .eq("id", imageId);

      if (error) throw error;

      // 更新本地状态
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, alt } : img))
      );
    } catch (error) {
      console.error("更新失败:", error);
      alert("更新失败，请重试");
    }
  };

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-slate-600">加载图片中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 上传区域 */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-slate-700">上传新图片</h3>
        <ImageUpload value="" onChange={handleImageUpload} />
        {uploading && (
          <p className="mt-2 text-sm text-blue-600">正在保存图片...</p>
        )}
      </div>

      {/* 图片列表 */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-slate-700">
          图片列表 ({images.length} 张)
        </h3>

        {images.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-600">
            暂无图片，请上传第一张图片
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
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
                    value={image.alt || ""}
                    onChange={(e) => handleUpdateAlt(image.id, e.target.value)}
                    placeholder="图片描述（可选）"
                    className="w-full rounded border border-slate-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                  />

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>排序: {image.sortOrder}</span>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-red-600 transition-colors hover:bg-red-100"
                    >
                      <Trash2 className="h-3 w-3" />
                      删除
                    </button>
                  </div>
                </div>

                {/* 拖拽手柄（预留） */}
                <div className="absolute left-2 top-2 cursor-move rounded bg-white/80 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <GripVertical className="h-4 w-4 text-slate-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
