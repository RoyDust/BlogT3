# 设计文档：迁移到 Prisma 客户端

## 上下文

当前项目使用混合的数据访问模式：
- 部分代码使用 Supabase JavaScript SDK (`@supabase/supabase-js`) 进行数据库操作
- 部分代码使用 Prisma ORM 进行数据库操作
- 数据库托管在 Supabase 平台上（PostgreSQL）

这种混合模式导致：
1. 代码风格不一致
2. 类型安全性参差不齐
3. 维护成本增加
4. 新开发者学习曲线陡峭
5. 客户端直接访问数据库存在安全风险

项目已经配置了 Prisma，并且大部分新代码已经在使用 Prisma。本次迁移的目标是完全统一到 Prisma，移除 Supabase SDK 依赖。

## 目标 / 非目标

### 目标

- 将所有 Supabase 客户端调用迁移到 Prisma
- 移除 `@supabase/supabase-js` 依赖
- 统一数据访问层，提高代码一致性
- 提高类型安全性
- 确保所有现有功能正常工作

### 非目标

- 不迁移数据库托管平台（继续使用 Supabase PostgreSQL）
- 不修改数据库 schema
- 不改变 API 接口
- 不实施新功能
- 不添加自动化测试（虽然建议，但不在本次范围内）

## 技术决策

### 决策 1：使用 Prisma Client 替代 Supabase Client

**选择**：使用 Prisma Client 进行所有数据库操作

**理由**：
- Prisma 提供更好的类型安全（自动生成类型）
- Prisma 查询 API 更符合 TypeScript 习惯
- 项目已经配置了 Prisma，减少学习成本
- Prisma 与 Next.js 集成良好
- 社区支持和文档完善

**考虑的替代方案**：
1. **继续使用 Supabase SDK**
   - 优点：无需迁移
   - 缺点：类型安全性较差，与项目架构不一致

2. **使用原生 SQL**
   - 优点：性能最优，灵活性最高
   - 缺点：失去类型安全，维护成本高

### 决策 2：客户端组件通过 Server Actions 访问数据库

**选择**：客户端组件不直接访问数据库，而是调用 Server Actions

**理由**：
- 符合 Next.js 15 最佳实践
- 提高安全性（避免暴露数据库凭证）
- 便于添加权限检查和业务逻辑
- 减少客户端打包体积

**实施方式**：
```typescript
// 客户端组件
'use client';
import { deletePost } from '~/server/actions/posts';

export function DeleteButton({ postId }: { postId: string }) {
  const handleDelete = async () => {
    await deletePost(postId);
  };
  return <button onClick={handleDelete}>删除</button>;
}
```

### 决策 3：保持 Supabase PostgreSQL 连接

**选择**：继续使用 Supabase 托管的 PostgreSQL 数据库

**理由**：
- 无需迁移数据
- Supabase 提供可靠的数据库托管服务
- 通过 `DATABASE_URL` 连接，与 Supabase SDK 无关
- 未来可以轻松迁移到其他 PostgreSQL 托管服务

**配置**：
```env
# .env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"
```

### 决策 4：分阶段迁移策略

**选择**：按文件类型分阶段迁移，每个阶段完成后进行验证

**阶段顺序**：
1. Server Actions（优先级最高，客户端依赖）
2. tRPC 路由（可并行）
3. 客户端组件
4. 页面组件
5. API 路由
6. 清理和验证

**理由**：
- 降低风险，每个阶段可以独立验证
- Server Actions 是基础，必须先完成
- 便于回滚和问题定位
- 可以分多个 commit 提交

## Supabase 到 Prisma 查询映射

### 基本查询映射

#### 查询所有记录

**Supabase**:
```typescript
const { data, error } = await supabase.from('Post').select('*');
```

**Prisma**:
```typescript
const posts = await prisma.post.findMany();
```

#### 查询单条记录

**Supabase**:
```typescript
const { data, error } = await supabase
  .from('Post')
  .select('*')
  .eq('id', postId)
  .single();
```

**Prisma**:
```typescript
const post = await prisma.post.findUnique({
  where: { id: postId }
});
```

#### 条件查询

**Supabase**:
```typescript
const { data, error } = await supabase
  .from('Post')
  .select('*')
  .eq('status', 'PUBLISHED')
  .order('createdAt', { ascending: false });
```

**Prisma**:
```typescript
const posts = await prisma.post.findMany({
  where: { status: 'PUBLISHED' },
  orderBy: { createdAt: 'desc' }
});
```

#### 关联查询

**Supabase**:
```typescript
const { data, error } = await supabase
  .from('Post')
  .select('*, Category(*), Tag(*)');
```

