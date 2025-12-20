'use server';

import { supabase } from '~/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * 评论功能
 * 使用 Supabase 客户端进行数据库操作
 */

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  likeCount: number;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentInput {
  postId: string;
  userId: string;
  content: string;
  parentId?: string; // 父评论 ID（用于回复）
}

export interface UpdateCommentInput {
  content?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
}

export interface GetCommentsOptions {
  postId?: string;
  userId?: string;
  parentId?: string | null;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  limit?: number;
  offset?: number;
}

/**
 * 创建评论
 */
export async function createComment(input: CreateCommentInput) {
  try {
    // 插入评论
    const { data: comment, error } = await supabase
      .from('Comment')
      .insert({
        postId: input.postId,
        userId: input.userId,
        parentId: input.parentId || null,
        content: input.content,
        status: 'PENDING', // 默认待审核
      })
      .select()
      .single();

    if (error) throw error;

    // 如果是回复，更新父评论的回复数
    if (input.parentId) {
      const { data: parent } = await supabase
        .from('Comment')
        .select('replyCount')
        .eq('id', input.parentId)
        .single();

      if (parent) {
        await supabase
          .from('Comment')
          .update({ replyCount: parent.replyCount + 1 })
          .eq('id', input.parentId);
      }
    }

    // 更新文章的评论数
    const { data: post } = await supabase
      .from('Post')
      .select('commentCount')
      .eq('id', input.postId)
      .single();

    if (post) {
      await supabase
        .from('Post')
        .update({ commentCount: post.commentCount + 1 })
        .eq('id', input.postId);
    }

    revalidatePath('/blog');
    return { success: true, data: comment };
  } catch (error) {
    console.error('Error creating comment:', error);
    return { success: false, error: 'Failed to create comment' };
  }
}

/**
 * 获取单个评论
 */
export async function getCommentById(id: string) {
  try {
    const { data: comment, error } = await supabase
      .from('Comment')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data: comment };
  } catch (error) {
    console.error('Error fetching comment:', error);
    return { success: false, error: 'Failed to fetch comment' };
  }
}

/**
 * 获取评论列表
 */
export async function getComments(options: GetCommentsOptions = {}) {
  try {
    let query = supabase.from('Comment').select('*', { count: 'exact' });

    // 应用筛选条件
    if (options.postId) {
      query = query.eq('postId', options.postId);
    }
    if (options.userId) {
      query = query.eq('userId', options.userId);
    }
    if (options.parentId !== undefined) {
      if (options.parentId === null) {
        query = query.is('parentId', null);
      } else {
        query = query.eq('parentId', options.parentId);
      }
    }
    if (options.status) {
      query = query.eq('status', options.status);
    }

    // 排序（最新的在前）
    query = query.order('createdAt', { ascending: false });

    // 分页
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data: comments, error, count } = await query;

    if (error) throw error;
    return { success: true, data: comments, count };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { success: false, error: 'Failed to fetch comments' };
  }
}

/**
 * 获取评论的回复列表
 */
export async function getCommentReplies(parentId: string) {
  try {
    const { data, error } = await supabase
      .from('Comment')
      .select('*')
      .eq('parentId', parentId)
      .eq('status', 'APPROVED')
      .order('createdAt', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching replies:', error);
    return { success: false, error: 'Failed to fetch replies' };
  }
}

/**
 * 获取文章的评论树（包含回复）
 */
export async function getPostCommentsTree(postId: string) {
  try {
    // 获取所有已批准的评论
    const { data: allComments, error } = await supabase
      .from('Comment')
      .select('*')
      .eq('postId', postId)
      .eq('status', 'APPROVED')
      .order('createdAt', { ascending: false });

    if (error) throw error;

    // 构建评论树
    const commentMap = new Map();
    const rootComments: any[] = [];

    // 第一遍：创建所有评论的映射
    allComments?.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // 第二遍：构建树结构
    allComments?.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id);
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return { success: true, data: rootComments };
  } catch (error) {
    console.error('Error fetching comment tree:', error);
    return { success: false, error: 'Failed to fetch comment tree' };
  }
}

/**
 * 更新评论
 */
export async function updateComment(id: string, input: UpdateCommentInput) {
  try {
    const { data: comment, error } = await supabase
      .from('Comment')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/blog');
    return { success: true, data: comment };
  } catch (error) {
    console.error('Error updating comment:', error);
    return { success: false, error: 'Failed to update comment' };
  }
}

/**
 * 删除评论
 */
export async function deleteComment(id: string) {
  try {
    // 获取评论信息
    const { data: comment } = await supabase
      .from('Comment')
      .select('postId, parentId, replyCount')
      .eq('id', id)
      .single();

    if (!comment) {
      return { success: false, error: 'Comment not found' };
    }

    // 删除评论的所有回复
    if (comment.replyCount > 0) {
      await supabase.from('Comment').delete().eq('parentId', id);
    }

    // 删除评论的点赞
    await supabase.from('Like').delete().eq('targetType', 'COMMENT').eq('targetId', id);

    // 删除评论
    const { error } = await supabase.from('Comment').delete().eq('id', id);
    if (error) throw error;

    // 如果是回复，更新父评论的回复数
    if (comment.parentId) {
      const { data: parent } = await supabase
        .from('Comment')
        .select('replyCount')
        .eq('id', comment.parentId)
        .single();

      if (parent && parent.replyCount > 0) {
        await supabase
          .from('Comment')
          .update({ replyCount: parent.replyCount - 1 })
          .eq('id', comment.parentId);
      }
    }

    // 更新文章的评论数
    const { data: post } = await supabase
      .from('Post')
      .select('commentCount')
      .eq('id', comment.postId)
      .single();

    if (post && post.commentCount > 0) {
      // 计算要减少的数量（包括回复）
      const deleteCount = 1 + comment.replyCount;
      await supabase
        .from('Post')
        .update({ commentCount: post.commentCount - deleteCount })
        .eq('id', comment.postId);
    }

    revalidatePath('/blog');
    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: 'Failed to delete comment' };
  }
}

/**
 * 批准评论
 */
export async function approveComment(id: string) {
  return updateComment(id, { status: 'APPROVED' });
}

/**
 * 拒绝评论
 */
export async function rejectComment(id: string) {
  return updateComment(id, { status: 'REJECTED' });
}

/**
 * 标记为垃圾评论
 */
export async function markAsSpam(id: string) {
  return updateComment(id, { status: 'SPAM' });
}

/**
 * 获取待审核的评论数量
 */
export async function getPendingCommentsCount() {
  try {
    const { count, error } = await supabase
      .from('Comment')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    if (error) throw error;
    return { success: true, count };
  } catch (error) {
    console.error('Error fetching pending count:', error);
    return { success: false, error: 'Failed to fetch pending count', count: 0 };
  }
}
