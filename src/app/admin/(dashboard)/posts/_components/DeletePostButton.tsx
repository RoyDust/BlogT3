"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deletePost } from "~/server/actions/posts";

export default function DeletePostButton({
  postId,
  postTitle,
}: {
  postId: string;
  postTitle: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deletePost(postId);

      if (!result.success) {
        toast.error(result.error || "删除失败，请重试");
      } else {
        toast.success("文章删除成功！");
        router.refresh();
      }
    } catch (error) {
      toast.error("删除失败，请重试");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
    >
      {isDeleting ? "删除中..." : "删除"}
    </button>
  );
}
