import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

async function test() {
  console.log("=== 检查 users 表 ===");

  // 1. 检查表是否存在
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .limit(5);

  if (error) {
    console.error("❌ 错误:", error.message);
    console.log("\n请先在 Supabase SQL Editor 中运行 supabase-users-table.sql");
    return;
  }

  console.log(`\n✅ users 表存在，找到 ${users.length} 个用户:`);
  users.forEach((user) => {
    console.log(`  - ${user.email} (${user.role}, active: ${user.is_active})`);
  });

  // 2. 测试密码 "123456"
  console.log("\n=== 测试密码验证 ===");
  const testPassword = "123456";

  if (users.length > 0) {
    const user = users[0];
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    console.log(`\n测试用户: ${user.email}`);
    console.log(`密码 "${testPassword}" 验证结果: ${isValid ? "✅ 正确" : "❌ 错误"}`);
    console.log(`\n如果验证失败，请使用以下 SQL 重新生成密码哈希：`);
    console.log(`\nUPDATE users SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye.IQ7WJv0qKNL0M0wS0a.hFw8xYw8Xee' WHERE email = '${user.email}';`);
  }

  // 3. 生成新的密码哈希供参考
  const newHash = await bcrypt.hash("123456", 10);
  console.log(`\n=== 新密码哈希（供参考）===`);
  console.log(`密码: "123456"`);
  console.log(`哈希: ${newHash}`);
}

test().catch(console.error);
