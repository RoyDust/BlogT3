'use server';

import { db } from '~/server/db';
import { revalidatePath } from 'next/cache';
import { requireAdmin, requireAuth } from './auth-guard';

/**
 * 评论功能
 * 使用 Prisma 客户端进行数据库操作
 */

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentInput {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string; // 父评论 ID（用于回复）
}

export interface UpdateCommentInput {
  content?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface GetCommentsOptions {
  postId?: string;
  authorId?: string;
  parentId?: string | null;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  limit?: number;
  offset?: number;
}

/**
 * 创建评论
 */
export async function createComment(input: CreateCommentInput) {
  try {
    const authResult = await requireAuth();
    if (!authResult.authenticated) {
      return { success: false, error: authResult.error };
    }

    const comment = await db.comment.create({
      data: {
        postId: input.postId,
        authorId: input.authorId,
        parentId: input.parentId || null,
        content: input.content,
        status: 'PENDING', // 默认待审核
        updatedAt: new Date(),
      },
    });

    // 更新文章的评论数
    await db.post.update({
      where: { id: input.postId },
      data: { commentCount: { increment: 1 } },
    });

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
    const comment = await db.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return { success: false, error: 'Comment not found' };
    }

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
    // 构建查询条件
    const where: any = {};

    if (options.postId) {
      where.postId = options.postId;
    }
    if (options.authorId) {
      where.authorId = options.authorId;
    }
    if (options.parentId !== undefined) {
      where.parentId = options.parentId;
    }
    if (options.status) {
      where.status = options.status;
    }

    // 执行查询
    const [comments, count] = await Promise.all([
      db.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options.offset || 0,
        take: options.limit || undefined,
      }),
      db.comment.count({ where }),
    ]);

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
    const data = await db.comment.findMany({
      where: {
        parentId,
        status: 'APPROVED',
      },
      orderBy: { createdAt: 'asc' },
    });

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
    const allComments = await db.comment.findMany({
      where: {
        postId,
        status: 'APPROVED',
      },
      orderBy: { createdAt: 'desc' },
    });

    // 构建评论树
    const commentMap = new Map();
    const rootComments: any[] = [];

    // 第一遍：创建所有评论的映射
    allComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // 第二遍：构建树结构
    allComments.forEach((comment) => {
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
    const authResult = await requireAdmin();
    if (!authResult.authenticated) {
      return { success: false, error: authResult.error };
    }

    const comment = await db.comment.update({
      where: { id },
      data: input,
    });

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
    const authResult = await requireAdmin();
    if (!authResult.authenticated) {
      return { success: false, error: authResult.error };
    }

    const comment = await db.comment.findUnique({
      where: { id },
      select: { postId: true, parentId: true },
    });

    if (!comment) {
      return { success: false, error: 'Comment not found' };
    }

    // 计算要删除的评论总数（包括所有子评论）
    const replyCount = await db.comment.count({
      where: { parentId: id },
    });

    // 删除评论的所有回复
    if (replyCount > 0) {
      await db.comment.deleteMany({
        where: { parentId: id },
      });
    }

    // 删除评论的点赞
    await db.like.deleteMany({
      where: {
        targetType: 'COMMENT',
        targetId: id,
      },
    });

    // 删除评论
    await db.comment.delete({
      where: { id },
    });

    // 更新文章的评论数
    const deleteCount = 1 + replyCount;
    await db.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: deleteCount } },
    });

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
 * 获取待审核的评论数量
 */
export async function getPendingCommentsCount() {
  try {
    const count = await db.comment.count({
      where: { status: 'PENDING' },
    });

    return { success: true, count };
  } catch (error) {
    console.error('Error fetching pending count:', error);
    return { success: false, error: 'Failed to fetch pending count', count: 0 };
  }
}