**Prisma**:
```typescript
const posts = await prisma.post.findMany({
  include: {
    category: true,
    tags: true
  }
});
```

#### 创建记录

**Supabase**:
```typescript
const { data, error } = await supabase
  .from('Post')
  .insert({
    title: 'New Post',
    content: 'Content',
    authorId: userId
  })
  .select()
  .single();
```

**Prisma**:
```typescript
const post = await prisma.post.create({
  data: {
    title: 'New Post',
    content: 'Content',
    authorId: userId
  }
});
```

#### 更新记录

**Supabase**:
```typescript
const { data, error } = await supabase
  .from('Post')
  .update({ title: 'Updated Title' })
  .eq('id', postId)
  .select()
  .single();
```

**Prisma**:
```typescript
const post = await prisma.post.update({
  where: { id: postId },
  data: { title: 'Updated Title' }
});
```

#### 删除记录

**Supabase**:
```typescript
const { error } = await supabase
  .from('Post')
  .delete()
  .eq('id', postId);
```

**Prisma**:
```typescript
await prisma.post.delete({
  where: { id: postId }
});
```

### 错误处理差异

**Supabase**:
```typescript
const { data, error } = await supabase.from('Post').select('*');
if (error) {
  throw new Error(error.message);
}
return data;
```

**Prisma**:
```typescript
try {
  const posts = await prisma.post.findMany();
  return posts;
} catch (error) {
  throw error;
}
```

## 风险 / 权衡

### 风险 1：查询性能差异

**风险**：Prisma 生成的 SQL 查询可能与 Supabase 客户端不同，导致性能变化

**缓解措施**：
- 关注关键查询的性能
- 使用 Prisma 的查询日志功能监控生成的 SQL
- 必要时添加数据库索引
- 使用 `prisma.$queryRaw` 优化特定查询

### 风险 2：类型不匹配

**风险**：Supabase 和 Prisma 的类型定义可能不完全一致

**缓解措施**：
- 仔细检查每个迁移的函数
- 运行 TypeScript 类型检查
- 测试所有受影响的功能

### 风险 3：功能回归

**风险**：迁移过程中可能引入 bug

**缓解措施**：
- 分阶段迁移，每个阶段独立验证
- 手动测试所有受影响的功能
- 保持 Git 提交历史清晰，便于回滚
- 在开发环境充分测试后再部署到生产环境

### 风险 4：遗漏的 Supabase 引用

**风险**：可能遗漏某些文件中的 Supabase 调用

**缓解措施**：
- 使用 grep 搜索所有 Supabase 引用
- 在清理阶段进行全面检查
- 删除 `src/lib/supabase.ts` 后，TypeScript 会报错未解析的导入

## 迁移计划

### 阶段 1：Server Actions（第 1-2 天）

1. 迁移 `posts.ts`
2. 迁移 `categories.ts`
3. 迁移 `tags.ts`
4. 迁移 `galleries.ts`
5. 迁移 `comments.ts` 和 `likes.ts`
6. 测试所有 Server Actions

### 阶段 2：tRPC 路由（第 2-3 天）

1. 迁移 `post.ts` 路由
2. 迁移 `category.ts` 路由
3. 迁移 `like.ts` 路由
4. 迁移 `feedback.ts` 路由
5. 测试所有 tRPC 查询

### 阶段 3：客户端组件（第 3-4 天）

1. 迁移删除按钮组件
2. 迁移表单组件
3. 迁移图片管理组件
4. 测试所有客户端交互

### 阶段 4：页面组件（第 4-5 天）

1. 迁移公开页面
2. 迁移管理后台页面
3. 测试所有页面渲染

### 阶段 5：清理和验证（第 5-6 天）

1. 删除 Supabase 文件
2. 更新依赖和配置
3. 全面测试
4. 文档更新

### 回滚策略

如果在任何阶段遇到严重问题：
1. 使用 `git revert` 回滚到上一个稳定提交
2. 分析问题原因
3. 修复问题后重新开始该阶段
4. 考虑调整迁移策略

## 待决问题

1. **是否需要性能基准测试？**
   - 建议：在迁移前后对关键查询进行性能测试
   - 决策：根据项目时间和资源决定

2. **是否需要添加自动化测试？**
   - 建议：迁移完成后添加集成测试
   - 决策：不在本次迁移范围内，但强烈建议后续添加

3. **是否需要保留 Supabase SDK 作为备用？**
   - 建议：完全移除，避免混淆
   - 决策：完全移除

## 参考资料

- [Prisma 官方文档](https://www.prisma.io/docs)
- [Prisma Client API 参考](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Supabase 到 Prisma 迁移指南](https://www.prisma.io/docs/guides/migrate-to-prisma/migrate-from-supabase)

