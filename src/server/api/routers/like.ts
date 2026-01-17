import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/lib/supabase";

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
    .mutation(async ({ input }) => {
      // IP 限流：1 秒间隔（使用 userId 作为限流标识）
      const rateLimitKey = `like:${input.userId}:${input.targetType}:${input.targetId}`;

      if (!checkRateLimit(rateLimitKey, 1000)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "操作过于频繁，请稍后再试",
        });
      }

      // 查询是否已点赞
      const { data: existingLike, error: queryError } = await supabase
        .from("Like")
        .select("*")
        .eq("userId", input.userId)
        .eq("targetType", input.targetType)
        .eq("targetId", input.targetId)
        .maybeSingle();

      if (queryError) {
        console.error("查询点赞状态失败:", queryError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `查询点赞状态失败: ${queryError.message}`,
        });
      }

      if (existingLike) {
        // 取消点赞
        const { error: deleteError } = await supabase
          .from("Like")
          .delete()
          .eq("id", existingLike.id);

        if (deleteError) {
          console.error("取消点赞失败:", deleteError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `取消点赞失败: ${deleteError.message}`,
          });
        }

        // 更新目标内容的点赞数
        await updateLikeCount(input.targetType, input.targetId, -1);

        return { liked: false };
      } else {
        // 添加点赞（数据库会自动生成 UUID）
        const { error: insertError } = await supabase
          .from("Like")
          .insert({
            userId: input.userId,
            targetType: input.targetType,
            targetId: input.targetId,
          });

        if (insertError) {
          console.error("添加点赞失败:", insertError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `添加点赞失败: ${insertError.message}`,
          });
        }

        // 更新目标内容的点赞数
        await updateLikeCount(input.targetType, input.targetId, 1);

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
    .query(async ({ input }) => {
      const { data: like, error } = await supabase
        .from("Like")
        .select("*")
        .eq("userId", input.userId)
        .eq("targetType", input.targetType)
        .eq("targetId", input.targetId)
        .maybeSingle();

      if (error) {
        console.error("查询点赞状态失败:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `查询点赞状态失败: ${error.message}`,
        });
      }

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
    .query(async ({ input }) => {
      const { count, error } = await supabase
        .from("Like")
        .select("*", { count: "exact", head: true })
        .eq("targetType", input.targetType)
        .eq("targetId", input.targetId);

      if (error) {
        console.error("查询点赞数量失败:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `查询点赞数量失败: ${error.message}`,
        });
      }

      return { count: count ?? 0 };
    }),
});

// 辅助函数：更新目标内容的点赞数
async function updateLikeCount(
  targetType: string,
  targetId: string,
  increment: number
) {
  if (targetType === "POST") {
    const { data: post, error: selectError } = await supabase
      .from("Post")
      .select("likeCount")
      .eq("id", targetId)
      .single();

    if (selectError) {
      console.error("查询文章点赞数失败:", selectError);
      return;
    }

    if (post) {
      const { error: updateError } = await supabase
        .from("Post")
        .update({ likeCount: post.likeCount + increment })
        .eq("id", targetId);

      if (updateError) {
        console.error("更新文章点赞数失败:", updateError);
      }
    }
  } else if (targetType === "GALLERY") {
    const { data: gallery, error: selectError } = await supabase
      .from("PhotoGallery")
      .select("likeCount")
      .eq("id", targetId)
      .single();

    if (selectError) {
      console.error("查询图片集点赞数失败:", selectError);
      return;
    }

    if (gallery) {
      const { error: updateError } = await supabase
        .from("PhotoGallery")
        .update({ likeCount: gallery.likeCount + increment })
        .eq("id", targetId);

      if (updateError) {
        console.error("更新图片集点赞数失败:", updateError);
      }
    }
  }
}
