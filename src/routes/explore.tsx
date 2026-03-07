import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'

export const Route = createFileRoute('/explore')({
  component: ExploreRoute,
})

function ExploreRoute() {
  return (
    <main className="py-10">
      <RoutePlaceholder
        eyebrow="Explore"
        title="原版 Explore 路由已经补回入口"
        description="这一页先恢复到旧版导航与首页的可达状态。下一轮会继续按 YesPlayMusic 原版的分类浏览页结构收口。"
      />
    </main>
  )
}
