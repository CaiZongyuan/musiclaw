# Developer Collaboration

本项目约定：`docs/` 是我与其他开发者共享上下文、同步计划、记录经验的主要渠道。

## 目标

通过 `docs/` 持续沉淀以下内容：

- 当前重写计划
- 当前进度与阻塞
- 架构决策与边界
- 需要其他开发者注意的约定
- 已踩过的坑与经验总结

## 文档约定

### 1. 计划文档

- 文件示例：`docs/yesplaymusic-web-rewrite-plan.md`
- 用途：记录阶段计划、里程碑、开发顺序、交付目标
- 更新时机：计划变化、阶段切换、范围调整

### 2. 分析文档

- 文件示例：`docs/yesplaymusic-web-rewrite-analysis.md`
- 用途：记录旧项目分析、依赖替换、迁移判断、技术选型原因
- 更新时机：做出新的架构判断或依赖判断时

### 3. 进度文档

- 统一文件：`docs/progress.md`
- 用途：记录当前做到了哪里、正在做什么、接下来做什么、有哪些阻塞
- 更新时机：完成一个阶段、做了关键实现、遇到明显阻塞时

建议记录格式：

```md
## YYYY-MM-DD

- Done:
- In progress:
- Next:
- Blockers:
```

### 4. 经验文档

- 统一文件：`docs/lessons-learned.md`
- 用途：沉淀踩坑、经验、约束、实现注意事项
- 更新时机：遇到可复用问题、修复了一类问题、发现重要实现边界时

建议记录格式：

```md
## 标题

- Context:
- Problem:
- Resolution:
- Prevention:
```

## 协作原则

- 改动前先看：`docs/yesplaymusic-web-rewrite-plan.md`
- 接手前先看：`docs/progress.md`
- 做技术决策前先看：`docs/yesplaymusic-web-rewrite-analysis.md`
- 遇到历史问题先看：`docs/lessons-learned.md`
- 如果实现改变了约定，必须同步更新对应文档

## 当前建议的协作节奏

1. 先在计划文档中确定阶段目标
2. 开发过程中把关键进展写入 `docs/progress.md`
3. 遇到坑后把结论写入 `docs/lessons-learned.md`
4. 若架构方向变化，同步更新分析文档与计划文档

## 当前重写项目的优先阅读顺序

1. `docs/yesplaymusic-web-rewrite-analysis.md`
2. `docs/yesplaymusic-web-rewrite-plan.md`
3. `docs/progress.md`
4. `docs/lessons-learned.md`
