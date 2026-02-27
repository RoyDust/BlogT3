import { getPosts } from "~/server/actions/posts";
import { db } from "~/server/db";
import Link from "next/link";
import PostsTable from "./_components/PostsTable";

export default async function PostsManagePage() {
  const result = await getPosts({
    orderBy: "createdAt",
    order: "desc",
  });

  const posts = result.success ? result.data ?? [] : [];

  // 获取所有分类信息
  const categoryIds = [...new Set(posts.map((p) => p.categoryId))];
  const categories = await db.category.findMany({
    where: {
      id: { in: categoryIds },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  const categoryMap: Record<string, { id: string; name: string; slug: string }> =
    Object.fromEntries(categories.map((c) => [c.id, c]));

  // 序列化 posts 数据传递给客户端组件
  const serializedPosts = posts.map((post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: post.status,
    viewCount: post.viewCount,
    createdAt: String(post.createdAt),
    categoryId: post.categoryId,
    PostTag: post.PostTag?.map((pt: any) => ({
      Tag: { id: pt.Tag.id, name: pt.Tag.name },
    })),
  }));

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

      <PostsTable posts={serializedPosts} categoryMap={categoryMap} />
    </div>
  );
}
