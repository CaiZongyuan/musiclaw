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
