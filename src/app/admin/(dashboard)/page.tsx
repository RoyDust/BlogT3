import { db } from "~/server/db";
import Link from "next/link";

export default async function AdminDashboard() {
  // 获取统计数据
  const totalPosts = await db.post.count();

  const publishedPosts = await db.post.count({
    where: { status: "PUBLISHED" },
  });

  const draftPosts = await db.post.count({
    where: { status: "DRAFT" },
  });

  const totalCategories = await db.category.count();

  // 获取最近的文章
  const recentPosts = await db.post.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    {
      name: "总文章数",
      value: totalPosts,
      icon: "📝",
      color: "blue",
    },
    {
      name: "已发布",
      value: publishedPosts,
      icon: "✅",
      color: "green",
    },
    {
      name: "草稿",
      value: draftPosts,
      icon: "📄",
      color: "yellow",
    },
    {
      name: "分类数",
      value: totalCategories,
      icon: "📁",
      color: "purple",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">仪表板</h1>
      <p className="mt-2 text-slate-600">欢迎回来！这是您的博客管理中心</p>

      {/* Stats Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">最近的文章</h2>
          <Link
            href="/admin/posts"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            查看全部 →
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {recentPosts && recentPosts.length > 0 ? (
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                    标题
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                    创建时间
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {post.title}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          post.status === "PUBLISHED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {post.status === "PUBLISHED" ? "已发布" : "草稿"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600" suppressHydrationWarning>
                      {new Date(String(post.createdAt ?? new Date())).toLocaleDateString("zh-CN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-600">
              还没有文章，
              <Link
                href="/admin/posts/new"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                创建第一篇
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
