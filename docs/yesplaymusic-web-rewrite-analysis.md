# YesPlayMusic Web 重写依赖分析

目标：把 `/root/Projects/Frontend/YesPlayMusic` 的 Vue 2 + Vue CLI Web 版本，迁移到当前这个 `TanStack Start + React 19 + Tailwind v4` 项目里。

范围：**仅 Web 端**，本轮**不考虑 Electron**。

## 1. 先说结论

当前项目 `music-claw` 已经有一套很新的基础设施，以下核心依赖**已经具备**：

- `react` / `react-dom`
- `@tanstack/react-start`
- `@tanstack/react-router`
- `@tanstack/react-query`
- `tailwindcss` / `@tailwindcss/vite`
- `better-auth`
- `@inlang/paraglide-js`
- `vitest`

这意味着：

1. **Vue 框架层依赖不需要迁移**，而是直接换成 TanStack Start 的路由、loader、server function、React 组件体系。
2. **Electron 相关依赖全部先排除**。
3. **旧项目里真正需要补装的，主要是播放器、缓存、二维码登录、日期工具，以及一个新的全局状态方案。**

## 2. 旧项目依赖按“是否还需要”分类

### A. 直接淘汰：Vue / Vue CLI 技术栈

这些包是旧架构绑定，重写后不应该继续安装：

- `vue`
- `vue-router`
- `vuex`
- `vue-i18n`
- `vue-clipboard2`
- `vue-gtag`
- `vue-slider-component`
- `@vue/cli-plugin-babel`
- `@vue/cli-plugin-eslint`
- `@vue/cli-plugin-pwa`
- `@vue/cli-plugin-vuex`
- `@vue/cli-service`
- `vue-template-compiler`
- `register-service-worker`
- `core-js`
- `svg-sprite-loader`

对应替换关系：

- `vue-router` → `@tanstack/react-router`
- `vuex` → `zustand`（推荐）或 React Context
- `vue-i18n` → `@inlang/paraglide-js`
- `vue-slider-component` → Shadcn `slider` 组件
- `vue-clipboard2` → 浏览器原生 `navigator.clipboard`
- `vue-gtag` → 先不装；后续按需要接 `gtag.js` 或 `react-ga4`
- `register-service-worker` / PWA 插件 → 先不迁，后续再决定是否加 `vite-plugin-pwa`

### B. Web 首阶段建议保留/替换为 React 友好方案

这些是旧项目的**业务能力依赖**，Web 重写大概率还需要：

| 旧依赖 | 用途 | React Web 建议 |
| --- | --- | --- |
| `axios` | API 请求 | **建议不装**，优先用 `fetch` + TanStack Start server functions |
| `dexie` | IndexedDB 缓存 | **建议继续使用** |
| `howler` | 音频播放 | **建议继续使用** |
| `qrcode` | 二维码登录渲染 | **建议继续使用** |
| `dayjs` | 日期处理 | **建议继续使用** |
| `js-cookie` | Cookie 读写 | 可装；也可以自己封装 cookie util |
| `plyr` | MV / 视频播放器 | 可装，MV 页面再接入 |
| `color` | 颜色处理 | 可选，歌词页/封面主题色时再装 |
| `node-vibrant` | 封面取色 | 可选，歌词背景/卡片渐变时再装 |
| `change-case` | 文本格式转换 | 可选，确认有实际需求再装 |
| `lodash` | 工具函数 | **建议不用整包**，尽量改为原生 API；必要时按子模块补 |
| `md5` / `crypto-js` | 哈希 | **优先不用**，能否改为 Web Crypto / 服务端实现后再定 |
| `nprogress` | 页面加载进度条 | 可选，TanStack Router 自带 pending 能力，先不急着装 |

### C. 服务端能力：是否自带网易云 API

这部分不是 React 替换，而是**后端边界选择**：

| 旧依赖 | 用途 | Web 重写建议 |
| --- | --- | --- |
| `@neteaseapireborn/api` | 网易云接口适配 | **推荐保留为服务端依赖**，通过 TanStack Start server functions 暴露给前端 |
| `express` | 本地 API 容器 | **不需要**，由 TanStack Start 取代 |
| `express-http-proxy` | 本地代理 | **不需要**，改成 server function / route handler |
| `express-fileupload` | 上传接口 | 只有云盘上传要做时再评估 |

这里有两种路线：

1. **外部已有 Netease API 服务**：那你现在甚至可以先不装 `@neteaseapireborn/api`。
2. **希望新项目自己承载 API**：那建议后续安装 `@neteaseapireborn/api`，但只在服务端代码里使用，不要在浏览器端直接引用。

### D. Electron 专属：本轮全部排除

这些包在 Web 第一阶段都**不要装**：

- `electron`
- `electron-builder`
- `electron-context-menu`
- `electron-debug`
- `electron-devtools-installer`
- `electron-icon-builder`
- `electron-is-dev`
- `electron-log`
- `electron-store`
- `electron-updater`
- `discord-rich-presence`
- `mpris-service`
- `pac-proxy-agent`
- `tunnel`
- `x11`
- `@unblockneteasemusic/rust-napi`
- `vue-cli-plugin-electron-builder`

## 3. 当前项目还缺什么

如果按 YesPlayMusic 的 Web 核心功能来做，当前项目最值得优先补的是：

### P0：我建议你先安装

- `zustand`
- `dexie`
- `howler`
- `qrcode`
- `dayjs`

原因：

