# Music Claw

> **YesPlayMusic** React 重写版 — 基于 TanStack Start 的现代化网易云音乐播放器

这是将 [YesPlayMusic](https://github.com/qier222/YesPlayMusic) 从 **Vue 2** 迁移到 **React + TanStack Start** 的 Web 重写项目。

---

## 为什么选择 TanStack Start？

[TanStack Start](https://tanstack.com/start/latest) 是一个全新的全栈 React 框架，相比传统的 Vue SPA 架构，它带来了诸多优势：

### 核心特性

| 特性 | 说明 |
|------|------|
| **全文档 SSR** | 服务端渲染带来更快的首屏加载和更好的 SEO |
| **Streaming** | 渐进式页面加载，用户体验更流畅 |
| **类型安全的路由** | 基于 TanStack Router，全链路 TypeScript 类型推导 |
| **Server Functions** | 类型安全的客户端-服务器 RPC 调用 |
| **文件路由** | 类似 Next.js 的文件系统路由，直观清晰 |
| **内置数据加载** | Loader 预加载数据，避免页面闪烁 |
| **搜索参数管理** | 类型安全的 URL 搜索参数处理 |
| **代码分割** | 自动按路由分割，优化加载性能 |
| **全栈打包** | 基于 Vite，客户端和服务端代码统一构建 |
| **通用部署** | 部署到任何支持 Vite 的托管平台（本项目使用 Cloudflare Workers） |

### 与 Vue 方案的对比

| Vue 2 (原项目) | TanStack Start (本项目) |
|---------------|------------------------|
| Vue Router | TanStack Router（类型安全） |
| Vuex | Zustand + TanStack Query |
| vue-i18n | ParaglideJS |
| Vue CLI | Vite（更快的热更新） |
| SPA（单页应用） | SSR + SPA 混合 |
| 无类型安全 | 端到端类型安全 |

---

## 技术栈

```json
{
  "框架": "TanStack Start + React 19",
  "路由": "TanStack Router (文件路由)",
  "状态管理": "Zustand + TanStack Query",
  "样式": "Tailwind CSS v4 + Shadcn UI",
  "播放器": "Howler.js",
  "本地存储": "Dexie (IndexedDB)",
  "国际化": "ParaglideJS",
  "认证": "Better Auth",
  "测试": "Vitest",
  "部署": "Cloudflare Workers"
}
```

---

## 快速开始

### 环境要求

- [Bun](https://bun.sh/) (推荐) 或 pnpm
- Node.js 18+

### 安装依赖

```bash
bun install
```

### 配置环境变量

复制 `.env.example` 到 `.env.local`，配置网易云 API 地址：

```bash
cp .env.example .env.local
```

### 启动开发服务器

```bash
bun run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
bun run build
bun run preview
```

### 部署到 Cloudflare Workers

```bash
bun run deploy
```

---

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── app/            # 应用级组件
│   └── ui/             # UI 组件 (Shadcn)
├── features/           # 业务功能模块
│   ├── player/         # 播放器
│   ├── auth/           # 认证
│   ├── music/          # 音乐 API
│   └── track/          # 歌曲详情
├── lib/                # 工具库
│   ├── api/            # API 客户端
│   ├── db/             # 数据库 (Dexie)
│   └── constants/      # 常量
├── routes/             # 文件路由
│   ├── __root.tsx      # 根布局
│   ├── index.tsx       # 首页
│   └── ...
└── paraglide/          # 国际化 (自动生成)
```

---

## 开发进度

项目正在分阶段迁移中，详细进度请查看 [`docs/progress.md`](docs/progress.md)。

- [x] Phase 0: 基础设施
- [x] Phase 1: 路由与页面骨架
- [x] Phase 2: 只读 API 迁移
- [ ] Phase 3: 播放器核心 (进行中)
- [ ] Phase 4: 核心页面功能
- [ ] Phase 5: 登录与用户能力
- [ ] Phase 6: 设置与缓存
- [ ] Phase 7: 扩展功能

---

## 常用命令

```bash
# 开发
bun run dev

# 构建
bun run build

# 预览
bun run preview

# 测试
bun run test

# 代码检查
bun run lint
bun run format
bun run check

# 部署
bun run deploy
```

---

## 文档

- [迁移分析](docs/yesplaymusic-web-rewrite-analysis.md) — 依赖替换与架构决策
- [开发计划](docs/yesplaymusic-web-rewrite-plan.md) — 分阶段实施计划
- [进度追踪](docs/progress.md) — 当前开发状态
- [协作规范](docs/developer-collaboration.md) — 开发协作流程

---

## 相关链接

- [TanStack Start 文档](https://tanstack.com/start/latest)
- [TanStack Router 文档](https://tanstack.com/router/latest)
- [YesPlayMusic 原项目](https://github.com/qier222/YesPlayMusic)
- [网易云音乐 API](https://github.com/Binaryify/NeteaseCloudMusicApi)

---

## License

MIT

---

*这是一个学习与重构项目，感谢 YesPlayMusic 原作者的开源贡献。*
