import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { fetchNewAlbums, getNewAlbums } from '#/features/album/api/album-api'
import {
  fetchTopArtists,
  getTopArtists,
} from '#/features/artist/api/artist-api'
import {
  fetchRecommendedPlaylists,
  fetchToplists,
  getRecommendedPlaylists,
  getToplists,
} from '#/features/playlist/api/playlist-api'

export interface HomePageData {
  recommendedPlaylists: Awaited<ReturnType<typeof getRecommendedPlaylists>>
  toplists: Awaited<ReturnType<typeof getToplists>>
  topArtists: Awaited<ReturnType<typeof getTopArtists>>
  newAlbums: Awaited<ReturnType<typeof getNewAlbums>>
}

export const getHomePageData = createServerFn({ method: 'GET' })
  .inputValidator((input: { limit?: number } | undefined) => ({
    limit: input?.limit ?? 12,
  }))
  .handler(async ({ data }) => {
    const [recommendedPlaylists, toplists, topArtists, newAlbums] =
      await Promise.all([
        fetchRecommendedPlaylists(data.limit),
        fetchToplists(),
        fetchTopArtists(),
        fetchNewAlbums({ limit: data.limit }),
      ])

    return {
      recommendedPlaylists,
      toplists,
      topArtists,
      newAlbums,
    } satisfies HomePageData
  })

export function homePageQueryOptions(limit = 12) {
  return queryOptions({
    queryKey: ['home', 'page', limit],
    queryFn: () => getHomePageData({ data: { limit } }),
  })
}
