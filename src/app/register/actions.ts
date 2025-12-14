"use server";

import { supabase } from "~/lib/supabase";
import bcrypt from "bcryptjs";

export async function registerUser(formData: {
  email: string;
  password: string;
  name?: string;
}) {
  try {
    // 加密密码
    const passwordHash = await bcrypt.hash(formData.password, 10);

    // 创建用户
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email: formData.email,
          password_hash: passwordHash,
          name: formData.name || formData.email.split("@")[0],
          role: "admin",
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "该邮箱已被注册" };
      }
      return { success: false, error: "注册失败: " + error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: "注册失败: " + err.message };
  }
}
