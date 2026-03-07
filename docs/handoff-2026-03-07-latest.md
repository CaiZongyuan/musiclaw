# Handoff · 2026-03-07 · Latest

本文档用于把当前 `music-claw` 仓库在 **2026-03-07 最新一轮收口后** 的状态交接给下一位开发者。

本版重点补充：

- 当前已经完成到什么程度
- 用户刚刚验证通过了哪些页面
- 目前最值得继续推进的功能顺序
- 哪些问题已经不是 blocker，哪些仍然是 blocker

---

## 1. 当前主线结论

当前仓库主线依然明确：

- **以 `/root/Projects/Frontend/YesPlayMusic` 的 Web 端为唯一产品基线**
- **优先做 1:1 parity，而不是做“风格相似的新站”**
- **先补主路径页面，再补边缘页与工程收尾**

当前已经完成的工作说明：

- 不再只是“主路径能用”
- 已开始系统性把页面从统一占位骨架拉回原版结构
- 已进入“继续补未完成页面 + 继续细抠 parity 细节”的阶段
- `Explore` 已不再属于主线路径 blocker，当前主 blocker 重点转向 `New Album` 与 `MV`

---

## 2. 用户刚刚验证通过的内容

本轮对话里，用户已经真实浏览器确认通过：

### A. `liked songs` 与 VIP 播放

已确认：

- `/library/liked-songs` 里的 VIP 歌曲现在可以正常播放
- 喜欢页不会再因为缺少客户端账号态校正而把 VIP 歌误判成不可播

对应关键实现：

- `src/routes/library.liked-songs.tsx`
- `src/lib/music/playability-client.ts`

### B. `Library / Playlist / Album / Artist` 页面骨架回迁

已确认：

- `/library`
- `/playlist/:id`
- `/album/:id`
- `/artist/:id`

这些页面现在都已经从上一轮的“统一占位骨架”明显回到更接近原版的页面结构。

用户反馈是：

- 当前整体已经“可以了”
- 说明主结构方向已基本得到认可

### C. 歌曲列表封面修正

已确认：

- `library` 与 `playlist` 的歌曲列表封面恢复正常
- `album` 与 `artist` 的歌曲列表封面在补修后也恢复正常

这说明以下两类修正已经生效：

1. 歌曲列表行本身已支持封面渲染
2. `album` / `artist` 页面中，原始数据不足时的封面兜底链路已补齐

---

## 3. 截止目前已完成的关键模块

### 3.1 全局壳体 / 首页 / 播放器

已完成：

- Navbar 改回顶部固定导航
- 首页改回纵向内容流
- Player 改回更接近原版的三段式结构
- 首页 `For You` 已接回真实 `Daily Tracks` 与 `Personal FM`
- `/next` 队列页已可用
- 播放器喜欢按钮、专辑/艺人跳转、来源语义已恢复主链路可用
- 搜索来源恢复已支持 `q / type / page`
- 全局主题已从海洋风回迁到更接近原版的白底/深灰底 + 蓝色主色体系

### 3.2 登录 / 账号态 / 用户名模式

已完成：

- `/login`
- `/login/account`
- `/login/username`

两种模式都可进入应用，但能力不同：

- 用户名模式：偏只读
- 账号模式：可用收藏、FM、喜欢状态、完整取流等账号态能力

### 3.3 Library 主路径

已完成：

- `/library`
- `/library/liked-songs`
- liked songs 分页
- liked songs 播放全部构建全量队列
- 收藏专辑 / 收藏艺人 / 最近播放预览
- Library 骨架从多卡片式收回到更接近原版的：
  - 上方 liked songs
  - 下方 tabs 分区

### 3.4 核心详情页骨架

已完成：

- `/playlist/:id`
- `/album/:id`
- `/artist/:id`

这些页面都已经：

- 移除“通用 `RoutePlaceholder` 主体骨架”
- 改成更接近原版的 `封面/头像 + 信息区 + 列表区` 结构
- 补上了歌曲列表封面显示

### 3.5 Explore 主路径

已完成：

- `/explore`

这一页现在已经：

- 移除“通用 `RoutePlaceholder` 说明页”
- 恢复原版主结构里的分类切换、更多分类面板和歌单网格
- 接回 `推荐歌单 / 精品歌单 / 排行榜 / 普通分类歌单` 的不同数据源
- 补上 Explore 卡片直接播放能力
- 补上从播放器来源跳回对应 Explore 分类上下文的链路

---

## 4. 当前还没完成的核心功能

优先看 `docs/todo-2026-03-07.md`，这里只列最重要结论。

### 第一优先级

1. `bun run build`
2. `/lastfm/callback`
3. 文档同步与交付说明

原因：

- 这些都是原版 Web 主路径的一部分
- 当前仍然带明显占位痕迹，或尚未实现
- 继续推进它们，比继续抠已可用页面的像素细节收益更高

### 第二优先级

