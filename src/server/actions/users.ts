'use server';

import { db } from '~/server/db';

/**
 * 用户相关操作
 */

export interface User {
  id: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
}

/**
 * 获取用户信息（通过 ID）
 */
export async function getUserById(id: string) {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: 'Failed to fetch user' };
  }
}

/**
 * 获取多个用户信息（通过 ID 列表）
 */
export async function getUsersByIds(ids: string[]) {
  try {
    const users = await db.user.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
      },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}
