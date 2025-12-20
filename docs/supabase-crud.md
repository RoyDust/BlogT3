# Supabase CRUD Implementation

本项目已完成基于 Supabase 的完整 CRUD 功能实现。

## 📁 文件结构

```
BlogT3/
├── prisma/
│   ├── schema.prisma          # Prisma schema (仅用于类型生成)
│   ├── init.sql               # 数据库初始化脚本
│   └── seed.sql               # Mock 数据插入脚本
├── src/
│   ├── lib/
│   │   └── supabase.ts        # Supabase 客户端配置
│   └── server/
│       └── actions/
│           ├── posts.ts       # 博客文章 CRUD
│           ├── galleries.ts   # 相册 CRUD
│           ├── likes.ts       # 点赞功能
│           ├── comments.ts    # 评论功能
│           └── index.ts       # 统一导出
└── src/app/test-db/
    └── page.tsx               # 测试页面
```

## 🚀 快速开始

### 1. 配置 Supabase

确保 `.env` 文件中包含以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. 初始化数据库

在 Supabase SQL Editor 中依次执行：

1. **创建数据库结构**：执行 `prisma/init.sql`
   - 创建所有 enum 类型
   - 创建所有数据表（无外键约束）
   - 创建索引和触发器
   - 创建辅助函数

2. **插入 Mock 数据**：执行 `prisma/seed.sql`
   - 4 个用户（1 管理员 + 3 作者）
   - 6 篇博客文章（5 已发布 + 1 草稿）
   - 3 个相册（共 16 张照片）
   - 6 条评论（包含嵌套回复）
   - 点赞记录

### 3. 测试功能

访问 `/test-db` 页面查看数据是否成功加载。

## 📚 API 使用说明

### Posts (博客文章)

```typescript
import {
  createPost,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost
} from '~/server/actions';

// 获取文章列表
const result = await getPosts({
  status: 'PUBLISHED',
  limit: 10,
  orderBy: 'publishedAt',
  order: 'desc'
});

// 获取单篇文章
const post = await getPostBySlug('nextjs-15-complete-guide');

// 创建文章
await createPost({
  slug: 'my-new-post',
  title: '我的新文章',
  excerpt: '简短摘要',
  content: '# 文章内容\n\n这是文章正文...',
  authorId: 'user_id',
  categoryId: 'category_id',
  status: 'PUBLISHED',
  tagIds: ['tag1', 'tag2']
});

// 更新文章
await updatePost('post_id', {
  title: '更新后的标题',
  status: 'PUBLISHED'
});

// 删除文章
await deletePost('post_id');
```

### Galleries (相册)

```typescript
import {
  createGallery,
  getGalleries,
  getGalleryPhotos,
  addPhotosToGallery
} from '~/server/actions';

// 获取相册列表
const result = await getGalleries({
  status: 'PUBLISHED',
  tag: '旅行',
  limit: 10
});

// 获取相册照片
const photos = await getGalleryPhotos('gallery_id');

// 创建相册
await createGallery({
  title: '我的旅行',
  slug: 'my-travel',
  coverImage: 'https://...',
  coverImageThumb: 'https://...',
  authorId: 'user_id',
  tags: ['旅行', '日本'],
  photos: [
    {
      url: 'https://...',
      thumbnail: 'https://...',
      order: 1
    }
  ]
});

// 添加照片到相册
await addPhotosToGallery('gallery_id', [
  { url: 'https://...', thumbnail: 'https://...', order: 5 }
]);
```

### Likes (点赞)

```typescript
import { toggleLike, checkUserLiked, getLikes } from '~/server/actions';

// 切换点赞状态
await toggleLike({
  userId: 'user_id',
  targetType: 'POST', // 'POST' | 'COMMENT' | 'GALLERY'
  targetId: 'post_id'
});

// 检查是否已点赞
const { liked } = await checkUserLiked('user_id', 'POST', 'post_id');

// 获取点赞列表
const result = await getLikes('POST', 'post_id');
```

### Comments (评论)

