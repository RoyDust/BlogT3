import { z } from "zod";
import { supabase } from "~/lib/supabase";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const categoryRouter = createTRPCRouter({
  // 获取所有分类
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []) as Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      color: string;
      created_at: string;
      updated_at: string;
    }>;
  }),

  // 根据 slug 获取分类
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", input.slug)
        .single();

      if (error) throw new Error(error.message);

      return data as {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        color: string;
        created_at: string;
        updated_at: string;
      };
    }),

  // 获取分类及其文章数量
  getAllWithCount: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select(`
        *,
        posts:posts(count)
      `)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []) as Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      color: string;
      created_at: string;
      updated_at: string;
      posts: { count: number }[];
    }>;
  }),
});
