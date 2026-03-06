# Progress

## 2026-03-07

- Done:
  - 分析了 `YesPlayMusic` 旧项目的依赖、路由、状态和 API 边界
  - 明确本轮只做 Web，不考虑 Electron
  - 输出了依赖替换分析文档
  - 输出了 Web 重写开发计划
  - 建立了 `docs/` 协作机制并写入 `AGENTS.md`
  - 完成 Phase 0 基础设施第一批实现：请求层、浏览器存储工具、Dexie db 骨架、Zustand store 骨架
  - 新增 `.env.example` 与 `vite-env.d.ts` 基础声明
  - 完成应用壳与核心业务路由骨架：首页、搜索、歌单、专辑、艺人、Library、Settings、Login、MV
  - 修复 `PlayerDock` 的 `zustand` selector 无限更新问题
  - 完成 Phase 2 第一批只读接口迁移：推荐歌单、榜单、新专辑、歌手榜、歌单详情、专辑详情、艺人详情、搜索
  - 首页、歌单页、专辑页、艺人页、搜索页已接入第一批 loader
  - 新增 `vitest.config.ts`，补充播放器 store 与曲目可播放性测试并通过
  - 按仓库约定将新增测试移动到根目录 `test/`
  - 修复服务端 Netease API 环境变量读取逻辑，并补充 `.env.local` 中的 Netease API 变量
  - 修复首页歌手榜数据结构兼容问题，兼容 `data.list.artists` 与数组两种返回格式
  - 修复首页其余区块的数组兜底，避免接口返回结构异常时再触发 `.slice()` 报错
  - 修复搜索页在没有 search 参数时读取 `q` 报错的问题
  - 修复综合搜索返回结构兼容问题，支持 `result.song.songs` / `result.artist.artists` 等嵌套结果
  - 修复搜索路由未声明 `loaderDeps` 导致切换 `?q=` 后 loader 不重跑、页面始终显示空结果的问题
  - 为搜索页补齐关键词输入、综合/分类切换与分类分页，支持直接通过页面交互发起搜索
- In progress:
  - 排查本地后端 3002 端口的实际连通性
- Next:
  - 为首页和详情页增加 root 级错误展示，避免直接白屏
  - 确认 `NETEASE_API_URL` 指向的独立 API 服务可访问
  - 继续迁移 `track` 模块（歌曲详情、歌词、播放地址）
- Blockers:
  - 仓库当前缺少部分生成产物，导致全量 TypeScript 检查无法通过（如 `routeTree.gen`、Paraglide 运行时代码）
  - 当前环境内 `curl http://127.0.0.1:3002` 仍失败，需确认独立后端已实际启动且监听正确地址
