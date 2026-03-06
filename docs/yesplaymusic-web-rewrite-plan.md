# YesPlayMusic Web 重写开发计划

目标：使用当前仓库的 **TanStack Start + React 19 + TanStack Router + TanStack Query + Tailwind v4** 重写 `/root/Projects/Frontend/YesPlayMusic` 的 **Web 端**。

范围：

- 仅做 Web
- 暂不考虑 Electron
- 第一阶段优先兼容旧功能，不追求一次性重构所有体验细节
- 数据请求层采用 `axios`

> 注：本计划基于你准备使用这些业务依赖：`zustand`、`dexie`、`howler`、`qrcode`、`dayjs`、`axios`

## 一、技术决策

### 1. 路由与页面数据

- 使用 `TanStack Router` 文件路由管理页面
- 优先使用 `loader` 拉取路由级数据
- 需要交互更新的数据使用 `TanStack Query`
- 需要服务端代理的接口使用 `server functions`

### 2. 请求层

- 保留 `axios` 作为统一 HTTP 客户端
- 在 `src/lib/api` 下建立统一请求实例
- 统一处理：
  - `baseURL`
  - 超时
  - cookie 透传
  - 登录失效处理
  - 错误格式归一化

### 3. 状态管理

- 使用 `zustand` 替代旧项目 `vuex`
- 按领域拆分 store：
  - `player-store`
  - `settings-store`
  - `auth-store`
  - `ui-store`

### 4. 播放与缓存

- 使用 `howler` 实现 Web 播放核心
- 使用 `dexie` 保存：
  - 歌词缓存
  - 专辑缓存
  - 音频缓存（如后续需要）
  - 播放器快照

### 5. 登录体系

- 第一阶段不接 `better-auth` 主流程
- 直接兼容 YesPlayMusic 的网易云 cookie / 二维码登录模式
- 将登录态视为业务状态，而不是站内账号体系

## 二、目录规划

建议新增或逐步形成如下结构：

```text
src/
  components/
    app/
    layout/
    player/
    music/
    ui/
  features/
    auth/
      api/
      components/
      hooks/
      stores/
      utils/
    player/
      api/
      components/
      hooks/
      stores/
      utils/
    library/
    search/
    playlist/
    album/
    artist/
    mv/
    lyrics/
    settings/
  lib/
    api/
    db/
    utils/
    constants/
  routes/
    __root.tsx
    index.tsx
    login.tsx
    playlist.$id.tsx
    album.$id.tsx
    artist.$id.tsx
    search.tsx
    library.tsx
    settings.tsx
    mv.$id.tsx
```

## 三、阶段计划

### Phase 0：基线准备

目标：把项目基础骨架和规范先定下来。

任务：

- 确认 Web 第一阶段 API 策略：
  - 优先接外部 Netease API 服务
  - 暂不把 `@neteaseapireborn/api` 内聚到仓库里
- 确认环境变量命名
- 建立新的功能目录结构
- 建立基础类型定义与实体模型
- 建立统一请求层与错误处理
- 建立 `zustand` store 骨架
- 建立 `dexie` 数据库骨架

交付物：

- `src/lib/api/client.ts`
- `src/lib/api/types.ts`
- `src/lib/db/index.ts`
- `src/features/*/stores/*.ts`
- `.env.example` 中新增 API 配置说明

完成标准：

- 项目可以正常启动
- 路由骨架存在
- 请求实例可用
- store 和 db 可正常初始化

### Phase 1：路由与页面骨架迁移

目标：先把主要页面路由搭起来，做到“能访问、能跳转、能展示占位内容”。

任务：

- 创建基础布局：侧边栏、顶栏、底部播放器栏
- 建立以下路由页面：
  - `/`
  - `/playlist/$id`
  - `/album/$id`
  - `/artist/$id`
  - `/search`
  - `/login`
  - `/library`
  - `/settings`
  - `/mv/$id`
- 补统一 loading / error / not-found 状态
- 建立页面级 SEO / title 更新策略

交付物：

- 页面文件路由骨架
- 统一布局组件
- 统一空态、错误态组件

完成标准：

- 所有核心页面可以访问
- 基本跳转链路可用
- 页面结构可承接真实数据

### Phase 2：API 层迁移

目标：把旧项目 `src/api/*.js` 的能力迁到新项目中。

任务：

- 对照旧项目 API 模块建立新模块：
  - `album`
  - `artist`
  - `auth`
  - `playlist`
  - `track`
  - `user`
  - `mv`
  - `search`
- 将旧的请求参数和返回格式做类型化
- 统一封装 cookie 注入、登录失效处理、错误处理
- 优先迁移只读接口

优先接口顺序：

