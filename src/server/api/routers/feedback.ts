import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// 反馈限流器（每小时限制）
const feedbackRateLimiter = new Map<string, { count: number; resetTime: number }>();

function checkFeedbackRateLimit(userId: string, maxCount: number, windowMs: number): boolean {
  const now = Date.now();
  const userLimit = feedbackRateLimiter.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // 重置计数器
    feedbackRateLimiter.set(userId, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (userLimit.count >= maxCount) {
    return false;
  }

  userLimit.count++;
  return true;
}

export const feedbackRouter = createTRPCRouter({
  // 提交反馈
  submitFeedback: publicProcedure
    .input(
      z.object({
        content: z.string().min(10, "反馈内容至少需要 10 个字符").max(500, "反馈内容不能超过 500 个字符"),
        type: z.enum(["BUG_REPORT", "SUGGESTION", "OTHER"]),
        targetType: z.string(),
        targetId: z.string(),
        userId: z.string(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // IP 限流：每小时最多 10 条
      if (!checkFeedbackRateLimit(input.userId, 10, 60 * 60 * 1000)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "您的反馈次数已达上限，请稍后再试",
        });
      }

      // 创建反馈记录（数据库会自动生成 UUID）
      const feedback = await ctx.db.feedback.create({
        data: {
          content: input.content,
          type: input.type,
          targetType: input.targetType,
          targetId: input.targetId,
          userIp: input.userId, // 使用 userId 作为标识
          userAgent: input.userAgent,
        },
      });

      return { success: true, feedbackId: feedback.id };
    }),

  // 获取反馈数量
  getFeedbackCount: publicProcedure
    .input(
      z.object({
        targetType: z.string(),
        targetId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const count = await ctx.db.feedback.count({
        where: {
          targetType: input.targetType,
          targetId: input.targetId,
        },
      });

      return { count };
    }),
});