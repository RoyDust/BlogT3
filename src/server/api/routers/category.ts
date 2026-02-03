import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const categoryRouter = createTRPCRouter({
  // 获取所有分类
  getAll: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      created_at: category.createdAt.toISOString(),
      updated_at: category.updatedAt.toISOString(),
    }));
  }),

  // 根据 slug 获取分类
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: {
          slug: input.slug,
        },
      });

      if (!category) {
        throw new Error("Category not found");
      }

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        created_at: category.createdAt.toISOString(),
        updated_at: category.updatedAt.toISOString(),
      };
    }),

  // 获取分类及其文章数量
  getAllWithCount: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            Post: true,
          },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      created_at: category.createdAt.toISOString(),
      updated_at: category.updatedAt.toISOString(),
      posts: [{ count: category._count.Post }],
    }));
  }),
});
