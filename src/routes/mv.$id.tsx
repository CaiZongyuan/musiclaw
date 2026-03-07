import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'

export const Route = createFileRoute('/mv/$id')({ component: MvRoute })

function MvRoute() {
  const { id } = Route.useParams()

  return (
    <RoutePlaceholder
      eyebrow="MV"
      title={`MV 播放页 #${id}`}
      description="暂未提供 MV 播放，请稍后再试。"
    />
  )
}
