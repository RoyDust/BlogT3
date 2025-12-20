-- ============================================================================
-- BlogT3 Mock 数据插入脚本
-- ============================================================================
-- 说明：在执行此脚本前，请确保已执行 init.sql 创建数据库结构
-- 执行方式：在 Supabase SQL Editor 中直接运行
-- ============================================================================

-- 清理现有数据（可选，仅用于测试）
-- DELETE FROM "Like";
-- DELETE FROM "PostView";
-- DELETE FROM "Comment";
-- DELETE FROM "PostTag";
-- DELETE FROM "GalleryTag";
-- DELETE FROM "PhotoImage";
-- DELETE FROM "PhotoGallery";
-- DELETE FROM "Post";
-- DELETE FROM "Tag";
-- DELETE FROM "Category";
-- DELETE FROM "Session";
-- DELETE FROM "Account";
-- DELETE FROM "User";

-- ============================================================================
-- 1. 插入用户数据
-- ============================================================================

INSERT INTO "User" ("id", "email", "name", "avatar", "bio", "role", "status", "emailVerified")
VALUES
    ('user_admin_001', 'admin@blogt3.com', '管理员', 'https://i.pravatar.cc/150?img=12', '全栈开发者，热爱技术分享', 'ADMIN', 'ACTIVE', NOW()),
    ('user_author_001', 'zhangwei@example.com', 'Zhang Wei', 'https://i.pravatar.cc/150?img=33', 'React 专家，专注前端架构', 'USER', 'ACTIVE', NOW()),
    ('user_author_002', 'lihua@example.com', 'Li Hua', 'https://i.pravatar.cc/150?img=5', 'UI/UX 设计师，热爱美学', 'USER', 'ACTIVE', NOW()),
    ('user_author_003', 'wangmin@example.com', 'Wang Min', 'https://i.pravatar.cc/150?img=68', '后端工程师，数据库专家', 'USER', 'ACTIVE', NOW())
ON CONFLICT ("email") DO NOTHING;

-- ============================================================================
-- 2. 插入分类数据（已在 init.sql 中插入，这里是更新）
-- ============================================================================

UPDATE "Category" SET "postCount" = 0 WHERE "slug" IN ('frontend', 'backend', 'ui-ux', 'programming-languages', 'tools');

-- ============================================================================
-- 3. 插入标签数据（已在 init.sql 中插入）
-- ============================================================================

-- 标签已在 init.sql 中创建

-- ============================================================================
-- 4. 插入博客文章数据
-- ============================================================================

-- 文章 1: Next.js 15 完全指南
INSERT INTO "Post" (
    "id", "slug", "title", "excerpt", "content", "coverImage",
    "status", "featured", "viewCount", "likeCount", "commentCount",
    "wordCount", "readingTime", "publishedAt", "authorId", "categoryId"
)
VALUES (
    'post_nextjs_guide',
    'nextjs-15-complete-guide',
    'Next.js 15 完全指南：构建现代化 Web 应用',
    'Next.js 15 带来了诸多革命性的特性，包括 React Server Components、Turbopack 和改进的性能优化。本文将深入探讨如何利用这些新特性构建高性能的 Web 应用。',
    E'# Next.js 15 完全指南\n\nNext.js 15 是一个里程碑版本，带来了许多激动人心的新特性。\n\n## 主要特性\n\n### 1. React Server Components\n\nReact Server Components 允许你在服务器端渲染组件，减少客户端 JavaScript 包的大小。\n\n```tsx\n// app/page.tsx\nexport default async function HomePage() {\n  const data = await fetch(\"https://api.example.com/data\");\n  return <div>{data.title}</div>;\n}\n```\n\n### 2. Turbopack\n\nTurbopack 是用 Rust 编写的下一代打包工具，比 Webpack 快 700 倍。\n\n### 3. 改进的性能优化\n\n- 更快的构建速度\n- 优化的图片加载\n- 自动代码分割\n\n## 最佳实践\n\n1. 使用 Server Components 处理数据获取\n2. 利用 Suspense 实现流式渲染\n3. 合理使用 Client Components\n\n## 总结\n\nNext.js 15 为现代 Web 开发带来了革命性的改进，值得每个前端开发者学习和使用。',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    'PUBLISHED', true, 1248, 89, 12,
    3250, 13, NOW() - INTERVAL '5 days', 'user_author_001', 'cat_frontend'
)
ON CONFLICT ("slug") DO NOTHING;

