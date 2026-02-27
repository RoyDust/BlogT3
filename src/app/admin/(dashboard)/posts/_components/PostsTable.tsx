"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DeletePostButton from "./DeletePostButton";
import BatchActions from "~/components/admin/BatchActions";
import { batchDeletePosts, batchUpdatePostStatus } from "~/server/actions/posts";

interface PostItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewCount: number | null;
  createdAt: string | Date;
  categoryId: string;
  PostTag?: { Tag: { id: string; name: string } }[];
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface PostsTableProps {
  posts: PostItem[];
  categoryMap: Record<string, CategoryItem>;
}

export default function PostsTable({ posts, categoryMap }: PostsTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === posts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(posts.map((p) => p.id));
    }
  };

  const handleDelete = async (ids: string[]) => {
    return batchDeletePosts(ids);
  };

  const handleUpdateStatus = async (ids: string[], status: string) => {
    return batchUpdatePostStatus(ids, status as "DRAFT" | "PUBLISHED" | "ARCHIVED");
  };

  return (
    <div className="mt-8 space-y-3">
      <BatchActions
        selectedIds={selectedIds}
        onDelete={handleDelete}
        onUpdateStatus={handleUpdateStatus}
        onClear={() => setSelectedIds([])}
        onRefresh={() => router.refresh()}
      />

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {posts.length > 0 ? (
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === posts.length && posts.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                  标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                  标签
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                  阅读数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {posts.map((post) => {
                const category = categoryMap[post.categoryId];
                return (
                  <tr key={post.id} className="hover:bg-slate-50">
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(post.id)}
                        onChange={() => handleToggle(post.id)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {post.title}
                        </span>
                        <span className="text-sm text-slate-500">
                          /{post.slug}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {category && (
                        <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                          {category.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {post.PostTag?.slice(0, 3).map((pt) => (
                          <span
                            key={pt.Tag.id}
                            className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                          >
                            {pt.Tag.name}
                          </span>
                        ))}
                        {post.PostTag && post.PostTag.length > 3 && (
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                            +{post.PostTag.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          post.status === "PUBLISHED"
                            ? "bg-green-100 text-green-700"
                            : post.status === "DRAFT"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {post.status === "PUBLISHED"
                          ? "已发布"
                          : post.status === "DRAFT"
                            ? "草稿"
                            : "已归档"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {post.viewCount ?? 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600" suppressHydrationWarning>
                      {new Date(String(post.createdAt)).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/posts/edit/${post.id}`}
                          className="rounded bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100"
                        >
                          编辑
                        </Link>
                        <DeletePostButton postId={post.id} postTitle={post.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-600">还没有文章</p>
            <Link
              href="/admin/posts/new"
              className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              创建第一篇文章 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
