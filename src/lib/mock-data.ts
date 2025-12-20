/**
 * Mock Data for BlogT3
 * Static data for demonstration purposes
 */

import type { PhotoGallery } from './types';

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  publishedAt: string;
  updatedAt?: string;
  category: {
    name: string;
    slug: string;
    color: string;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
  author: {
    name: string;
    avatar: string;
  };
  viewCount: number;
  wordCount: number;
  readingTime: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  count: number;
}

export const mockPosts: Post[] = [
  {
    id: '1',
    slug: 'getting-started-with-nextjs',
    title: 'Next.js 15 完全指南：构建现代化 Web 应用',
    excerpt: 'Next.js 15 带来了诸多革命性的特性，包括 React Server Components、Turbopack 和改进的性能优化。本文将深入探讨如何利用这些新特性构建高性能的 Web 应用。',
    content: '# Next.js 15 完全指南\n\nNext.js 15 是一个里程碑版本...',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    publishedAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-16T14:20:00Z',
    category: {
      name: '前端开发',
      slug: 'frontend',
      color: '#3b82f6',
    },
    tags: [
      { name: 'Next.js', slug: 'nextjs' },
      { name: 'React', slug: 'react' },
      { name: 'TypeScript', slug: 'typescript' },
    ],
    author: {
      name: 'Zhang Wei',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    viewCount: 1248,
    wordCount: 3250,
    readingTime: 13,
  },
  {
    id: '2',
    slug: 'mastering-tailwind-css',
    title: '精通 Tailwind CSS：从零到高级实战技巧',
    excerpt: 'Tailwind CSS 已经成为现代前端开发的首选工具。通过实用优先的方法，它极大地提升了开发效率。本文将分享从基础到高级的实战技巧。',
    content: '# 精通 Tailwind CSS\n\nTailwind CSS 采用了实用优先的方法...',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    publishedAt: '2025-01-12T09:15:00Z',
    category: {
      name: '前端开发',
      slug: 'frontend',
      color: '#3b82f6',
    },
    tags: [
      { name: 'CSS', slug: 'css' },
      { name: 'Tailwind', slug: 'tailwind' },
      { name: '设计系统', slug: 'design-system' },
    ],
    author: {
      name: 'Li Hua',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    viewCount: 892,
    wordCount: 2800,
    readingTime: 11,
  },
  {
    id: '3',
    slug: 'supabase-authentication-guide',
    title: 'Supabase 身份认证完整实现指南',
    excerpt: 'Supabase 提供了强大的身份认证功能，包括邮箱登录、OAuth、魔法链接等多种方式。本文将详细介绍如何在 Next.js 项目中集成 Supabase 认证。',
    content: '# Supabase 身份认证指南\n\nSupabase 是一个开源的 Firebase 替代方案...',
    coverImage: null,
    publishedAt: '2025-01-10T16:45:00Z',
    category: {
      name: '后端开发',
      slug: 'backend',
      color: '#10b981',
    },
    tags: [
      { name: 'Supabase', slug: 'supabase' },
      { name: '身份认证', slug: 'authentication' },
      { name: 'PostgreSQL', slug: 'postgresql' },
    ],
    author: {
      name: 'Wang Min',
      avatar: 'https://i.pravatar.cc/150?img=33',
    },
    viewCount: 654,
    wordCount: 4100,
    readingTime: 16,
  },
  {
    id: '4',
    slug: 'typescript-advanced-patterns',
    title: 'TypeScript 高级类型系统：泛型与工具类型深度解析',
    excerpt: 'TypeScript 的类型系统是其最强大的特性之一。掌握泛型、条件类型和工具类型，可以写出更安全、更灵活的代码。',
    content: '# TypeScript 高级类型系统\n\n泛型是 TypeScript 中最重要的概念之一...',
    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    publishedAt: '2025-01-08T11:20:00Z',
    category: {
      name: '编程语言',
      slug: 'programming-languages',
      color: '#f59e0b',
    },
    tags: [
      { name: 'TypeScript', slug: 'typescript' },
      { name: '类型系统', slug: 'type-system' },
      { name: '泛型', slug: 'generics' },
    ],
    author: {
      name: 'Chen Jie',
      avatar: 'https://i.pravatar.cc/150?img=8',
    },
    viewCount: 1567,
    wordCount: 5200,
    readingTime: 21,
  },
  {
    id: '5',
    slug: 'design-system-with-figma',
    title: '用 Figma 构建企业级设计系统：最佳实践分享',
    excerpt: '设计系统是保证产品一致性的关键。本文将分享如何使用 Figma 构建可扩展的企业级设计系统，包括组件库、颜色系统和文档规范。',
    content: '# 用 Figma 构建企业级设计系统\n\n设计系统是现代产品开发的基石...',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    publishedAt: '2025-01-05T14:00:00Z',
    category: {
      name: 'UI/UX 设计',
      slug: 'ui-ux',
      color: '#ec4899',
    },
    tags: [
      { name: 'Figma', slug: 'figma' },
      { name: '设计系统', slug: 'design-system' },
      { name: 'UI 设计', slug: 'ui-design' },
    ],
    author: {
      name: 'Liu Yang',
      avatar: 'https://i.pravatar.cc/150?img=15',
    },
    viewCount: 723,
    wordCount: 3600,
    readingTime: 14,
  },
  {
    id: '6',
    slug: 'react-server-components-explained',
    title: 'React Server Components 深度剖析：原理与实践',
    excerpt: 'React Server Components 是 React 18 引入的革命性特性，它改变了我们构建 React 应用的方式。本文将深入探讨其工作原理和实际应用。',
    content: '# React Server Components 深度剖析\n\nRSC 是 React 架构的重大革新...',
    coverImage: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800',
    publishedAt: '2025-01-03T09:30:00Z',
    updatedAt: '2025-01-04T10:15:00Z',
    category: {
      name: '前端开发',
      slug: 'frontend',
      color: '#3b82f6',
    },
    tags: [
      { name: 'React', slug: 'react' },
      { name: 'Server Components', slug: 'server-components' },
      { name: 'Next.js', slug: 'nextjs' },
    ],
    author: {
      name: 'Zhao Qiang',
      avatar: 'https://i.pravatar.cc/150?img=68',
    },
    viewCount: 2103,
    wordCount: 4850,
    readingTime: 19,
  },
];

export const mockCategories: Category[] = [
  { id: '1', name: '前端开发', slug: 'frontend', color: '#3b82f6', count: 12 },
  { id: '2', name: '后端开发', slug: 'backend', color: '#10b981', count: 8 },
  { id: '3', name: 'UI/UX 设计', slug: 'ui-ux', color: '#ec4899', count: 5 },
  { id: '4', name: '编程语言', slug: 'programming-languages', color: '#f59e0b', count: 7 },
  { id: '5', name: '工具与效率', slug: 'tools', color: '#8b5cf6', count: 6 },
];

export const mockTags = [
  'Next.js',
  'React',
  'TypeScript',
  'Tailwind',
  'CSS',
  'Supabase',
  'PostgreSQL',
  'Figma',
  'UI 设计',
  '设计系统',
  '身份认证',
  '泛型',
  'Server Components',
];

export const mockProfile = {
  name: 'Zhang Wei',
  avatar: 'https://github.com/shadcn.png',
  bio: '全栈开发者，热爱开源和技术分享。专注于 React 生态和现代 Web 开发。',
  links: [
    { name: 'GitHub', url: 'https://github.com', icon: 'github' },
    { name: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
    { name: 'Email', url: 'mailto:example@example.com', icon: 'mail' },
  ],
};

// Photo Galleries Mock Data
export const mockPhotoGalleries: PhotoGallery[] = [
  {
    id: '1',
    title: '城市夜景',
    coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200',
    coverImageThumb: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400',
    date: new Date('2024-01-15'),
    tags: ['城市', '夜景', '建筑'],
    description: '记录城市夜晚的霓虹与繁华',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400',
        alt: '城市夜景全景',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400',
        alt: '高楼大厦',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
        alt: '城市天际线',
        width: 1200,
        height: 800,
      },
    ],
  },
  {
    id: '2',
    title: '自然风光',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    coverImageThumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    date: new Date('2024-02-20'),
    tags: ['自然', '风景', '山脉'],
    description: '探索大自然的壮丽与宁静',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        alt: '雪山风光',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
        alt: '森林湖泊',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400',
        alt: '山间小径',
        width: 1200,
        height: 800,
      },
    ],
  },
  {
    id: '3',
    title: '日常生活',
    coverImage: 'https://images.unsplash.com/photo-1495954222046-2c427ecb546d?w=1200',
    coverImageThumb: 'https://images.unsplash.com/photo-1495954222046-2c427ecb546d?w=400',
    date: new Date('2024-03-10'),
    tags: ['生活', '咖啡', '静物'],
    description: '捕捉生活中的美好瞬间',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1495954222046-2c427ecb546d?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1495954222046-2c427ecb546d?w=400',
        alt: '咖啡与书',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        alt: '咖啡拉花',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
        alt: '咖啡店一角',
        width: 1200,
        height: 800,
      },
    ],
  },
  {
    id: '4',
    title: '建筑艺术',
    coverImage: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1200',
    coverImageThumb: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400',
    date: new Date('2024-04-05'),
    tags: ['建筑', '艺术', '设计'],
    description: '探索建筑的线条与美学',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400',
        alt: '现代建筑外观',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=400',
        alt: '建筑内部',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400',
        alt: '建筑细节',
        width: 1200,
        height: 800,
      },
    ],
  },
  {
    id: '5',
    title: '街头摄影',
    coverImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200',
    coverImageThumb: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400',
    date: new Date('2024-05-12'),
    tags: ['街头', '人文', '黑白'],
    description: '记录街头的故事与情感',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400',
        alt: '城市街道',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
        alt: '繁忙街头',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400',
        alt: '街头小巷',
        width: 1200,
        height: 800,
      },
    ],
  },
  {
    id: '6',
    title: '日本之旅',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200',
    coverImageThumb: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
    date: new Date('2024-06-20'),
    tags: ['旅行', '日本', '文化', '风景'],
    description: '探索日本的传统与现代，从京都的古寺到东京的霓虹',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
        alt: '京都街道',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400',
        alt: '富士山远景',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400',
        alt: '东京塔夜景',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400',
        alt: '日式庭院',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400',
        alt: '樱花盛开',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400',
        alt: '传统寺庙',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400',
        alt: '涩谷路口',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=400',
        alt: '日本料理',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400',
        alt: '神社鸟居',
        width: 1200,
        height: 800,
      },
      {
        url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400',
        alt: '东京夜景',
        width: 1200,
        height: 800,
      },
    ],
  },
];
