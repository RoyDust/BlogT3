import { z } from "zod";

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
    .query(async ({ ctx, input }) => {
      const [posts, total] = await Promise.all([
        ctx.db.post.findMany({
          where: {
            status: "PUBLISHED",
          },
          include: {
            Category: {
              select: {
                name: true,
                slug: true,
                color: true,
              },
            },
          },
          orderBy: {
            publishedAt: "desc",
          },
          skip: input.offset,
          take: input.limit,
        }),
        ctx.db.post.count({
          where: {
            status: "PUBLISHED",
          },
        }),
      ]);

      return {
        posts,
        total,
      };
    }),

  // 根据 slug 获取文章详情
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: {
          slug: input.slug,
          status: "PUBLISHED",
        },
        include: {
          Category: {
            select: {
              name: true,
              slug: true,
              color: true,
            },
          },
        },
      });

      if (!post) {
        throw new Error("文章不存在");
      }

      // 增加阅读数
      await ctx.db.post.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });

      return post;
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
    .query(async ({ ctx, input }) => {
      // 先获取分类 ID
      const category = await ctx.db.category.findUnique({
        where: { slug: input.categorySlug },
        select: { id: true },
      });

      if (!category) {
        return { posts: [], total: 0 };
      }

      const [posts, total] = await Promise.all([
        ctx.db.post.findMany({
          where: {
            categoryId: category.id,
            status: "PUBLISHED",
          },
          include: {
            Category: {
              select: {
                name: true,
                slug: true,
                color: true,
              },
            },
          },
          orderBy: {
            publishedAt: "desc",
          },
          skip: input.offset,
          take: input.limit,
        }),
        ctx.db.post.count({
          where: {
            categoryId: category.id,
            status: "PUBLISHED",
          },
        }),
      ]);

      return {
        posts,
        total,
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
        coverImage: z.string().optional(),
        categoryId: z.string(),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("未授权：需要登录才能创建文章");
      }

      const post = await ctx.db.post.create({
        data: {
          title: input.title,
          slug: input.slug,
          content: input.content ?? "",
          excerpt: input.excerpt,
          coverImage: input.coverImage,
          categoryId: input.categoryId,
          status: input.status,
          authorId: ctx.session.user.id,
          publishedAt: input.status === "PUBLISHED" ? new Date() : null,
          updatedAt: new Date(),
        },
      });

      return post;
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
        coverImage: z.string().optional(),
        categoryId: z.string().optional(),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("未授权：需要登录才能更新文章");
      }

      const { id, ...updateData } = input;

      // 如果状态改为 PUBLISHED，设置发布时间
      const dataToUpdate: {
        title?: string;
        slug?: string;
        content?: string;
        excerpt?: string;
        coverImage?: string;
        categoryId?: string;
        status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
        publishedAt?: Date;
      } = { ...updateData };

      if (updateData.status === "PUBLISHED") {
        dataToUpdate.publishedAt = new Date();
      }

      const post = await ctx.db.post.update({
        where: {
          id,
          authorId: ctx.session.user.id, // 只能更新自己的文章
        },
        data: dataToUpdate,
      });

      return post;
    }),

  // 删除文章（需要认证）
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("未授权：需要登录才能删除文章");
      }

      await ctx.db.post.delete({
        where: {
          id: input.id,
          authorId: ctx.session.user.id, // 只能删除自己的文章
        },
      });

      return { success: true };
    }),

  // 获取当前用户的文章
  getMyPosts: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user) {
      throw new Error("未授权：需要登录才能查看自己的文章");
    }

    const posts = await ctx.db.post.findMany({
      where: {
        authorId: ctx.session.user.id,
      },
      include: {
        Category: {
          select: {
            name: true,
            slug: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts;
  }),
});
