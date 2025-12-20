-- 创建默认管理员用户
-- 这个脚本需要在 Supabase SQL Editor 中执行

-- 检查是否已存在用户
DO $$
BEGIN
  -- 如果 User 表为空，创建一个默认管理员用户
  IF NOT EXISTS (SELECT 1 FROM "User" LIMIT 1) THEN
    INSERT INTO "User" (
      "id",
      "email",
      "name",
      "password",
      "role",
      "status"
    ) VALUES (
      'default-author-id',
      'admin@example.com',
      '管理员',
      -- 密码: admin123 (使用 bcrypt 哈希，成本因子 10)
      '$2b$10$VeEHkHUECg.rLpB7xVBRrupIFcmdhObCO5IQFgMVcf.zU3owPlGzC',
      'ADMIN',
      'ACTIVE'
    );

    RAISE NOTICE '默认管理员用户已创建';
    RAISE NOTICE '邮箱: admin@example.com';
    RAISE NOTICE '密码: admin123';
    RAISE NOTICE '请登录后立即修改密码！';
  ELSE
    RAISE NOTICE '用户表已有数据，跳过创建';
  END IF;
END $$;

-- 验证用户是否创建成功
SELECT id, email, name, role, status, "createdAt"
FROM "User"
WHERE id = 'default-author-id' OR email = 'admin@example.com';
