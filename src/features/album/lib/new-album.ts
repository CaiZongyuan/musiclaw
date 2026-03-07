import type { NeteaseAlbumSummary, NeteaseTrack } from '#/features/music/api/types'
import {
  filterPlayableTracks,
  mapNeteaseTrackToPlayerTrack,
} from '#/features/player/lib/player-track'
import type { PlayerTrack, PlayerQueueSource } from '#/features/player/stores/player-store'

export const NEW_ALBUM_PAGE_SIZE = 24
export const DEFAULT_NEW_ALBUM_AREA = 'EA'

export const NEW_ALBUM_AREA_OPTIONS = [
  { value: 'ALL', label: '全部' },
  { value: 'ZH', label: '华语' },
  { value: 'EA', label: '欧美' },
  { value: 'KR', label: '韩国' },
  { value: 'JP', label: '日本' },
] as const

export interface NewAlbumSearch {
  area: string
  page: number
}

function normalizePositiveInteger(value: unknown, fallback: number) {
  const normalized =
    typeof value === 'string'
      ? Number(value)
      : typeof value === 'number'
        ? value
        : Number.NaN

  if (!Number.isFinite(normalized) || normalized < 1) {
    return fallback
  }

  return Math.floor(normalized)
}

export function normalizeNewAlbumArea(value: unknown) {
  const normalized = typeof value === 'string' ? value.toUpperCase() : ''

  return NEW_ALBUM_AREA_OPTIONS.some((option) => option.value === normalized)
    ? normalized
    : DEFAULT_NEW_ALBUM_AREA
}

export function normalizeNewAlbumSearch(
  search: Partial<NewAlbumSearch> | undefined,
): NewAlbumSearch {
  return {
    area: normalizeNewAlbumArea(search?.area),
    page: normalizePositiveInteger(search?.page, 1),
  }
}

export function getNewAlbumLoaderDeps(search: Partial<NewAlbumSearch> | undefined) {
  return normalizeNewAlbumSearch(search)
}

export function getNewAlbumArtists(album: NeteaseAlbumSummary) {
  return (
    album.artist?.name ??
    album.artists?.map((artist) => artist.name).join(' / ') ??
    'Unknown artist'
  )
}

export function formatNewAlbumYear(timestamp?: number) {
  if (!timestamp) {
    return '年份待补充'
  }

  return String(new Date(timestamp).getFullYear())
}

export function hydrateNewAlbumTracks(
  tracks: NeteaseTrack[],
  album: Pick<NeteaseAlbumSummary, 'id' | 'name' | 'picUrl' | 'blurPicUrl'>,
) {
  const coverUrl = album.picUrl ?? album.blurPicUrl

  return tracks.map((track) => ({
    ...track,
    al: {
      id: track.al?.id ?? album.id,
      name: track.al?.name ?? album.name,
      picUrl: track.al?.picUrl ?? coverUrl,
    },
    album: {
      id: track.album?.id ?? track.al?.id ?? album.id,
      name: track.album?.name ?? track.al?.name ?? album.name,
      picUrl: track.album?.picUrl ?? track.al?.picUrl ?? coverUrl,
    },
  }))
}

export function buildNewAlbumPlaybackQueue(
  tracks: NeteaseTrack[],
  album: Pick<NeteaseAlbumSummary, 'id' | 'name' | 'picUrl' | 'blurPicUrl'>,
): PlayerTrack[] {
  const coverUrl = album.picUrl ?? album.blurPicUrl

  return filterPlayableTracks(hydrateNewAlbumTracks(tracks, album)).map((track) => ({
    ...mapNeteaseTrackToPlayerTrack(track),
    albumId: track.al?.id ?? track.album?.id ?? album.id,
    albumName: track.al?.name ?? track.album?.name ?? album.name,
    coverUrl: coverUrl ?? track.al?.picUrl ?? track.album?.picUrl,
  }))
}

export function buildNewAlbumQueueSource(area: string): PlayerQueueSource {
  const areaLabel =
    NEW_ALBUM_AREA_OPTIONS.find((option) => option.value === area)?.label ?? '新专辑'

  return {
    label: `${areaLabel}新专辑`,
    to: '/new-album',
    newAlbumArea: normalizeNewAlbumArea(area),
  }
}
