import { getCategoryById } from "~/server/actions/categories";
import { db } from "~/server/db";
import { notFound } from "next/navigation";
import CategoryForm from "../../_components/CategoryForm";
import Link from "next/link";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getCategoryById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const category = result.data;

  // 获取使用该分类的文章数量
  const postCount = await db.post.count({
    where: { categoryId: id },
  });

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/categories"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          &larr; 返回分类列表
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">编辑分类</h1>
        <p className="mt-1 text-sm text-slate-500">
          该分类下有 {postCount} 篇文章
        </p>
      </div>

      <div className="max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <CategoryForm
          initialData={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            color: category.color,
          }}
        />
      </div>
    </div>
  );
}
