# Progress

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