-- 文章 2: Tailwind CSS 实战
INSERT INTO "Post" (
    "id", "slug", "title", "excerpt", "content", "coverImage",
    "status", "featured", "viewCount", "likeCount", "commentCount",
    "wordCount", "readingTime", "publishedAt", "authorId", "categoryId"
)
VALUES (
    'post_tailwind_mastery',
    'mastering-tailwind-css',
    '精通 Tailwind CSS：从零到高级实战技巧',
    'Tailwind CSS 已经成为现代前端开发的首选工具。通过实用优先的方法，它极大地提升了开发效率。本文将分享从基础到高级的实战技巧。',
    E'# 精通 Tailwind CSS\n\nTailwind CSS 采用了实用优先的方法，让你无需离开 HTML 就能快速构建现代化的用户界面。\n\n## 核心概念\n\n### 1. 实用类优先\n\n```html\n<div class=\"flex items-center justify-between p-4 bg-white shadow-lg rounded-lg\">\n  <h2 class=\"text-2xl font-bold text-gray-900\">标题</h2>\n  <button class=\"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600\">\n    按钮\n  </button>\n</div>\n```\n\n### 2. 响应式设计\n\n```html\n<div class=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4\">\n  <!-- 内容 -->\n</div>\n```\n\n### 3. 自定义配置\n\n在 `tailwind.config.js` 中扩展默认主题：\n\n```js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        primary: \"#3b82f6\",\n        secondary: \"#10b981\",\n      },\n    },\n  },\n};\n```\n\n## 高级技巧\n\n1. 使用 `@apply` 提取重复样式\n2. 利用 JIT 模式提升性能\n3. 配合 CSS-in-JS 使用\n\n## 总结\n\nTailwind CSS 是一个强大的工具，掌握它能大幅提升你的开发效率。',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    'PUBLISHED', true, 892, 67, 8,
    2800, 11, NOW() - INTERVAL '8 days', 'user_author_001', 'cat_frontend'
)
ON CONFLICT ("slug") DO NOTHING;

-- 文章 3: Supabase 身份认证
INSERT INTO "Post" (
    "id", "slug", "title", "excerpt", "content", "coverImage",
    "status", "featured", "viewCount", "likeCount", "commentCount",
    "wordCount", "readingTime", "publishedAt", "authorId", "categoryId"
)
VALUES (
    'post_supabase_auth',
    'supabase-authentication-guide',
    'Supabase 身份认证完整实现指南',
    'Supabase 提供了强大的身份认证功能，包括邮箱登录、OAuth、魔法链接等多种方式。本文将详细介绍如何在 Next.js 项目中集成 Supabase 认证。',
    E'# Supabase 身份认证指南\n\nSupabase 是一个开源的 Firebase 替代方案，提供了完整的后端服务。\n\n## 快速开始\n\n### 1. 安装依赖\n\n```bash\npnpm add @supabase/supabase-js\n```\n\n### 2. 初始化客户端\n\n```ts\nimport { createClient } from \"@supabase/supabase-js\";\n\nconst supabase = createClient(\n  process.env.NEXT_PUBLIC_SUPABASE_URL!,\n  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!\n);\n```\n\n### 3. 实现登录\n\n```ts\nconst { data, error } = await supabase.auth.signInWithPassword({\n  email: \"user@example.com\",\n  password: \"password\",\n});\n```\n\n## 高级功能\n\n- Row Level Security (RLS)\n- OAuth 集成\n- 魔法链接登录\n- 多因素认证\n\n## 最佳实践\n\n1. 使用环境变量存储密钥\n2. 实现服务端会话验证\n3. 配置 RLS 策略保护数据\n\n## 总结\n\nSupabase 提供了简单而强大的认证系统，非常适合现代 Web 应用。',
    NULL,
    'PUBLISHED', false, 654, 45, 6,
    4100, 16, NOW() - INTERVAL '10 days', 'user_author_003', 'cat_backend'
)
ON CONFLICT ("slug") DO NOTHING;

