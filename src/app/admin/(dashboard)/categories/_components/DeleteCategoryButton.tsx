"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "~/lib/supabase";

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `确定要删除分类 "${categoryName}" 吗？关联的文章将被取消分类。`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("Category")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("删除失败:", error);
      alert("删除失败，请重试");
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
