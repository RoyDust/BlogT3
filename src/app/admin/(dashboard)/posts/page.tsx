import { getPosts } from "~/server/actions/posts";
import { supabase } from "~/lib/supabase";
import Link from "next/link";
import DeletePostButton from "./_components/DeletePostButton";

export default async function PostsManagePage() {
  // 使用新的 server action 获取文章
  const result = await getPosts({
    orderBy: "createdAt",
    order: "desc",
  });

  const posts = result.success ? result.data ?? [] : [];

  // 获取所有分类信息
  const categoryIds = [...new Set(posts.map((p) => p.categoryId))];
  const { data: categories } = await supabase
    .from("Category")
    .select("id, name, slug")
    .in("id", categoryIds);

  const categoryMap = new Map(categories?.map((c) => [c.id, c]) ?? []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">文章管理</h1>
          <p className="mt-2 text-slate-600">管理您的所有文章</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          + 新建文章
        </Link>
      </div>

      {/* Posts Table */}
      <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {posts && posts.length > 0 ? (
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                  标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                  分类
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
                const category = categoryMap.get(post.categoryId);
                return (
                  <tr key={post.id} className="hover:bg-slate-50">
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
                      {new Date(String(post.createdAt ?? new Date())).toLocaleDateString("zh-CN")}
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
