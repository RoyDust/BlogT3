'use server';

import { db } from '~/server/db';

/**
 * 标签相关操作
 */

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 获取所有标签
 */
export async function getTags() {
  try {
    const data = await db.tag.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return { success: true, data: data ?? [] };
  } catch (error) {
    console.error('Error fetching tags:', error);
    return { success: false, error: 'Failed to fetch tags' };
  }
}

/**
 * 获取单个标签
 */
export async function getTagById(id: string) {
  try {
    const data = await db.tag.findUnique({
      where: { id }
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching tag:', error);
    return { success: false, error: 'Failed to fetch tag' };
  }
}

/**
 * 获取标签（通过 slug）
 */
export async function getTagBySlug(slug: string) {
  try {
    const data = await db.tag.findUnique({
      where: { slug }
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching tag:', error);
    return { success: false, error: 'Failed to fetch tag' };
  }
}

/**
 * 删除标签
 */
export async function deleteTag(id: string) {
  try {
    await db.tag.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting tag:', error);
    return { success: false, error: 'Failed to delete tag' };
  }
}

/**
 * 更新标签
 */
export async function updateTag(
  id: string,
  input: { name: string; slug: string }
) {
  try {
    const existing = await db.tag.findFirst({
      where: { slug: input.slug, id: { not: id } },
    });
    if (existing) {
      return { success: false, error: '该 Slug 已被其他标签使用' };
    }

    const tag = await db.tag.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
      },
    });

    return { success: true, data: tag };
  } catch (error) {
    console.error('Error updating tag:', error);
    return { success: false, error: 'Failed to update tag' };
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

    const tags = postTags.map((pt) => pt.Tag).filter((tag): tag is NonNullable<typeof tag> => tag !== null);

    return { success: true, data: tags };
  } catch (error) {
    console.error('Error fetching post tags:', error);
    return { success: false, error: 'Failed to fetch tags' };
  }
}
