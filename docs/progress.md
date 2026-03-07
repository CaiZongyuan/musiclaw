# Progress

## 2026-03-07（第十四轮功能收口：Library / Playlist / Album / Artist 页面骨架回迁）

- Done:
  - `src/routes/library.tsx` 已从“多个纵向卡片区块”收回到更接近旧版的结构：上方保留 liked songs 入口与预览，下方恢复 `歌单 / 专辑 / 艺人 / 最近播放` tabs 视图
  - `src/routes/playlist.$id.tsx` 不再使用通用 `RoutePlaceholder` 作为主体骨架，已改为更接近旧版的 `封面 + 信息区 + 曲目列表` 布局
  - `src/routes/album.$id.tsx` 已改为更接近旧版的专辑头部信息结构，补回 `专辑信息 + 歌曲列表` 的主视觉关系
  - `src/routes/artist.$id.tsx` 已改为更接近旧版的艺人头部结构，并补上 `最新发布 / 热门歌曲 / 专辑` 的分区节奏
  - `src/styles.css` 已新增并收口这几类页面的共用 detail-page 样式，不再继续沿用明显的“统一占位页”视觉
  - 已运行 `./node_modules/.bin/tsc --noEmit`，当前 TypeScript 校验通过
- In progress:
  - 等待真实浏览器手测，确认 `Library / Playlist / Album / Artist` 的新骨架在桌面端与移动端都没有明显布局错位
  - 本轮继续等你确认歌曲列表封面与 `/library` liked songs 卡片封面是否已恢复可见
  - `album` 页歌曲行封面已补专辑封面兜底；`artist` 页热门歌曲已改为额外补一次 `song/detail`，用于拿回更完整的封面信息
  - 已继续收一轮 `Library / Playlist / Album / Artist` 的样式细节：缩小 Library 头像尺寸、让 liked songs 卡更接近旧版主色块节奏、收紧 tabs 形态，并将详情页标题/信息区字号与间距继续往原版靠拢
- Next:
  - 根据你的手测结果继续微调这些页面的字号、按钮、卡片密度与间距，让它们进一步贴近原版
  - 若这轮结构稳定，下一步继续把 `MV / Explore / New Album` 等仍带占位痕迹的页面继续收口
- Blockers:
  - 当前这些页面已先把“通用占位骨架”拆掉，但距离旧版仍有细节差距，例如 Library 的完整筛选项、Album 的更多附加信息、Artist 的 MV / 相似艺人等

## 2026-03-07（第十三轮修正：原版主题回迁 / VIP 播放权限修正）

- Done:
  - 已记录本地后端接口文档入口：`http://localhost:3002/docs/`（需本地 API 服务运行后可访问）
  - 已确认当前仓库整体 UI 偏离原版的根因之一是全局色板与字体体系被替换成了自定义海洋风，而不是沿用原版白底 / 深灰底 + 蓝色主色
  - `src/styles.css` 已开始回迁原版主题基调：全局主色、正文颜色、页面底色、导航/播放器半透明底色、字体体系和卡片背景都已向旧版收口
  - 已去掉首页封面卡片额外的底色盒子，减少“图片圆角但外层盒子颜色不一致”的偏差
  - 已确认当前播放器取流根因：`/song/url` 之前走服务端 `createServerFn`，拿不到浏览器本地持久化的网易云 cookie，导致 VIP 账号也会拿到试听 / 受限结果
  - `src/features/player/components/player-engine.tsx` 已改为客户端直接请求 `/song/url`，并通过 `attachNeteaseCookie` 带上本地账号 cookie
  - 已补充 `freeTrialInfo` 判断，避免播放器继续使用只能试听的音源
  - 搜索页、歌单页、专辑页、艺人页、每日推荐页现在都会按当前本地账号态重新计算 `playable / reason`，不再只信任服务端首屏判断
  - `/library/liked-songs` 也已补上同一套客户端二次可播性校正；当前页歌曲按钮和“播放全部”构建完整队列时，都会按当前本地账号态重新计算 `playable / reason`
  - 已运行 `./node_modules/.bin/tsc --noEmit`，当前 TypeScript 校验通过
  - 已运行 `bunx vitest run test/lib/playability.test.ts`，当前 1 个测试文件共 3 个测试全部通过
- In progress:
  - 等待真实浏览器复测，确认 VIP 账号在搜索、歌单、专辑、艺人、日推和 `/library/liked-songs` 页面都不再误标 `VIP Only`，且播放器不再只拿到试听片段
- Next:
  - 根据你的复测结果继续把全局页面视觉往原版收口，优先处理 `RoutePlaceholder` 风格和详情页信息区布局
  - 若仍有个别歌曲被限制，继续排查是否需要引入原版的更多音源兜底策略
- Blockers:
  - 当前还没有接入原版 Electron 里的 `UnblockNeteaseMusic` 兜底链路；如果网易云本身不给完整 URL，少数歌曲仍可能无法像旧版桌面端那样自动解锁

## 2026-03-07（第十二轮功能收口：Navbar / Player / 首页视觉 parity）

- Done:
  - 顶栏搜索框已补回更接近旧版的焦点态：聚焦后 placeholder 隐藏、输入与图标高亮、整体高亮底色更接近原版 `Navbar.vue`
  - 头像按钮已补回展开态样式，菜单打开时可保持和 hover 一致的激活反馈
  - 首页封面卡片的区块间距、标题字重、封面圆角、副文案尺寸继续向旧版 `CoverRow` 收口
  - 首页推荐歌手卡片已改为更接近旧版的圆形封面 + 居中文案布局
  - 底部播放器已继续微调到更接近旧版节奏：封面尺寸、控制按钮尺寸、文案层级、音量条宽度、歌词预览密度均已收口
  - `/next` 队列页卡片已继续压缩视觉密度，当前播放 / 插队 / 后续队列三段的卡片尺寸、圆角和按钮节奏更接近旧版
  - 已运行 `./node_modules/.bin/tsc --noEmit`，当前 TypeScript 校验通过
