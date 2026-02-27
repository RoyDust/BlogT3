'use server';

import { db } from '~/server/db';
import { revalidatePath } from 'next/cache';

/**
 * 博客文章 CRUD 操作
 * 使用 Prisma 客户端进行数据库操作
 */

export interface CreatePostInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorId: string;
  categoryId: string;
  status?: 'DRAFT' | 'PUBLISHED';
  featured?: boolean;
  tagIds?: string[]; // 标签 ID 数组
}

export interface UpdatePostInput {
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  categoryId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean;
  tagIds?: string[]; // 标签 ID 数组
}

export interface GetPostsOptions {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  authorId?: string;
  categoryId?: string;
  featured?: boolean;
  query?: string; // 搜索关键词（标题、摘要、内容）
  tagIds?: string[]; // 标签筛选
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'publishedAt' | 'viewCount' | 'likeCount';
  order?: 'asc' | 'desc';
}

/**
 * 生成阅读时间（基于内容字数）
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * 创建博客文章
 */
export async function createPost(input: CreatePostInput) {
  try {
    const readingTime = calculateReadingTime(input.content);
    const publishedAt = input.status === 'PUBLISHED' ? new Date() : null;

    // 插入文章
    const post = await db.post.create({
      data: {
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        coverImage: input.coverImage || null,
        authorId: input.authorId,
        categoryId: input.categoryId,
        status: input.status || 'DRAFT',
        featured: input.featured || false,
        readingTime,
        wordCount: input.content.split(/\s+/).length,
        publishedAt,
        updatedAt: new Date(),
      },
    });

    // 如果有标签，关联标签
    if (input.tagIds && input.tagIds.length > 0) {
      await db.postTag.createMany({
        data: input.tagIds.map((tagId) => ({
          postId: post.id,
          tagId,
        })),
      });
    }

    revalidatePath('/blog');
    return { success: true, data: post };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: 'Failed to create post' };
  }
}

/**
 * 获取单个博客文章（通过 ID）
 */
export async function getPostById(id: string) {
  try {
    const post = await db.post.findUnique({
      where: { id },
    });

    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    return { success: true, data: post };
  } catch (error) {
    console.error('Error fetching post:', error);
    return { success: false, error: 'Failed to fetch post' };
  }
}

/**
 * 获取单个博客文章（通过 slug）
 */
export async function getPostBySlug(slug: string) {
  try {
    const post = await db.post.findUnique({
      where: { slug },
    });

    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    return { success: true, data: post };
  } catch (error) {
    console.error('Error fetching post:', error);
    return { success: false, error: 'Failed to fetch post' };
  }
}

/**
 * 获取博客文章列表
 */
export async function getPosts(options: GetPostsOptions = {}) {
  try {
    // 构建查询条件
    const where: any = {};

    if (options.status) {
      where.status = options.status;
    }
    if (options.authorId) {
      where.authorId = options.authorId;
    }
    if (options.categoryId) {
      where.categoryId = options.categoryId;
    }
    if (options.featured !== undefined) {
      where.featured = options.featured;
    }

    // 搜索关键词
    if (options.query) {
      where.OR = [
        { title: { contains: options.query, mode: 'insensitive' } },
        { excerpt: { contains: options.query, mode: 'insensitive' } },
        { content: { contains: options.query, mode: 'insensitive' } },
      ];
    }

    // 标签筛选
    if (options.tagIds && options.tagIds.length > 0) {
      where.PostTag = {
        some: {
          tagId: { in: options.tagIds },
        },
      };
    }

    // 排序
    const orderBy = options.orderBy || 'createdAt';
    const order = options.order || 'desc';

    // 查询文章
    const posts = await db.post.findMany({
      where,
      include: {
        User: true,
        Category: true,
        PostTag: {
          include: {
            Tag: true,
          },
        },
      },
      orderBy: { [orderBy]: order },
      skip: options.offset || 0,
      take: options.limit || undefined,
    });

    // 获取总数
    const count = await db.post.count({ where });

    console.log(posts);

    return { success: true, data: posts, count };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { success: false, error: 'Failed to fetch posts' };
  }
}

/**
 * 更新博客文章
 */
