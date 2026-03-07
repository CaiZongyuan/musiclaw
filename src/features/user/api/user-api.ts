import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '#/lib/api/client'
import type {
  NeteaseAlbumSummary,
  NeteaseArtistSummary,
  NeteasePlaylistSummary,
  NeteaseTrack,
} from '#/features/music/api/types'

interface UserPlaylistsResponse {
  code: number
  playlist: NeteasePlaylistSummary[]
  more?: boolean
}

interface LikedAlbumsResponse {
  code: number
  data?: NeteaseAlbumSummary[]
  count?: number
  hasMore?: boolean
}

interface LikedArtistsResponse {
  code: number
  data?: NeteaseArtistSummary[]
  count?: number
  hasMore?: boolean
}

interface LikedSongIdsResponse {
  code: number
  ids?: number[]
  checkPoint?: number
}

export interface UserPlayHistoryItem {
  playCount: number
  score?: number
  song: NeteaseTrack
}

interface UserPlayHistoryResponse {
  code: number
  weekData?: UserPlayHistoryItem[]
  allData?: UserPlayHistoryItem[]
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

export async function fetchLikedAlbums(limit = 12) {
  const response = await apiClient.get<LikedAlbumsResponse>('/album/sublist', {
    params: {
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
    data: Array.isArray(response.data.data) ? response.data.data : [],
  }
}

export async function fetchLikedArtists(limit = 12) {
  const response = await apiClient.get<LikedArtistsResponse>('/artist/sublist', {
    params: {
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
    data: Array.isArray(response.data.data) ? response.data.data : [],
  }
}

export async function fetchUserPlayHistory(
  uid: string | number,
  type: 0 | 1 = 1,
) {
  const response = await apiClient.get<UserPlayHistoryResponse>('/user/record', {
    params: {
      uid: Number(uid),
      type,
      timestamp: Date.now(),
    },
    meta: {
      attachNeteaseCookie: true,
      attachRealIp: true,
    },
  })

  return {
    ...response.data,
    weekData: Array.isArray(response.data.weekData) ? response.data.weekData : [],
    allData: Array.isArray(response.data.allData) ? response.data.allData : [],
  }
}

export async function fetchLikedSongIds(uid: string | number) {
  const response = await apiClient.get<LikedSongIdsResponse>('/likelist', {
    params: {
      uid: Number(uid),
      timestamp: Date.now(),
    },
    meta: {
      attachNeteaseCookie: true,
      attachRealIp: true,
    },
  })

  return {
    ...response.data,
    ids: Array.isArray(response.data.ids) ? response.data.ids : [],
  }
}

export function userPlaylistsQueryOptions(uid: string | number, limit = 100) {
  return queryOptions({
    queryKey: ['user', Number(uid), 'playlists', limit],
    queryFn: () => fetchUserPlaylists(uid, limit),
  })
}

export function likedAlbumsQueryOptions(limit = 12) {
  return queryOptions({
    queryKey: ['user', 'liked-albums', limit],
    queryFn: () => fetchLikedAlbums(limit),
  })
}

export function likedArtistsQueryOptions(limit = 12) {
  return queryOptions({
    queryKey: ['user', 'liked-artists', limit],
    queryFn: () => fetchLikedArtists(limit),
  })
}

export function likedSongIdsQueryOptions(uid: string | number) {
  return queryOptions({
    queryKey: ['user', Number(uid), 'liked-song-ids'],
    queryFn: () => fetchLikedSongIds(uid),
  })
}

export function userPlayHistoryQueryOptions(
  uid: string | number,
  type: 0 | 1 = 1,
) {
  return queryOptions({
    queryKey: ['user', Number(uid), 'play-history', type],
    queryFn: () => fetchUserPlayHistory(uid, type),
  })
}