- In progress:
  - 等待真实浏览器手测，确认本轮视觉细节调整没有影响顶栏搜索、播放器按钮和队列页交互
- Next:
  - 根据手测结果继续微调 `Navbar / Player / 首页` 的 hover、active、字号和移动端密度
  - 若本轮视觉收口稳定，下一轮继续把播放器来源语义扩展到 `Explore` 和首页更多播放入口
- Blockers:
  - 当前仍未恢复更细粒度的搜索滚动位置恢复、Explore 分类来源恢复，以及歌词层最终视觉；本轮先专注在主壳体的视觉 parity

## 2026-03-07（第十一轮功能收口：搜索结果来源跳转）

- Done:
  - 播放器来源上下文已扩展到搜索页，支持从底部播放器跳回同一组搜索条件
  - `PlayerQueueSource` 已支持保存 `/search` 及其 `q / type / page` 搜索参数
  - 搜索页的单曲播放与“下一首”现在会把当前搜索条件写入播放器来源上下文
  - 已运行 `./node_modules/.bin/tsc --noEmit`，当前 TypeScript 校验通过
- In progress:
  - 等待真实浏览器手测，确认搜索结果播放后的来源展示与返回搜索页链路是否稳定
- Next:
  - 若手测通过，继续把同样的来源语义扩展到更多非固定详情页入口
- Blockers:
  - 当前仍未恢复更细粒度的搜索滚动位置与焦点态恢复；这一轮先收口“返回同一搜索条件”


## 2026-03-07（第十轮功能收口：播放器来源信息与来源跳转）

- Done:
  - 播放器 store 已新增 `queueSource`，用于记录当前播放队列来自哪一个页面或内容源
  - 播放器第三行文案现在可展示“专辑 · 来自某来源”，并支持从来源名跳回原页面
  - 已为这些来源接入队列来源信息：歌单页、专辑页、艺人页、每日推荐、我喜欢的音乐、私人 FM
  - `PlayTrackButton` 已支持透传来源信息，保证单曲播放与“播放全部”都能写入一致的来源上下文
  - 已运行 `./node_modules/.bin/tsc --noEmit`，当前 TypeScript 校验通过
  - 已运行 `bunx vitest run test/lib/player-track.test.ts test/stores/player-store.test.ts`，当前 2 个测试文件共 13 个测试全部通过
- In progress:
  - 等待真实浏览器手测，确认播放器来源展示与来源跳转链路是否稳定
- Next:
  - 根据手测结果继续补播放器剩余 parity 细节，例如来源文案节奏、按钮尺寸与更多旧版交互反馈
- Blockers:
  - 搜索结果等非固定详情页目前还没有恢复完整“回到同一搜索条件”的来源语义；这一轮先覆盖旧版最核心的内容详情来源


## 2026-03-07（第九轮功能收口：播放器专辑/歌手跳转）

- Done:
  - 底部播放器当前歌曲区域已补回旧版常用跳转：点击封面或专辑名可进入专辑页，点击歌手名可进入艺人页
  - `PlayerTrack` 已补充 `albumId` 与 `artistIds`，用于在播放态保留最基础的来源跳转信息
  - `src/features/player/lib/player-track.ts` 已在歌曲映射时写入专辑与艺人 id
  - 已运行 `./node_modules/.bin/tsc --noEmit`，当前 TypeScript 校验通过
  - 已运行 `bunx vitest run test/lib/player-track.test.ts test/stores/player-store.test.ts`，当前 2 个测试文件共 13 个测试全部通过
- In progress:
  - 等待真实浏览器手测，确认播放器跳转行为与当前播放信息展示是否稳定
- Next:
  - 根据手测结果继续补播放器剩余 parity 细节，例如来源信息、按钮尺寸与更多旧版文案节奏
- Blockers:
  - 当前播放器仍未恢复“列表来源跳转”这类更完整的旧版播放来源语义；目前只补了专辑与艺人跳转


## 2026-03-07（第八轮功能收口：播放器喜欢按钮）

- Done:
  - 底部播放器已补回当前歌曲“喜欢 / 取消喜欢”按钮，更接近旧版 `Player.vue` 的左侧信息区交互
  - 新增 `src/features/user/api/user-api.ts` 的 `likedSongIdsQueryOptions`，可拉取当前账号已喜欢歌曲 id 列表
  - 新增 `src/features/track/api/track-api.ts` 的 `toggleTrackLike`，接入 `/like` 接口
  - 新增 `src/features/track/components/track-like-button.tsx`，负责账号态判断、乐观更新和相关 query 失效
  - `src/components/app/player-dock.tsx` 已接入喜欢按钮，当前播放歌曲可直接收藏或取消收藏
  - 已运行 `./node_modules/.bin/tsc --noEmit`，当前 TypeScript 校验通过
- In progress:
  - 等待真实浏览器手测，确认播放器收藏动作、按钮高亮与 `Library / liked songs` 的后续联动是否稳定
- Next:
  - 根据手测结果决定是否把同一套喜欢按钮复用到歌词面板、歌曲列表等页面
  - 继续推进 Player / Navbar / 首页剩余 parity 细节
- Blockers:
  - 喜欢按钮依赖账号态 cookie；用户名只读模式下只能跳到 `/login/account`

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
