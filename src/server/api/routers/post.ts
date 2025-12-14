import { z } from "zod";
import { supabase } from "~/lib/supabase";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  // 获取所有已发布的文章（分页）
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const { data, error, count } = await supabase
        .from("posts")
        .select("*, categories(name, slug, color)", { count: "exact" })
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) throw new Error(error.message);

      return {
        posts: data ?? [],
        total: count ?? 0,
      };
    }),

  // 根据 slug 获取文章详情
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, categories(name, slug, color)")
        .eq("slug", input.slug)
        .eq("status", "published")
        .single();

      if (error) throw new Error(error.message);

      // 增加阅读数
      if (data) {
        await supabase
          .from("posts")
          .update({ view_count: (data.view_count ?? 0) + 1 })
          .eq("id", data.id);
      }

      return data;
    }),

  // 根据分类获取文章
  getByCategory: publicProcedure
    .input(
      z.object({
        categorySlug: z.string(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      // 先获取分类 ID
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", input.categorySlug)
        .single();

      if (!category) {
        return { posts: [], total: 0 };
      }

      const { data, error, count } = await supabase
        .from("posts")
        .select("*, categories(name, slug, color)", { count: "exact" })
        .eq("category_id", category.id)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) throw new Error(error.message);

      return {
        posts: data ?? [],
        total: count ?? 0,
      };
    }),

  // 创建文章（需要认证）
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        cover_image: z.string().optional(),
        category_id: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).default("draft"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          ...input,
          author_id: ctx.session.user.id,
          published_at: input.status === "published" ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return data;
    }),

  // 更新文章（需要认证）
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        cover_image: z.string().optional(),
        category_id: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // 如果状态改为 published，设置发布时间
      const dataToUpdate: any = { ...updateData };
      if (updateData.status === "published") {
        dataToUpdate.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("posts")
        .update(dataToUpdate)
        .eq("id", id)
        .eq("author_id", ctx.session.user.id) // 只能更新自己的文章
        .select()
        .single();

      if (error) throw new Error(error.message);

      return data;
    }),

  // 删除文章（需要认证）
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", input.id)
        .eq("author_id", ctx.session.user.id); // 只能删除自己的文章

      if (error) throw new Error(error.message);

      return { success: true };
    }),

  // 获取当前用户的文章
  getMyPosts: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, categories(name, slug, color)")
      .eq("author_id", ctx.session.user.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data ?? [];
  }),
});