```typescript
import {
  createComment,
  getPostCommentsTree,
  approveComment,
  deleteComment
} from '~/server/actions';

// 创建评论
await createComment({
  postId: 'post_id',
  userId: 'user_id',
  content: '这是一条评论'
});

// 创建回复
await createComment({
  postId: 'post_id',
  userId: 'user_id',
  content: '这是一条回复',
  parentId: 'parent_comment_id'
});

// 获取文章的评论树（含回复）
const result = await getPostCommentsTree('post_id');

// 批准评论
await approveComment('comment_id');

// 删除评论（会连带删除所有回复）
await deleteComment('comment_id');
```

## 🔧 技术特点

### 1. 无外键约束设计
- 应用层保证数据一致性
- 提高数据库性能和灵活性
- 适合高并发场景

### 2. 冗余计数字段
- `likeCount`、`commentCount`、`viewCount` 等
- 减少实时统计查询
- 通过应用层保持同步

### 3. Server Actions
- 使用 Next.js 15 Server Actions
- `'use server'` 指令
- 自动类型安全

### 4. 数据一致性保证

在删除操作中，应用层负责清理相关数据：

```typescript
// 删除文章时的数据一致性保证
export async function deletePost(id: string) {
  // 1. 删除文章-标签关联
  await supabase.from('PostTag').delete().eq('postId', id);

  // 2. 删除所有评论
  await supabase.from('Comment').delete().eq('postId', id);

  // 3. 删除所有点赞
  await supabase.from('Like').delete().eq('targetType', 'POST').eq('targetId', id);

  // 4. 删除浏览记录
  await supabase.from('PostView').delete().eq('postId', id);

  // 5. 最后删除文章本身
  await supabase.from('Post').delete().eq('id', id);
}
```

## 📊 数据库设计

详细的数据库设计文档请查看 [docs/database-design.md](../docs/database-design.md)

### 核心表

- **User**: 用户表
- **Post**: 博客文章表
- **Category**: 分类表
- **Tag**: 标签表
- **PostTag**: 文章-标签关联表
- **Comment**: 评论表（支持嵌套回复）
- **PhotoGallery**: 相册表
- **Photo**: 照片表
- **Like**: 点赞表（支持文章/评论/相册）
- **PostView**: 文章浏览记录

### 枚举类型

```sql
UserRole: 'USER' | 'ADMIN' | 'MODERATOR'
UserStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
PostStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
CommentStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM'
GalleryStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
LikeTargetType: 'POST' | 'COMMENT' | 'GALLERY'
```

## 🧪 测试

访问测试页面验证功能：

```bash
# 启动开发服务器
pnpm dev

# 访问测试页面
open http://localhost:3000/test-db
```

测试页面会显示：
- 已发布的博客文章列表
- 已发布的相册列表
- 完整的 API 函数列表
- 设置说明

## 🔒 安全注意事项

1. **环境变量**：不要将 Supabase credentials 提交到版本控制
2. **RLS (Row Level Security)**：可以在 Supabase 中配置行级安全策略
3. **输入验证**：在生产环境中建议添加 Zod schema 验证
4. **错误处理**：所有函数都返回 `{ success, data?, error? }` 格式

## 📝 下一步

建议的后续开发：

1. **集成到现有页面**
   - 将博客列表页面连接到真实数据
   - 将相册页面连接到真实数据

2. **实现用户认证**
   - 使用 NextAuth.js 集成 Supabase Auth
   - 添加用户登录/注册功能

3. **添加表单验证**
   - 使用 Zod 添加输入验证
   - 使用 react-hook-form 创建表单

4. **实现管理后台**
   - 文章管理（创建、编辑、删除）
   - 相册管理
   - 评论审核

## 🆘 故障排查

### 数据库连接失败
- 检查 `.env` 文件中的 Supabase credentials
- 确认 Supabase 项目状态正常

### SQL 执行错误
- 确保先执行 `init.sql` 再执行 `seed.sql`
- 如果需要重置，可以在 Supabase SQL Editor 中删除所有表后重新执行

### 数据未显示
- 检查 Supabase 项目的 RLS 策略
- 确认 `seed.sql` 已成功执行
- 查看浏览器控制台和服务端日志

## 📖 参考资料

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
