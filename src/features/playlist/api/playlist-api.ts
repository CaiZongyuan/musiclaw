import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { mapTrackPlayableStatus } from '#/lib/music/playability'
import { requestNeteaseApi } from '#/lib/api/netease-server'
import type {
  NeteasePlaylistDetailResponse,
  NeteasePlaylistSummary,
} from '#/features/music/api/types'

interface RecommendPlaylistResponse {
  code: number
  result: NeteasePlaylistSummary[]
}

interface ToplistsResponse {
  code: number
  list: NeteasePlaylistSummary[]
}

export async function fetchRecommendedPlaylists(limit = 12) {
  return requestNeteaseApi<RecommendPlaylistResponse>({
    url: '/personalized',
    method: 'GET',
    params: {
      limit,
    },
  })
}

export async function fetchToplists() {
  return requestNeteaseApi<ToplistsResponse>({
    url: '/toplist',
    method: 'GET',
  })
}

export async function fetchPlaylistDetail(id: string | number) {
  const response = await requestNeteaseApi<NeteasePlaylistDetailResponse>({
    url: '/playlist/detail',
    method: 'GET',
    params: {
      id: Number(id),
    },
  })

  return {
    ...response,
    playlist: {
      ...response.playlist,
      tracks: mapTrackPlayableStatus(
        response.playlist?.tracks ?? [],
        response.privileges ?? [],
      ),
    },
  }
}

export const getRecommendedPlaylists = createServerFn({ method: 'GET' })
  .inputValidator((input: { limit?: number } | undefined) => ({
    limit: input?.limit ?? 12,
  }))
  .handler(async ({ data }) => fetchRecommendedPlaylists(data.limit))

export const getToplists = createServerFn({ method: 'GET' }).handler(async () =>
  fetchToplists(),
)

export const getPlaylistDetail = createServerFn({ method: 'GET' })
  .inputValidator((input: { id: string | number }) => ({
    id: Number(input.id),
  }))
  .handler(async ({ data }) => fetchPlaylistDetail(data.id))

export function recommendedPlaylistsQueryOptions(limit = 12) {
  return queryOptions({
    queryKey: ['home', 'recommended-playlists', limit],
    queryFn: () => getRecommendedPlaylists({ data: { limit } }),
  })
}

export function toplistsQueryOptions() {
  return queryOptions({
    queryKey: ['home', 'toplists'],
    queryFn: () => getToplists(),
  })
}

export function playlistDetailQueryOptions(id: string | number) {
  return queryOptions({
    queryKey: ['playlist', Number(id)],
    queryFn: () => getPlaylistDetail({ data: { id } }),
  })
}
