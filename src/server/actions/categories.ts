'use server';

import { db } from '~/server/db';

/**
 * 分类相关操作
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 获取所有分类
 */
export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

/**
 * 获取单个分类
 */
export async function getCategoryById(id: string) {
  try {
    const category = await db.category.findUnique({
      where: { id },
    });

    if (!category) {
      return { success: false, error: 'Category not found' };
    }

    return { success: true, data: category };
  } catch (error) {
    console.error('Error fetching category:', error);
    return { success: false, error: 'Failed to fetch category' };
  }
}

/**
 * 获取分类（通过 slug）
 */
export async function getCategoryBySlug(slug: string) {
  try {
    const category = await db.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return { success: false, error: 'Category not found' };
    }

    return { success: true, data: category };
  } catch (error) {
    console.error('Error fetching category:', error);
    return { success: false, error: 'Failed to fetch category' };
  }
}

/**
 * 删除分类
 */
export async function deleteCategory(id: string) {
  try {
    await db.category.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}

/**
 * 更新分类
 */
export async function updateCategory(
  id: string,
  input: { name: string; slug: string; description?: string; color: string }
) {
  try {
    // 检查 slug 唯一性（排除当前分类）
    const existing = await db.category.findFirst({
      where: { slug: input.slug, id: { not: id } },
    });
    if (existing) {
      return { success: false, error: '该 Slug 已被其他分类使用' };
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        color: input.color,
        updatedAt: new Date(),
      },
    });

    return { success: true, data: category };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, error: 'Failed to update category' };
  }
}

/**
 * 获取多个分类（通过 ID 列表）
 */
export async function getCategoriesByIds(ids: string[]) {
  try {
    const categories = await db.category.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
      },
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

/**
 * 获取所有分类及其文章数量
 */
export async function getCategoriesWithPostCount() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            Post: {
              where: {
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
    });

    const categoriesWithCount = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      count: category._count.Post,
    }));

    return { success: true, data: categoriesWithCount };
  } catch (error) {
    console.error('Error fetching categories with count:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}
