import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'

export const Route = createFileRoute('/album/$id')({ component: AlbumRoute })

function AlbumRoute() {
  const { id } = Route.useParams()

  return (
    <RoutePlaceholder
      eyebrow="Album"
      title={`专辑详情页 #${id}`}
      description="这里会承接专辑信息、曲目列表、封面主视觉和播放入口。后续会先用 route loader 拉取只读数据，再接播放器联动。"
    />
  )
}
