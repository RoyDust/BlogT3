# BlogT3 数据库设计文档

## 概述

本文档描述了 BlogT3 博客系统的完整数据库设计方案。系统使用 PostgreSQL 数据库和 Prisma ORM。

**设计原则：**
- ❌ 不使用外键约束（提高性能和灵活性）
- ✅ 应用层保证数据一致性
- ✅ 使用索引优化查询性能

**技术栈：**
- 数据库：PostgreSQL
- ORM：Prisma
- 认证：NextAuth.js
- 部署：建议使用 Vercel + Supabase/Neon

---

## 数据库架构图

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    User     │───────│     Post     │───────│  Category   │
└─────────────┘       └──────────────┘       └─────────────┘
       │                      │                      │
       │                      │                      │
       │              ┌───────┼───────┐              │
       │              │       │       │              │
       ▼              ▼       ▼       ▼              ▼
┌─────────────┐  ┌──────┐ ┌──────┐ ┌──────┐  ┌──────────┐
│  Account    │  │PostTag│ │ Tag │ │ Like │  │PostView  │
│  Session    │  └──────┘ └──────┘ └──────┘  └──────────┘
└─────────────┘                        │
                                       ▼
┌──────────────┐      ┌──────────────┐┌──────────┐
│PhotoGallery  │──────│  PhotoImage  ││ Comment  │
└──────────────┘      └──────────────┘└──────────┘
       │
       ▼
