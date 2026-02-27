import { getTagById } from "~/server/actions/tags";
import { db } from "~/server/db";
import { notFound } from "next/navigation";
import TagForm from "../../_components/TagForm";
import Link from "next/link";

export default async function EditTagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getTagById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const tag = result.data;

  // 获取使用该标签的文章和相册数量
  const [postCount, galleryCount] = await Promise.all([
    db.postTag.count({ where: { tagId: id } }),
    db.galleryTag.count({ where: { tagId: id } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/tags"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          &larr; 返回标签列表
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">编辑标签</h1>
        <p className="mt-1 text-sm text-slate-500">
          该标签关联了 {postCount} 篇文章、{galleryCount} 个相册
        </p>
      </div>

      <div className="max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <TagForm
          initialData={{
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
          }}
        />
      </div>
    </div>
  );
}
