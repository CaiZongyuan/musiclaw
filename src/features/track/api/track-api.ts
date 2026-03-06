import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { requestNeteaseApi } from '#/lib/api/netease-server'
import { mapTrackPlayableStatus } from '#/lib/music/playability'
import { normalizeTrackLyricsResponse } from '#/features/track/lib/lyrics'
import type {
  NeteaseLyricResponse,
  NeteaseTrackDetailResponse,
  NeteaseTrackSourceItem,
  NeteaseTrackSourceResponse,
} from '#/features/music/api/types'

const DEFAULT_TRACK_SOURCE_BITRATE = 320000

export async function fetchTrackDetail(ids: string | number) {
  const response = await requestNeteaseApi<NeteaseTrackDetailResponse>({
    url: '/song/detail',
    method: 'GET',
    params: {
      ids,
    },
  })

  return {
    ...response,
    songs: mapTrackPlayableStatus(response.songs, response.privileges ?? []),
  }
}

export async function fetchTrackLyrics(id: string | number) {
  const response = await requestNeteaseApi<NeteaseLyricResponse>({
    url: '/lyric',
    method: 'GET',
    params: {
      id: Number(id),
    },
  })

  return {
    ...response,
    parsed: normalizeTrackLyricsResponse(response),
  }
}

export async function fetchTrackSource(
  id: string | number,
  bitrate = DEFAULT_TRACK_SOURCE_BITRATE,
) {
  const response = await requestNeteaseApi<NeteaseTrackSourceResponse>({
    url: '/song/url',
    method: 'GET',
    params: {
      id: Number(id),
      br: bitrate,
      timestamp: Date.now(),
    },
  })

  return response.data[0] ?? ({ id: Number(id), url: null } as NeteaseTrackSourceItem)
}

export const getTrackDetail = createServerFn({ method: 'GET' })
  .inputValidator((input: { ids: string | number }) => ({
    ids: input.ids,
  }))
  .handler(async ({ data }) => fetchTrackDetail(data.ids))

export const getTrackLyrics = createServerFn({ method: 'GET' })
  .inputValidator((input: { id: string | number }) => ({
    id: Number(input.id),
  }))
  .handler(async ({ data }) => fetchTrackLyrics(data.id))

export const getTrackSource = createServerFn({ method: 'GET' })
  .inputValidator((input: { id: string | number; bitrate?: number }) => ({
    id: Number(input.id),
    bitrate: input.bitrate ?? DEFAULT_TRACK_SOURCE_BITRATE,
  }))
  .handler(async ({ data }) => fetchTrackSource(data.id, data.bitrate))

export function trackDetailQueryOptions(ids: string | number) {
  return queryOptions({
    queryKey: ['track', 'detail', String(ids)],
    queryFn: () => getTrackDetail({ data: { ids } }),
  })
}

export function trackLyricsQueryOptions(id: string | number) {
  return queryOptions({
    queryKey: ['track', 'lyrics', Number(id)],
    queryFn: () => getTrackLyrics({ data: { id } }),
  })
}

export function trackSourceQueryOptions(
  id: string | number,
  bitrate = DEFAULT_TRACK_SOURCE_BITRATE,
) {
  return queryOptions({
    queryKey: ['track', 'source', Number(id), bitrate],
    queryFn: () => getTrackSource({ data: { id, bitrate } }),
  })
}

export { DEFAULT_TRACK_SOURCE_BITRATE }