┌──────────────┐
│GalleryTag    │
└──────────────┘
```

---

## 核心实体详细设计

### 1. 用户系统 (User Management)

#### 1.1 User（用户表）

**用途：** 存储用户基本信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String (cuid) | PK | 用户唯一标识 |
| email | String | UNIQUE, NOT NULL | 用户邮箱 |
| emailVerified | DateTime | NULLABLE | 邮箱验证时间 |
| name | String | NULLABLE | 用户昵称 |
| password | String | NULLABLE | 密码哈希（使用 bcrypt） |
| avatar | String | NULLABLE | 头像 URL |
| bio | String (Text) | NULLABLE | 个人简介 |
| role | Enum | DEFAULT 'USER' | 用户角色：USER/ADMIN/MODERATOR |
| status | Enum | DEFAULT 'ACTIVE' | 账号状态：ACTIVE/BANNED/DELETED |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

**索引：**
- PRIMARY KEY (id)
- UNIQUE INDEX (email)
- INDEX (role, status)

**关联关系（应用层维护）：**
- userId 存在于：Post, PhotoGallery, Comment, Like, Account, Session

---

#### 1.2 Account（账号表 - NextAuth）

**用途：** 存储 OAuth 提供商账号信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String (cuid) | PK | 账号唯一标识 |
| userId | String | NOT NULL | 关联用户 ID |
| type | String | NOT NULL | 账号类型（oauth/email） |
| provider | String | NOT NULL | 提供商（github/google） |
| providerAccountId | String | NOT NULL | 提供商账号 ID |
| refresh_token | String (Text) | NULLABLE | 刷新令牌 |
| access_token | String (Text) | NULLABLE | 访问令牌 |
| expires_at | Int | NULLABLE | 令牌过期时间 |
| token_type | String | NULLABLE | 令牌类型 |
| scope | String | NULLABLE | 权限范围 |
| id_token | String (Text) | NULLABLE | ID 令牌 |
| session_state | String | NULLABLE | 会话状态 |
| refresh_token_expires_in | Int | NULLABLE | 刷新令牌过期时间 |

**索引：**
- PRIMARY KEY (id)
- UNIQUE INDEX (provider, providerAccountId)
- INDEX (userId)

**清理策略：**
- 应用层：用户删除时删除关联账号

---

#### 1.3 Session（会话表 - NextAuth）

**用途：** 存储用户会话信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String (cuid) | PK | 会话唯一标识 |
| sessionToken | String | UNIQUE, NOT NULL | 会话令牌 |
| userId | String | NOT NULL | 关联用户 ID |
| expires | DateTime | NOT NULL | 过期时间 |

**索引：**
- PRIMARY KEY (id)
- UNIQUE INDEX (sessionToken)
- INDEX (userId)
- INDEX (expires)

**清理策略：**
- 定时任务：删除过期会话（expires < now()）

---

#### 1.4 VerificationToken（验证令牌表）

**用途：** 存储邮箱验证/密码重置令牌

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| identifier | String | NOT NULL | 标识符（邮箱） |
| token | String | UNIQUE, NOT NULL | 验证令牌 |
| expires | DateTime | NOT NULL | 过期时间 |

**索引：**
- UNIQUE INDEX (identifier, token)
- UNIQUE INDEX (token)
- INDEX (expires)

**清理策略：**
- 定时任务：删除过期令牌

---

### 2. 博客系统 (Blog System)

#### 2.1 Post（文章表）

**用途：** 存储博客文章内容

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String (cuid) | PK | 文章唯一标识 |
| slug | String | UNIQUE, NOT NULL | URL 友好的唯一标识 |
| title | String | NOT NULL | 文章标题 |
| excerpt | String (Text) | NULLABLE | 文章摘要 |
| content | String (Text) | NOT NULL | 文章内容（Markdown） |
| coverImage | String | NULLABLE | 封面图 URL |
| status | Enum | DEFAULT 'DRAFT' | 状态：DRAFT/PUBLISHED/ARCHIVED |
| featured | Boolean | DEFAULT false | 是否精选 |
| viewCount | Int | DEFAULT 0 | 浏览次数 |
| likeCount | Int | DEFAULT 0 | 点赞数（冗余字段） |
| commentCount | Int | DEFAULT 0 | 评论数（冗余字段） |
| wordCount | Int | DEFAULT 0 | 字数统计 |
| readingTime | Int | DEFAULT 0 | 阅读时间（分钟） |
| publishedAt | DateTime | NULLABLE | 发布时间 |
| authorId | String | NOT NULL | 作者 ID |
| categoryId | String | NOT NULL | 分类 ID |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

**索引：**
- PRIMARY KEY (id)
- UNIQUE INDEX (slug)
- INDEX (authorId)
- INDEX (categoryId)
- INDEX (status, publishedAt DESC)
- INDEX (featured, publishedAt DESC)
- INDEX (likeCount DESC)
- FULLTEXT INDEX (title, excerpt, content) *可选，用于全文搜索*

**计算字段：**
- `readingTime`: 根据 `wordCount` 自动计算（250字/分钟）
- `wordCount`: 在保存时自动计算内容字数
- `likeCount`: 定期从 Like 表聚合更新
- `commentCount`: 定期从 Comment 表聚合更新

---

#### 2.2 Category（分类表）

**用途：** 文章分类管理

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String (cuid) | PK | 分类唯一标识 |
| name | String | UNIQUE, NOT NULL | 分类名称 |
| slug | String | UNIQUE, NOT NULL | URL 友好标识 |
| description | String (Text) | NULLABLE | 分类描述 |
| color | String | DEFAULT '#3b82f6' | 分类颜色（Hex） |
| icon | String | NULLABLE | 图标（emoji 或 URL） |
| postCount | Int | DEFAULT 0 | 文章数量（冗余字段） |
| sortOrder | Int | DEFAULT 0 | 排序顺序 |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

**索引：**
- PRIMARY KEY (id)
- UNIQUE INDEX (slug)
- UNIQUE INDEX (name)
- INDEX (sortOrder)

**删除策略：**
- 应用层：删除前检查 postCount，如果有文章则拒绝删除

---

#### 2.3 Tag（标签表）

**用途：** 文章和相册标签

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String (cuid) | PK | 标签唯一标识 |
| name | String | UNIQUE, NOT NULL | 标签名称 |
| slug | String | UNIQUE, NOT NULL | URL 友好标识 |
| postCount | Int | DEFAULT 0 | 使用次数（冗余字段） |
| galleryCount | Int | DEFAULT 0 | 相册使用次数（冗余字段） |
| createdAt | DateTime | DEFAULT now() | 创建时间 |

**索引：**
- PRIMARY KEY (id)
- UNIQUE INDEX (slug)
- UNIQUE INDEX (name)
- INDEX (postCount DESC)

---

#### 2.4 PostTag（文章-标签关联表）

**用途：** 多对多关系中间表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| postId | String | NOT NULL | 文章 ID |
| tagId | String | NOT NULL | 标签 ID |
| createdAt | DateTime | DEFAULT now() | 创建时间 |

**索引：**
- PRIMARY KEY (postId, tagId)
- INDEX (tagId)

**清理策略：**
- 应用层：删除文章时删除关联记录
- 应用层：删除标签时删除关联记录

---

#### 2.5 Comment（评论表）

**用途：** 文章评论系统

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String (cuid) | PK | 评论唯一标识 |
| content | String (Text) | NOT NULL | 评论内容 |
| postId | String | NOT NULL | 关联文章 ID |
| authorId | String | NULLABLE | 评论者 ID（未登录用户为 NULL） |
| authorName | String | NULLABLE | 游客昵称（未登录用户） |
| authorEmail | String | NULLABLE | 游客邮箱（未登录用户） |
| parentId | String | NULLABLE | 父评论 ID（嵌套评论） |
| status | Enum | DEFAULT 'PENDING' | 状态：PENDING/APPROVED/REJECTED |
| likeCount | Int | DEFAULT 0 | 点赞数（冗余字段） |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

**索引：**
- PRIMARY KEY (id)
- INDEX (postId, status, createdAt DESC)
- INDEX (authorId)
- INDEX (parentId)
- INDEX (status)

**清理策略：**
- 应用层：删除文章时删除所有评论
- 应用层：用户删除时保留评论，authorId 设为 NULL

---

#### 2.6 Like（点赞表）

**用途：** 记录用户对文章、评论、相册的点赞

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String (cuid) | PK | 点赞唯一标识 |
| userId | String | NOT NULL | 用户 ID |
| targetType | Enum | NOT NULL | 目标类型：POST/COMMENT/GALLERY |
| targetId | String | NOT NULL | 目标 ID（postId/commentId/galleryId） |
| createdAt | DateTime | DEFAULT now() | 点赞时间 |

**索引：**
- PRIMARY KEY (id)
- UNIQUE INDEX (userId, targetType, targetId) *防止重复点赞*
- INDEX (targetType, targetId)
- INDEX (userId)

**清理策略：**
- 应用层：删除目标实体时删除相关点赞记录
- 取消点赞：直接删除记录

**聚合更新：**
- 点赞/取消点赞时，更新对应表的 likeCount 字段
- 定期任务：校正 likeCount 计数

---

#### 2.7 PostView（文章浏览记录）

**用途：** 记录文章浏览数据，用于统计分析

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String (cuid) | PK | 记录唯一标识 |
| postId | String | NOT NULL | 文章 ID |
| viewerIp | String | NULLABLE | 访客 IP（可哈希处理） |
| viewerId | String | NULLABLE | 登录用户 ID |
| userAgent | String | NULLABLE | 用户代理 |
| referer | String | NULLABLE | 来源页面 |
| viewedAt | DateTime | DEFAULT now() | 浏览时间 |

**索引：**
- PRIMARY KEY (id)
- INDEX (postId, viewedAt)
- INDEX (viewerId)
- INDEX (viewedAt) *用于定期清理旧数据*

**去重策略：**
- 同一 IP/用户在 24 小时内只记录一次浏览

**清理策略：**
- 定期任务：归档或删除超过 90 天的记录

---

### 3. 摄影系统 (Photography System)

#### 3.1 PhotoGallery（相册表）

**用途：** 摄影作品集管理

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String (cuid) | PK | 相册唯一标识 |
| title | String | NOT NULL | 相册标题 |
| slug | String | UNIQUE, NOT NULL | URL 友好标识 |
| description | String (Text) | NULLABLE | 相册描述 |
| coverImage | String | NULLABLE | 封面图 URL |
| coverImageThumb | String | NULLABLE | 封面缩略图 URL |
| status | Enum | DEFAULT 'DRAFT' | 状态：DRAFT/PUBLISHED/ARCHIVED |
| featured | Boolean | DEFAULT false | 是否精选 |
| viewCount | Int | DEFAULT 0 | 浏览次数 |
| likeCount | Int | DEFAULT 0 | 点赞数（冗余字段） |
| imageCount | Int | DEFAULT 0 | 图片数量（冗余字段） |
| captureDate | DateTime | NULLABLE | 拍摄日期 |
| location | String | NULLABLE | 拍摄地点 |
| camera | String | NULLABLE | 相机型号 |
| lens | String | NULLABLE | 镜头型号 |
| authorId | String | NOT NULL | 作者 ID |
| publishedAt | DateTime | NULLABLE | 发布时间 |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

**索引：**
- PRIMARY KEY (id)
- UNIQUE INDEX (slug)
- INDEX (authorId)
- INDEX (status, publishedAt DESC)
- INDEX (featured, publishedAt DESC)
- INDEX (likeCount DESC)

---

#### 3.2 PhotoImage（照片表）

**用途：** 存储相册中的单张照片信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | String (cuid) | PK | 照片唯一标识 |
| galleryId | String | NOT NULL | 所属相册 ID |
| url | String | NOT NULL | 原图 URL |
| thumbnail | String | NOT NULL | 缩略图 URL |
| alt | String | NULLABLE | 图片说明 |
| width | Int | NULLABLE | 原图宽度 |
| height | Int | NULLABLE | 原图高度 |
| fileSize | Int | NULLABLE | 文件大小（字节） |
| mimeType | String | NULLABLE | 文件类型 |
| exifData | Json | NULLABLE | EXIF 信息（JSON） |
| sortOrder | Int | DEFAULT 0 | 排序顺序 |
| createdAt | DateTime | DEFAULT now() | 创建时间 |

**索引：**
- PRIMARY KEY (id)
- INDEX (galleryId, sortOrder)

**清理策略：**
- 应用层：删除相册时删除所有照片

**EXIF 数据示例（JSON）：**
```json
{
  "camera": "Canon EOS R5",
  "lens": "RF 24-70mm F2.8L IS USM",
  "focalLength": "50mm",
  "aperture": "f/2.8",
  "shutterSpeed": "1/200s",
  "iso": 400,
  "captureDate": "2024-06-20T10:30:00Z",
  "location": "京都, 日本"
}
```

---

#### 3.3 GalleryTag（相册-标签关联表）

**用途：** 相册与标签的多对多关系

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| galleryId | String | NOT NULL | 相册 ID |
| tagId | String | NOT NULL | 标签 ID |
| createdAt | DateTime | DEFAULT now() | 创建时间 |

**索引：**
- PRIMARY KEY (galleryId, tagId)
- INDEX (tagId)

---

## 枚举类型定义

```prisma
enum UserRole {
  USER
  ADMIN
  MODERATOR
}