5. `Library` 剩余分区：MV / 云盘 / 更完整 tab 行为
6. `Artist` 剩余分区：MV / 相似艺人
7. `Album` 剩余信息：More by / 多 Disc / 更多附加信息
8. `Playlist` 剩余行为：歌单内搜索 / 收藏 / 特殊歌单样式 / 更多操作

### 第三优先级

9. `/settings`
10. `/lastfm/callback`
11. `build` 单独收口

---

## 5. 当前最重要的实现边界

### 5.1 用户名模式 != 账号模式

仍需时刻注意：

- 活跃会话不等于账号会话
- `profile.userId` 只能说明“当前有用户上下文”
- 账号态能力仍然必须依赖 `rawCookie / MUSIC_U`

因此：

- `Library` 分区要分别判断可见性
- liked 状态、FM、私人推荐、完整取流等必须按账号态分流

### 5.2 VIP 修复是两条链路，不要只修一边

当前已经修好的，是下面两条要一起成立：

1. 列表页 `playable / reason` 的客户端二次校正
2. 播放器取 `/song/url` 的客户端账号态取流

如果以后只改其中一边，会再次出现：

- 页面不显示 `VIP Only`，但播放器拿不到完整 URL
- 或者播放器能播，但列表页按钮仍灰掉

### 5.3 核心详情页不要退回 `RoutePlaceholder`

现在 `playlist / album / artist` 已经拆掉通用占位主体。
后续继续开发这些页时：

- 不要再往 `RoutePlaceholder` 回退
- 直接在这些页面自己的骨架上继续扩展即可

---

## 6. 当前关键文件

### 页面与样式

- `src/routes/library.tsx`
- `src/routes/library.liked-songs.tsx`
- `src/routes/playlist.$id.tsx`
- `src/routes/album.$id.tsx`
- `src/routes/artist.$id.tsx`
- `src/routes/explore.tsx`
- `src/styles.css`

### 播放与可播性

- `src/features/player/components/player-engine.tsx`
- `src/features/player/components/play-track-button.tsx`
- `src/features/player/lib/player-track.ts`
- `src/features/player/stores/player-store.ts`
- `src/lib/music/playability.ts`
- `src/lib/music/playability-client.ts`
- `src/features/track/api/track-api.ts`

### 登录与用户态

- `src/features/auth/stores/auth-store.ts`
- `src/features/auth/api/auth-api.ts`
- `src/routes/login.tsx`
- `src/routes/login.account.tsx`
- `src/routes/login.username.tsx`
- `src/features/user/api/user-api.ts`

### 协作文档

- `docs/progress.md`
- `docs/lessons-learned.md`
- `docs/todo-2026-03-07.md`
- `docs/handoff-2026-03-07-latest.md`

---

## 7. 当前已知 blocker

### 7.1 当前范围调整

用户已明确：本轮不继续做 `MV` 与云盘功能，因此当前 blocker 已从这些页面改为构建和文档收尾。


- `Explore`
- `New Album`
- `MV`

其中 `Explore` 已在本轮完成主结构回迁，不再是当前最主要 blocker；主 blocker 重点已转为 `New Album` 与 `MV`。

这些仍未完成，导致原版主路径还没有真正收口。

### 7.2 build 仍未通过

当前已知不是最近几轮业务代码引入的，而是旧问题：

- `src/routes/demo.i18n.tsx` 依赖的 `../logo.svg` 缺失
- 当前环境下 `wrangler` 日志写入权限问题

建议：

- 除非单独开一轮“构建修复”，否则不要优先处理

---

## 8. 建议下一位开发者的工作顺序

建议严格照这个顺序：

1. 先看 `docs/progress.md`
2. 再看 `docs/todo-2026-03-07.md`
3. 再看 `docs/lessons-learned.md`
4. 先做 `New Album`
5. 再做 `MV` 主路径
6. 然后才回头继续扩 `Library / Artist / Album / Playlist` 的剩余细节

---

## 9. 建议接手前的真实浏览器快速回归

继续开发前，建议至少先回归：

1. `/`
2. `/search?q=周杰伦&type=1&page=1`
3. `/playlist/<任意已知 id>`
4. `/album/<任意已知 id>`
5. `/artist/<任意已知 id>`
6. `/library`
7. `/library/liked-songs`
8. `/next`

如果接下来要做发现页或 MV，再额外回归：

9. `/explore`
10. `/new-album`
11. `/mv/<任意已知 id>`
12. `/artist/<任意已知 id>/mv`

---

## 10. 交接结论

当前仓库已经完成从“主路径能用”到“核心页面开始真正回到原版结构”的关键转折。

目前最重要的事情已经不是修补已有页面的基本可用性，而是：

- **补齐仍缺失的原版主路径页面**
- **继续让已完成页面更贴近原版而不是停留在说明页或统一占位页形态**
- **继续保持‘每做完一轮就浏览器验证，再更新 docs’的节奏**

如果下一位开发者按 `docs/todo-2026-03-07.md` 的顺序推进，当前主线是清晰且连续的。
