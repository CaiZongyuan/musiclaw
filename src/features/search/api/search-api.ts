import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { mapTrackPlayableStatus } from '#/lib/music/playability'
import { requestNeteaseApi } from '#/lib/api/netease-server'
import type {
  NeteaseAlbumSummary,
  NeteaseArtistSummary,
  NeteasePlaylistSummary,
  NeteaseSearchResponse,
  NeteaseTrack,
} from '#/features/music/api/types'

interface SearchResultGroup<TItem> {
  songs?: TItem[]
  albums?: TItem[]
  artists?: TItem[]
  playlists?: TItem[]
  mvs?: TItem[]
  songCount?: number
  albumCount?: number
  artistCount?: number
  playlistCount?: number
  mvCount?: number
}

interface SearchResponseWithNestedGroups extends NeteaseSearchResponse {
  result: NeteaseSearchResponse['result'] & {
    song?: SearchResultGroup<NeteaseTrack>
    album?: SearchResultGroup<NeteaseAlbumSummary>
    artist?: SearchResultGroup<NeteaseArtistSummary>
    playlist?: SearchResultGroup<NeteasePlaylistSummary>
  }
}

export interface NormalizedSearchResponse extends SearchResponseWithNestedGroups {
  result: SearchResponseWithNestedGroups['result'] & {
    songs: NeteaseTrack[]
    albums: NeteaseAlbumSummary[]
    artists: NeteaseArtistSummary[]
    playlists: NeteasePlaylistSummary[]
  }
}

export function normalizeSearchResponse(
  response: SearchResponseWithNestedGroups,
): NormalizedSearchResponse {
  const songs = mapTrackPlayableStatus(
    response.result?.songs ?? response.result?.song?.songs,
  )
  const albums = response.result?.albums ?? response.result?.album?.albums ?? []
  const artists =
    response.result?.artists ?? response.result?.artist?.artists ?? []
  const playlists =
    response.result?.playlists ?? response.result?.playlist?.playlists ?? []

  return {
    ...response,
    result: {
      ...response.result,
      songs,
      albums,
      artists,
      playlists,
      songCount:
        response.result?.songCount ??
        response.result?.song?.songCount ??
        songs.length,
      albumCount:
        response.result?.albumCount ??
        response.result?.album?.albumCount ??
        albums.length,
      artistCount:
        response.result?.artistCount ??
        response.result?.artist?.artistCount ??
        artists.length,
      playlistCount:
        response.result?.playlistCount ??
        response.result?.playlist?.playlistCount ??
        playlists.length,
    },
  }
}

export const searchEverything = createServerFn({ method: 'GET' })
  .inputValidator(
    (input: {
      keywords: string
      type?: number
      limit?: number
      offset?: number
    }) => ({
      keywords: input.keywords.trim(),
      type: input.type ?? 1018,
      limit: input.limit ?? 20,
      offset: input.offset ?? 0,
    }),
  )
  .handler(async ({ data }) => {
    const response = await requestNeteaseApi<SearchResponseWithNestedGroups>({
      url: '/search',
      method: 'GET',
      params: data,
    })

    return normalizeSearchResponse(response)
  })

export function searchQueryOptions(params: {
  keywords: string
  type?: number
  limit?: number
  offset?: number
}) {
  return queryOptions({
    queryKey: ['search', params],
    queryFn: () => searchEverything({ data: params }),
    enabled: params.keywords.trim().length > 0,
  })
}
