import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'

export const Route = createFileRoute('/next')({
  component: NextRoute,
})

function NextRoute() {
  return (
    <main className="py-10">
      <RoutePlaceholder
        eyebrow="Next Up"
        title="播放队列页入口已恢复"
        description="底部播放器的列表按钮现在可以进入这个原版路由。下一轮会继续把队列列表和当前播放项样式接回来。"
      />
    </main>
  )
}
