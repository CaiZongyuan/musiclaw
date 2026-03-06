import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'

export const Route = createFileRoute('/search')({ component: SearchRoute })

function SearchRoute() {
  return (
    <RoutePlaceholder
      eyebrow="Search"
      title="搜索页骨架"
      description="这里会承接综合搜索、分类搜索、热门推荐和最近搜索。下一步会补查询参数、搜索输入框和搜索结果列表。"
    />
  )
}