-- 文章 4: TypeScript 高级类型
INSERT INTO "Post" (
    "id", "slug", "title", "excerpt", "content",
    "status", "featured", "viewCount", "likeCount", "commentCount",
    "wordCount", "readingTime", "publishedAt", "authorId", "categoryId"
)
VALUES (
    'post_typescript_advanced',
    'typescript-advanced-patterns',
    'TypeScript 高级类型系统：泛型与工具类型深度解析',
    'TypeScript 的类型系统是其最强大的特性之一。掌握泛型、条件类型和工具类型，可以写出更安全、更灵活的代码。',
    E'# TypeScript 高级类型系统\n\n泛型是 TypeScript 中最重要的概念之一。\n\n## 泛型基础\n\n```ts\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\nconst result = identity<string>(\"hello\");\n```\n\n## 条件类型\n\n```ts\ntype IsString<T> = T extends string ? true : false;\n\ntype A = IsString<string>; // true\ntype B = IsString<number>; // false\n```\n\n## 工具类型\n\n- `Partial<T>`: 所有属性可选\n- `Required<T>`: 所有属性必填\n- `Pick<T, K>`: 选择指定属性\n- `Omit<T, K>`: 排除指定属性\n\n## 实战案例\n\n```ts\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n  password: string;\n}\n\ntype PublicUser = Omit<User, \"password\">;\n```\n\n## 总结\n\n掌握 TypeScript 高级类型能让你的代码更加类型安全和灵活。',
    'PUBLISHED', true, 1567, 123, 15,
    5200, 21, NOW() - INTERVAL '12 days', 'user_author_001', 'cat_programming'
)
ON CONFLICT ("slug") DO NOTHING;

-- 文章 5: Figma 设计系统
INSERT INTO "Post" (
    "id", "slug", "title", "excerpt", "content", "coverImage",
    "status", "featured", "viewCount", "likeCount", "commentCount",
    "wordCount", "readingTime", "publishedAt", "authorId", "categoryId"
)
VALUES (
    'post_figma_design_system',
    'design-system-with-figma',
    '用 Figma 构建企业级设计系统：最佳实践分享',
    '设计系统是保证产品一致性的关键。本文将分享如何使用 Figma 构建可扩展的企业级设计系统，包括组件库、颜色系统和文档规范。',
    E'# 用 Figma 构建企业级设计系统\n\n设计系统是现代产品开发的基石。\n\n## 设计系统的组成\n\n### 1. 设计原则\n\n- 一致性\n- 可访问性\n- 可扩展性\n\n### 2. 组件库\n\n建立可复用的 UI 组件：\n- 按钮\n- 表单\n- 导航\n- 卡片\n\n### 3. 设计令牌\n\n```json\n{\n  \"colors\": {\n    \"primary\": \"#3b82f6\",\n    \"secondary\": \"#10b981\",\n    \"gray\": {\n      \"50\": \"#f9fafb\",\n      \"900\": \"#111827\"\n    }\n  },\n  \"spacing\": {\n    \"xs\": \"4px\",\n    \"sm\": \"8px\",\n    \"md\": \"16px\"\n  }\n}\n```\n\n## Figma 技巧\n\n1. 使用 Auto Layout\n2. 创建变体组件\n3. 利用样式和变量\n4. 编写详细的组件说明\n\n## 总结\n\n一个好的设计系统能大幅提升团队协作效率。',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    'PUBLISHED', false, 723, 56, 9,
    3600, 14, NOW() - INTERVAL '15 days', 'user_author_002', 'cat_uiux'
)
ON CONFLICT ("slug") DO NOTHING;

