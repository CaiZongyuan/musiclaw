# Lessons Learned

## 账号态专属推荐优先走客户端 Query

- Context:
  - 首页 `Daily Tracks`、`Personal FM` 和 `/daily/songs` 依赖本地持久化的网易云 cookie，而不是 SSR 请求上下文里的标准 session
- Problem:
  - 如果把这类能力强行放进 route loader / server function，服务端首次渲染拿不到浏览器 localStorage 里的 `rawCookie`，就会把账号专属内容误判成未登录或空数据
- Resolution:
  - 对这类账号态专属推荐，优先使用带 `attachNeteaseCookie` 的客户端 `useQuery`；页面骨架和非账号态提示仍由路由负责
- Prevention:
  - 后续凡是依赖本地持久化 cookie 的“账号专属内容”，先判断它是否真的适合 SSR；如果 cookie 只存在浏览器端，就默认走客户端 query + 明确空态 / 登录态分支

## 用 `docs/` 作为协作中枢

- Context:
  - 项目将由多个开发者或多个阶段协同推进
- Problem:
  - 如果上下文只存在对话里，后续开发者无法快速接手
- Resolution:
  - 统一把计划、进度、分析、经验放进 `docs/`
- Prevention:
  - 每次阶段切换、遇到阻塞、形成稳定结论后都更新文档

## Web 重写先不要带上 Electron 包袱

- Context:
  - YesPlayMusic 同时包含 Web 与 Electron 两套运行方式
- Problem:
  - 如果一开始就兼顾 Electron，会显著增加迁移复杂度
- Resolution:
  - 第一阶段仅做 Web，Electron 相关依赖和本地服务能力全部后置
- Prevention:
  - 新实现只围绕 TanStack Start Web 运行时设计

## 登录先保持业务态，不急着引入站内账号体系

- Context:
  - 当前仓库内已有 `better-auth`
- Problem:
  - YesPlayMusic 的核心登录其实是网易云 cookie / 二维码登录，不是网站自有账号
- Resolution:
  - 第一阶段把登录视为业务态，用 store + cookie + API 兼容旧逻辑
- Prevention:
  - 在真正需要站内账号前，不把 `better-auth` 强行塞进主流程

## TanStack Start 与 Paraglide 有生成产物依赖

- Context:
  - 当前仓库在全量类型检查时出现 `routeTree.gen` 和 `#/paraglide/*` 缺失
- Problem:
  - 即使新增代码本身没有明显错误，仓库也会因为缺少生成文件而让全量 `tsc` 失败
- Resolution:
  - 先继续做增量实现，同时把该问题记录到进度中；后续需要通过框架生成流程补齐这些文件
- Prevention:
  - 在开始大规模实现前，先确认路由生成与 Paraglide 代码生成流程已经跑过

## Phase 0 先搭基础设施，不要过早绑定具体页面

- Context:
  - YesPlayMusic 的迁移涉及请求层、状态层、缓存层、播放器层多条主线
- Problem:
  - 如果一开始就直接写页面，很容易把请求、状态、缓存逻辑分散进组件
- Resolution:
  - 先建立 `src/lib/api`、`src/lib/db`、`src/features/*/stores` 骨架
- Prevention:
  - 后续新增页面时优先复用这些基础层，而不是在页面里重新拼请求和状态

## Zustand v5 里对象 selector 需要稳定引用

- Context:
  - `PlayerDock` 通过 `usePlayerStore((state) => ({ ... }))` 一次性选择多个字段
- Problem:
  - 在 `zustand` v5 下，这类 selector 每次都会返回新对象，可能触发 `Maximum update depth exceeded`
- Resolution:
  - 对多字段对象 selector 使用 `useShallow`，或拆成多个独立 selector
- Prevention:
  - 以后凡是 `zustand` 返回对象或数组，都优先使用 `useShallow` 或稳定引用策略

## 路由 loader 先通过 server functions 取外部 API

- Context:
  - TanStack Start 的 route loader 既可能在服务端首次渲染执行，也可能在客户端导航时执行
- Problem:
  - 如果直接在 loader 里用相对地址请求外部 API，SSR 下容易遇到 base URL 不完整的问题
- Resolution:
  - 第一批只读接口通过 `createServerFn` 在服务端请求外部 Netease API，再由 loader 复用 query options
- Prevention:
  - 后续迁移更多接口时，优先沿用“server function + query options + loader”这一条链路

## 为当前项目单独维护 `vitest.config.ts`

- Context:
  - 默认 `vite.config.ts` 启用了 Cloudflare Vite 插件
- Problem:
  - 直接运行 `vitest` 会被拉入 Workers/Miniflare 运行时，导致本地单测不稳定
- Resolution:
  - 新增独立的 `vitest.config.ts`，仅保留 `tsconfigPaths` 和 `jsdom` 测试环境
