import { supabase } from "~/lib/supabase";
import CategoryForm from "./_components/CategoryForm";
import DeleteCategoryButton from "./_components/DeleteCategoryButton";

export default async function CategoriesPage() {
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">分类管理</h1>
        <p className="mt-2 text-slate-600">管理文章分类</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Form */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">添加新分类</h2>
          <CategoryForm />
        </div>

        {/* Categories List */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            现有分类
          </h2>
          <div className="space-y-3">
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <div className="font-medium text-slate-900">
                        {category.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        /{category.slug}
                      </div>
                    </div>
                  </div>
                  <DeleteCategoryButton
                    categoryId={category.id}
                    categoryName={category.name}
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-slate-600">暂无分类</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
