"use server";

import { db } from "~/server/db";
import { Prisma } from "../../../../../generated/prisma";

export async function createCategory(formData: {
  name: string;
  slug: string;
  description: string;
  color: string;
}) {
  try {
    await db.category.create({
      data: {
        ...formData,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return { success: false, error: "分类名称或 Slug 已存在" };
      }
    }
    const message = err instanceof Error ? err.message : "未知错误";
    return { success: false, error: "创建失败: " + message };
  }
}
