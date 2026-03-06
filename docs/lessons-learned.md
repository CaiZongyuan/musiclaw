# Lessons Learned

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
