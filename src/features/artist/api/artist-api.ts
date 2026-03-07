import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { requestNeteaseApi } from '#/lib/api/netease-server'
import { mapTrackPlayableStatus } from '#/lib/music/playability'
import type {
  NeteaseAlbumSummary,
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

interface ArtistAlbumsResponse {
  code: number
  hotAlbums: NeteaseAlbumSummary[]
  more?: boolean
}

interface SimilarArtistsResponse {
  code: number
  artists?: NeteaseArtistSummary[]
}

export interface NormalizedTopArtistsResponse extends TopArtistsResponse {
  artists: NeteaseArtistSummary[]
}

export interface NormalizedArtistAlbumsResponse extends ArtistAlbumsResponse {
  hotAlbums: NeteaseAlbumSummary[]
}

export interface NormalizedSimilarArtistsResponse extends SimilarArtistsResponse {
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

export function normalizeArtistAlbumsResponse(
  response: ArtistAlbumsResponse,
): NormalizedArtistAlbumsResponse {
  return {
    ...response,
    hotAlbums: Array.isArray(response.hotAlbums) ? response.hotAlbums : [],
  }
}

export function normalizeSimilarArtistsResponse(
  response: SimilarArtistsResponse,
): NormalizedSimilarArtistsResponse {
  return {
    ...response,
    artists: Array.isArray(response.artists) ? response.artists : [],
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

export async function fetchArtistAlbums(
  id: string | number,
  limit = 24,
  offset = 0,
) {
  const response = await requestNeteaseApi<ArtistAlbumsResponse>({
    url: '/artist/album',
    method: 'GET',
    params: {
      id: Number(id),
      limit,
      offset,
    },
  })

  return normalizeArtistAlbumsResponse(response)
}

export async function fetchSimilarArtists(id: string | number) {
  const response = await requestNeteaseApi<SimilarArtistsResponse>({
    url: '/simi/artist',
    method: 'GET',
    params: {
      id: Number(id),
      timestamp: Date.now(),
    },
  })

  return normalizeSimilarArtistsResponse(response)
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

export const getArtistAlbums = createServerFn({ method: 'GET' })
  .inputValidator(
    (input: { id: string | number; limit?: number; offset?: number }) => ({
      id: Number(input.id),
      limit: input.limit ?? 24,
      offset: input.offset ?? 0,
    }),
  )
  .handler(async ({ data }) => fetchArtistAlbums(data.id, data.limit, data.offset))

export const getSimilarArtists = createServerFn({ method: 'GET' })
  .inputValidator((input: { id: string | number }) => ({
    id: Number(input.id),
  }))
  .handler(async ({ data }) => fetchSimilarArtists(data.id))

export function topArtistsQueryOptions() {
  return queryOptions({
    queryKey: ['home', 'top-artists'],
    queryFn: () => getTopArtists(),
  })
}

export function artistDetailQueryOptions(id: string | number) {
  return queryOptions({
    queryKey: ['artist', Number(id), 'detail'],
    queryFn: () => getArtistDetail({ data: { id } }),
  })
}

export function artistAlbumsQueryOptions(
  id: string | number,
  limit = 24,
  offset = 0,
) {
  return queryOptions({
    queryKey: ['artist', Number(id), 'albums', limit, offset],
    queryFn: () => getArtistAlbums({ data: { id, limit, offset } }),
  })
}

export function similarArtistsQueryOptions(id: string | number) {
  return queryOptions({
    queryKey: ['artist', Number(id), 'similar'],
    queryFn: () => getSimilarArtists({ data: { id } }),
  })
}
