# BlogT3 后台还需完善什么（现状分析 + 缺口清单）

本文聚焦“后台管理（/admin）”相关能力：认证/权限、内容管理（文章/分类/标签/相册/图片）、以及与后台强相关的安全与数据链路问题。目标是把“必须先补齐的阻塞项”和“可渐进完善的功能项”拆清楚，便于你按优先级落地。

## 1. 后台现状盘点（基于代码结构）

### 1.1 已有路由/页面
- `/admin`：仪表板（统计 + 最近文章）
- `/admin/posts`：文章列表
- `/admin/posts/new`、`/admin/posts/edit/[id]`：文章编辑（同一编辑器复用）
- `/admin/categories`：分类管理（创建/删除）
- `/admin/tags`：标签管理（创建/删除）
- `/admin/galleries`：相册列表
- `/admin/galleries/new`、`/admin/galleries/edit/[id]`：相册编辑（含图片管理）
- `/admin/login`：登录
- `/admin/register`：注册（创建管理员账号）

### 1.2 当前实现方式的几个“关键特征”
- **NextAuth Credentials**：使用自建 `User` 表校验邮箱/密码（见 `src/server/auth/config.ts`）。
- **Supabase anon key 全域直连**：`src/lib/supabase.ts` 同时给“服务端/客户端”创建了 `supabase`（anon key）客户端；大量后台写操作直接在浏览器端执行。
- **权限主要靠页面级“是否登录”**：`src/app/admin/(dashboard)/layout.tsx` 与 `src/middleware.ts` 只做“有无 session”的保护，没有统一的角色/权限校验。

## 2. P0：必须优先修复的阻塞项（安全/一致性）

### 2.1 “任何人可写库/可上传”的高危风险
当前后台的新增/删除/更新大量在客户端用 anon key 直接写数据库；同时注册接口与上传接口也缺少鉴权。这会导致：
- 任何访问者在不登录的情况下，只要能发起请求（甚至绕开 UI），**就可能创建管理员、写入文章/分类/标签、上传任意图片**。

明确证据（部分）：
- 公开注册并默认写入管理员角色：`src/app/api/auth/register/route.ts`
- 上传接口无鉴权且允许跨域：`src/app/api/upload/route.ts`
- 客户端直接写库（示例）：  
  - 创建分类：`src/app/admin/(dashboard)/categories/_components/CategoryForm.tsx`  
  - 删除文章：`src/app/admin/(dashboard)/posts/_components/DeletePostButton.tsx`  
  - 新建/编辑文章：`src/app/admin/(dashboard)/posts/new/page.tsx`  
  - 图片管理：`src/components/admin/GalleryImageManager.tsx`
- anon key 客户端：`src/lib/supabase.ts`

建议的“最低可上线”修复方向（满足其一即可，但要一致）：
1) **服务端写入 + 强制鉴权/角色校验**  
   - 后台所有写操作迁移到 Server Actions 或受保护 API 路由；服务端读取 session，并校验 `role===ADMIN`（或更细粒度 RBAC）。
2) **数据库层收紧（RLS/权限）**  
   - 不要依赖“应用层自觉”；至少要做到 anon key 无法写入核心表（Post/Category/Tag/User/PhotoGallery/PhotoImage 等）。
3) **限制注册与上传**  
   - `/admin/register` 仅开发环境启用，或改为“邀请制/一次性初始化密钥”，并强制鉴权。  
   - `/api/upload` 必须校验管理员身份；加上速率限制、文件/路径策略、审计日志（最少要记录上传者与时间）。

### 2.2 后台写入与“当前登录用户”未绑定（审计与归属缺失）
文章/相册创建时，作者 ID 通过“取 User 表第一个用户”来兜底（`default-author-id` + `limit(1)`），这会导致：
- 内容归属混乱；无法审计谁创建/修改；后续做权限隔离会非常困难。

证据：
- `src/app/admin/(dashboard)/posts/new/page.tsx`
- `src/app/admin/(dashboard)/galleries/new/page.tsx`

修复方向：
- 从 NextAuth session 中取 `session.user.id` 作为 `authorId`，并在服务端写入时强制覆盖（不要信任客户端传入的 authorId）。

### 2.3 数据模型/命名体系割裂（会直接造成后台“看得到但写不进去/数据为空”）
仓库里并存多套表结构与命名体系：
- Prisma 使用 `Post/Category/Tag/User/...`（PascalCase）模型（见 `prisma/schema.prisma`）。
- 旧 SQL 脚本使用 `posts/categories/tags/users/...`（snake_case / lowercase）（见 `supabase-init.sql`、`supabase-users-table.sql`、`fix-posts-rls.sql` 等）。
- Server Actions / tRPC / 页面直连混用，有的读写 `Post`，有的读写 `posts`。

这类割裂会让后台看起来“页面齐全”，但在不同环境/不同数据源下功能会随机失效，属于上线阻塞项。

最低要求（P0 定稿决策）：
- **数据库与数据访问层必须二选一并贯彻到底**：  
  - 以 Prisma schema 为准（推荐），则所有 Supabase 查询统一指向 `Post/Category/...`；旧 SQL 脚本标注废弃/迁移。  
  - 或以旧 SQL 为准，则统一改为 `posts/categories/...`，并调整字段命名与关系表。

### 2.4 前台读接口可能暴露草稿/未发布内容（与后台发布流程强耦合）
例如 `getPostBySlug` 当前不限定 `status`，如果 public 路由可访问，将可能通过 slug 直接看到草稿/未发布文章。

