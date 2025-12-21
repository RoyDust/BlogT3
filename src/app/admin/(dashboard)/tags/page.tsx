import { supabase } from "~/lib/supabase";
import TagForm from "./_components/TagForm";
import DeleteTagButton from "./_components/DeleteTagButton";

export default async function TagsPage() {
  const { data: tags } = await supabase
    .from("Tag")
    .select("*")
    .order("name");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">标签管理</h1>
        <p className="mt-2 text-slate-600">管理文章标签</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tag Form */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">添加新标签</h2>
          <TagForm />
        </div>

        {/* Tags List */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            现有标签
          </h2>
          <div className="space-y-3">
            {tags && tags.length > 0 ? (
              tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {tag.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      /{tag.slug}
                    </div>
                  </div>
                  <DeleteTagButton
                    tagId={tag.id}
                    tagName={tag.name}
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-slate-600">暂无标签</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
