import { NextResponse } from "next/server";
import { db } from "~/server/db";
import bcrypt from "bcryptjs";
import { Prisma } from "../../../../../generated/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json(
        { error: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度至少为 6 位" },
        { status: 400 }
      );
    }

    // 生成密码哈希
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await db.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        password: passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json(
      { success: true, user },
      { status: 201 }
    );
  } catch (error) {
    console.error("注册异常:", error);

    // 处理唯一约束冲突（邮箱已存在）
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "该邮箱已被注册" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "服务器错误，请重试" },
      { status: 500 }
    );
  }
}
