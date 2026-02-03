"use server";

import { db } from "~/server/db";
import bcrypt from "bcryptjs";
import { Prisma } from "../../../generated/prisma";

export async function registerUser(formData: {
  email: string;
  password: string;
  name?: string;
}) {
  try {
    // 加密密码
    const passwordHash = await bcrypt.hash(formData.password, 10);

    // 创建用户
    const user = await db.user.create({
      data: {
        email: formData.email,
        password: passwordHash,
        name: formData.name ?? formData.email.split("@")[0],
        role: "ADMIN",
        status: "ACTIVE",
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return { success: true, data: user };
  } catch (err) {
    // 处理唯一约束冲突（邮箱已存在）
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return { success: false, error: "该邮箱已被注册" };
      }
    }

    const message = err instanceof Error ? err.message : "未知错误";
    return { success: false, error: "注册失败: " + message };
  }
}
