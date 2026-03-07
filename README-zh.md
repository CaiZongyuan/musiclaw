# Music Claw

**[English](README.md) | 中文**

一个基于 `TanStack Start`、`React 19` 和 `Bun` 的 [YesPlayMusic](https://github.com/qier222/YesPlayMusic) Web 端对齐式重写项目。

本项目的目标不是做一个“参考 YesPlayMusic 的新产品”，而是把原版 Vue 2 Web 体验迁移到支持 SSR 的现代 React 技术栈中，并尽量保持原版路由、应用壳体和播放主链路的一致性。

## 当前状态

- 当前是 YesPlayMusic Web 端的持续重写，不是全新产品线
- 现阶段重点在应用壳体、首页、搜索、歌单、专辑、艺人、登录、个人库、每日推荐、发现页和队列页的 parity 收口
- 剩余差异、阻塞和下一步计划统一记录在 `docs/progress.md` 与 `docs/navbar-player-home-parity.md`

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

当前已经覆盖一批关键的 YesPlayMusic Web 路由：

- `/` 首页
- `/search` 搜索
- `/playlist/$id` 歌单详情
- `/album/$id` 专辑详情
- `/artist/$id` 艺人详情
- `/daily/songs` 每日推荐
- `/new-album` 新专辑
- `/explore` 发现
- `/next` 播放队列
- `/library` 与 `/library/liked-songs` 个人库
- `/login`、`/login/account`、`/login/username` 登录流

部分次级页面与交互细节仍在继续向原版收口。

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

## 相关链接

- [YesPlayMusic](https://github.com/qier222/YesPlayMusic)
- [TanStack Start](https://tanstack.com/start/latest)
- [TanStack Router](https://tanstack.com/router/latest)
- [ParaglideJS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)
- [Better Auth](https://www.better-auth.com/)

## License

MIT
