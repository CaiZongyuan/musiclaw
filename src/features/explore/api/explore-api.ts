import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { fetchRecommendedPlaylists, fetchToplists } from '#/features/playlist/api/playlist-api'
import { requestNeteaseApi } from '#/lib/api/netease-server'
import type { NeteasePlaylistSummary } from '#/features/music/api/types'
import { EXPLORE_DEFAULT_CATEGORY, normalizeExploreCategory } from '#/features/explore/lib/explore-helpers'

const DEFAULT_EXPLORE_PAGE_SIZE = 20

interface ExploreTopPlaylistsResponse {
  code: number
  playlists: NeteasePlaylistSummary[]
  more?: boolean
}

interface ExploreCategoryPage {
  category: string
  playlists: NeteasePlaylistSummary[]
  hasMore: boolean
}

async function fetchTopPlaylists(options: {
  category: string
  limit?: number
  offset?: number
}) {
  return requestNeteaseApi<ExploreTopPlaylistsResponse>({
    url: '/top/playlist',
    method: 'GET',
    params: {
      cat: options.category,
      limit: options.limit ?? DEFAULT_EXPLORE_PAGE_SIZE,
      offset: options.offset ?? 0,
    },
  })
}

async function fetchHighQualityPlaylists(options: {
  category: string
  limit?: number
  before?: number
}) {
  return requestNeteaseApi<ExploreTopPlaylistsResponse>({
    url: '/top/playlist/highquality',
    method: 'GET',
    params: {
      cat:
        options.category === EXPLORE_DEFAULT_CATEGORY ? EXPLORE_DEFAULT_CATEGORY : options.category,
      limit: options.limit ?? DEFAULT_EXPLORE_PAGE_SIZE,
      before: options.before,
    },
  })
}

export async function fetchExploreCategoryPage(options?: {
  category?: string
  limit?: number
  offset?: number
  before?: number
}) {
  const category = normalizeExploreCategory(options?.category)
  const limit = options?.limit ?? DEFAULT_EXPLORE_PAGE_SIZE

  if (category === '推荐歌单') {
    const response = await fetchRecommendedPlaylists(limit)

    return {
      category,
      playlists: response.result ?? [],
      hasMore: false,
    } satisfies ExploreCategoryPage
  }

  if (category === '排行榜') {
    const response = await fetchToplists()

    return {
      category,
      playlists: response.list ?? [],
      hasMore: false,
    } satisfies ExploreCategoryPage
  }

  if (category === '精品歌单') {
    const response = await fetchHighQualityPlaylists({
      category,
      limit,
      before: options?.before,
    })

    return {
      category,
      playlists: response.playlists ?? [],
      hasMore: response.more ?? false,
    } satisfies ExploreCategoryPage
  }

  const response = await fetchTopPlaylists({
    category,
    limit,
    offset: options?.offset ?? 0,
  })

  return {
    category,
    playlists: response.playlists ?? [],
    hasMore: response.more ?? false,
  } satisfies ExploreCategoryPage
}

export const getExploreCategoryPage = createServerFn({ method: 'GET' })
  .inputValidator(
    (
      input:
        | {
            category?: string
            limit?: number
            offset?: number
            before?: number
          }
        | undefined,
    ) => ({
      category: normalizeExploreCategory(input?.category),
      limit: input?.limit ?? DEFAULT_EXPLORE_PAGE_SIZE,
      offset: input?.offset ?? 0,
      before: input?.before,
    }),
  )
  .handler(async ({ data }) => fetchExploreCategoryPage(data))

export function exploreCategoryQueryOptions(category = EXPLORE_DEFAULT_CATEGORY) {
  return queryOptions({
    queryKey: ['explore', 'category', category],
    queryFn: () => getExploreCategoryPage({ data: { category } }),
  })
}

export { DEFAULT_EXPLORE_PAGE_SIZE }
