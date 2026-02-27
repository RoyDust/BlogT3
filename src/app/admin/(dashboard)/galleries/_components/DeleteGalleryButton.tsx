"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteGallery } from "~/server/actions/galleries";

interface DeleteGalleryButtonProps {
  galleryId: string;
  galleryTitle: string;
  imageCount: number;
}

export default function DeleteGalleryButton({
  galleryId,
  galleryTitle,
  imageCount,
}: DeleteGalleryButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteGallery(galleryId);
      if (!result.success) {
        toast.error(result.error || "删除失败，请重试");
      } else {
        toast.success("相册删除成功");
        router.refresh();
      }
    } catch {
      toast.error("删除失败，请重试");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="rounded bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
      >
        删除
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              确认删除相册
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              确定要删除相册「{galleryTitle}」吗？该相册包含 {imageCount} 张图片。
            </p>
            <p className="mt-1 text-sm font-medium text-red-600">
              此操作不可撤销，所有图片记录将被永久删除。
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "删除中..." : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
