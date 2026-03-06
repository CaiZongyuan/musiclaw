import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'

export const Route = createFileRoute('/settings')({ component: SettingsRoute })

function SettingsRoute() {
  return (
    <RoutePlaceholder
      eyebrow="Settings"
      title="设置页骨架"
      description="这里将承接主题、音质、歌词字号、缓存大小、代理配置等设置。当前已具备 settings store 骨架，后续会把 UI 接上去。"
    />
  )
}
