import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'

export const Route = createFileRoute('/mv/$id')({ component: MvRoute })

function MvRoute() {
  const { id } = Route.useParams()

  return (
    <RoutePlaceholder
      eyebrow="MV"
      title={`MV 播放页 #${id}`}
      description="MV 会在后续阶段再接入，届时再决定是否引入 plyr。当前先把 Web 路由骨架和迁移目标占住。"
    />
  )
}