-- 文章 6: 草稿文章示例
INSERT INTO "Post" (
    "id", "slug", "title", "excerpt", "content",
    "status", "featured", "viewCount", "likeCount", "commentCount",
    "wordCount", "readingTime", "publishedAt", "authorId", "categoryId"
)
VALUES (
    'post_draft_example',
    'upcoming-web-trends-2024',
    '2024 年 Web 开发趋势预测',
    '探讨 2024 年 Web 开发领域的最新趋势和技术方向。',
    E'# 2024 年 Web 开发趋势\n\n这是一篇草稿文章，内容正在完善中...',
    'DRAFT', false, 0, 0, 0,
    500, 2, NULL, 'user_admin_001', 'cat_frontend'
)
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- 5. 插入文章-标签关联
-- ============================================================================

INSERT INTO "PostTag" ("postId", "tagId")
VALUES
    -- Next.js 文章的标签
    ('post_nextjs_guide', 'tag_nextjs'),
    ('post_nextjs_guide', 'tag_react'),
    ('post_nextjs_guide', 'tag_typescript'),

    -- Tailwind 文章的标签
    ('post_tailwind_mastery', 'tag_tailwind'),
    ('post_tailwind_mastery', 'tag_css'),
    ('post_tailwind_mastery', 'tag_design'),

    -- Supabase 文章的标签
    ('post_supabase_auth', 'tag_supabase'),
    ('post_supabase_auth', 'tag_postgresql'),
    ('post_supabase_auth', 'tag_auth'),

    -- TypeScript 文章的标签
    ('post_typescript_advanced', 'tag_typescript'),
    ('post_typescript_advanced', 'tag_nextjs'),

    -- Figma 文章的标签
    ('post_figma_design_system', 'tag_figma'),
    ('post_figma_design_system', 'tag_design')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. 插入评论数据
-- ============================================================================

-- 评论 1: Next.js 文章的评论
INSERT INTO "Comment" ("id", "content", "postId", "authorId", "status")
VALUES
    ('comment_001', '很棒的文章！Next.js 15 的 Server Components 确实是游戏规则改变者。', 'post_nextjs_guide', 'user_author_002', 'APPROVED'),
    ('comment_002', '能否详细讲解一下 Turbopack 的使用场景？', 'post_nextjs_guide', 'user_author_003', 'APPROVED'),
    ('comment_003', '感谢分享，期待更多深入的内容！', 'post_nextjs_guide', 'user_admin_001', 'APPROVED')
ON CONFLICT ("id") DO NOTHING;

-- 评论 2: Tailwind 文章的评论
INSERT INTO "Comment" ("id", "content", "postId", "authorId", "status")
VALUES
    ('comment_004', 'Tailwind 的 JIT 模式真的太好用了！', 'post_tailwind_mastery', 'user_author_003', 'APPROVED'),
    ('comment_005', '能分享一下你的 Tailwind 配置文件吗？', 'post_tailwind_mastery', NULL, 'APPROVED')
ON CONFLICT ("id") DO NOTHING;

-- 嵌套评论（回复）
INSERT INTO "Comment" ("id", "content", "postId", "authorId", "parentId", "status")
VALUES
    ('comment_006', '当然可以！我会在下一篇文章中分享完整配置。', 'post_tailwind_mastery', 'user_author_001', 'comment_005', 'APPROVED')
ON CONFLICT ("id") DO NOTHING;

-- ============================================================================
-- 7. 插入相册数据
-- ============================================================================

-- 相册 1: 城市夜景
INSERT INTO "PhotoGallery" (
    "id", "title", "slug", "description",
    "coverImage", "coverImageThumb",
    "status", "featured", "viewCount", "likeCount", "imageCount",
    "captureDate", "location", "camera", "lens",
    "authorId", "publishedAt"
)
VALUES (
    'gallery_city_night',
    '城市夜景',
    'city-night-views',
    '记录城市夜晚的霓虹与繁华，捕捉都市的璀璨光影',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400',
    'PUBLISHED', true, 456, 78, 3,
    '2024-01-15'::TIMESTAMP, '上海', 'Canon EOS R5', 'RF 24-70mm F2.8L IS USM',
    'user_author_002', NOW() - INTERVAL '20 days'
)
ON CONFLICT ("slug") DO NOTHING;

