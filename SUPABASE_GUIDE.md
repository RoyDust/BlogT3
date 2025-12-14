# Supabase 使用指南

## ✅ 连接状态

Supabase 已成功配置并可以使用！

## 配置文件

### 环境变量 (.env)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (可选，用于服务端)
```

### Supabase 客户端 (src/lib/supabase.ts)

已创建统一的 Supabase 客户端，可在整个应用中使用：

```typescript
import { supabase } from '@/lib/supabase'

// 使用示例
const { data, error } = await supabase.from('posts').select('*')
```

## 基础用法

### 1. 查询数据

```typescript
import { supabase } from '@/lib/supabase'

// 获取所有记录
const { data, error } = await supabase
  .from('posts')
  .select('*')

// 带条件查询
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
  .order('created_at', { ascending: false })

// 分页查询
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .range(0, 9) // 获取前 10 条
```

### 2. 插入数据

```typescript
const { data, error } = await supabase
  .from('posts')
  .insert({
    title: '我的第一篇博客',
    content: '内容...',
    author_id: 'user-id'
  })
  .select() // 返回插入的数据
```

### 3. 更新数据

```typescript
const { data, error } = await supabase
  .from('posts')
  .update({ title: '更新后的标题' })
  .eq('id', postId)
  .select()
```

### 4. 删除数据

```typescript
const { data, error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId)
```

### 5. 实时订阅

```typescript
const channel = supabase
  .channel('posts-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'posts'
    },
    (payload) => {
      console.log('数据变化:', payload)
    }
  )
  .subscribe()

// 取消订阅
channel.unsubscribe()
```

## 推荐的数据库结构

### 博客文章表 (posts)

在 Supabase Dashboard 中创建：

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  status TEXT DEFAULT 'draft', -- draft, published
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 添加索引
CREATE INDEX posts_slug_idx ON posts(slug);
CREATE INDEX posts_status_idx ON posts(status);
CREATE INDEX posts_author_idx ON posts(author_id);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 分类表 (categories)

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 标签表 (tags)

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 文章-标签关联表 (post_tags)

```sql
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

## 文件存储

### 上传文件

```typescript
import { supabase } from '@/lib/supabase'

// 上传图片
const file = event.target.files[0]
const { data, error } = await supabase.storage
  .from('images')
  .upload(`public/${Date.now()}-${file.name}`, file)

if (data) {
  // 获取公开 URL
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(data.path)

  console.log('图片 URL:', publicUrl)
}
```

### 获取文件列表

```typescript
const { data, error } = await supabase.storage
  .from('images')
  .list('public', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' }
  })
```

### 删除文件

```typescript
const { data, error } = await supabase.storage
  .from('images')
  .remove(['public/image.jpg'])
```

## 认证集成

### 使用 Supabase Auth

如果要使用 Supabase Auth 替代 NextAuth.js：

```typescript
// 注册
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// 登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// 登出
const { error } = await supabase.auth.signOut()

// 获取当前用户
const { data: { user } } = await supabase.auth.getUser()
```

## 在 Next.js 中使用

### 服务端组件 (RSC)

```typescript
// app/posts/page.tsx
import { supabase } from '@/lib/supabase'

export default async function PostsPage() {
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')

  return (
    <div>
      {posts?.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
```

### 客户端组件

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PostList() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from('posts')
        .select('*')
      setPosts(data || [])
    }
    fetchPosts()
  }, [])

  return <div>{/* 渲染 posts */}</div>
}
```

### API 路由

```typescript
// app/api/posts/route.ts
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('posts')
    .insert(body)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

## Row Level Security (RLS)

为了安全，建议启用 RLS：

```sql
-- 启用 RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取已发布的文章
CREATE POLICY "公开访问已发布文章"
ON posts FOR SELECT
USING (status = 'published');

-- 只允许作者编辑自己的文章
CREATE POLICY "作者可编辑自己的文章"
ON posts FOR UPDATE
USING (auth.uid() = author_id);

-- 允许认证用户创建文章
CREATE POLICY "认证用户可创建文章"
ON posts FOR INSERT
WITH CHECK (auth.uid() = author_id);
```

## 测试命令

```bash
# 测试连接
npx tsx test-supabase-simple.ts

# 或使用完整测试
npx tsx test-supabase.ts
```

## 下一步

1. ✅ Supabase 已配置成功
2. 📝 在 Supabase Dashboard 创建数据表
3. 🔐 配置 Row Level Security 策略
4. 🎨 开始构建应用界面
5. 🚀 集成到 Next.js 页面和组件

## 有用的链接

- [Supabase Dashboard](https://supabase.com/dashboard/project/cnixcpuuwonzevnsutis)
- [Supabase 文档](https://supabase.com/docs)
- [Supabase JS 客户端文档](https://supabase.com/docs/reference/javascript/introduction)

---

**状态**: ✅ 已配置并测试通过
**更新时间**: 2025-12-14
