"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "~/lib/supabase";

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

    toast.promise(
      (async () => {
        const { error } = await supabase.from("Post").delete().eq("id", postId);
        if (error) throw error;
        router.refresh();
      })(),
      {
        loading: `正在删除文章 "${postTitle}"...`,
        success: "文章删除成功！",
        error: "删除失败，请重试",
      }
    ).finally(() => {
      setIsDeleting(false);
    });
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
