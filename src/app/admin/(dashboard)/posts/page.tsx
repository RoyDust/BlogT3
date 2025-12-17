import { supabase } from "~/lib/supabase";
import Link from "next/link";
import DeletePostButton from "./_components/DeletePostButton";

export default async function PostsManagePage() {
  const { data: posts } = await supabase
    .from("posts")
    .select("*, categories(name, slug)")
    .order("created_at", { ascending: false });

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
              {posts.map((post) => (
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
                    {post.categories && (
                      <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                        {post.categories.name}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700"
                          : post.status === "draft"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {post.status === "published"
                        ? "已发布"
                        : post.status === "draft"
                          ? "草稿"
                          : "已归档"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {post.view_count ?? 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600" suppressHydrationWarning>
                    {new Date(String(post.created_at ?? new Date())).toLocaleDateString("zh-CN")}
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
              ))}
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
