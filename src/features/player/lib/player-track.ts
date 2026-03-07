import type { NeteaseTrack } from '#/features/music/api/types'
import type { PlayerTrack } from '#/features/player/stores/player-store'

export function getPlayerTrackArtists(track: NeteaseTrack) {
  return track.ar?.map((artist) => artist.name) ??
    track.artists?.map((artist) => artist.name) ??
    ['Unknown artist']
}

export function getPlayerTrackArtistIds(track: NeteaseTrack) {
  return track.ar?.map((artist) => artist.id) ??
    track.artists?.map((artist) => artist.id) ??
    []
}

export function mapNeteaseTrackToPlayerTrack(track: NeteaseTrack): PlayerTrack {
  return {
    id: track.id,
    name: track.name,
    artists: getPlayerTrackArtists(track),
    artistIds: getPlayerTrackArtistIds(track),
    albumId: track.al?.id ?? track.album?.id,
    albumName: track.al?.name ?? track.album?.name,
    coverUrl: track.al?.picUrl ?? track.album?.picUrl,
    durationMs: track.dt,
  }
}

export function buildPlayerQueueFromTracks(tracks: NeteaseTrack[]) {
  return tracks.map(mapNeteaseTrackToPlayerTrack)
}
