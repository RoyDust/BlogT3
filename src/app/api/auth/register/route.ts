import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";
import bcrypt from "bcryptjs";

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
    const { data, error } = await supabase.from("User").insert([
      {
        email,
        name: name || email.split("@")[0],
        password: passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
    ]).select().single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "该邮箱已被注册" },
          { status: 400 }
        );
      }
      console.error("注册错误:", error);
      return NextResponse.json(
        { error: "注册失败，请重试" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, user: { id: data.id, email: data.email, name: data.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error("注册异常:", error);
    return NextResponse.json(
      { error: "服务器错误，请重试" },
      { status: 500 }
    );
  }
}
