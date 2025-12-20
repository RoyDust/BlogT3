'use server';

import { supabase } from '~/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * 点赞功能
 * 使用 Supabase 客户端进行数据库操作
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
    const { data: existing } = await supabase
      .from('Like')
      .select('id')
      .eq('userId', input.userId)
      .eq('targetType', input.targetType)
      .eq('targetId', input.targetId)
      .single();

    if (existing) {
      return { success: false, error: 'Already liked' };
    }

    // 添加点赞
    const { data: like, error } = await supabase
      .from('Like')
      .insert({
        userId: input.userId,
        targetType: input.targetType,
        targetId: input.targetId,
      })
      .select()
      .single();

    if (error) throw error;

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
    const { error } = await supabase
      .from('Like')
      .delete()
      .eq('userId', input.userId)
      .eq('targetType', input.targetType)
      .eq('targetId', input.targetId);

    if (error) throw error;

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
    const { data: existing } = await supabase
      .from('Like')
      .select('id')
      .eq('userId', input.userId)
      .eq('targetType', input.targetType)
      .eq('targetId', input.targetId)
      .single();

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
    const { data, error } = await supabase
      .from('Like')
      .select('id')
      .eq('userId', userId)
      .eq('targetType', targetType)
      .eq('targetId', targetId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

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
    const { data, error, count } = await supabase
      .from('Like')
      .select('*, User(*)', { count: 'exact' })
      .eq('targetType', targetType)
      .eq('targetId', targetId)
      .order('createdAt', { ascending: false });

    if (error) throw error;

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
    let query = supabase
      .from('Like')
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (targetType) {
      query = query.eq('targetType', targetType);
    }

    const { data, error, count } = await query;

    if (error) throw error;

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
      const { data } = await supabase
        .from('Post')
        .select('likeCount')
        .eq('id', targetId)
        .single();

      if (data) {
        await supabase
          .from('Post')
          .update({ likeCount: data.likeCount + 1 })
          .eq('id', targetId);
      }
    } else if (targetType === 'COMMENT') {
      const { data } = await supabase
        .from('Comment')
        .select('likeCount')
        .eq('id', targetId)
        .single();

      if (data) {
        await supabase
          .from('Comment')
          .update({ likeCount: data.likeCount + 1 })
          .eq('id', targetId);
      }
    } else if (targetType === 'GALLERY') {
      const { data } = await supabase
        .from('PhotoGallery')
        .select('likeCount')
        .eq('id', targetId)
        .single();

      if (data) {
        await supabase
          .from('PhotoGallery')
          .update({ likeCount: data.likeCount + 1 })
          .eq('id', targetId);
      }
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
      const { data } = await supabase
        .from('Post')
        .select('likeCount')
        .eq('id', targetId)
        .single();

      if (data && data.likeCount > 0) {
        await supabase
          .from('Post')
          .update({ likeCount: data.likeCount - 1 })
          .eq('id', targetId);
      }
    } else if (targetType === 'COMMENT') {
      const { data } = await supabase
        .from('Comment')
        .select('likeCount')
        .eq('id', targetId)
        .single();

      if (data && data.likeCount > 0) {
        await supabase
          .from('Comment')
          .update({ likeCount: data.likeCount - 1 })
          .eq('id', targetId);
      }
    } else if (targetType === 'GALLERY') {
      const { data } = await supabase
        .from('PhotoGallery')
        .select('likeCount')
        .eq('id', targetId)
        .single();

      if (data && data.likeCount > 0) {
        await supabase
          .from('PhotoGallery')
          .update({ likeCount: data.likeCount - 1 })
          .eq('id', targetId);
      }
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