-- 相册 2: 日本之旅
INSERT INTO "PhotoGallery" (
    "id", "title", "slug", "description",
    "coverImage", "coverImageThumb",
    "status", "featured", "viewCount", "likeCount", "imageCount",
    "captureDate", "location", "camera", "lens",
    "authorId", "publishedAt"
)
VALUES (
    'gallery_japan_trip',
    '日本之旅',
    'japan-travel-2024',
    '探索日本的传统与现代，从京都的古寺到东京的霓虹',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
    'PUBLISHED', true, 892, 145, 10,
    '2024-06-20'::TIMESTAMP, '日本', 'Sony A7R IV', 'FE 24-105mm F4 G OSS',
    'user_author_002', NOW() - INTERVAL '10 days'
)
ON CONFLICT ("slug") DO NOTHING;

-- 相册 3: 自然风光
INSERT INTO "PhotoGallery" (
    "id", "title", "slug", "description",
    "coverImage", "coverImageThumb",
    "status", "featured", "viewCount", "likeCount", "imageCount",
    "captureDate", "location",
    "authorId", "publishedAt"
)
VALUES (
    'gallery_nature',
    '自然风光',
    'nature-landscapes',
    '探索大自然的壮丽与宁静',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'PUBLISHED', false, 234, 45, 3,
    '2024-02-20'::TIMESTAMP, '云南',
    'user_author_002', NOW() - INTERVAL '30 days'
)
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- 8. 插入照片数据
-- ============================================================================

