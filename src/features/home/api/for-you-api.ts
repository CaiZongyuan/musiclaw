import { queryOptions } from '@tanstack/react-query'
import type { NeteaseTrack } from '#/features/music/api/types'
import { apiClient } from '#/lib/api/client'

interface NeteaseDailySongsResponse {
  code: number
  data?: {
    dailySongs?: NeteaseTrack[]
  }
}

interface NeteasePersonalFmResponse {
  code: number
  data?: NeteaseTrack[]
}

export async function fetchDailySongs() {
  const response = await apiClient.get<NeteaseDailySongsResponse>('/recommend/songs', {
    params: {
      timestamp: Date.now(),
    },
    meta: {
      attachNeteaseCookie: true,
      attachRealIp: true,
    },
  })

  return response.data.data?.dailySongs ?? []
}

export async function fetchPersonalFm() {
  const response = await apiClient.get<NeteasePersonalFmResponse>('/personal_fm', {
    params: {
      timestamp: Date.now(),
    },
    meta: {
      attachNeteaseCookie: true,
      attachRealIp: true,
    },
  })

  return response.data.data ?? []
}

export async function trashPersonalFm(trackId: number) {
  await apiClient.post(
    '/fm_trash',
    null,
    {
      params: {
        id: trackId,
        timestamp: Date.now(),
      },
      meta: {
        attachNeteaseCookie: true,
        attachRealIp: true,
      },
    },
  )
}

export function dailySongsQueryOptions() {
  return queryOptions({
    queryKey: ['home', 'daily-songs'],
    queryFn: fetchDailySongs,
  })
}

export function personalFmQueryOptions() {
  return queryOptions({
    queryKey: ['home', 'personal-fm'],
    queryFn: fetchPersonalFm,
  })
}
