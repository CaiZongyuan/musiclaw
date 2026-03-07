# Progress

## 2026-03-07（第七轮功能收口：首页 For You 真实业务）

- Done:
  - 首页 `For You` 已不再是双占位卡片，已新增真实 `Daily Tracks` 与 `Personal FM` 卡片
  - 新增 `src/features/home/api/for-you-api.ts`，接入 `/recommend/songs`、`/personal_fm`、`/fm_trash` 接口
  - `/daily/songs` 已从占位页升级为真实日推列表页，支持账号态加载、播放全部、单曲播放与“下一首”
  - 首页 `Daily Tracks` 卡片已支持：展示真实封面、进入日推页、直接播放当日日推
  - 首页 `Personal FM` 卡片已支持：展示当前 FM 歌曲、播放 / 暂停、下一首、不喜欢并刷新 FM
  - 已运行 `./node_modules/.bin/tsc --noEmit`，当前 TypeScript 校验通过
- In progress:
  - 等待真实浏览器手测，确认首页 `For You` 的账号态分支、FM 控制和日推页联动是否稳定
- Next:
  - 根据手测结果继续微调 `Daily Tracks` / `Personal FM` 卡片视觉细节
  - 继续推进 Navbar / Player / 首页剩余 parity 细节，尤其是按钮尺寸、字重和 hover 反馈
  - 评估是否继续补 FM 连续播放语义，还是转向下一块旧版缺口
- Blockers:
  - `For You` 两张卡都依赖账号态 cookie；如果当前是用户名只读模式或 cookie 失效，页面只能显示登录引导或空态
  - `bun run build` 仍被仓库既有问题阻塞：`src/routes/demo.i18n.tsx` 依赖的 `../logo.svg` 缺失，且 `wrangler` 在当前环境下无法写 `/root/.config/.wrangler/logs/*`

## 2026-03-07（第六轮功能收口：登录分流 / Library 扩展 / play-next 队列）

- Done:
  - 恢复旧版登录分流路径：`/login`、`/login/account`、`/login/username`
  - 修复 `/login` 父路由未渲染 `Outlet` 导致点击登录分流入口无反应的问题
  - 将原可用登录逻辑下沉到 `/login/account`，继续支持二维码、手机号、邮箱登录
  - 新增用户名只读登录模式：可搜索公开用户并写入 `profile` + `loginMode=username` 后进入 `/library`
  - `/library` 继续补齐旧版结构，新增收藏专辑、收藏艺人、最近播放预览，并对用户名模式显示账号登录提示
  - `/library/liked-songs` 的“播放全部”改为按 `trackIds` 分批补齐歌曲详情后构建完整播放队列，不再只依赖当前页
  - 播放器状态新增 `playNextQueue`，`/next` 现在支持“Now Playing / 插队播放 / Next Up”三段结构
  - 顶栏补回头像菜单交互，首页 `by Apple Music` 改回旧版静态卡片数据，播放器队列按钮增加插队数量提示
  - 已运行 `bunx vitest run`，当前 8 个测试文件共 31 个测试全部通过
  - 已运行 `./node_modules/.bin/tsc --noEmit`，当前 TypeScript 校验通过
- In progress:
  - 等待真实浏览器手测，确认登录分流、用户名模式、Library 扩展和 play-next 队列行为
- Next:
  - 根据手测结果继续微调 Navbar / Player / 首页视觉细节
  - 继续补旧版缺口，比如更完整的 `Library` 分区与更多播放器细节
- Blockers:
  - `bun run build` 仍被仓库既有问题阻塞：`src/routes/demo.i18n.tsx` 依赖的 `../logo.svg` 缺失，且 `wrangler` 在当前环境下无法写 `/root/.config/.wrangler/logs/*`

## 2026-03-07（第五轮修正：liked songs 分页）

- Done:
  - 修复 `/library/liked-songs` 只显示前 50 首的问题，改为真正的分页浏览
  - 当前页会优先使用歌单详情里已返回的曲目；如果当前分页缺少曲目详情，会按 `trackIds` 补拉对应歌曲详情
  - 增加上一页 / 下一页分页控件，并展示总歌曲数与当前页码
- In progress:
  - 继续把用户音乐库页面往旧版完整行为收口
- Next:
  - 根据你的验证结果，决定是继续补页码直达 / 每页条数，还是转向下一块功能
  - 继续完善登录分流页和更多用户库分区
- Blockers:
  - “播放全部”目前仍以当前已加载曲目为主，若后端对大歌单做分段返回，完整全量队列还需后续继续补
  - 仓库当前缺少部分生成产物，导致全量 TypeScript 检查无法通过（如 `routeTree.gen`、Paraglide 运行时代码）

## 2026-03-07（第四轮功能收口：可用登录页）

- Done:
  - 新增 `src/features/auth/api/auth-api.ts`，补上手机号登录、邮箱登录、二维码 key / 状态轮询、用户资料拉取与 cookie 解析
  - 将 `src/routes/login.tsx` 从说明页替换成可用登录页，支持二维码登录、手机号登录与邮箱登录
  - 登录成功后会把网易云 cookie、`MUSIC_U`、`__csrf` 与用户资料写入 `auth-store`，然后跳转到 `/library`
  - 已补“已登录”状态展示与“清空本地登录态”入口，避免重复登录时卡死
- In progress:
  - 继续把登录态相关页面从“能登录”推进到更接近旧版完整体验
- Next:
  - 验证登录成功后 `/library` 与 `/library/liked-songs` 的联动是否稳定
  - 继续补旧版登录分流页与更多用户态页面细节
  - 视测试结果决定是否补 `/login/account` 与 `/login/username` 路由来进一步贴近原版
- Blockers:
  - 当前登录链路依赖外部 Netease API 服务的登录接口可用；如果后端未启动或返回异常，前端只能提示错误
  - 仓库当前缺少部分生成产物，导致全量 TypeScript 检查无法通过（如 `routeTree.gen`、Paraglide 运行时代码）

## 2026-03-07（第三轮功能收口：Library 与 liked songs）

- Done:
  - 新增 `src/features/user/api/user-api.ts`，通过登录 cookie 拉取当前用户歌单列表
  - 将 `/library` 从占位页升级为可用的音乐库首页，优先展示用户信息、我喜欢的音乐入口和歌单列表
  - 新增 `/library/liked-songs` 路由，直接读取喜欢歌曲歌单详情并支持播放全部 / 单曲播放
  - `Library` 与 `liked songs` 在未登录时会显示明确的登录引导，而不是空白占位
- In progress:
  - 继续把用户相关页面从“基础可用”推进到更接近旧版的信息结构
- Next:
  - 继续补旧版缺失路由与登录态相关页面
  - 继续补 Library 的专辑、艺人、MV、播放历史等分区
  - 评估是否把喜欢歌曲页继续向旧版歌单详情页样式收口
- Blockers:
  - 当前 `Library` 主要依赖本地持久化登录 cookie；如果尚未完成网易云登录，页面会停留在登录引导状态
  - 仓库当前缺少部分生成产物，导致全量 TypeScript 检查无法通过（如 `routeTree.gen`、Paraglide 运行时代码）
