"use client";

import { useState } from "react";
import { toast } from "sonner";

interface BatchActionsProps {
  selectedIds: string[];
  onDelete: (ids: string[]) => Promise<{ success: boolean; error?: string }>;
  onUpdateStatus?: (
    ids: string[],
    status: string
  ) => Promise<{ success: boolean; error?: string }>;
  onClear: () => void;
  onRefresh: () => void;
}

export default function BatchActions({
  selectedIds,
  onDelete,
  onUpdateStatus,
  onClear,
  onRefresh,
}: BatchActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleBatchDelete = async () => {
    setLoading(true);
    try {
      const result = await onDelete(selectedIds);
      if (result.success) {
        toast.success(`成功删除 ${selectedIds.length} 项`);
        onClear();
        onRefresh();
      } else {
        toast.error(result.error || "批量删除失败");
      }
    } catch {
      toast.error("批量删除失败");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!onUpdateStatus) return;
    setLoading(true);
    try {
      const result = await onUpdateStatus(selectedIds, status);
      if (result.success) {
        const label =
          status === "PUBLISHED" ? "发布" : status === "DRAFT" ? "设为草稿" : "归档";
        toast.success(`成功${label} ${selectedIds.length} 篇文章`);
        onClear();
        onRefresh();
      } else {
        toast.error(result.error || "操作失败");
      }
    } catch {
      toast.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-2">
        <span className="text-sm font-medium text-blue-700">
          已选 {selectedIds.length} 项
        </span>
        <div className="flex gap-2">
          {onUpdateStatus && (
            <>
              <button
                type="button"
                onClick={() => handleStatusChange("PUBLISHED")}
                disabled={loading}
                className="rounded bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
              >
                发布
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("DRAFT")}
                disabled={loading}
                className="rounded bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
              >
                设为草稿
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={loading}
            className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
          >
            删除
          </button>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="ml-auto text-xs text-blue-600 hover:text-blue-800"
        >
          取消选择
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">确认批量删除</h3>
            <p className="mt-2 text-sm text-slate-600">
              确定要删除选中的 {selectedIds.length} 项吗？此操作不可撤销。
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "删除中..." : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
