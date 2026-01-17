import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/lib/supabase";

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
    .mutation(async ({ input }) => {
      // IP 限流：每小时最多 10 条
      if (!checkFeedbackRateLimit(input.userId, 10, 60 * 60 * 1000)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "您的反馈次数已达上限，请稍后再试",
        });
      }

      // 创建反馈记录（数据库会自动生成 UUID）
      const { data: feedback, error } = await supabase
        .from("Feedback")
        .insert({
          content: input.content,
          type: input.type,
          targetType: input.targetType,
          targetId: input.targetId,
          userIp: input.userId, // 使用 userId 作为标识
          userAgent: input.userAgent,
        })
        .select()
        .single();

      if (error) {
        console.error("提交反馈失败:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `提交反馈失败: ${error.message}`,
        });
      }

      if (!feedback) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "提交反馈失败：未返回数据",
        });
      }

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
    .query(async ({ input }) => {
      const { count, error } = await supabase
        .from("Feedback")
        .select("*", { count: "exact", head: true })
        .eq("targetType", input.targetType)
        .eq("targetId", input.targetId);

      if (error) {
        console.error("查询反馈数量失败:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `查询反馈数量失败: ${error.message}`,
        });
      }

      return { count: count ?? 0 };
    }),
});