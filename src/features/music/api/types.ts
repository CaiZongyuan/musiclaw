export interface NeteaseImageOwner {
  id: number
  name: string
  nickname?: string
}

export interface NeteaseArtistSummary {
  id: number
  name: string
  alias?: string[]
  picUrl?: string
  img1v1Url?: string
  cover?: string
  musicSize?: number
  albumSize?: number
  mvSize?: number
}

export interface NeteaseAlbumSummary {
  id: number
  name: string
  picUrl?: string
  blurPicUrl?: string
  artist?: NeteaseImageOwner
  artists?: NeteaseImageOwner[]
  publishTime?: number
  company?: string
  description?: string
  type?: string
  size?: number
  alias?: string[]
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
  tns?: string[]
  ar?: NeteaseTrackArtist[]
  artists?: NeteaseTrackArtist[]
  al?: NeteaseTrackAlbum
  album?: NeteaseTrackAlbum
  dt?: number
  cd?: string | number
  no?: number
  fee?: number
  privilege?: NeteaseTrackPrivilege
  noCopyrightRcmd?: Record<string, {}> | null
  playable?: boolean
  reason?: string
}

export interface NeteaseMvSummary {
  id: number
  name: string
  cover?: string
  coverUrl?: string
  imgurl?: string
  artistId?: number
  artistName?: string
  playCount?: number
  duration?: number
  publishTime?: string
}

export interface NeteasePlaylistSummary {
  id: number
  name: string
  coverImgUrl?: string
  picUrl?: string
  playCount?: number
  trackCount?: number
  copywriter?: string
  description?: string
  updateFrequency?: string
  updateTime?: number
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

export interface NeteaseTrackDetailResponse {
  code: number
  songs: NeteaseTrack[]
  privileges?: NeteaseTrackPrivilege[]
}

export interface NeteaseTrackSourceItem {
  id: number
  url?: string | null
  br?: number
  size?: number
  type?: string
  level?: string
  time?: number
  fee?: number
  freeTrialInfo?: Record<string, {}> | null
}

export interface NeteaseTrackSourceResponse {
  code: number
  data: NeteaseTrackSourceItem[]
}

export interface NeteaseLyricBlock {
  lyric?: string
}

export interface NeteaseLyricResponse {
  code: number
  lrc?: NeteaseLyricBlock
  tlyric?: NeteaseLyricBlock
  romalrc?: NeteaseLyricBlock
  lyricUser?: Record<string, {}>
  transUser?: Record<string, {}>
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
