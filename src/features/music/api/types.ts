export interface NeteaseImageOwner {
  id: number
  name: string
}

export interface NeteaseArtistSummary {
  id: number
  name: string
  alias?: string[]
  picUrl?: string
  img1v1Url?: string
  cover?: string
}

export interface NeteaseAlbumSummary {
  id: number
  name: string
  picUrl?: string
  blurPicUrl?: string
  artist?: NeteaseImageOwner
  artists?: NeteaseImageOwner[]
  publishTime?: number
}

export interface NeteaseTrackArtist {
  id: number
  name: string
}

export interface NeteaseTrackAlbum {
  id: number
  name: string
  picUrl?: string
}

export interface NeteaseTrackPrivilege {
  id: number
  pl?: number
  fee?: number
  cs?: boolean
  st?: number
}

export interface NeteaseTrack {
  id: number
  name: string
  alia?: string[]
  ar?: NeteaseTrackArtist[]
  artists?: NeteaseTrackArtist[]
  al?: NeteaseTrackAlbum
  album?: NeteaseTrackAlbum
  dt?: number
  fee?: number
  privilege?: NeteaseTrackPrivilege
  noCopyrightRcmd?: unknown
  playable?: boolean
  reason?: string
}

export interface NeteasePlaylistSummary {
  id: number
  name: string
  coverImgUrl?: string
  picUrl?: string
  playCount?: number
  trackCount?: number
  copywriter?: string
  creator?: NeteaseImageOwner
}

export interface NeteasePlaylistDetail extends NeteasePlaylistSummary {
  description?: string
  tags?: string[]
  tracks: NeteaseTrack[]
  trackIds?: Array<{ id: number }>
}

export interface NeteasePlaylistDetailResponse {
  code: number
  playlist: NeteasePlaylistDetail
  privileges?: NeteaseTrackPrivilege[]
}

export interface NeteaseAlbumDetailResponse {
  code: number
  album: NeteaseAlbumSummary & {
    description?: string
    artists?: NeteaseImageOwner[]
  }
  songs: NeteaseTrack[]
}

export interface NeteaseArtistDetailResponse {
  code: number
  artist: NeteaseArtistSummary & {
    musicSize?: number
    albumSize?: number
    mvSize?: number
    briefDesc?: string
  }
  hotSongs: NeteaseTrack[]
  more?: boolean
}

export interface NeteaseSearchResponse {
  code: number
  result: {
    songs?: NeteaseTrack[]
    albums?: NeteaseAlbumSummary[]
    artists?: NeteaseArtistSummary[]
    playlists?: NeteasePlaylistSummary[]
    songCount?: number
    albumCount?: number
    artistCount?: number
    playlistCount?: number
  }
}
