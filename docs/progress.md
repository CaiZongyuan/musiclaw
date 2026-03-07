# Progress

## 2026-03-07（第一轮 UI 收口：Navbar / Player / 首页）

- Done:
  - 对照旧版 `src/components/Navbar.vue`，把当前全局壳体从左侧栏改回顶部固定导航
  - 新增 `src/components/app/app-navbar.tsx`，恢复旧版主导航结构：返回/前进、`Home / Explore / Library`、右侧搜索框与头像入口
  - 对照旧版 `src/components/Player.vue`，重排 `src/components/app/player-dock.tsx` 为更接近原版的三段式底部播放器
  - 顶部细进度条、左侧封面信息、中间播放控制、右侧队列/循环/随机/音量/歌词入口已完成第一轮收口
  - 对照旧版 `src/views/home.vue`，把首页从两列仪表盘式布局改回纵向内容流
  - 首页区块顺序已按旧版重排为：`by Apple Music`、`推荐歌单`、`For You`、`推荐歌手`、`新专辑`、`排行榜`
  - 新增占位路由以恢复旧版入口闭环：`/explore`、`/new-album`、`/next`、`/daily/songs`
  - 新增 `docs/navbar-player-home-parity.md`，记录这三块的旧版基线、本轮已收口项和剩余差距
- In progress:
  - 继续把 Navbar / Player / 首页从“结构接近”推进到“视觉和交互更接近”
- Next:
  - 微调顶部导航的尺寸、字重、搜索框和头像交互，继续贴近旧版
  - 微调播放器按钮尺寸、状态样式和 `/next` 队列页内容
  - 把首页 `by Apple Music`、`For You` 的占位结构继续换成更接近旧版的真实内容
- Blockers:
  - 仓库当前缺少部分生成产物，导致全量 TypeScript 检查无法通过（如 `routeTree.gen`、Paraglide 运行时代码）
  - 首页 `by Apple Music`、`Daily Tracks`、`Personal FM` 仍未完全接回旧版真实数据链路

## 2026-03-07（方向校正）

- Done:
  - 对照 `/root/Projects/Frontend/YesPlayMusic/src/router/index.js` 重新梳理旧版 Web 路由基线
  - 对照旧版 `App.vue`、`Navbar.vue`、`Player.vue` 重新确认全局壳体与播放器是当前第一优先级
  - 识别当前项目的主线偏差：工程实现推进快于产品复刻校验
  - 重写 `docs/yesplaymusic-web-rewrite-plan.md`，将主线切换为“原版功能和 UI 1:1 复刻优先”
  - 更新 `docs/yesplaymusic-web-rewrite-analysis.md` 与 `docs/lessons-learned.md`，明确“旧仓库源码是唯一产品规范”
- In progress:
  - 按原版页面建立 parity 驱动的开发顺序，优先收口全局框架、首页、搜索、歌单和播放器
- Next:
  - 对照旧版 `Navbar` / `Player` / 首页，梳理当前实现与原版在布局和交互上的具体差异
  - 将当前已实现页面按 `1:1 已对齐`、`功能已到位但未对齐`、`未实现 / 未核对` 重新标记
  - 开始按旧版顺序补全缺失路由：`/next`、`/new-album`、`/explore`、`/daily/songs`、`/artist/:id/mv`、`/library/liked-songs` 等
- Blockers:
  - 仓库当前缺少部分生成产物，导致全量 TypeScript 检查无法通过（如 `routeTree.gen`、Paraglide 运行时代码）
  - 当前仍缺少旧版页面级的系统化截图 / 差异清单，需要在后续页面复刻中逐页补齐

## 2026-03-07（此前实现记录，需按 parity 重新验收）

- Done:
  - 分析了 `YesPlayMusic` 旧项目的依赖、路由、状态和 API 边界
  - 明确本轮只做 Web，不考虑 Electron
  - 输出了依赖替换分析文档
  - 建立了 `docs/` 协作机制并写入 `AGENTS.md`
  - 完成 Phase 0 基础设施：请求层、浏览器存储工具、Dexie db 骨架、Zustand store 骨架
  - 新增 `.env.example` 与 `vite-env.d.ts` 基础声明
  - 完成应用壳与核心业务路由骨架：首页、搜索、歌单、专辑、艺人、Library、Settings、Login、MV
  - 修复 `PlayerDock` 的 `zustand` selector 无限更新问题
  - 完成 Phase 2 只读接口迁移：推荐歌单、榜单、新专辑、歌手榜、歌单详情、专辑详情、艺人详情、搜索
  - 首页、歌单页、专辑页、艺人页、搜索页已接入 loader
  - 新增 `vitest.config.ts`，补充播放器 store 与曲目可播放性测试并通过
  - 按仓库约定将新增测试移动到根目录 `test/`
  - 修复服务端 Netease API 环境变量读取逻辑，并补充 `.env.local` 中的 Netease API 变量
  - 修复首页歌手榜数据结构兼容问题，兼容 `data.list.artists` 与数组两种返回格式
  - 修复首页其余区块的数组兜底，避免接口返回结构异常时再触发 `.slice()` 报错
  - 修复搜索页在没有 search 参数时读取 `q` 报错的问题
  - 修复综合搜索返回结构兼容问题，支持 `result.song.songs` / `result.artist.artists` 等嵌套结果
  - 修复搜索路由未声明 `loaderDeps` 导致切换 `?q=` 后 loader 不重跑、页面始终显示空结果的问题
  - 为搜索页补齐关键词输入、综合/分类切换与分类分页，支持直接通过页面交互发起搜索
  - 启动 `track` 模块迁移：新增歌曲详情/歌词/播放地址 API，详情页与搜索页已可把歌曲加入底部播放器
  - 后端连通性问题已解决
  - 完成播放器核心第一批实现：队列、播放/暂停、切歌、循环、乱序、持久化、歌词解析、播放按钮与队列构建工具
  - 完成播放器核心第二批实现：`howler` 真实音频播放、播放/暂停、切歌、音量同步和进度展示
  - 完成播放器控制层第一批交互：进度拖动、循环模式切换、随机播放切换、音量调节百分比展示、歌词预览滚动
  - 修复 `player-store` 在切歌 / seek 时的时长与进度边界处理
  - 完成首页、搜索页、歌单页、专辑页、艺人页及根路由的共享错误态接入
  - 完成歌词体验第一批实现：展开歌词面板、当前句高亮、翻译歌词展示
  - 在 `track/lib/lyrics.ts` 中抽出当前歌词定位与预览 helper，并补充歌词单测
  - 完成艺人页新功能第一批实现：接入 `artist/album`，支持展示最新专辑卡片与真实专辑列表
- In progress:
  - 上述实现仍需全部回到“与原版对齐”的标准下重新验收
- Next:
  - 停止继续把“新功能完成数”当成主线指标，改为按原版页面做差异清单和收口
- Blockers:
  - 目前还没有逐页 parity 标记，因此这些完成项不能直接视为复刻完成
