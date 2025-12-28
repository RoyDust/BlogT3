'use server';

import { supabase } from '~/lib/supabase';

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
    const { data, error } = await supabase
      .from('Tag')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
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
    const { data, error } = await supabase
      .from('Tag')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
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
    const { data, error } = await supabase
      .from('Tag')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching tag:', error);
    return { success: false, error: 'Failed to fetch tag' };
  }
}
