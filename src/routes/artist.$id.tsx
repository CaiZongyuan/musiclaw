import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'

export const Route = createFileRoute('/artist/$id')({ component: ArtistRoute })

function ArtistRoute() {
  const { id } = Route.useParams()

  return (
    <RoutePlaceholder
      eyebrow="Artist"
      title={`艺人详情页 #${id}`}
      description="这里会放艺人资料、热门歌曲、专辑和 MV 入口。后续会按 YesPlayMusic 的信息结构把艺人页拆成多个区块。"
    />
  )
}