- Prevention:
  - 后续纯单元测试优先使用 `bunx vitest run --config vitest.config.ts`

## 新增测试统一放在根目录 `test/`

- Context:
  - 当前仓库已存在根目录 `test/` 作为测试入口
- Problem:
  - 把测试紧贴源码文件放在 `src/` 下会偏离当前仓库约定
- Resolution:
  - 本项目新增测试统一放到根目录 `test/` 下，并按模块分子目录组织
- Prevention:
  - 后续新增单测时优先使用 `test/`，例如 `test/stores/*`、`test/lib/*`

## 服务端环境变量优先从 `process.env` 读取

- Context:
  - TanStack Start 的 server function 和 loader 在服务端执行时会读取后端 API 地址
- Problem:
  - `NETEASE_API_URL` 这类未加 `VITE_` 前缀的变量，不能稳定通过 `import.meta.env` 读取
- Resolution:
  - 服务端请求桥优先读取 `process.env.NETEASE_API_URL`，再回退到 `VITE_NETEASE_API_URL`
- Prevention:
  - 以后凡是仅服务端使用的环境变量，都优先从 `process.env` 读取

## 前端开发端口不要和独立后端 API 端口相同

- Context:
  - 当前项目默认前端开发端口是 `3000`
- Problem:
  - 如果 `NETEASE_API_URL` 也指向 `http://127.0.0.1:3000`，SSR 请求会打回前端自身，而不是独立 API 服务
- Resolution:
  - 独立 Netease API 服务请使用其他端口，例如 `3001` 或 `10754`
- Prevention:
  - 真机测试前先确认前端和 API 不是同一个地址

## 搜索参数驱动的 TanStack Router loader 必须声明 `loaderDeps`

- Context:
  - `/search` 页面通过查询参数 `?q=` 和 `?type=` 驱动 loader 请求
- Problem:
  - 如果 route 只在 `loader` 里读取 `search`，但没有声明 `loaderDeps`，同一路径下仅搜索参数变化时 loader 可能不会重新执行，页面会继续显示旧的或空的 loader 数据
- Resolution:
  - 为这类 route 显式声明 `loaderDeps: ({ search }) => ...`，并在 `loader` 中统一使用 `deps`
- Prevention:
  - 以后凡是依赖 query string 拉数据的 TanStack Router 页面，都先补 `loaderDeps`，避免把 search 参数漏出缓存键

## 搜索页优先让 URL 成为唯一状态源

- Context:
  - 搜索页同时包含关键词、分类和分页，这些状态既影响 loader，也影响缓存命中
- Problem:
  - 如果输入框、当前分类和当前页只放在本地 state，刷新、分享链接和前进后退都会变得不可靠
- Resolution:
  - 让 `q`、`type`、`page` 全部进入路由 search 参数，表单和分页只负责更新 URL，loader 统一从 `loaderDeps` 读取
- Prevention:
  - 后续实现筛选、排序、MV 搜索等功能时，也优先把影响数据请求的状态放进 URL


## 当前播放歌曲的衍生数据适合由播放器壳统一拉取

- Context:
  - 歌曲的播放地址、歌词等衍生数据会在搜索页、歌单页、专辑页、艺人页等多个入口被触发
- Problem:
  - 如果每个入口按钮自己请求这些数据，切歌后容易漏拉下一首，逻辑也会重复
- Resolution:
  - 让页面入口只负责把队列和当前曲目写入 store，再由 `PlayerDock` 根据当前曲目统一解析播放地址和歌词预览
- Prevention:
  - 后续接 howler、scrobble 和歌词高亮时，优先围绕“当前播放曲目”集中处理副作用，而不是分散到各个页面按钮


## `Howl` 实例应只在曲目源变化时重建

- Context:
  - 播放器需要同时响应当前曲目、播放状态、音量和进度等多个状态
- Problem:
  - 如果把 `isPlaying`、`volume` 这类高频状态也放进创建 `Howl` 的 effect 依赖里，会导致音频实例被反复销毁重建，产生断播或重头播放
- Resolution:
  - 创建 `Howl` 的 effect 只依赖 `track.id` 和 `sourceUrl`；播放/暂停、音量、进度同步分别用独立 effect 处理
- Prevention:
  - 后续扩展 seek、倍速、淡入淡出等能力时，继续保持“实例生命周期”和“运行时控制”分离

## 播放器进度与时长应在 store 层统一钳制

- Context:
  - 底部播放器 UI、`Howler` 引擎和持久化状态都会读写 `progressSeconds`、`durationSeconds`
- Problem:
  - 如果让组件直接随意写进度，拖动进度条或切歌后容易出现进度超过时长、切歌后仍残留上一首时长的问题
