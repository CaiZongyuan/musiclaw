import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '#/features/auth/stores/auth-store'
import type { NeteaseTrack } from '#/features/music/api/types'
import PlayTrackButton from '#/features/player/components/play-track-button'
import { buildPlayerQueueFromTracks } from '#/features/player/lib/player-track'
import { usePlayerStore } from '#/features/player/stores/player-store'
import { playlistDetailQueryOptions } from '#/features/playlist/api/playlist-api'
import { getTrackDetail, trackDetailQueryOptions } from '#/features/track/api/track-api'
import { userPlaylistsQueryOptions } from '#/features/user/api/user-api'
import {
  remapTracksPlayableStatusForAuth,
  usePlayableTracks,
} from '#/lib/music/playability-client'

export const Route = createFileRoute('/library/liked-songs')({
  component: LikedSongsRoute,
})

const PAGE_SIZE = 50
const TRACK_BATCH_SIZE = 200

function chunkTrackIds(trackIds: number[], size: number) {
  const chunks: number[][] = []

  for (let index = 0; index < trackIds.length; index += size) {
    chunks.push(trackIds.slice(index, index + size))
  }

  return chunks
}

function LikedSongsRoute() {
  const isClient = typeof window !== 'undefined'
  const [currentPage, setCurrentPage] = useState(1)
  const [playAllError, setPlayAllError] = useState<string | null>(null)
  const [isBuildingFullQueue, setIsBuildingFullQueue] = useState(false)
  const loadQueueAndPlay = usePlayerStore((state) => state.loadQueueAndPlay)
  const authSnapshot = useAuthStore(
    useShallow((state) => ({
      csrfToken: state.csrfToken,
      loginMode: state.loginMode,
      musicU: state.musicU,
      profile: state.profile,
      rawCookie: state.rawCookie,
    })),
  )

  const hasSession = Boolean(authSnapshot.profile?.userId)
  const userId = authSnapshot.profile?.userId ?? null

  const playlistsQuery = useQuery({
    ...userPlaylistsQueryOptions(userId ?? 0),
    enabled: isClient && hasSession && userId !== null,
  })

  const likedSongsPlaylist = playlistsQuery.data?.playlist[0] ?? null

  const likedSongsQuery = useQuery({
    ...playlistDetailQueryOptions(likedSongsPlaylist?.id ?? 0),
    enabled: Boolean(likedSongsPlaylist?.id),
  })

  const baseTracksRaw = useMemo(
    () => (likedSongsQuery.data?.playlist.tracks ?? []) as NeteaseTrack[],
    [likedSongsQuery.data],
  )
  const baseTracks = usePlayableTracks(baseTracksRaw)

  const playlistTrackIds = likedSongsQuery.data?.playlist.trackIds ?? []
  const totalTrackCount = likedSongsPlaylist?.trackCount ?? playlistTrackIds.length ?? baseTracks.length
  const totalPages = Math.max(1, Math.ceil((totalTrackCount || baseTracks.length || 1) / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pageStartIndex = (safeCurrentPage - 1) * PAGE_SIZE
  const pageEndIndex = pageStartIndex + PAGE_SIZE

  const orderedTrackIds = useMemo(() => {
    if (playlistTrackIds.length > 0) {
      return playlistTrackIds.map((track) => track.id)
    }

    return baseTracks.map((track) => track.id)
  }, [baseTracks, playlistTrackIds])

  const pageTrackIds = orderedTrackIds.slice(pageStartIndex, pageEndIndex)
  const knownTrackIds = new Set(baseTracks.map((track) => track.id))
  const missingPageTrackIds = pageTrackIds.filter((trackId) => !knownTrackIds.has(trackId))

  const missingTracksQuery = useQuery({
    ...trackDetailQueryOptions(missingPageTrackIds.join(',')),
    enabled: missingPageTrackIds.length > 0,
  })
  const missingTracks = usePlayableTracks(
    (missingTracksQuery.data?.songs ?? []) as NeteaseTrack[],
  )

  const hydratedTrackMap = useMemo(() => {
    const map = new Map<number, NeteaseTrack>()

    for (const track of baseTracks) {
      map.set(track.id, track)
    }

    for (const track of missingTracks) {
      map.set(track.id, track)
    }

    return map
  }, [baseTracks, missingTracks])

  const currentPageTracks = useMemo(() => {
    if (pageTrackIds.length > 0) {
      return pageTrackIds
        .map((trackId) => hydratedTrackMap.get(trackId))
        .filter((track): track is NeteaseTrack => Boolean(track))
    }

    return baseTracks.slice(pageStartIndex, pageEndIndex)
  }, [baseTracks, hydratedTrackMap, pageEndIndex, pageStartIndex, pageTrackIds])

  const canGoPrevious = safeCurrentPage > 1
  const canGoNext = safeCurrentPage < totalPages

  async function handlePlayAll() {
    if (orderedTrackIds.length === 0 && baseTracks.length === 0) {
      return
    }

    setPlayAllError(null)
    setIsBuildingFullQueue(true)

    try {
      const fullTrackMap = new Map<number, NeteaseTrack>(hydratedTrackMap)
      const missingTrackIds = orderedTrackIds.filter((trackId) => !fullTrackMap.has(trackId))

      for (const trackIdChunk of chunkTrackIds(missingTrackIds, TRACK_BATCH_SIZE)) {
        if (trackIdChunk.length === 0) {
          continue
        }

        const response = await getTrackDetail({
          data: { ids: trackIdChunk.join(',') },
        })

        for (const track of response.songs ?? []) {
          fullTrackMap.set(track.id, track)
        }
      }

      const fullQueueTracks = (orderedTrackIds.length > 0 ? orderedTrackIds : baseTracks.map((track) => track.id))
        .map((trackId) => fullTrackMap.get(trackId))
        .filter((track): track is NeteaseTrack => Boolean(track))

      const queueTracks = remapTracksPlayableStatusForAuth(
        fullQueueTracks.length > 0 ? fullQueueTracks : baseTracksRaw,
        authSnapshot,
      )

      loadQueueAndPlay(buildPlayerQueueFromTracks(queueTracks), undefined, { label: '我喜欢的音乐', to: '/library/liked-songs' })
    } catch (error) {
      setPlayAllError(error instanceof Error ? error.message : '构建完整播放队列失败，请稍后重试')
    } finally {
      setIsBuildingFullQueue(false)
    }
  }

  if (!hasSession) {
    return (
      <main className="py-10">
        <section className="island-shell rounded-[2rem] p-6 sm:p-8">
          <p className="island-kicker mb-3">Liked Songs</p>
          <h1 className="display-title m-0 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
            登录后才能查看我喜欢的音乐
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/login" className="app-chip">
              去登录
            </Link>
            <Link to="/library" className="app-chip">
              返回音乐库
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="py-10">
      <section className="island-shell rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="island-kicker mb-3">Liked Songs</p>
            <h1 className="display-title m-0 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
              我喜欢的音乐
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--sea-ink-soft)] sm:text-base">
              在这里浏览你喜欢的歌曲，也可以一键播放当前收藏。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/library" className="app-chip">
              返回音乐库
            </Link>
            <button
              type="button"
              onClick={handlePlayAll}
              disabled={baseTracks.length === 0 || isBuildingFullQueue}
              className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBuildingFullQueue ? '正在构建完整队列…' : '播放全部'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.42)] px-4 py-3 text-sm text-[var(--sea-ink-soft)]">
          <span>
            共 {totalTrackCount || baseTracks.length} 首 · 第 {safeCurrentPage} / {totalPages} 页
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={!canGoPrevious}
              className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              上一页
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={!canGoNext}
              className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>

        {playAllError ? (
          <div className="mt-6 rounded-[1.25rem] border border-[rgba(220,38,38,0.18)] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[rgb(153,27,27)] dark:text-[rgb(254,202,202)]">
            {playAllError}
          </div>
        ) : null}

        <div className="mt-8 grid gap-3">
          {likedSongsQuery.isLoading || missingTracksQuery.isLoading ? (
            <div className="library-empty-state">正在加载喜欢的歌曲…</div>
          ) : currentPageTracks.length > 0 ? (
            currentPageTracks.map((track, index) => (
              <article key={track.id} className="library-track-row">
                <div className="library-track-row__cover-shell">
                  {track.al?.picUrl ?? track.album?.picUrl ? (
                    <img
                      src={track.al?.picUrl ?? track.album?.picUrl}
                      alt={track.name}
                      className="library-track-row__cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="library-track-row__cover-placeholder">{track.name.slice(0, 1)}</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="library-track-row__title">
                    {pageStartIndex + index + 1}. {track.name}
                  </p>
                  <p className="library-track-row__meta">
                    {track.ar?.map((artist) => artist.name).join(' / ') ?? 'Unknown artist'}
                    {track.al?.name ? ` · ${track.al.name}` : ''}
                  </p>
                </div>
                <PlayTrackButton
                  track={track}
                  queue={currentPageTracks}
                  source={{ label: '我喜欢的音乐', to: '/library/liked-songs' }}
                  showPlayNext
                  className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
              </article>
            ))
          ) : (
            <div className="library-empty-state">当前还没有拿到喜欢歌曲列表。</div>
          )}
        </div>
      </section>
    </main>
  )
}
