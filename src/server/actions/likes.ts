'use server';

import { db } from '~/server/db';
import { revalidatePath } from 'next/cache';

/**
 * 点赞功能
 * 使用 Prisma 客户端进行数据库操作
 */

export type LikeTargetType = 'POST' | 'COMMENT' | 'GALLERY';

export interface CreateLikeInput {
  userId: string;
  targetType: LikeTargetType;
  targetId: string;
}

/**
 * 添加点赞
 */
export async function createLike(input: CreateLikeInput) {
  try {
    // 检查是否已经点赞
    const existing = await db.like.findFirst({
      where: {
        userId: input.userId,
        targetType: input.targetType,
        targetId: input.targetId,
      },
    });

    if (existing) {
      return { success: false, error: 'Already liked' };
    }

    // 添加点赞
    const like = await db.like.create({
      data: {
        userId: input.userId,
        targetType: input.targetType,
        targetId: input.targetId,
      },
    });

    // 更新目标的点赞数
    await incrementLikeCount(input.targetType, input.targetId);

    // 重新验证缓存
    revalidateCacheForTarget(input.targetType, input.targetId);

    return { success: true, data: like };
  } catch (error) {
    console.error('Error creating like:', error);
    return { success: false, error: 'Failed to create like' };
  }
}

/**
 * 取消点赞
 */
export async function deleteLike(input: CreateLikeInput) {
  try {
    // 删除点赞
    await db.like.deleteMany({
      where: {
        userId: input.userId,
        targetType: input.targetType,
        targetId: input.targetId,
      },
    });

    // 更新目标的点赞数
    await decrementLikeCount(input.targetType, input.targetId);

    // 重新验证缓存
    revalidateCacheForTarget(input.targetType, input.targetId);

    return { success: true };
  } catch (error) {
    console.error('Error deleting like:', error);
    return { success: false, error: 'Failed to delete like' };
  }
}

/**
 * 切换点赞状态（如果已点赞则取消，未点赞则添加）
 */
export async function toggleLike(input: CreateLikeInput) {
  try {
    // 检查是否已经点赞
    const existing = await db.like.findFirst({
      where: {
        userId: input.userId,
        targetType: input.targetType,
        targetId: input.targetId,
      },
    });

    if (existing) {
      // 已点赞，取消点赞
      return await deleteLike(input);
    } else {
      // 未点赞，添加点赞
      return await createLike(input);
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return { success: false, error: 'Failed to toggle like' };
  }
}

/**
 * 检查用户是否已点赞
 */
export async function checkUserLiked(
  userId: string,
  targetType: LikeTargetType,
  targetId: string
) {
  try {
    const data = await db.like.findFirst({
      where: {
        userId,
        targetType,
        targetId,
      },
    });

    return { success: true, liked: !!data };
  } catch (error) {
    console.error('Error checking like:', error);
    return { success: false, error: 'Failed to check like', liked: false };
  }
}

/**
 * 获取目标的点赞列表
 */
export async function getLikes(targetType: LikeTargetType, targetId: string) {
  try {
    const [data, count] = await Promise.all([
      db.like.findMany({
        where: {
          targetType,
          targetId,
        },
        include: {
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.like.count({
        where: {
          targetType,
          targetId,
        },
      }),
    ]);

    return { success: true, data, count };
  } catch (error) {
    console.error('Error fetching likes:', error);
    return { success: false, error: 'Failed to fetch likes' };
  }
}

/**
 * 获取用户的点赞列表
 */
export async function getUserLikes(userId: string, targetType?: LikeTargetType) {
  try {
    const where: any = { userId };
    if (targetType) {
      where.targetType = targetType;
    }

    const [data, count] = await Promise.all([
      db.like.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      db.like.count({ where }),
    ]);

    return { success: true, data, count };
  } catch (error) {
    console.error('Error fetching user likes:', error);
    return { success: false, error: 'Failed to fetch user likes' };
  }
}

/**
 * 增加目标的点赞计数
 */
async function incrementLikeCount(targetType: LikeTargetType, targetId: string) {
  try {
    if (targetType === 'POST') {
      await db.post.update({
        where: { id: targetId },
        data: { likeCount: { increment: 1 } },
      });
    } else if (targetType === 'COMMENT') {
      await db.comment.update({
        where: { id: targetId },
        data: { likeCount: { increment: 1 } },
      });
    } else if (targetType === 'GALLERY') {
      await db.photoGallery.update({
        where: { id: targetId },
        data: { likeCount: { increment: 1 } },
      });
    }
  } catch (error) {
    console.error('Error incrementing like count:', error);
  }
}

/**
 * 减少目标的点赞计数
 */
async function decrementLikeCount(targetType: LikeTargetType, targetId: string) {
  try {
    if (targetType === 'POST') {
      await db.post.update({
        where: { id: targetId },
        data: { likeCount: { decrement: 1 } },
      });
    } else if (targetType === 'COMMENT') {
      await db.comment.update({
        where: { id: targetId },
        data: { likeCount: { decrement: 1 } },
      });
    } else if (targetType === 'GALLERY') {
      await db.photoGallery.update({
        where: { id: targetId },
        data: { likeCount: { decrement: 1 } },
      });
    }
  } catch (error) {
    console.error('Error decrementing like count:', error);
  }
}

/**
 * 重新验证缓存
 */
function revalidateCacheForTarget(targetType: LikeTargetType, targetId: string) {
  if (targetType === 'POST') {
    revalidatePath('/blog');
  } else if (targetType === 'GALLERY') {
    revalidatePath('/photography');
  }
  // COMMENT 通常在 Post 页面，会随 Post 一起重新验证
}