1. 首页推荐 / 榜单 / 新专辑
2. 歌单详情
3. 专辑详情
4. 艺人详情
5. 搜索
6. 歌曲详情 / 歌词 / 播放地址
7. 登录与用户资料

交付物：

- `src/features/*/api/*.ts`
- 公共响应类型
- 可复用 query options / loader helpers

完成标准：

- 首页到详情页的数据链路打通
- 不再依赖旧 Vue API 封装

### Phase 3：播放器核心

目标：先打通“选歌 - 播放 - 切歌 - 进度 - 歌词”闭环。

任务：

- 建立 `player-store`
- 用 `howler` 封装播放器引擎
- 实现：
  - 播放/暂停
  - 上一首/下一首
  - 切换播放模式
  - 设置音量
  - 设置进度
  - 当前歌曲信息同步
- 迁移歌词获取与解析逻辑
- 迁移本地播放器快照持久化

交付物：

- `src/features/player/stores/player-store.ts`
- `src/features/player/utils/player-engine.ts`
- `src/features/player/components/*`

完成标准：

- 可以从详情页开始播放
- 底部播放器可控制播放状态
- 刷新后可恢复部分播放状态

### Phase 4：核心页面功能落地

目标：让最有价值的核心页面可实际使用。

任务：

- 首页：推荐内容、榜单、新专辑
- 歌单页：歌单信息、歌曲列表、播放全部
- 专辑页：专辑信息、歌曲列表
- 艺人页：艺人信息、热门歌曲、专辑、MV 入口
- 搜索页：综合搜索、分类搜索
- 歌词页：滚动歌词、当前句高亮

完成标准：

- 核心内容浏览功能可用
- 核心播放链路可用
- 页面间联动自然

### Phase 5：登录与用户能力

目标：补齐“登录后体验”。

任务：

- 实现登录页
- 接入二维码登录
- 接入 cookie 登录态恢复
- 拉取用户信息
- 拉取用户歌单
- 拉取喜欢的歌曲 / 专辑 / 艺人 / MV
- 实现登录失效自动处理

说明：

- 第一阶段只兼容 YesPlayMusic 原逻辑
- `better-auth` 先不介入主登录流程

完成标准：

- 用户可登录
- 用户资料和个人库可展示
- 登录失效后能自动退出或引导重登

### Phase 6：设置、缓存与体验优化

目标：补齐可用性和性能体验。

任务：

- 设置页迁移：
  - 主题
  - 音质
  - 歌词字号
  - 播放偏好
  - 缓存清理
- 接入 `dexie` 缓存：
  - 歌词
  - 专辑
  - 歌曲详情
- 优化图片、列表滚动、首屏加载
- 增加 toast、modal、上下文菜单
- 增加滚动位置恢复策略

完成标准：

- 设置项可持久化
- 常见页面二次访问体验更快
- 基础交互体验完整

### Phase 7：扩展功能

目标：在核心功能稳定后，再补增强能力。

可选任务：

- MV 页面接 `plyr`
- 封面主题色提取接 `node-vibrant`
- 动态色彩接 `color`
- PWA 支持
- 分享能力
- 更完整的播放队列管理
- 云盘与历史记录能力

## 四、推荐开发顺序

建议严格按这个顺序推进：

1. 基础请求层
2. 基础 store
3. 页面路由骨架
4. 首页和详情页只读数据
5. 播放器核心
6. 搜索
7. 登录
8. 用户库
9. 设置与缓存
10. MV 和视觉增强

## 五、拆分成具体迭代

### Iteration 1

- 搭请求层
- 搭 store
- 搭布局
- 搭首页/歌单/专辑/艺人路由骨架

### Iteration 2

- 打通首页接口
- 打通歌单详情
- 打通专辑详情
- 打通艺人详情

### Iteration 3

- 实现播放器核心
- 打通歌曲播放地址
- 打通歌词

### Iteration 4

- 完成搜索
- 完成登录页
- 完成二维码登录

### Iteration 5

- 完成 library
- 完成 liked 内容
- 完成 settings
- 接入缓存

### Iteration 6

- MV
- 动态主题色
- 性能优化
- 交互细节收尾

## 六、当前建议的下一步

建议你下一步直接开始做这 5 件事：

1. 建 `src/lib/api/client.ts`
2. 建 `src/lib/db/index.ts`
3. 建 `src/features/player/stores/player-store.ts`
4. 建 `src/features/settings/stores/settings-store.ts`
5. 建首页、歌单、专辑、艺人 4 个基础路由

如果按执行效率来排，我建议接下来由我先帮你完成：

- 第 1 步：搭请求层 + store 骨架
- 第 2 步：搭首页/歌单/专辑/艺人路由骨架
- 第 3 步：开始迁移旧项目 API 模块
