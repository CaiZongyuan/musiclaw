# Music Claw

**[English](README.md) | 中文**

一个基于 `TanStack Start`、`React 19` 和 `Bun` 的 [YesPlayMusic](https://github.com/qier222/YesPlayMusic) Web 端对齐式重写项目。

本项目的目标不是做一个“参考 YesPlayMusic 的新产品”，而是把原版 Vue 2 Web 体验迁移到支持 SSR 的现代 React 技术栈中，并尽量保持原版路由、应用壳体和播放主链路的一致性。

## 当前状态

- 当前是 YesPlayMusic Web 端的持续重写，不是全新产品线
- 应用壳体、底部播放器、首页、搜索、歌单、专辑、艺人、登录、个人库、我喜欢的音乐、发现页和队列页已经具备较完整的主路径能力
- 当前剩余缺口主要集中在构建/文档收尾和少量非核心 parity 细节；本轮交付不再推进 `mv` 与云盘能力
- 剩余差异、阻塞和下一步优先级统一记录在 `docs/progress.md` 与 `docs/handoff-2026-03-07-latest.md`

## 当前可用能力

- 顶部导航、响应式应用壳体、底部播放器、播放队列，以及从播放器来源回跳
- 首页推荐入口，包括 `Daily Tracks` 与 `Personal FM`
- 搜索页及其查询词、类型、分页等路由状态恢复
- 歌单、专辑、艺人、个人库、我喜欢的音乐，以及发现页分类浏览
- 从搜索、发现页、歌单类列表直接播放，并保留全局队列来源语义
- 用户名模式与账号模式两套网易云登录入口

## 仍在完善中

- `/daily/songs` 已接入账号态真实数据，当前仍保留少量过渡态页面结构
- `/new-album` 已可用，后续只需决定是否继续追更细的原版视觉节奏
- `/lastfm/callback` 已补上最小可用回调链路
- 一些次级交互和像素级对齐仍在继续收口

## 技术栈

- `TanStack Start` + `React 19`：SSR 与文件路由
- `TanStack Router` + `TanStack Query`：路由与数据获取
- `Zustand`：播放器和账号态状态管理
- `Better Auth`：应用侧认证基础设施
- `ParaglideJS`：英文与德文本地化
- `Tailwind CSS v4` + Shadcn UI 模式：样式与基础组件
- `Howler.js`：音频播放
- `Dexie`：浏览器本地持久化
- `Cloudflare Workers` + `wrangler`：部署目标

## 环境要求

- `Bun`
- `Node.js 18+`
- 一个独立运行的网易云 API 服务

## 环境变量

先从 `.env.example` 创建 `.env.local`：

```bash
cp .env.example .env.local
```

必填变量：

```bash
NETEASE_API_URL=http://127.0.0.1:3002
```

可选的客户端覆盖项：

```bash
VITE_NETEASE_API_URL=http://127.0.0.1:3001
VITE_REAL_IP=211.161.244.70
```

如果你的本地 API 服务启用了 Swagger，一般可以在 `http://localhost:3002/docs/` 查看接口文档。

如果要使用 `/lastfm/callback`，还需要在服务端环境里提供 `LASTFM_API_KEY` 与 `LASTFM_API_SHARED_SECRET`。

## 快速开始

安装依赖：

```bash
bun install
```

启动本地开发服务器，默认端口 `3000`：

```bash
bun run dev
```

运行测试：

```bash
bun run test
```

构建并预览生产版本：

```bash
bun run build
bun run preview
```

部署到 Cloudflare Workers：

```bash
bun run deploy
```

启动后可访问 `http://localhost:3000`。

## 常用命令

```bash
bun run dev      # 启动本地开发服务器
bun run build    # 构建生产包
bun run preview  # 预览生产构建
bun run test     # 运行 Vitest
bun run lint     # 运行 ESLint
bun run format   # 运行 Prettier 检查
bun run check    # 执行 Prettier 写入并运行 ESLint --fix
bun run deploy   # 构建并通过 Wrangler 部署
```

## 项目结构

```text
src/
├── components/                     # 应用壳体与共享 UI
├── features/                       # 业务模块（auth、player、album、artist、playlist、search 等）
├── integrations/                   # TanStack Query / Better Auth 集成层
├── lib/                            # API 客户端、工具函数、主题、存储、音乐能力
├── routes/                         # TanStack Start 文件路由
├── paraglide/                      # 自动生成的 i18n runtime（不要手改）
messages/                           # 翻译源文件
project.inlang/                     # Paraglide 配置
wrangler.jsonc                      # Cloudflare Workers 部署配置
```

主路径别名：

- `#/*` → `src/*`

## 路由覆盖

当前已经具备较完整主路径能力的路由：

- `/` 首页
- `/search` 搜索
- `/playlist/$id` 歌单详情
- `/album/$id` 专辑详情
- `/artist/$id` 艺人详情
- `/explore` 发现
- `/next` 播放队列
- `/library` 与 `/library/liked-songs` 个人库
- `/login`、`/login/account`、`/login/username` 登录流

已存在但仍处于过渡态或占位态的路由：

- `/daily/songs`
- `/new-album`
- `/mv/$id`
- `/settings`
- `/lastfm/callback`

这些路由以及部分次级交互细节仍在继续向原版收口。

## 登录模式

- `用户名模式` 适合轻量浏览和身份识别场景
- `账号模式` 才能解锁喜欢状态、每日推荐、私人 FM 以及更完整的音源获取能力
- 某些播放与推荐能力会刻意依赖浏览器本地保存的网易云账号态

## 协作文档

继续开发前，建议按下面顺序阅读：

- `docs/yesplaymusic-web-rewrite-analysis.md` — 重写原则与产品基线
- `docs/yesplaymusic-web-rewrite-plan.md` — 分阶段计划
- `docs/progress.md` — 当前进度、阻塞与下一步
- `docs/lessons-learned.md` — 可复用的坑点与修复经验
- `docs/developer-collaboration.md` — 仓库协作流程
- `docs/navbar-player-home-parity.md` — 主壳体 UI 对齐记录

## 说明

- 本仓库统一使用 `bun` 进行依赖管理和脚本执行
- `src/paraglide/` 是生成代码，不要手动修改
- 播放能力会受到浏览器本地网易云账号态影响，因此部分音源请求会故意放在客户端执行
- `docs/handoff-2026-03-07-latest.md` 是当前迁移状态最快的交接入口

## 相关链接

- [YesPlayMusic](https://github.com/qier222/YesPlayMusic)
- [TanStack Start](https://tanstack.com/start/latest)
- [TanStack Router](https://tanstack.com/router/latest)
- [ParaglideJS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)
- [Better Auth](https://www.better-auth.com/)

## License

MIT