export async function updatePost(id: string, input: UpdatePostInput) {
  try {
    const updateData: any = { ...input };

    // 如果更新内容，重新计算阅读时间
    if (input.content) {
      updateData.readingTime = calculateReadingTime(input.content);
      updateData.wordCount = input.content.split(/\s+/).length;
    }

    // 如果状态改为 PUBLISHED 且之前没有发布时间，设置发布时间
    if (input.status === 'PUBLISHED') {
      const currentPost = await db.post.findUnique({
        where: { id },
        select: { publishedAt: true },
      });

      if (currentPost && !currentPost.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    // 移除 tagIds（后续单独处理）
    const tagIds = updateData.tagIds;
    delete updateData.tagIds;

    // 添加 updatedAt
    updateData.updatedAt = new Date();

    // 更新文章
    const post = await db.post.update({
      where: { id },
      data: updateData,
    });

    // 如果提供了标签，更新标签关联
    if (tagIds !== undefined) {
      // 删除旧的标签关联
      await db.postTag.deleteMany({
        where: { postId: id },
      });

      // 添加新的标签关联
      if (tagIds.length > 0) {
        await db.postTag.createMany({
          data: tagIds.map((tagId: string) => ({
            postId: id,
            tagId,
          })),
        });
      }
    }

    revalidatePath('/blog');
    revalidatePath(`/blog/${post.slug}`);
    return { success: true, data: post };
  } catch (error) {
    console.error('Error updating post:', error);
    return { success: false, error: 'Failed to update post' };
  }
}

/**
 * 删除博客文章
 */
export async function deletePost(id: string) {
  try {
    // 获取文章信息
    const post = await db.post.findUnique({
      where: { id },
      select: { authorId: true, slug: true },
    });

    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    // 删除文章（级联删除会自动处理关联数据）
    await db.post.delete({
      where: { id },
    });

    revalidatePath('/blog');
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

/**
 * 增加文章浏览量
 */
export async function incrementPostView(postId: string, userId?: string) {
  try {
    // 记录浏览
    if (userId) {
      await db.postView.create({
        data: {
          postId,
          viewerId: userId,
        },
      });
    }

    // 增加浏览量计数
    await db.post.update({
      where: { id: postId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error incrementing view:', error);
    return { success: false, error: 'Failed to increment view' };
  }
}

/**
 * 获取文章的标签
 */
export async function getPostTags(postId: string) {
  try {
    const postTags = await db.postTag.findMany({
      where: { postId },
      include: {
        Tag: true,
      },
    });

    return { success: true, data: postTags.map((pt) => pt.Tag) };
  } catch (error) {
    console.error('Error fetching post tags:', error);
    return { success: false, error: 'Failed to fetch tags' };
  }
}

/**
 * 获取文章的评论
 */
export async function getPostComments(postId: string) {
  try {
    const comments = await db.comment.findMany({
      where: {
        postId,
        status: 'APPROVED',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: comments };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { success: false, error: 'Failed to fetch comments' };
  }
}

/**
 * 批量删除文章
 */
export async function batchDeletePosts(ids: string[]) {
  try {
    if (ids.length === 0) return { success: false, error: '未选择文章' };
    if (ids.length > 100) return { success: false, error: '单次最多删除 100 篇文章' };

    await db.post.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath('/blog');
    return { success: true, count: ids.length };
  } catch (error) {
    console.error('Error batch deleting posts:', error);
    return { success: false, error: 'Failed to batch delete posts' };
  }
}

/**
 * 批量更新文章状态
 */
export async function batchUpdatePostStatus(
  ids: string[],
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
) {
  try {
    if (ids.length === 0) return { success: false, error: '未选择文章' };
    if (ids.length > 100) return { success: false, error: '单次最多操作 100 篇文章' };

    const updateData: any = { status, updatedAt: new Date() };
    if (status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    await db.post.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    });

    revalidatePath('/blog');
    return { success: true, count: ids.length };
  } catch (error) {
    console.error('Error batch updating post status:', error);
    return { success: false, error: 'Failed to batch update status' };
  }
}

/**
 * 获取默认作者 ID
 */
export async function getDefaultAuthorId() {
  try {
    const user = await db.user.findFirst({
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: 'No user found' };
    }

    return { success: true, data: user.id };
  } catch (error) {
    console.error('Error fetching default author:', error);
    return { success: false, error: 'Failed to fetch default author' };
  }
}
