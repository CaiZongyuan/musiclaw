import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '#/lib/api/client'
import type { NeteasePlaylistSummary } from '#/features/music/api/types'

interface UserPlaylistsResponse {
  code: number
  playlist: NeteasePlaylistSummary[]
  more?: boolean
}

export async function fetchUserPlaylists(uid: string | number, limit = 100) {
  const response = await apiClient.get<UserPlaylistsResponse>('/user/playlist', {
    params: {
      uid: Number(uid),
      limit,
      timestamp: Date.now(),
    },
    meta: {
      attachNeteaseCookie: true,
      attachRealIp: true,
    },
  })

  return {
    ...response.data,
    playlist: Array.isArray(response.data.playlist) ? response.data.playlist : [],
  }
}

export function userPlaylistsQueryOptions(uid: string | number, limit = 100) {
  return queryOptions({
    queryKey: ['user', Number(uid), 'playlists', limit],
    queryFn: () => fetchUserPlaylists(uid, limit),
  })
}
