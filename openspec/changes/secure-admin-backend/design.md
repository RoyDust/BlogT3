# 设计文档：后台管理系统安全加固与功能完善

## 架构概览

本设计文档描述了后台管理系统安全加固和功能完善的技术方案，重点解决认证授权、数据访问控制和功能完整性问题。

## 核心设计决策

### 1. 数据访问层统一

**决策**：使用 Prisma 作为唯一的数据访问层，废弃直接使用 Supabase 客户端进行写操作。

**理由**：
- Prisma 提供类型安全和迁移管理
- 避免命名体系混乱（PascalCase vs snake_case）
- 便于统一权限控制和审计

**实施方案**：
- 保留 Prisma schema 中的 PascalCase 命名（Post/Category/Tag/User）
- 所有数据库操作通过 Prisma Client
- Supabase 客户端仅用于存储和实时订阅（如需要）

### 2. 认证授权架构

**决策**：采用 NextAuth + Server Actions + 权限中间件的架构。

**架构图**：
```
客户端请求
    ↓
Next.js Middleware（路由保护）
    ↓
Server Actions（业务逻辑）
    ↓
权限检查函数（requireAdmin/requireAuth）
    ↓
Prisma Client（数据访问）
    ↓
PostgreSQL（数据存储）
```

**组件职责**：

1. **Next.js Middleware**（`src/middleware.ts`）
   - 保护 `/admin/*` 路由
   - 检查用户是否已登录
   - 重定向未登录用户到登录页

2. **权限检查函数**（新建 `src/lib/auth-utils.ts`）
   - `requireAuth()`: 要求用户已登录
   - `requireAdmin()`: 要求用户具有 ADMIN 角色
   - `requireRole(role)`: 要求用户具有特定角色
   - 返回当前用户信息或抛出错误

3. **Server Actions**（`src/server/actions/*`）
   - 所有写操作必须调用权限检查函数
   - 自动绑定当前登录用户 ID
   - 统一错误处理和返回格式

### 3. 注册和上传安全

**注册接口改造**：

**方案 A**：环境变量控制（推荐）
```typescript
// src/app/api/auth/register/route.ts
if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_REGISTRATION) {
  return NextResponse.json({ error: '注册已关闭' }, { status: 403 });
}
```

**方案 B**：邀请码机制
```typescript
// 需要提供有效的邀请码
const { inviteCode } = body;
const validCode = await prisma.inviteCode.findUnique({
  where: { code: inviteCode, used: false }
});
```

**上传接口改造**：
```typescript
// src/app/api/upload/route.ts
export async function POST(request: NextRequest) {
  // 1. 验证用户身份
  const user = await requireAdmin();

  // 2. 验证文件
  // 3. 上传到七牛云
  // 4. 记录审计日志
  await prisma.uploadLog.create({
    data: {
      userId: user.id,
      fileName: file.name,
      fileSize: file.size,
      url: result.url,
    }
  });
}
```

### 4. 公开 API 内容过滤

**决策**：在数据访问层强制过滤未发布内容。

**实施方案**：

创建两套查询函数：
- `getPublicPosts()`: 只返回 PUBLISHED 状态
- `getAdminPosts()`: 返回所有状态（需要权限）

```typescript
// src/server/queries/posts.ts
export async function getPublicPosts(options) {
  return prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      ...options.where,
    },
  });
}

export async function getAdminPosts(options) {
  await requireAdmin();
  return prisma.post.findMany(options);
}
```

### 5. 作者绑定策略

**决策**：在 Server Actions 中自动绑定当前登录用户，不信任客户端传入的 authorId。

**实施方案**：
```typescript
export async function createPost(input: CreatePostInput) {
  const user = await requireAdmin();

  // 强制使用当前登录用户的 ID
  const post = await prisma.post.create({
    data: {
      ...input,
      authorId: user.id, // 覆盖客户端传入的值
    },
  });

  return post;
}
```

