import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'

export const Route = createFileRoute('/new-album')({
  component: NewAlbumRoute,
})

function NewAlbumRoute() {
  return (
    <main className="py-10">
      <RoutePlaceholder
        eyebrow="New Album"
        title="原版新专辑入口已恢复"
        description="当前先保证首页“新专辑”区块的跳转路径与原版一致，后续会继续补齐页面内容和列表密度。"
      />
    </main>
  )
}