-- 城市夜景的照片
INSERT INTO "PhotoImage" ("id", "galleryId", "url", "thumbnail", "alt", "width", "height", "sortOrder")
VALUES
    ('img_city_001', 'gallery_city_night', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400', '城市夜景全景', 1200, 800, 1),
    ('img_city_002', 'gallery_city_night', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400', '高楼大厦', 1200, 800, 2),
    ('img_city_003', 'gallery_city_night', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400', '城市天际线', 1200, 800, 3)
ON CONFLICT ("id") DO NOTHING;

-- 日本之旅的照片
INSERT INTO "PhotoImage" ("id", "galleryId", "url", "thumbnail", "alt", "width", "height", "sortOrder")
VALUES
    ('img_japan_001', 'gallery_japan_trip', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400', '京都街道', 1200, 800, 1),
    ('img_japan_002', 'gallery_japan_trip', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400', '富士山远景', 1200, 800, 2),
    ('img_japan_003', 'gallery_japan_trip', 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1200', 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400', '东京塔夜景', 1200, 800, 3),
    ('img_japan_004', 'gallery_japan_trip', 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=1200', 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400', '日式庭院', 1200, 800, 4),
    ('img_japan_005', 'gallery_japan_trip', 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=1200', 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400', '樱花盛开', 1200, 800, 5),
    ('img_japan_006', 'gallery_japan_trip', 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200', 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400', '传统寺庙', 1200, 800, 6),
    ('img_japan_007', 'gallery_japan_trip', 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1200', 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400', '涩谷路口', 1200, 800, 7),
    ('img_japan_008', 'gallery_japan_trip', 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1200', 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=400', '日本料理', 1200, 800, 8),
    ('img_japan_009', 'gallery_japan_trip', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400', '神社鸟居', 1200, 800, 9),
    ('img_japan_010', 'gallery_japan_trip', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400', '东京夜景', 1200, 800, 10)
ON CONFLICT ("id") DO NOTHING;

-- 自然风光的照片
INSERT INTO "PhotoImage" ("id", "galleryId", "url", "thumbnail", "alt", "width", "height", "sortOrder")
VALUES
    ('img_nature_001', 'gallery_nature', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', '雪山风光', 1200, 800, 1),
    ('img_nature_002', 'gallery_nature', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400', '森林湖泊', 1200, 800, 2),
    ('img_nature_003', 'gallery_nature', 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200', 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400', '山间小径', 1200, 800, 3)
ON CONFLICT ("id") DO NOTHING;

-- ============================================================================
-- 9. 插入点赞数据
-- ============================================================================

-- 文章点赞
INSERT INTO "Like" ("id", "userId", "targetType", "targetId")
VALUES
    ('like_001', 'user_author_002', 'POST', 'post_nextjs_guide'),
    ('like_002', 'user_author_003', 'POST', 'post_nextjs_guide'),
    ('like_003', 'user_admin_001', 'POST', 'post_tailwind_mastery'),
    ('like_004', 'user_author_002', 'POST', 'post_typescript_advanced')
ON CONFLICT ("userId", "targetType", "targetId") DO NOTHING;

-- 相册点赞
INSERT INTO "Like" ("id", "userId", "targetType", "targetId")
VALUES
    ('like_005', 'user_author_001', 'GALLERY', 'gallery_japan_trip'),
    ('like_006', 'user_author_003', 'GALLERY', 'gallery_japan_trip'),
    ('like_007', 'user_admin_001', 'GALLERY', 'gallery_city_night')
ON CONFLICT ("userId", "targetType", "targetId") DO NOTHING;

-- ============================================================================
-- 10. 更新统计数据
-- ============================================================================

-- 更新文章点赞数
UPDATE "Post"
SET "likeCount" = (SELECT COUNT(*) FROM "Like" WHERE "targetType" = 'POST' AND "targetId" = "Post"."id")
WHERE "id" IN ('post_nextjs_guide', 'post_tailwind_mastery', 'post_typescript_advanced');

-- 更新文章评论数
UPDATE "Post"
SET "commentCount" = (SELECT COUNT(*) FROM "Comment" WHERE "postId" = "Post"."id" AND "status" = 'APPROVED')
WHERE "id" IN ('post_nextjs_guide', 'post_tailwind_mastery');

-- 更新分类文章数
UPDATE "Category"
SET "postCount" = (SELECT COUNT(*) FROM "Post" WHERE "categoryId" = "Category"."id" AND "status" = 'PUBLISHED');

-- 更新标签使用次数
UPDATE "Tag"
SET "postCount" = (SELECT COUNT(*) FROM "PostTag" WHERE "tagId" = "Tag"."id");

-- 更新相册点赞数
UPDATE "PhotoGallery"
SET "likeCount" = (SELECT COUNT(*) FROM "Like" WHERE "targetType" = 'GALLERY' AND "targetId" = "PhotoGallery"."id");

-- ============================================================================
-- 11. 验证数据
-- ============================================================================

DO $$
DECLARE
    user_count INTEGER;
    post_count INTEGER;
    gallery_count INTEGER;
    comment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM "User";
    SELECT COUNT(*) INTO post_count FROM "Post";
    SELECT COUNT(*) INTO gallery_count FROM "PhotoGallery";
    SELECT COUNT(*) INTO comment_count FROM "Comment";

    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Mock 数据插入完成！';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '数据统计：';
    RAISE NOTICE '  用户数量: %', user_count;
    RAISE NOTICE '  文章数量: %', post_count;
    RAISE NOTICE '  相册数量: %', gallery_count;
    RAISE NOTICE '  评论数量: %', comment_count;
    RAISE NOTICE '';
    RAISE NOTICE '测试账号：';
    RAISE NOTICE '  管理员: admin@blogt3.com';
    RAISE NOTICE '  作者1: zhangwei@example.com';
    RAISE NOTICE '  作者2: lihua@example.com';
    RAISE NOTICE '  作者3: wangmin@example.com';
    RAISE NOTICE '';
    RAISE NOTICE '下一步：';
    RAISE NOTICE '  1. 在项目中配置 Supabase 客户端';
    RAISE NOTICE '  2. 实现 CRUD API';
    RAISE NOTICE '  3. 测试数据查询和展示';
    RAISE NOTICE '============================================================================';
END $$;

-- ============================================================================
-- SQL 脚本结束
-- ============================================================================
