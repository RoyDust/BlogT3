'use server';

import { supabase } from '~/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * 博客文章 CRUD 操作
 * 使用 Supabase 客户端进行数据库操作
 */

// 定义类型
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  authorId: string;
  categoryId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  readingTime: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

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
    const publishedAt = input.status === 'PUBLISHED' ? new Date().toISOString() : null;

    // 插入文章
    const { data: post, error } = await supabase
      .from('Post')
      .insert({
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
        publishedAt,
      })
      .select()
      .single();

    if (error) throw error;

    // 如果有标签，关联标签
    if (input.tagIds && input.tagIds.length > 0) {
      const postTags = input.tagIds.map((tagId) => ({
        postId: post.id,
        tagId,
      }));

      const { error: tagError } = await supabase.from('PostTag').insert(postTags);
      if (tagError) throw tagError;
    }

    // 更新作者的文章数
    await supabase.rpc('increment_user_post_count', { user_id: input.authorId });

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
    const { data: post, error } = await supabase
      .from('Post')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
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
    const { data: post, error } = await supabase
      .from('Post')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
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
    let query = supabase.from('Post').select('*', { count: 'exact' });

    // 应用筛选条件
    if (options.status) {
      query = query.eq('status', options.status);
    }
    if (options.authorId) {
      query = query.eq('authorId', options.authorId);
    }
    if (options.categoryId) {
      query = query.eq('categoryId', options.categoryId);
    }
    if (options.featured !== undefined) {
      query = query.eq('featured', options.featured);
    }

    // 排序
    const orderBy = options.orderBy || 'createdAt';
    const order = options.order || 'desc';
    query = query.order(orderBy, { ascending: order === 'asc' });

    // 分页
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data: posts, error, count } = await query;

    if (error) throw error;
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
    }

    // 如果状态改为 PUBLISHED 且之前没有发布时间，设置发布时间
    if (input.status === 'PUBLISHED') {
      const { data: currentPost } = await supabase
        .from('Post')
        .select('publishedAt')
        .eq('id', id)
        .single();

      if (currentPost && !currentPost.publishedAt) {
        updateData.publishedAt = new Date().toISOString();
      }
    }

    // 移除 tagIds（后续单独处理）
    const tagIds = updateData.tagIds;
    delete updateData.tagIds;

    // 更新文章
    const { data: post, error } = await supabase
      .from('Post')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // 如果提供了标签，更新标签关联
    if (tagIds !== undefined) {
      // 删除旧的标签关联
      await supabase.from('PostTag').delete().eq('postId', id);

      // 添加新的标签关联
      if (tagIds.length > 0) {
        const postTags = tagIds.map((tagId: string) => ({
          postId: id,
          tagId,
        }));
        await supabase.from('PostTag').insert(postTags);
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
    // 获取文章信息（用于更新作者统计）
    const { data: post } = await supabase
      .from('Post')
      .select('authorId, slug')
      .eq('id', id)
      .single();

    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    // 删除相关数据（应用层保证一致性）
    await supabase.from('PostTag').delete().eq('postId', id);
    await supabase.from('Comment').delete().eq('postId', id);
    await supabase.from('Like').delete().eq('targetType', 'POST').eq('targetId', id);
    await supabase.from('PostView').delete().eq('postId', id);

    // 删除文章
    const { error } = await supabase.from('Post').delete().eq('id', id);
    if (error) throw error;

    // 更新作者的文章数
    await supabase.rpc('decrement_user_post_count', { user_id: post.authorId });

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
      await supabase.from('PostView').insert({
        postId,
        userId,
      });
    }

    // 增加浏览量计数
    const { error } = await supabase.rpc('increment', {
      table_name: 'Post',
      row_id: postId,
      column_name: 'viewCount',
    });

    if (error) throw error;
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
    const { data, error } = await supabase
      .from('PostTag')
      .select('tagId, Tag(*)')
      .eq('postId', postId);

    if (error) throw error;
    return { success: true, data: data.map((pt) => pt.Tag) };
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
    const { data, error } = await supabase
      .from('Comment')
      .select('*')
      .eq('postId', postId)
      .eq('status', 'APPROVED')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { success: false, error: 'Failed to fetch comments' };
  }
}
