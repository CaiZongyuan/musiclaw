import { Link, createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'

export const Route = createFileRoute('/')({ component: HomeRoute })

function HomeRoute() {
  return (
    <div className="space-y-6">
      <RoutePlaceholder
        eyebrow="Home"
        title="YesPlayMusic Web 重写已经启动。"
        description="当前首页先作为迁移中控台：展示重写目标、优先页面和下一批待接入能力。接下来会逐步替换成推荐内容、榜单、新专辑和真实播放入口。"
        actions={
          <>
            <Link to="/search" className="app-chip">
              Search page
            </Link>
            <Link to="/library" className="app-chip">
              User library
            </Link>
          </>
        }
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            ['首页与详情页', '优先打通首页、歌单、专辑、艺人详情的数据链路。'],
            ['播放器骨架', '已经接入 Zustand store，下一步接 howler 引擎。'],
            ['登录与用户库', '后续兼容网易云二维码登录和用户资料同步。'],
          ].map(([title, description]) => (
            <article key={title} className="island-shell rounded-3xl p-5">
              <h2 className="m-0 text-base font-semibold text-[var(--sea-ink)]">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--sea-ink-soft)]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </RoutePlaceholder>
    </div>
  )
}