- `zustand`：旧项目的 `vuex` 不只是页面状态，还承担了播放器、设置、登录态、toast、modal 等全局状态。只靠 React Context 会比较快失控，`zustand` 更适合做播放器和设置中心。
- `dexie`：旧项目本来就把歌词、专辑、音频缓存放 IndexedDB，这个能力 Web 端值得保留。
- `howler`：旧项目播放器核心依赖，React 重写时依然适合。
- `qrcode`：登录页二维码能力直接要用。
- `dayjs`：旧项目多处使用，迁移成本最低。

### P1：按页面推进再安装

- `js-cookie`
- `plyr`
- `color`
- `node-vibrant`

说明：

- `js-cookie`：如果你想快速兼容旧的 cookie 登录逻辑，装它最省事。
- `plyr`：MV 页面时再补。
- `color` + `node-vibrant`：歌词页、FM 卡片、封面主色提取时再补。

### P2：只有在你选择“项目内承载网易云 API”时再安装

- `@neteaseapireborn/api`

## 4. 我不建议你现在装的包

这些要么已经被当前项目替代，要么应该等后面明确需求再加：

- 所有 `vue*` / `@vue/*`
- 所有 `electron*`
- `express`
- `express-http-proxy`
- `express-fileupload`
- `lodash`（整包）
- `md5`
- `crypto-js`
- `register-service-worker`
- `core-js`
- `svg-sprite-loader`

## 5. 一个重要判断：`better-auth` 这轮先不要当主线

当前项目已经有 `better-auth`，但 **YesPlayMusic 的登录体系本质上不是“你自己的站内账号体系”**，而是：

- 网易云账号登录
- Cookie 持有与刷新
- 二维码登录
- 用户名/账号两种登录路径

所以 Web 第一阶段建议：

- **不要急着把登录迁到 `better-auth`**。
- 先把“网易云登录态”当成业务态处理：cookie + profile + login mode。
- 如果以后你想给自己的网站再加“站内账号”，再启用 `better-auth` 也不迟。

换句话说，`better-auth` 现在可以**保留依赖但暂不接入主流程**。

## 6. 推荐的新状态划分

旧项目 `vuex` 里混了 4 类状态，React 重写时建议拆开：

1. **路由级数据**
   - 用 TanStack Router `loader`
   - 例如：歌单详情、专辑详情、艺人详情、搜索结果

2. **服务端请求缓存**
   - 用 TanStack Query
   - 例如：用户信息、喜欢列表、播放历史、每日推荐

3. **客户端全局 UI / Player 状态**
   - 用 `zustand`
   - 例如：当前播放队列、播放模式、歌词开关、toast、modal、settings

4. **持久化缓存**
   - 用 `localStorage` + `Dexie`
   - 例如：设置、播放器快照、歌词缓存、专辑缓存、音频缓存

## 7. 推荐安装顺序

如果你希望我后面按最稳的路径继续推进，建议你先安装：

```bash
bun add zustand dexie howler qrcode dayjs
```

如果你倾向于尽快兼容旧登录和 MV 能力，再补：

```bash
bun add js-cookie plyr color node-vibrant
```

如果你决定把网易云 API 也直接放进当前项目：

```bash
bun add @neteaseapireborn/api
```

如果你打算过渡期复用旧 SCSS 资源：

```bash
bun add -d sass
```

## 8. 路由/页面迁移优先级建议

建议按下面顺序重写，这样最容易尽快跑通：

1. `home`
2. `playlist/:id`
3. `album/:id`
4. `artist/:id`
5. `search`
6. `login` / `login/account`
7. `library`
8. `settings`
9. `mv`
10. `lyrics`

原因：前 5 个页面可以先证明“内容浏览 + 基础播放链路”跑通，后面再补登录、收藏、设置和 MV。

## 9. 迁移计划

### 阶段 1：基础设施定型

- 确认 API 边界：外部 Netease API，还是项目内 server functions 包装
- 安装首批依赖：`zustand`、`dexie`、`howler`、`qrcode`、`dayjs`
- 定义新的目录边界：`routes`、`features/player`、`features/auth`、`features/music-api`

### 阶段 2：状态与数据层重建

- 用 `zustand` 重建播放器 store 与 settings store
- 用 TanStack Query 重建用户信息、喜欢列表、播放历史查询
- 用 server functions 封装旧 `src/api/*.js` 能力

### 阶段 3：页面骨架迁移

- 先迁 `home`、`playlist`、`album`、`artist`、`search`
- 把 Vue Router 路由映射成 `src/routes/` 文件路由
- 替换旧的 `keepAlive/savePosition` 逻辑为滚动恢复与 query 缓存

### 阶段 4：播放器闭环

- 接入 `howler`
- 迁移播放队列、播放模式、上一首/下一首、进度同步
- 用 `Dexie` 接回歌词/专辑/音频缓存

### 阶段 5：登录与用户能力

- 迁移二维码登录、cookie 登录、profile 拉取
- 迁移用户歌单、喜欢歌曲、每日推荐、云盘等能力
- 明确 `better-auth` 暂不进入主登录流程

### 阶段 6：增强体验

- 补 `mv`、`lyrics`、主题色提取、快捷反馈
- 评估是否恢复 PWA
- 最后再考虑 Electron 复用策略

## 10. 下一步建议

如果只做“第一轮最小可用 Web 重写”，我建议你**现在先安装这一组**：

```bash
bun add zustand dexie howler qrcode dayjs js-cookie
```

这是因为它们能覆盖：

- 播放器
- 本地缓存
- 二维码登录
- 日期处理
- Cookie 登录兼容

而 `plyr`、`node-vibrant`、`color`、`@neteaseapireborn/api` 都可以后置。
