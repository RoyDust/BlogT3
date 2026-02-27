# 设计文档：完善后台管理功能

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    管理后台界面                          │
├─────────────────────────────────────────────────────────┤
│  文章管理  │  分类管理  │  标签管理  │  相册管理  │  仪表板  │
├─────────────────────────────────────────────────────────┤
│                    共享组件层                            │
│  TagSelector │ BatchActions │ SearchFilter │ Charts    │
├─────────────────────────────────────────────────────────┤
│                  Server Actions 层                       │
│  posts.ts │ categories.ts │ tags.ts │ galleries.ts     │
├─────────────────────────────────────────────────────────┤
│                    Prisma ORM                           │
├─────────────────────────────────────────────────────────┤
│                  PostgreSQL 数据库                       │
└─────────────────────────────────────────────────────────┘
```

### 数据流

1. **用户操作** → UI 组件
2. **UI 组件** → Server Actions
3. **Server Actions** → Prisma ORM
4. **Prisma ORM** → PostgreSQL
5. **响应** → Toast 通知 → UI 更新

## 功能模块设计

### 1. 文章标签选择

#### 组件设计

**TagSelector 组件**
```typescript
interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}
```

**功能特性**：
- 多选标签
- 搜索标签
- 创建新标签
- 显示已选标签数量
- 支持键盘操作

#### 数据流程

1. 加载所有可用标签
2. 用户选择/取消选择标签
3. 保存文章时，更新 PostTag 关联表
4. 使用 Prisma 事务确保数据一致性

#### API 设计

```typescript
// Server Action
async function updatePostTags(postId: string, tagIds: string[]) {
  return await db.$transaction(async (tx) => {
    // 删除旧的标签关联
    await tx.postTag.deleteMany({ where: { postId } });
    // 创建新的标签关联
    await tx.postTag.createMany({
      data: tagIds.map(tagId => ({ postId, tagId }))
    });
    // 更新标签计数
    await updateTagCounts(tx, tagIds);
  });
}
```

### 2. 分类和标签编辑

#### 页面结构

**分类编辑页面** (`/admin/categories/edit/[id]`)
- 复用 CategoryForm 组件
- 预填充现有数据
- 支持修改名称、描述、颜色、图标
- 显示使用该分类的文章数量

**标签编辑页面** (`/admin/tags/edit/[id]`)
- 复用 TagForm 组件
- 预填充现有数据
- 支持修改名称、slug
- 显示使用该标签的文章和相册数量

#### 数据验证

```typescript
const categorySchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  icon: z.string().max(50).optional(),
});
```

### 3. 相册删除功能

#### 组件设计

**DeleteGalleryButton 组件**
```typescript
interface DeleteGalleryButtonProps {
  galleryId: string;
  galleryTitle: string;
  imageCount: number;
}
```

**功能特性**：
- 确认对话框
- 显示相册信息（标题、图片数量）
- 警告删除操作不可逆
- 删除进度提示
- 成功/失败反馈

#### 删除流程

1. 用户点击删除按钮
2. 显示确认对话框
3. 用户确认后，调用 Server Action
4. Server Action 使用事务删除：
   - 删除 PhotoImage 记录
   - 删除 GalleryTag 关联
   - 删除 PhotoGallery 记录
5. 显示 Toast 通知
6. 刷新页面数据

### 4. 批量操作功能

#### 组件设计

**BatchActions 组件**
```typescript
interface BatchActionsProps {
  selectedIds: string[];
  onDelete: (ids: string[]) => Promise<void>;
  onUpdateStatus?: (ids: string[], status: string) => Promise<void>;
  onClear: () => void;
}
```

**功能特性**：
- 全选/取消全选
- 显示已选数量
- 批量删除
- 批量修改状态（文章）
- 操作确认对话框

#### 实现方式

使用 React 状态管理选中项：
```typescript
const [selectedIds, setSelectedIds] = useState<string[]>([]);

const handleSelectAll = () => {
  setSelectedIds(items.map(item => item.id));
};

const handleToggleSelect = (id: string) => {
  setSelectedIds(prev =>
    prev.includes(id)
      ? prev.filter(i => i !== id)
      : [...prev, id]
  );
};
```

### 5. 搜索和筛选功能

#### 组件设计

**SearchFilter 组件**
```typescript
interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  filterOptions: {
    categories?: Category[];
    tags?: Tag[];
    statuses?: PostStatus[];
  };
}
```

**功能特性**：
- 关键词搜索（标题、内容）
- 按分类筛选
- 按标签筛选
- 按状态筛选
- 按日期范围筛选
- 清除筛选条件

#### 实现方式

使用 URL 查询参数保存筛选状态：
```typescript
const searchParams = useSearchParams();
const router = useRouter();

