# 数据库迁移说明

本目录包含交互侧边栏功能所需的数据库迁移脚本。

## 迁移文件

### 001_create_feedback_table.sql
创建反馈功能所需的数据库表和枚举类型。

**包含内容**：
- `FeedbackType` 枚举类型（BUG_REPORT, SUGGESTION, OTHER）
- `Feedback` 表及相关索引

### 001_create_feedback_table_rollback.sql
回滚脚本，用于撤销上述迁移。

## 执行步骤

### 1. 在 Supabase 执行迁移

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目
3. 进入 **SQL Editor**
4. 创建新查询
5. 复制 `001_create_feedback_table.sql` 的内容
6. 点击 **Run** 执行

### 2. 更新 Prisma Schema

在 `prisma/schema.prisma` 文件中添加以下内容：

```prisma
enum FeedbackType {
  BUG_REPORT
  SUGGESTION
  OTHER
}

model Feedback {
  id          String       @id @default(cuid())
  content     String
  type        FeedbackType
  targetType  String
  targetId    String
  userIp      String?
  userAgent   String?
  createdAt   DateTime     @default(now())

  @@index([targetType, targetId])
  @@index([createdAt])
  @@map("Feedback")
}
```

### 3. 同步 Prisma 类型

在项目根目录执行以下命令：

```bash
# 从数据库拉取最新结构（可选，用于验证）
pnpm db:pull

# 生成 Prisma 客户端类型
pnpm prisma generate

# 验证类型定义
pnpm typecheck
```

## 回滚迁移

如果需要撤销迁移，在 Supabase SQL Editor 中执行：

```bash
# 执行回滚脚本
001_create_feedback_table_rollback.sql
```

然后从 `prisma/schema.prisma` 中删除 `Feedback` 模型和 `FeedbackType` 枚举。

## 验证

迁移成功后，您应该能够：

1. 在 Supabase Table Editor 中看到 `Feedback` 表
2. 表包含以下字段：
   - id (text, primary key)
   - content (text)
   - type (FeedbackType enum)
   - targetType (text)
   - targetId (text)
   - userIp (text, nullable)
   - userAgent (text, nullable)
   - createdAt (timestamp)
3. 存在两个索引：
   - `Feedback_targetType_targetId_idx`
   - `Feedback_createdAt_idx`

## 注意事项

- 执行迁移前建议先备份数据库
- 确保在生产环境执行前先在开发环境测试
- 迁移脚本使用 `IF EXISTS` 和 `IF NOT EXISTS` 确保幂等性

