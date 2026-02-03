# 数据访问层规范增量

## 修改需求

### 需求：数据库访问统一使用 Prisma

系统必须使用 Prisma ORM 进行所有数据库操作，不得使用 Supabase JavaScript SDK 进行数据库访问。

#### 场景：Server Actions 使用 Prisma

- **当** Server Action 需要访问数据库
- **那么** 必须使用 `prisma` 客户端实例
- **并且** 不得导入或使用 `supabase` 客户端

#### 场景：tRPC 路由使用 Prisma

- **当** tRPC 路由需要访问数据库
- **那么** 必须使用 `ctx.db`（Prisma 客户端）
- **并且** 不得导入或使用 `supabase` 客户端

#### 场景：客户端组件通过 Server Actions 访问数据

- **当** 客户端组件需要执行数据库操作
- **那么** 必须调用 Server Action
- **并且** 不得直接使用任何数据库客户端

#### 场景：页面组件使用 Prisma 或 Server Actions

- **当** 服务端页面组件需要访问数据库
- **那么** 可以直接使用 `prisma` 客户端或调用 Server Action
- **并且** 不得导入或使用 `supabase` 客户端

### 需求：类型安全的数据访问

系统必须使用 Prisma 生成的类型定义，确保数据访问的类型安全。

#### 场景：使用 Prisma 生成的类型

- **当** 定义数据模型类型
- **那么** 必须使用 Prisma 生成的类型（如 `Post`、`Category`、`Tag`）
- **并且** 不得手动定义与数据库表对应的类型

#### 场景：查询结果自动类型推断

- **当** 执行 Prisma 查询
- **那么** 查询结果的类型应自动推断
- **并且** TypeScript 应能检测类型错误

## 移除需求

### 需求：Supabase 客户端数据库访问

**原因**：项目统一使用 Prisma ORM 进行数据库访问，Supabase SDK 不再需要

**迁移**：
- 所有 `supabase.from()` 调用已迁移到对应的 Prisma 查询
- 客户端直接数据库访问已改为调用 Server Actions
- `src/lib/supabase.ts` 文件已删除
- `@supabase/supabase-js` 依赖已从 `package.json` 移除

