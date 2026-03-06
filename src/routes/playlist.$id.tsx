import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'

export const Route = createFileRoute('/playlist/$id')({
  component: PlaylistRoute,
})

function PlaylistRoute() {
  const { id } = Route.useParams()

  return (
    <RoutePlaceholder
      eyebrow="Playlist"
      title={`歌单详情页 #${id}`}
      description="这里将承接旧项目的歌单详情、歌曲列表、播放全部、收藏状态和评论入口。当前先保留路由与页面骨架，下一步接入 loader 与真实 API。"
    />
  )
}
