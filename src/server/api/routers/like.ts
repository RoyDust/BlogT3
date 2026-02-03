import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// 简单的内存限流器
const rateLimiter = new Map<string, number>();

function checkRateLimit(key: string, windowMs: number): boolean {
  const now = Date.now();
  const lastRequest = rateLimiter.get(key);

  if (lastRequest && now - lastRequest < windowMs) {
    return false;
  }

  rateLimiter.set(key, now);
  return true;
}

export const likeRouter = createTRPCRouter({
  // 切换点赞状态
  toggleLike: publicProcedure
    .input(
      z.object({
        targetType: z.enum(["POST", "GALLERY"]),
        targetId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // IP 限流：1 秒间隔（使用 userId 作为限流标识）
      const rateLimitKey = `like:${input.userId}:${input.targetType}:${input.targetId}`;

      if (!checkRateLimit(rateLimitKey, 1000)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "操作过于频繁，请稍后再试",
        });
      }

      // 查询是否已点赞
      const existingLike = await ctx.db.like.findFirst({
        where: {
          userId: input.userId,
          targetType: input.targetType,
          targetId: input.targetId,
        },
      });

      if (existingLike) {
        // 取消点赞
        await ctx.db.like.delete({
          where: {
            id: existingLike.id,
          },
        });

        // 更新目标内容的点赞数
        await updateLikeCount(ctx, input.targetType, input.targetId, -1);

        return { liked: false };
      } else {
        // 添加点赞（数据库会自动生成 UUID）
        await ctx.db.like.create({
          data: {
            userId: input.userId,
            targetType: input.targetType,
            targetId: input.targetId,
          },
        });

        // 更新目标内容的点赞数
        await updateLikeCount(ctx, input.targetType, input.targetId, 1);

        return { liked: true };
      }
    }),

  // 获取点赞状态
  getLikeStatus: publicProcedure
    .input(
      z.object({
        targetType: z.enum(["POST", "GALLERY"]),
        targetId: z.string(),
        userId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const like = await ctx.db.like.findFirst({
        where: {
          userId: input.userId,
          targetType: input.targetType,
          targetId: input.targetId,
        },
      });

      return { liked: !!like };
    }),

  // 获取点赞数量
  getLikeCount: publicProcedure
    .input(
      z.object({
        targetType: z.enum(["POST", "GALLERY"]),
        targetId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const count = await ctx.db.like.count({
        where: {
          targetType: input.targetType,
          targetId: input.targetId,
        },
      });

      return { count };
    }),
});

// 辅助函数：更新目标内容的点赞数
async function updateLikeCount(
  ctx: { db: any },
  targetType: string,
  targetId: string,
  increment: number
) {
  try {
    if (targetType === "POST") {
      await ctx.db.post.update({
        where: { id: targetId },
        data: {
          likeCount: {
            increment: increment,
          },
        },
      });
    } else if (targetType === "GALLERY") {
      await ctx.db.photoGallery.update({
        where: { id: targetId },
        data: {
          likeCount: {
            increment: increment,
          },
        },
      });
    }
  } catch (error) {
    console.error("更新点赞数失败:", error);
  }
}