- Resolution:
  - 在 `player-store` 中提供 `seekTo`、切歌时重算 `durationSeconds`，并统一对进度和时长做 clamp
- Prevention:
  - 后续新增歌词高亮、已播放缓存、逐字歌词时，继续只通过 store action 改写播放进度，不在组件里分散处理边界

## 路由级数据页应尽早接入共享错误态

- Context:
  - 首页、搜索页和详情页大量依赖 TanStack Router loader + server function 拉取外部 Netease API
- Problem:
  - 当 API 地址错误、服务未启动或返回异常时，如果路由没有 `errorComponent`，用户容易看到整页空白或难以恢复的报错
- Resolution:
  - 抽出 `RouteErrorState` 作为共享错误 UI，并在根路由和核心数据路由统一接入 `errorComponent` + `reset`
- Prevention:
  - 后续新增依赖 loader 的业务路由时，默认一起补上 `errorComponent`，把错误恢复路径当成页面骨架的一部分

## 歌词高亮逻辑应先沉到纯函数再接 UI

- Context:
  - 歌词预览、展开面板和后续独立歌词页都需要根据 `progressSeconds` 定位当前句
- Problem:
  - 如果每个组件都自己扫描歌词数组，容易出现当前句不一致，也很难写稳定测试
- Resolution:
  - 在 `track/lib/lyrics.ts` 中抽出 `getActiveLyricIndex` 和 `getLyricPreview`，组件只消费 helper 的结果
- Prevention:
  - 后续扩展逐字歌词、翻译歌词对齐和滚动定位时，继续优先扩展 helper，再让 UI 复用同一套逻辑

## 同一路由的扩展区块优先并入已有 loader

- Context:
  - 艺人页后续会逐步追加热门歌曲、专辑、MV 等多个区块
- Problem:
  - 如果每个区块各自发请求，页面容易出现多段加载闪烁，也会让错误恢复路径分散
- Resolution:
  - 让艺人页 loader 统一 `Promise.all` 组合详情和专辑请求，再由组件一次消费
- Prevention:
  - 后续给艺人页补 MV、相似艺人等区块时，优先评估是否并入同一路由 loader，而不是先散落到多个组件请求

## 重写项目必须先锁定原产品基线

- Context:
  - 当前仓库以 `TanStack Start` 重写 `YesPlayMusic` Web 端，前期已经完成了不少基础设施和页面能力。
- Problem:
  - 如果只按“模块做完了多少”推进，而不把旧仓库源码当成唯一产品规范，项目很容易滑向“参考原项目做一个新站”，而不是“1:1 复刻原项目”。
- Resolution:
  - 重新把 `/root/Projects/Frontend/YesPlayMusic` 的路由、页面结构、全局壳体和关键交互定义为唯一产品基线；`docs/progress.md` 与计划文档统一改成 parity 驱动写法。
- Prevention:
  - 后续每做一个页面，先看旧仓库对应源码，再记录“已对齐 / 功能已到位但未对齐 / 未实现”；不要在 parity 未建立前继续扩展非原版能力。

## 用户名只读登录应以 profile 作为会话基准

- Context:
  - 旧版 `YesPlayMusic` 的 `/login/username` 并不写入账号 cookie，而是只记录选中的公开用户资料后进入 `Library`
- Problem:
  - 如果前端把“已登录”严格等同于 `rawCookie` / `MUSIC_U` 存在，那么用户名模式会被误判为未登录，导致 `/library` 和 `/library/liked-songs` 无法复用同一条浏览链路
- Resolution:
  - 将“活跃登录态”和“账号登录态”拆开：前者允许基于 `profile.userId` 成立，后者仍要求 cookie；`Library` 里对账号专属区块单独做 capability gate
- Prevention:
  - 后续凡是有“公开浏览模式”和“账号模式”并存的页面，都应先区分“能进入页面”和“能读私有数据”这两个判断，不要共用同一个 cookie 条件

## 大歌单播放全部应按 trackIds 按需批量补全

- Context:
  - 喜欢歌曲歌单在大体量场景下，`/playlist/detail` 返回的 `tracks` 往往只覆盖前一段，完整列表需要依赖 `trackIds`
- Problem:
  - 如果“播放全部”直接基于当前页或当前已加载的 `tracks` 构建队列，会让 `/next` 和播放器都只拿到局部数据，看起来像“播放全部”失效
- Resolution:
  - 在点击“播放全部”时，基于 `trackIds` 找出缺失歌曲，按批次调用歌曲详情接口补齐，再按原始顺序重建完整队列
- Prevention:
  - 后续凡是面向大歌单的“播放全部 / 收藏全部 / 批量操作”，都优先以 `trackIds` 作为真实数据源，再把明细请求设计成批量补齐，而不是默认依赖第一页 `tracks`