enum UserStatus {
  ACTIVE
  BANNED
  DELETED
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum CommentStatus {
  PENDING
  APPROVED
  REJECTED
}

enum GalleryStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum LikeTargetType {
  POST
  COMMENT
  GALLERY
}
```

---

## 数据完整性约束

### 唯一性约束
- User.email
- Post.slug
- Category.slug
- Category.name
- Tag.slug
- Tag.name
- PhotoGallery.slug
- Session.sessionToken
- VerificationToken.token
- Like(userId, targetType, targetId) *防止重复点赞*

### 检查约束
```sql
-- 计数字段必须非负
viewCount >= 0
likeCount >= 0
commentCount >= 0
postCount >= 0
galleryCount >= 0
wordCount >= 0
readingTime >= 0
sortOrder >= 0
```

### 应用层数据一致性保证

由于不使用外键约束，需要在应用层保证数据一致性：

#### 1. 删除操作
```typescript
// 删除文章时的级联清理
async function deletePost(postId: string) {
  await prisma.$transaction([
    prisma.postTag.deleteMany({ where: { postId } }),
    prisma.comment.deleteMany({ where: { postId } }),
    prisma.like.deleteMany({ where: { targetType: 'POST', targetId: postId } }),
    prisma.postView.deleteMany({ where: { postId } }),
    prisma.post.delete({ where: { id: postId } }),
  ]);
}

// 删除用户时的清理
async function deleteUser(userId: string) {
  await prisma.$transaction([
    prisma.account.deleteMany({ where: { userId } }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.like.deleteMany({ where: { userId } }),
    // 文章和评论可以保留，只是将 authorId 设为特殊值或保持原样
    prisma.user.delete({ where: { id: userId } }),
  ]);
}
```

#### 2. 计数字段更新
```typescript
// 更新文章点赞数
async function togglePostLike(userId: string, postId: string) {
  const existing = await prisma.like.findUnique({
    where: {
      userId_targetType_targetId: {
        userId,
        targetType: 'POST',
        targetId: postId,
      },
    },
  });

  if (existing) {
    // 取消点赞
    await prisma.$transaction([
      prisma.like.delete({ where: { id: existing.id } }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
  } else {
    // 点赞
    await prisma.$transaction([
      prisma.like.create({
        data: { userId, targetType: 'POST', targetId: postId },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
  }
}

// 更新分类文章数
async function updateCategoryPostCount(categoryId: string) {
  const count = await prisma.post.count({
    where: { categoryId, status: 'PUBLISHED' },
  });

  await prisma.category.update({
    where: { id: categoryId },
    data: { postCount: count },
  });
}
```

#### 3. 数据验证
```typescript
// 创建文章前验证分类和标签存在
async function createPost(data: CreatePostInput) {
  // 验证分类存在
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) throw new Error('Category not found');

  // 验证标签存在
  if (data.tagIds?.length) {
    const tags = await prisma.tag.findMany({
      where: { id: { in: data.tagIds } },
    });
    if (tags.length !== data.tagIds.length) {
      throw new Error('Some tags not found');
    }
  }

  // 创建文章和关联
  return prisma.post.create({ data });
}
```

---

## 性能优化建议

### 1. 索引策略

**高频查询索引：**
```sql
-- 文章列表查询（按发布时间倒序）
CREATE INDEX idx_post_status_published ON Post(status, publishedAt DESC);

-- 分类下的文章
CREATE INDEX idx_post_category_published ON Post(categoryId, publishedAt DESC);

-- 热门文章（按点赞数）
CREATE INDEX idx_post_like_count ON Post(likeCount DESC);

-- 标签下的文章
CREATE INDEX idx_posttag_tag ON PostTag(tagId, postId);

-- 用户的文章
CREATE INDEX idx_post_author ON Post(authorId, publishedAt DESC);

-- 评论查询
CREATE INDEX idx_comment_post ON Comment(postId, status, createdAt DESC);

-- 点赞查询
CREATE INDEX idx_like_target ON Like(targetType, targetId);
CREATE INDEX idx_like_user_target ON Like(userId, targetType, targetId);

-- 相册列表
CREATE INDEX idx_gallery_status_published ON PhotoGallery(status, publishedAt DESC);
```

**全文搜索索引（PostgreSQL）：**
```sql
-- 文章全文搜索
CREATE INDEX idx_post_fulltext ON Post
USING GIN (to_tsvector('english', title || ' ' || excerpt || ' ' || content));
```

### 2. 查询优化

**避免 N+1 查询：**

```typescript
// ❌ N+1 查询问题
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } });
}

// ✅ 使用嵌套查询优化
const posts = await prisma.post.findMany({
  include: {
    author: {
      select: { id: true, name: true, avatar: true }
    },
    category: {
      select: { id: true, name: true, slug: true, color: true }
    }
  }
});

// ✅ 或使用原始查询
const posts = await prisma.$queryRaw`
  SELECT
    p.*,
    u.name as author_name,
    u.avatar as author_avatar,
    c.name as category_name,
    c.color as category_color
  FROM "Post" p
  LEFT JOIN "User" u ON p."authorId" = u.id
  LEFT JOIN "Category" c ON p."categoryId" = c.id
  WHERE p.status = 'PUBLISHED'
  ORDER BY p."publishedAt" DESC
  LIMIT 10
`;
```

### 3. 缓存策略

**Redis 缓存建议：**
```typescript
// 热门文章列表（5分钟）
cache:posts:hot:${page} // TTL: 300s

// 分类列表（1小时）
cache:categories // TTL: 3600s

// 标签云（1小时）
cache:tags:popular // TTL: 3600s

// 用户信息（15分钟）
cache:user:${userId} // TTL: 900s

// 文章详情（10分钟）
cache:post:${slug} // TTL: 600s

// 相册详情（10分钟）
cache:gallery:${slug} // TTL: 600s

// 点赞状态（5分钟）
cache:like:${userId}:${targetType}:${targetId} // TTL: 300s
```

### 4. 分区策略

对于大数据量表，可考虑按时间分区：

```sql
-- 按月分区 PostView 表
CREATE TABLE post_view (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  viewer_ip TEXT,
  viewer_id TEXT,
  viewed_at TIMESTAMP NOT NULL
) PARTITION BY RANGE (viewed_at);

CREATE TABLE post_view_2024_06 PARTITION OF post_view
FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');

CREATE TABLE post_view_2024_07 PARTITION OF post_view
FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
```

---

## 数据迁移策略

### 使用 Prisma Migrate

```bash
# 1. 初始化数据库
pnpm prisma db push

# 2. 生成迁移文件
pnpm prisma migrate dev --name init

# 3. 生产环境部署迁移
pnpm prisma migrate deploy

# 4. 生成 Prisma Client
pnpm prisma generate
```

### Seed 脚本

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  // 创建默认分类
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'frontend' },
      update: {},
      create: { name: '前端开发', slug: 'frontend', color: '#3b82f6' },
    }),
    prisma.category.upsert({
      where: { slug: 'backend' },
      update: {},
      create: { name: '后端开发', slug: 'backend', color: '#10b981' },
    }),
    prisma.category.upsert({
      where: { slug: 'ui-ux' },
      update: {},
      create: { name: 'UI/UX 设计', slug: 'ui-ux', color: '#ec4899' },
    }),
  ]);

  // 创建默认标签
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'nextjs' },
      update: {},
      create: { name: 'Next.js', slug: 'nextjs' },
    }),
    prisma.tag.upsert({
      where: { slug: 'react' },
      update: {},
      create: { name: 'React', slug: 'react' },
    }),
    prisma.tag.upsert({
      where: { slug: 'typescript' },
      update: {},
      create: { name: 'TypeScript', slug: 'typescript' },
    }),
  ]);

  console.log({ admin, categories, tags });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 定期维护任务

### 1. 清理脚本

```typescript
// scripts/cleanup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('Starting cleanup tasks...');

  // 1. 清理过期会话（7天前）
  const deletedSessions = await prisma.session.deleteMany({
    where: {
      expires: {
        lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });
  console.log(`Deleted ${deletedSessions.count} expired sessions`);

  // 2. 清理过期验证令牌
  const deletedTokens = await prisma.verificationToken.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  });
  console.log(`Deleted ${deletedTokens.count} expired tokens`);

  // 3. 清理旧浏览记录（90天前）
  const deletedViews = await prisma.postView.deleteMany({
    where: {
      viewedAt: {
        lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    },
  });
  console.log(`Deleted ${deletedViews.count} old view records`);

  console.log('Cleanup completed!');
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 2. 计数校正脚本

```typescript
// scripts/sync-counts.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncCounts() {
  console.log('Syncing counts...');

  // 1. 更新文章点赞数
  const posts = await prisma.post.findMany({ select: { id: true } });
  for (const post of posts) {
    const likeCount = await prisma.like.count({
      where: { targetType: 'POST', targetId: post.id },
    });
    const commentCount = await prisma.comment.count({
      where: { postId: post.id, status: 'APPROVED' },
    });
    await prisma.post.update({
      where: { id: post.id },
      data: { likeCount, commentCount },
    });
  }
  console.log(`Updated ${posts.length} posts`);

  // 2. 更新分类文章数
  const categories = await prisma.category.findMany({ select: { id: true } });
  for (const category of categories) {
    const postCount = await prisma.post.count({
      where: { categoryId: category.id, status: 'PUBLISHED' },
    });
    await prisma.category.update({
      where: { id: category.id },
      data: { postCount },
    });
  }
  console.log(`Updated ${categories.length} categories`);

  // 3. 更新标签使用次数
  const tags = await prisma.tag.findMany({ select: { id: true } });
  for (const tag of tags) {
    const postCount = await prisma.postTag.count({
      where: { tagId: tag.id },
    });
    const galleryCount = await prisma.galleryTag.count({
      where: { tagId: tag.id },
    });
    await prisma.tag.update({
      where: { id: tag.id },
      data: { postCount, galleryCount },
    });
  }
  console.log(`Updated ${tags.length} tags`);

  // 4. 更新相册图片数和点赞数
  const galleries = await prisma.photoGallery.findMany({ select: { id: true } });
  for (const gallery of galleries) {
    const imageCount = await prisma.photoImage.count({
      where: { galleryId: gallery.id },
    });
    const likeCount = await prisma.like.count({
      where: { targetType: 'GALLERY', targetId: gallery.id },
    });
    await prisma.photoGallery.update({
      where: { id: gallery.id },
      data: { imageCount, likeCount },
    });
  }
  console.log(`Updated ${galleries.length} galleries`);

  console.log('Sync completed!');
}

syncCounts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 3. 定时任务配置

```typescript
// lib/cron-jobs.ts
import cron from 'node-cron';
import { cleanup } from '@/scripts/cleanup';
import { syncCounts } from '@/scripts/sync-counts';

// 每天凌晨 2 点清理过期数据
cron.schedule('0 2 * * *', async () => {
  console.log('Running daily cleanup...');
  await cleanup();
});

// 每小时同步计数
cron.schedule('0 * * * *', async () => {
  console.log('Running hourly count sync...');
  await syncCounts();
});
```

---

## 备份与恢复

### 自动备份脚本

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DB_NAME="blogt3"

# 创建备份
pg_dump -U postgres -d $DB_NAME -F c -b -v -f "$BACKUP_DIR/backup_$DATE.dump"

# 保留最近 30 天的备份
find $BACKUP_DIR -name "backup_*.dump" -mtime +30 -delete

echo "Backup completed: backup_$DATE.dump"
```

### 恢复数据

```bash
# 恢复完整备份
pg_restore -U postgres -d blogt3 -v backup_20240620_120000.dump

# 恢复特定表
pg_restore -U postgres -d blogt3 -t post backup_20240620_120000.dump
```

---

## 安全建议

### 1. 敏感数据处理

- **密码：** 使用 bcrypt 哈希，成本因子 ≥ 10
- **邮箱：** 存储前转小写，防止重复注册
- **IP 地址：** 可选择哈希存储，保护隐私
- **令牌：** 使用 crypto.randomBytes 生成，足够长度（≥32字节）

```typescript
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// 密码哈希
const hashedPassword = await bcrypt.hash(password, 10);

// IP 哈希（可选）
const hashedIp = crypto.createHash('sha256').update(ip).digest('hex');

// 生成令牌
const token = crypto.randomBytes(32).toString('hex');
```

### 2. SQL 注入防护

- ✅ 使用 Prisma ORM（自动参数化查询）
- ❌ 避免使用原始 SQL（`prisma.$executeRaw` 需谨慎）
- ✅ 输入验证使用 Zod schema

```typescript
// ✅ 安全：使用 Prisma
const posts = await prisma.post.findMany({
  where: { title: { contains: userInput } }
});

// ⚠️ 谨慎：原始查询需要参数化
const posts = await prisma.$queryRaw`
  SELECT * FROM "Post" WHERE title LIKE ${`%${userInput}%`}
`;

// ❌ 危险：字符串拼接
const posts = await prisma.$queryRawUnsafe(
  `SELECT * FROM "Post" WHERE title LIKE '%${userInput}%'`
);
```

### 3. 输入验证

```typescript
import { z } from 'zod';

// 创建文章验证
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  categoryId: z.string().cuid(),
  tagIds: z.array(z.string().cuid()).optional(),
});

// 使用验证
const validatedData = createPostSchema.parse(input);
```

---

## 扩展性考虑

### 未来功能扩展

**可能需要新增的表：**

1. **Notification（通知表）**
```typescript
{
  id: string;
  userId: string;
  type: 'LIKE' | 'COMMENT' | 'REPLY' | 'FOLLOW';
  actorId: string; // 触发通知的用户
  targetType: 'POST' | 'COMMENT' | 'GALLERY';
  targetId: string;
  read: boolean;
  createdAt: Date;
}
```

2. **Bookmark（收藏表）**
```typescript
{
  id: string;
  userId: string;
  targetType: 'POST' | 'GALLERY';
  targetId: string;
  createdAt: Date;
}
```

3. **Follow（关注表）**
```typescript
{
  followerId: string;
  followingId: string;
  createdAt: Date;
}
```

4. **Draft（草稿自动保存）**
```typescript
{
  id: string;
  userId: string;
  type: 'POST' | 'COMMENT';
  content: JSON;
  lastSavedAt: Date;
}
```

---

## 总结

本数据库设计遵循以下原则：

1. **无外键约束：** 提高性能和灵活性，应用层保证一致性
2. **冗余计数字段：** 减少聚合查询，提高列表页性能
3. **合理索引：** 针对高频查询优化
4. **可扩展性：** 预留扩展空间，支持未来功能
5. **安全性：** 数据加密、输入验证、防注入
6. **可维护性：** 清晰的命名、完整的文档、自动化脚本

**技术栈兼容性：**
- ✅ PostgreSQL 12+
- ✅ Prisma 6+
- ✅ NextAuth.js 5+
- ✅ Next.js 15+

**参考资源：**
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [NextAuth.js Database Adapters](https://next-auth.js.org/adapters/overview)
- [PostgreSQL Performance Optimization](https://www.postgresql.org/docs/current/performance-tips.html)

---

**文档版本：** 2.0.0
**最后更新：** 2024-06-20
**维护者：** BlogT3 开发团队
