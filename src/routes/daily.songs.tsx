import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'

export const Route = createFileRoute('/daily/songs')({
  component: DailySongsRoute,
})

function DailySongsRoute() {
  return (
    <main className="py-10">
      <RoutePlaceholder
        eyebrow="Daily Songs"
        title="日推入口已恢复"
        description="首页 For You 区块现在可以跳到原版的日推路由。后续会继续接账号校验和每日推荐歌曲列表。"
      />
    </main>
  )
}
