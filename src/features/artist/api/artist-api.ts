import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { mapTrackPlayableStatus } from '#/lib/music/playability'
import { requestNeteaseApi } from '#/lib/api/netease-server'
import type {
  NeteaseArtistDetailResponse,
  NeteaseArtistSummary,
} from '#/features/music/api/types'

interface TopArtistsResponse {
  code: number
  list?:
    | NeteaseArtistSummary[]
    | {
        artists?: NeteaseArtistSummary[]
      }
  artists?: NeteaseArtistSummary[]
}

export interface NormalizedTopArtistsResponse extends TopArtistsResponse {
  artists: NeteaseArtistSummary[]
}

export function normalizeTopArtistsResponse(
  response: TopArtistsResponse,
): NormalizedTopArtistsResponse {
  const artists = Array.isArray(response.list)
    ? response.list
    : (response.list?.artists ?? response.artists ?? [])

  return {
    ...response,
    artists,
  }
}

export async function fetchTopArtists(type?: number) {
  const response = await requestNeteaseApi<TopArtistsResponse>({
    url: '/toplist/artist',
    method: 'GET',
    params: type ? { type } : undefined,
  })

  return normalizeTopArtistsResponse(response)
}

export async function fetchArtistDetail(id: string | number) {
  const response = await requestNeteaseApi<NeteaseArtistDetailResponse>({
    url: '/artists',
    method: 'GET',
    params: {
      id: Number(id),
      timestamp: Date.now(),
    },
  })

  return {
    ...response,
    hotSongs: mapTrackPlayableStatus(response.hotSongs),
  }
}

export const getTopArtists = createServerFn({ method: 'GET' })
  .inputValidator((input: { type?: number } | undefined) => ({
    type: input?.type,
  }))
  .handler(async ({ data }) => fetchTopArtists(data.type))

export const getArtistDetail = createServerFn({ method: 'GET' })
  .inputValidator((input: { id: string | number }) => ({
    id: Number(input.id),
  }))
  .handler(async ({ data }) => fetchArtistDetail(data.id))

export function topArtistsQueryOptions() {
  return queryOptions({
    queryKey: ['home', 'top-artists'],
    queryFn: () => getTopArtists(),
  })
}

export function artistDetailQueryOptions(id: string | number) {
  return queryOptions({
    queryKey: ['artist', Number(id)],
    queryFn: () => getArtistDetail({ data: { id } }),
  })
}
