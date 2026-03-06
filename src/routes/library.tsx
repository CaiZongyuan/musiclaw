import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'

export const Route = createFileRoute('/library')({ component: LibraryRoute })

function LibraryRoute() {
  return (
    <RoutePlaceholder
      eyebrow="Library"
      title="用户音乐库"
      description="这里会显示用户歌单、喜欢的歌曲、专辑、艺人、MV 和播放历史。它依赖登录态，因此会在登录链路完成后逐步接通。"
    />
  )
}