const handleSearch = (query: string) => {
  const params = new URLSearchParams(searchParams);
  params.set('q', query);
  router.push(`?${params.toString()}`);
};
```

### 6. 仪表板数据可视化

#### 统计数据

**基础统计**：
- 总文章数
- 已发布文章数
- 草稿数
- 总浏览量
- 总点赞数
- 总评论数
- 分类数
- 标签数
- 相册数

**趋势数据**：
- 最近 7 天文章发布趋势
- 最近 30 天浏览量趋势
- 分类分布（饼图）
- 热门文章排行

#### 图表组件

使用 Recharts 库：
```typescript
import { LineChart, Line, PieChart, Pie, BarChart, Bar } from 'recharts';

// 文章发布趋势
<LineChart data={publishTrendData}>
  <Line type="monotone" dataKey="count" stroke="#3b82f6" />
</LineChart>

// 分类分布
<PieChart>
  <Pie data={categoryDistribution} dataKey="count" nameKey="name" />
</PieChart>
```

## UI/UX 设计

### 设计原则

1. **一致性**：保持与现有界面风格一致
2. **简洁性**：避免过度设计，保持界面简洁
3. **反馈性**：所有操作都有明确的反馈
4. **容错性**：重要操作需要确认，支持撤销

### 颜色方案

- 主色调：蓝色 (#3b82f6)
- 成功：绿色 (#10b981)
- 警告：黄色 (#f59e0b)
- 错误：红色 (#ef4444)
- 中性：灰色 (#64748b)

### 交互设计

**确认对话框**：
- 标题：明确操作内容
- 内容：说明操作影响
- 按钮：取消（次要）+ 确认（主要）

**Toast 通知**：
- 成功：绿色背景，勾选图标
- 错误：红色背景，叉号图标
- 持续时间：3-5 秒

## 性能优化

### 1. 数据加载优化

- 使用 Prisma 的 `select` 只查询需要的字段
- 使用 `include` 预加载关联数据，避免 N+1 查询
- 实现分页加载，每页 20 条数据

### 2. 批量操作优化

- 使用 Prisma 事务确保原子性
- 使用 `deleteMany`、`updateMany` 批量操作
- 限制单次批量操作数量（最多 100 条）

### 3. 前端优化

- 使用 React.memo 避免不必要的重渲染
- 使用 useMemo 缓存计算结果
- 使用 useCallback 缓存回调函数
- 使用虚拟滚动处理长列表

## 错误处理

### 错误类型

1. **验证错误**：输入数据不符合要求
2. **权限错误**：用户无权执行操作
3. **数据库错误**：数据库操作失败
4. **网络错误**：请求失败或超时

### 错误处理策略

```typescript
try {
  const result = await serverAction(data);
  if (!result.success) {
    toast.error(result.error || '操作失败');
    return;
  }
  toast.success('操作成功');
  router.refresh();
} catch (error) {
  console.error(error);
  toast.error('发生未知错误，请重试');
}
```

## 安全考虑

### 1. 输入验证

- 使用 Zod 进行服务端验证
- 限制输入长度和格式
- 防止 XSS 攻击

### 2. 权限检查

- 所有 Server Actions 检查用户登录状态
- 确保只有作者可以执行管理操作

### 3. 数据保护

- 删除操作需要确认
- 批量操作限制数量
- 使用事务确保数据一致性

## 测试策略

### 单元测试

- Server Actions 的业务逻辑
- 数据验证函数
- 工具函数

### 组件测试

- TagSelector 组件
- BatchActions 组件
- SearchFilter 组件
- 确认对话框

### 集成测试

- 文章标签关联流程
- 批量删除流程
- 搜索筛选流程

### E2E 测试

- 完整的文章创建和编辑流程
- 分类和标签管理流程
- 相册管理流程

## 部署考虑

### 数据库迁移

无需数据库迁移，使用现有 schema。

### 环境变量

无需新增环境变量。

### 依赖更新

```json
{
  "dependencies": {
    "recharts": "^2.10.0",
    "@radix-ui/react-select": "^2.0.0",
    "@dnd-kit/core": "^6.1.0"
  }
}
```

### 构建和部署

1. 运行类型检查：`pnpm typecheck`
2. 运行代码检查：`pnpm lint`
3. 运行构建：`pnpm build`
4. 部署到生产环境

## 监控和维护

### 性能监控

- 监控 Server Actions 响应时间
- 监控数据库查询性能
- 监控页面加载时间

### 错误监控

- 使用 Sentry 或类似工具记录错误
- 监控 Toast 错误通知频率
- 定期检查错误日志

### 用户反馈

- 收集用户使用反馈
- 优化交互体验
- 持续改进功能
