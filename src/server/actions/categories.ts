'use server';

import { supabase } from '~/lib/supabase';

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
    const { data, error } = await supabase
      .from('Category')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { success: true, data: data ?? [] };
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
    const { data, error } = await supabase
      .from('Category')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
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
    const { data, error } = await supabase
      .from('Category')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching category:', error);
    return { success: false, error: 'Failed to fetch category' };
  }
}