证据：
- `src/server/actions/posts.ts`（getPostBySlug）
- `src/app/(public)/post/[slug]/page.tsx`（直接调用 getPostBySlug）

修复方向：
- public 读取必须默认只返回 `PUBLISHED`；后台预览需要单独的“带鉴权的预览路由/接口”。

## 3. P1：后台核心功能缺口（做完后“可稳定运营”）

### 3.1 文章管理（Posts）
现状：具备列表/编辑/发布/封面/分类，但缺少运营级能力与一致性校验。

建议补齐：
- **查询能力**：分页、搜索（标题/摘要/内容）、按状态/分类/标签筛选、排序（发布时间/阅读/点赞/评论）。
- **标签管理**：编辑页选择标签（多选），并在列表展示/筛选（目前后台编辑页未提供标签选择 UI）。
- **发布流程**：草稿自动保存、未保存离开提醒、预览（草稿预览）、定时发布（可选）。
- **内容校验**：slug 唯一性校验与冲突提示；标题/摘要长度提示；必填项校验（分类、内容等）。
- **运营字段**：featured 置顶、SEO 字段（meta title/description/og image）、阅读时长/字数的统一计算策略。
- **批量操作**：批量发布/归档/删除、批量改分类/改标签（至少给运营人员节省时间）。

### 3.2 分类/标签管理（Categories/Tags）
现状：只有创建/删除；缺少编辑、合并、排序、使用量约束。

建议补齐：
- **编辑能力**：改名/改 slug/改描述/改颜色；slug 修改的重定向策略（尤其是分类页/标签页 SEO）。
- **删除保护**：分类下有文章时禁止直接删除，提供“迁移到其他分类/批量改分类”。
- **排序与展示控制**：sortOrder、是否隐藏、导航显示/不显示。
- **统计刷新**：postCount 等计数字段应由触发器/作业/后台任务维护，避免手工不一致。

### 3.3 相册/图片管理（Galleries/Images）
现状：相册 CRUD + 图片上传/删除/alt 编辑，但缺少“稳定可运营”的内容与媒体管理能力。

建议补齐：
- **作者绑定**：同文章（必须绑定当前登录用户）。
- **图片排序**：拖拽排序落地（当前 UI 有“预留”但没有实现顺序持久化）。
- **封面策略**：从相册图片选择封面；生成/管理缩略图；封面删除/替换联动。
- **批量图片操作**：批量删除、批量改 alt、批量移动排序。
- **EXIF/元数据**：从上传文件提取并保存（如果做摄影站，这是核心卖点）。
- **标签体系一致化**：现在有 `GalleryTag` 关系模型，但后台 UI 里未提供相册标签编辑与筛选。
- **删除能力**：相册列表缺少删除/归档入口；删除要处理图片与引用一致性。

### 3.4 评论/互动/反馈的后台闭环
现状：代码中存在 comments/likes/feedback 等模块，但后台没有对应管理页面。

建议补齐：
- **评论审核台**：待审核列表、批量通过/拒绝、垃圾评论处理、按文章筛选、搜索。
- **反馈工单**：bug/建议列表、状态流转（open/processing/done）、关联目标内容（post/gallery/comment）。
- **数据一致性**：评论数/点赞数/浏览数的计数策略统一（触发器/作业/事务/幂等）。

## 4. P2：体验与工程质量（做完后“更像产品”）

### 4.1 体验与交互
- 统一 toast/弹窗：删除二次确认、错误信息可读、表单提交 loading/skeleton。
- 列表性能：分页/虚拟滚动、避免一次性加载全部。
- 编辑器：快捷插入图片、自动保存、粘贴上传、草稿恢复。

### 4.2 工程化与可维护性
- **统一数据入口**：在“Server Actions vs tRPC”中选一个做唯一数据层；页面不要混用直连 + actions + tRPC。
- **权限工具化**：抽出 `requireAdmin()` / `requireRole()`，服务端写入统一调用。
- **审计日志**：记录后台关键操作（创建/更新/删除/发布/上传），便于追责与排错。
- **测试**：至少补齐后台关键 API/Server Actions 的权限测试与基本 CRUD 测试。

## 5. 推荐里程碑（按最小可上线切分）

### M1：安全与一致性定稿（上线前必须）
- 决策：统一数据库表命名体系（Prisma vs 旧 SQL）并清理/标注废弃脚本。
- 后台写操作全部服务端化 + 管理员鉴权（注册/上传也必须加）。
- public 读取只允许 `PUBLISHED`；草稿预览走鉴权通道。

### M2：后台可运营（核心功能补齐）
- 文章：筛选/分页/搜索 + 标签编辑 + 批量操作 + 预览/自动保存。
- 分类/标签：编辑/排序/删除保护 + 使用量统计。
- 相册：标签编辑 + 图片排序持久化 + 删除/归档 + 封面策略。

### M3：产品化与质量提升
- 评论审核、反馈工单、审计日志、权限细分（ADMIN/MODERATOR/EDITOR）。
- 性能与缓存策略（仪表板统计聚合、列表缓存）。
- 测试与监控（错误上报、慢查询监控）。

---

如果你愿意，我可以基于这份清单把 M1 拆成可执行的具体任务（含建议改动点与文件清单），并按“最小改动保证安全”原则先把后台的高危风险清掉。