## 数据模型调整

### 审计日志表（新增）

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // CREATE, UPDATE, DELETE, UPLOAD
  resource  String   // POST, CATEGORY, TAG, GALLERY, IMAGE
  resourceId String?
  details   Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([action, resource])
  @@index([createdAt])
}
```

### 上传日志表（新增）

```prisma
model UploadLog {
  id        String   @id @default(cuid())
  userId    String
  fileName  String
  fileSize  Int
  fileType  String
  url       String
  key       String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([createdAt])
}
```

## 关键技术决策

### 为什么选择 Server Actions 而不是 tRPC？

**优点**：
1. Next.js 15 原生支持，无需额外配置
2. 自动处理序列化和错误边界
3. 与 React Server Components 无缝集成
4. 代码改动最小

**缺点**：
1. 类型安全不如 tRPC 完整
2. 需要手动处理权限检查

**结论**：对于后台管理系统，Server Actions 的简单性和与 Next.js 的集成度更重要。

### 为什么不使用 Supabase RLS？

**原因**：
1. Prisma 与 Supabase RLS 集成有限
2. RLS 策略调试困难
3. 应用层权限控制更灵活
4. 便于审计和日志记录

**结论**：在应用层实现权限控制，数据库层作为最后防线。

### 为什么不完全废弃 Supabase 客户端？

**原因**：
1. 可能用于实时订阅功能
2. 可能用于存储功能（如果不用七牛云）
3. 保持灵活性

**结论**：保留 Supabase 客户端，但仅用于读操作和特殊功能，所有写操作通过 Prisma。

## 安全考虑

### 1. CSRF 保护
- NextAuth 自动处理 CSRF token
- Server Actions 自动验证来源

### 2. XSS 防护
- React 自动转义输出
- Markdown 内容需要使用 sanitize 库

### 3. SQL 注入防护
- Prisma 自动参数化查询
- 避免使用 `prisma.$queryRaw` 拼接用户输入

### 4. 文件上传安全
- 验证文件类型（MIME type + 文件扩展名）
- 限制文件大小（10MB）
- 使用随机文件名
- 记录上传日志

### 5. 速率限制
- 使用 `@upstash/ratelimit` 或类似库
- 限制注册、登录、上传频率

## 性能考虑

### 1. 数据库查询优化
- 使用 Prisma 的 `select` 和 `include` 精确控制返回字段
- 为常用查询添加索引
- 使用分页避免一次性加载大量数据

### 2. 缓存策略
- 使用 Next.js 的 `unstable_cache` 缓存公开内容
- 使用 `revalidatePath` 在内容更新时清除缓存

### 3. 图片优化
- 使用七牛云 CDN
- 生成多种尺寸的缩略图
- 使用 Next.js Image 组件

## 向后兼容性

### 迁移策略

1. **阶段 1**：添加新的 Server Actions，保留旧代码
2. **阶段 2**：逐步迁移前端调用到新 API
3. **阶段 3**：废弃旧的 Supabase 直连代码

### 数据迁移

如果需要统一表命名：
1. 创建 Prisma 迁移脚本
2. 在低峰期执行迁移
3. 保留旧表作为备份
4. 验证数据完整性后删除旧表

## 测试策略

### 单元测试
- 权限检查函数
- 数据访问函数
- 业务逻辑函数

### 集成测试
- Server Actions 端到端测试
- 权限验证测试
- 数据一致性测试

### 安全测试
- 未授权访问测试
- CSRF 测试
- SQL 注入测试
- 文件上传安全测试

## 监控和日志

### 审计日志
- 记录所有管理员操作
- 包含用户 ID、操作类型、资源 ID、时间戳
- 可查询和导出

### 错误日志
- 使用结构化日志（如 Pino）
- 记录错误堆栈和上下文
- 集成错误追踪服务（如 Sentry）

### 性能监控
- 记录慢查询
- 监控 API 响应时间
- 追踪资源使用情况
