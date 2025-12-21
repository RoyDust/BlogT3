import { supabase } from "~/lib/supabase";
import Link from "next/link";

export default async function GalleriesPage() {
  const { data: galleries } = await supabase
    .from("PhotoGallery")
    .select("*")
    .order("createdAt", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">相册管理</h1>
          <p className="mt-2 text-slate-600">管理摄影作品集</p>
        </div>
        <Link
          href="/admin/galleries/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          + 新建相册
        </Link>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {galleries && galleries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">
                    标题
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">
                    图片数量
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">
                    浏览量
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-900">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-900">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {galleries.map((gallery) => (
                  <tr key={gallery.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {gallery.title}
                      </div>
                      {gallery.description && (
                        <div className="mt-1 text-sm text-slate-500 line-clamp-1">
                          {gallery.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          gallery.status === "PUBLISHED"
                            ? "bg-green-50 text-green-700"
                            : gallery.status === "DRAFT"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-slate-50 text-slate-700"
                        }`}
                      >
                        {gallery.status === "PUBLISHED"
                          ? "已发布"
                          : gallery.status === "DRAFT"
                            ? "草稿"
                            : "已归档"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {gallery.imageCount} 张
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {gallery.viewCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(gallery.createdAt).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/galleries/edit/${gallery.id}`}
                          className="rounded bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100"
                        >
                          编辑
                        </Link>
                        <Link
                          href={`/photography/${gallery.slug}`}
                          target="_blank"
                          className="rounded bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100"
                        >
                          查看
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-600">暂无相册</p>
            <Link
              href="/admin/galleries/new"
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700"
            >
              创建第一个相册 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
