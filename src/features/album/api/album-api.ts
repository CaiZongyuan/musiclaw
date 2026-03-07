import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { mapTrackPlayableStatus } from '#/lib/music/playability'
import { requestNeteaseApi } from '#/lib/api/netease-server'
import type {
  NeteaseAlbumDetailResponse,
  NeteaseAlbumSummary,
} from '#/features/music/api/types'

interface NewAlbumsResponse {
  code: number
  albums: NeteaseAlbumSummary[]
}

export async function fetchNewAlbums(options?: {
  limit?: number
  offset?: number
  area?: string
}) {
  return requestNeteaseApi<NewAlbumsResponse>({
    url: '/album/new',
    method: 'GET',
    params: {
      limit: options?.limit ?? 12,
      offset: options?.offset ?? 0,
      area: options?.area ?? 'ALL',
    },
  })
}

export async function fetchAlbumDetail(id: string | number) {
  const response = await requestNeteaseApi<NeteaseAlbumDetailResponse>({
    url: '/album',
    method: 'GET',
    params: {
      id: Number(id),
    },
  })

  return {
    ...response,
    songs: mapTrackPlayableStatus(response.songs),
  }
}

export const getNewAlbums = createServerFn({ method: 'GET' })
  .inputValidator(
    (
      input: { limit?: number; offset?: number; area?: string } | undefined,
    ) => ({
      limit: input?.limit ?? 12,
      offset: input?.offset ?? 0,
      area: input?.area ?? 'ALL',
    }),
  )
  .handler(async ({ data }) => fetchNewAlbums(data))

export const getAlbumDetail = createServerFn({ method: 'GET' })
  .inputValidator((input: { id: string | number }) => ({
    id: Number(input.id),
  }))
  .handler(async ({ data }) => fetchAlbumDetail(data.id))

export function newAlbumsPageQueryOptions(options?: {
  limit?: number
  offset?: number
  area?: string
}) {
  const limit = options?.limit ?? 12
  const offset = options?.offset ?? 0
  const area = options?.area ?? 'ALL'

  return queryOptions({
    queryKey: ['album', 'new', limit, offset, area],
    queryFn: () => getNewAlbums({ data: { limit, offset, area } }),
  })
}

export function newAlbumsQueryOptions(limit = 12) {
  return newAlbumsPageQueryOptions({ limit })
}

export function albumDetailQueryOptions(id: string | number) {
  return queryOptions({
    queryKey: ['album', Number(id)],
    queryFn: () => getAlbumDetail({ data: { id } }),
  })
}
