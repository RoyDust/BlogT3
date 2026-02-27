'use server';

import { auth } from '~/server/auth';

/**
 * 权限检查工具函数
 * 用于 Server Actions 中验证用户身份和角色
 */

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

interface AuthResult {
  authenticated: true;
  userId: string;
  role: UserRole;
}

interface AuthError {
  authenticated: false;
  error: string;
}

/**
 * 验证用户是否已登录
 */
export async function requireAuth(): Promise<AuthResult | AuthError> {
  const session = await auth();

  if (!session?.user?.id) {
    return { authenticated: false, error: '未登录，请先登录' };
  }

  return {
    authenticated: true,
    userId: session.user.id,
    role: (session.user.role as UserRole) ?? 'USER',
  };
}

/**
 * 验证用户是否为管理员（ADMIN 或 MODERATOR）
 */
export async function requireAdmin(): Promise<AuthResult | AuthError> {
  const result = await requireAuth();

  if (!result.authenticated) {
    return result;
  }

  if (result.role !== 'ADMIN' && result.role !== 'MODERATOR') {
    return { authenticated: false, error: '权限不足，需要管理员权限' };
  }

  return result;
}
