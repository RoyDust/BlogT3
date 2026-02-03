import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充测试数据...');

  // 清理现有数据（可选，谨慎使用）
  console.log('清理现有数据...');
  await prisma.postView.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.galleryTag.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.photoImage.deleteMany();
  await prisma.photoGallery.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.like.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('创建用户...');
  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: '管理员',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      bio: '博客管理员，负责内容审核和网站维护。',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      emailVerified: new Date(),
      updatedAt: new Date(),
    },
  });

  // 创建普通用户
  const userPassword = await bcrypt.hash('user123', 10);
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      name: '张三',
      password: userPassword,
      role: 'USER',
      status: 'ACTIVE',
      bio: '热爱技术，喜欢分享。',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
      emailVerified: new Date(),
      updatedAt: new Date(),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      name: '李四',
      password: userPassword,
      role: 'USER',
      status: 'ACTIVE',
      bio: '摄影爱好者，记录生活点滴。',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
      emailVerified: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`创建了 3 个用户: ${admin.name}, ${user1.name}, ${user2.name}`);

  console.log('创建分类...');
  // 创建分类
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: '技术',
        slug: 'tech',
        description: '技术相关的文章，包括编程、开发工具、框架等',
        color: '#3b82f6',
        icon: '💻',
        sortOrder: 1,
        updatedAt: new Date(),
      },
    }),
    prisma.category.create({
      data: {
        name: '生活',
        slug: 'life',
        description: '生活感悟、日常记录',
        color: '#10b981',
        icon: '🌱',
        sortOrder: 2,
        updatedAt: new Date(),
      },
    }),
    prisma.category.create({
      data: {
        name: '摄影',
        slug: 'photography',
        description: '摄影作品、拍摄技巧分享',
        color: '#f59e0b',
        icon: '📷',
        sortOrder: 3,
        updatedAt: new Date(),
      },
    }),
    prisma.category.create({
      data: {
        name: '旅行',
        slug: 'travel',
        description: '旅行游记、景点推荐',
        color: '#8b5cf6',
        icon: '✈️',
        sortOrder: 4,
        updatedAt: new Date(),
      },
    }),
  ]);

  console.log(`创建了 ${categories.length} 个分类`);

  console.log('创建标签...');
  // 创建标签
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'JavaScript', slug: 'javascript' } }),
    prisma.tag.create({ data: { name: 'TypeScript', slug: 'typescript' } }),
    prisma.tag.create({ data: { name: 'React', slug: 'react' } }),
    prisma.tag.create({ data: { name: 'Next.js', slug: 'nextjs' } }),
    prisma.tag.create({ data: { name: 'Prisma', slug: 'prisma' } }),
    prisma.tag.create({ data: { name: '前端开发', slug: 'frontend' } }),
    prisma.tag.create({ data: { name: '后端开发', slug: 'backend' } }),
    prisma.tag.create({ data: { name: '数据库', slug: 'database' } }),
    prisma.tag.create({ data: { name: '风景', slug: 'landscape' } }),
    prisma.tag.create({ data: { name: '人像', slug: 'portrait' } }),
  ]);

  console.log(`创建了 ${tags.length} 个标签`);

  console.log('创建文章...');
  // 创建文章
  const post1 = await prisma.post.create({
    data: {
      title: 'Next.js 15 新特性详解',
      slug: 'nextjs-15-features',
      excerpt: '深入了解 Next.js 15 带来的新特性和改进，包括 App Router、Server Actions 等。',
      content: `# Next.js 15 新特性详解

Next.js 15 是一个重要的版本更新，带来了许多令人兴奋的新特性。

## App Router

App Router 是 Next.js 13 引入的新路由系统，在 15 版本中得到了进一步完善。

## Server Actions

Server Actions 让你可以在服务端直接定义函数，客户端可以直接调用，无需创建 API 路由。

## 性能优化

Next.js 15 在性能方面也有显著提升，包括更快的构建速度和更小的打包体积。`,
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      status: 'PUBLISHED',
      featured: true,
      viewCount: 156,
      likeCount: 23,
      commentCount: 5,
      wordCount: 1200,
      readingTime: 5,
      publishedAt: new Date('2024-01-15'),
      authorId: admin.id,
      categoryId: categories[0]!.id,
      updatedAt: new Date(),
    },
  });

  // 关联标签
  await prisma.postTag.createMany({
    data: [
      { postId: post1.id, tagId: tags[3]!.id }, // Next.js
      { postId: post1.id, tagId: tags[2]!.id }, // React
      { postId: post1.id, tagId: tags[5]!.id }, // 前端开发
    ],
  });

  console.log(`创建了文章: ${post1.title}`);

  const post2 = await prisma.post.create({
    data: {
      title: 'Prisma ORM 完全指南',
      slug: 'prisma-orm-guide',
      excerpt: '从零开始学习 Prisma ORM，掌握现代化的数据库访问方式。',
      content: `# Prisma ORM 完全指南

Prisma 是一个现代化的 TypeScript ORM，提供了类型安全的数据库访问。

## 为什么选择 Prisma

- 类型安全
- 自动生成类型
- 优秀的开发体验
- 支持多种数据库

## 快速开始

\`\`\`bash
npm install prisma @prisma/client
npx prisma init
\`\`\``,
      coverImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800',
      status: 'PUBLISHED',
      featured: false,
      viewCount: 89,
      likeCount: 12,
      commentCount: 3,
      wordCount: 800,
      readingTime: 4,
      publishedAt: new Date('2024-01-20'),
      authorId: admin.id,
      categoryId: categories[0]!.id,
      updatedAt: new Date(),
    },
  });

  await prisma.postTag.createMany({
    data: [
      { postId: post2.id, tagId: tags[4]!.id }, // Prisma
      { postId: post2.id, tagId: tags[1]!.id }, // TypeScript
      { postId: post2.id, tagId: tags[7]!.id }, // 数据库
    ],
  });

  console.log(`创建了文章: ${post2.title}`);

  const post3 = await prisma.post.create({
    data: {
      title: '我的 2024 年度总结',
      slug: '2024-year-review',
      excerpt: '回顾 2024 年的成长与收获，展望 2025 年的目标。',
      content: `# 我的 2024 年度总结

2024 年是充实的一年，有很多值得记录的时刻。

## 技术成长

今年学习了很多新技术，包括 Next.js、Prisma 等。

## 生活感悟

工作之余也要注重生活质量，保持身心健康。`,
      coverImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
      status: 'PUBLISHED',
      featured: false,
      viewCount: 234,
      likeCount: 45,
      commentCount: 12,
      wordCount: 1500,
      readingTime: 6,
      publishedAt: new Date('2024-12-31'),
      authorId: user1.id,
      categoryId: categories[1]!.id,
      updatedAt: new Date(),
    },
  });

  console.log(`创建了文章: ${post3.title}`);

  console.log('创建评论...');
  // 创建评论
  const comment1 = await prisma.comment.create({
    data: {
      content: '写得很好，学到了很多！',
      postId: post1.id,
      authorId: user1.id,
      status: 'APPROVED',
      likeCount: 5,
      updatedAt: new Date(),
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: '感谢分享，期待更多这样的文章。',
      postId: post1.id,
      authorId: user2.id,
      status: 'APPROVED',
      likeCount: 3,
      updatedAt: new Date(),
    },
  });

  // 创建回复评论
  await prisma.comment.create({
    data: {
      content: '谢谢支持！',
      postId: post1.id,
      authorId: admin.id,
      parentId: comment1.id,
      status: 'APPROVED',
      updatedAt: new Date(),
    },
  });

  console.log('创建了 3 条评论');

  console.log('创建相册...');
  // 创建相册
  const gallery1 = await prisma.photoGallery.create({
    data: {
      title: '城市夜景',
      slug: 'city-night',
      description: '记录城市夜晚的美丽瞬间',
      coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
      coverImageThumb: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400',
      status: 'PUBLISHED',
      featured: true,
      viewCount: 456,
      likeCount: 78,
      imageCount: 5,
      captureDate: new Date('2024-01-10'),
      location: '上海',
      camera: 'Sony A7III',
      lens: 'FE 24-70mm F2.8 GM',
      authorId: user2.id,
      publishedAt: new Date('2024-01-12'),
      updatedAt: new Date(),
    },
  });

  console.log(`创建了相册: ${gallery1.title}`);

  // 为相册添加图片
  await prisma.photoImage.createMany({
    data: [
      {
        galleryId: gallery1.id,
        url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400',
        alt: '城市夜景 1',
        width: 1920,
        height: 1080,
        sortOrder: 1,
      },
      {
        galleryId: gallery1.id,
        url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400',
        alt: '城市夜景 2',
        width: 1920,
        height: 1080,
        sortOrder: 2,
      },
    ],
  });

  // 为相册关联标签
  await prisma.galleryTag.create({
    data: {
      galleryId: gallery1.id,
      tagId: tags[8]!.id, // 风景
    },
  });

  console.log('创建了相册图片和标签关联');

  console.log('创建点赞记录...');
  // 创建点赞记录
  await prisma.like.createMany({
    data: [
      { userId: user1.id, targetType: 'POST', targetId: post1.id },
      { userId: user2.id, targetType: 'POST', targetId: post1.id },
      { userId: user1.id, targetType: 'POST', targetId: post2.id },
      { userId: admin.id, targetType: 'GALLERY', targetId: gallery1.id },
    ],
  });

  console.log('创建了 4 条点赞记录');

  console.log('创建反馈记录...');
  // 创建反馈记录
  await prisma.feedback.createMany({
    data: [
      {
        content: '网站加载速度很快，体验很好！',
        type: 'SUGGESTION',
        targetType: 'SITE',
        targetId: 'general',
        userIp: '192.168.1.1',
      },
      {
        content: '希望能增加深色模式',
        type: 'SUGGESTION',
        targetType: 'SITE',
        targetId: 'general',
        userIp: '192.168.1.2',
      },
    ],
  });

  console.log('创建了 2 条反馈记录');

  // 更新分类的文章计数
  await prisma.category.update({
    where: { id: categories[0]!.id },
    data: { postCount: 2 },
  });

  await prisma.category.update({
    where: { id: categories[1]!.id },
    data: { postCount: 1 },
  });

  // 更新标签的使用计数
  await prisma.tag.update({
    where: { id: tags[3]!.id },
    data: { postCount: 1 },
  });

  await prisma.tag.update({
    where: { id: tags[8]!.id },
    data: { galleryCount: 1 },
  });

  console.log('✅ 测试数据填充完成！');
  console.log('---');
  console.log('用户信息：');
  console.log(`  管理员: admin@example.com / admin123`);
  console.log(`  用户1: user1@example.com / user123`);
  console.log(`  用户2: user2@example.com / user123`);
}

main()
  .catch((e) => {
    console.error('❌ 填充数据时出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

