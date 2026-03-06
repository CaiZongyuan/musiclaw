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
- In progress:
  - 准备进入只读 API 模块迁移
- Next:
  - 建 `album`、`artist`、`playlist`、`search` API 模块
  - 为首页和详情页接入第一批 loader
  - 把占位页面替换成真实数据结构
- Blockers:
  - 仓库当前缺少部分生成产物，导致全量 TypeScript 检查无法通过（如 `routeTree.gen`、Paraglide 运行时代码）
