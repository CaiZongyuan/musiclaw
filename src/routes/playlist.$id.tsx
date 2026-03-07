import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import RouteErrorState from '#/components/app/route-error-state'
import type { NeteaseTrack } from '#/features/music/api/types'
import PlayTrackButton from '#/features/player/components/play-track-button'
import { buildPlayerQueueFromTracks } from '#/features/player/lib/player-track'
import { usePlayerStore } from '#/features/player/stores/player-store'
import { playlistDetailQueryOptions } from '#/features/playlist/api/playlist-api'
import type { fetchPlaylistDetail } from '#/features/playlist/api/playlist-api'
import { usePlayableTracks } from '#/lib/music/playability-client'

export const Route = createFileRoute('/playlist/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(playlistDetailQueryOptions(params.id)),
  errorComponent: PlaylistErrorComponent,
  component: PlaylistRoute,
})

function formatDate(timestamp?: number) {
  if (!timestamp) {
    return '日期待补充'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(timestamp)
}

function formatDuration(durationMs: number) {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return '0:00'
  }

  const totalSeconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatPlaylistRuntime(tracks: NeteaseTrack[]) {
  const totalMs = tracks.reduce((sum, track) => sum + (track.dt ?? 0), 0)

  if (!totalMs) {
    return '总时长待补充'
  }

  return `${Math.round(totalMs / 1000 / 60)} 分钟`
}

function PlaylistRoute() {
  const data: Awaited<ReturnType<typeof fetchPlaylistDetail>> = Route.useLoaderData()
  const { enqueueToPlayNext, loadQueueAndPlay } = usePlayerStore(
    useShallow((state) => ({
      enqueueToPlayNext: state.enqueueToPlayNext,
      loadQueueAndPlay: state.loadQueueAndPlay,
    })),
  )
  const tracks = usePlayableTracks(data.playlist.tracks as NeteaseTrack[])
  const queueSource = {
    label: data.playlist.name,
    to: '/playlist/$id' as const,
    params: { id: String(data.playlist.id) },
  }
  const creator = data.playlist.creator as
    | { id?: number; nickname?: string; name?: string }
    | undefined
  const creatorName = creator?.nickname ?? creator?.name ?? 'Unknown creator'
  const updateTime = data.playlist.updateTime
  const tags = data.playlist.tags ?? []
  const coverUrl = data.playlist.coverImgUrl ?? data.playlist.picUrl
  const [keyword, setKeyword] = useState('')
  const filteredTracks = useMemo(() => {
    const trimmedKeyword = keyword.trim().toLowerCase()

    if (!trimmedKeyword) {
      return tracks
    }

    return tracks.filter((track) => {
      const artistText = track.ar?.map((artist) => artist.name).join(' ') ?? ''
      const albumText = track.al?.name ?? track.album?.name ?? ''
      return `${track.name} ${artistText} ${albumText}`.toLowerCase().includes(trimmedKeyword)
    })
  }, [keyword, tracks])

  function copyPageUrl() {
    if (typeof window === 'undefined') {
      return
    }

    void window.navigator.clipboard?.writeText(window.location.href)
  }

  function openOriginalPage() {
    if (typeof window === 'undefined') {
      return
    }

    window.open(`https://music.163.com/#/playlist?id=${data.playlist.id}`, '_blank', 'noopener,noreferrer')
  }

  function enqueuePlaylistLeadTrack() {
    const firstTrack = filteredTracks[0]

    if (!firstTrack) {
      return
    }

    enqueueToPlayNext(buildPlayerQueueFromTracks([firstTrack])[0])
  }

  return (
    <div className="detail-screen detail-screen--playlist">
      <section className="detail-hero detail-hero--playlist island-shell">
        <div className="detail-hero__cover-shell">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={data.playlist.name}
              className="detail-hero__cover"
              loading="lazy"
            />
          ) : (
            <div className="detail-hero__cover-placeholder">{data.playlist.name.slice(0, 1)}</div>
          )}
        </div>

        <div className="detail-hero__main">
          <p className="detail-hero__eyebrow">Playlist</p>
          <h1 className="detail-hero__title">{data.playlist.name}</h1>
          <p className="detail-hero__meta">
            由{' '}
            {creator?.id ? (
              <a
                href={`https://music.163.com/#/user/home?id=${creator.id}`}
                target="_blank"
                rel="noreferrer"
                className="detail-inline-link"
              >
                {creatorName}
              </a>
            ) : (
              creatorName
            )}
            创建 · 更新于 {formatDate(updateTime)} · {tracks.length} 首歌曲
          </p>
          {tags.length > 0 ? (
            <div className="detail-hero__tag-row">
              {tags.map((tag) => (
                <span key={tag} className="detail-stat-pill">
                  {tag}
                </span>
              ))}
              <span className="detail-stat-pill">{formatPlaylistRuntime(tracks)}</span>
            </div>
          ) : (
            <div className="detail-hero__tag-row">
              <span className="detail-stat-pill">{tracks.length} 首歌曲</span>
              <span className="detail-stat-pill">{formatPlaylistRuntime(tracks)}</span>
            </div>
          )}
          <p className="detail-hero__description">
            {data.playlist.description || '在这里查看歌单信息、搜索歌曲，并继续播放当前列表。'}
          </p>
          <div className="detail-hero__actions detail-hero__actions--wrap">
            <button
              type="button"
              onClick={() =>
                loadQueueAndPlay(buildPlayerQueueFromTracks(filteredTracks), undefined, queueSource)
              }
              disabled={filteredTracks.length === 0}
              className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              播放当前列表
            </button>
            <button
              type="button"
              onClick={enqueuePlaylistLeadTrack}
              disabled={filteredTracks.length === 0}
              className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              下一首播放首曲
            </button>
            <button type="button" onClick={copyPageUrl} className="app-chip cursor-pointer">
              复制链接
            </button>
            <button type="button" onClick={openOriginalPage} className="app-chip cursor-pointer">
              在网易云打开
            </button>
          </div>
        </div>
      </section>

      <section className="detail-section">
        <div className="detail-section__header">
          <h2 className="detail-section__title">附加信息</h2>
          <span className="detail-section__count">标签、搜索与常用操作</span>
        </div>
        <div className="detail-info-grid">
          <article className="detail-info-card">
            <p className="detail-info-card__kicker">Updated</p>
            <p className="detail-info-card__value detail-info-card__value--small">{formatDate(updateTime)}</p>
            <p className="detail-info-card__meta">歌单的更新时间会固定保留在信息区。</p>
          </article>
          <article className="detail-info-card">
            <p className="detail-info-card__kicker">Tracks</p>
            <p className="detail-info-card__value">{tracks.length}</p>
            <p className="detail-info-card__meta">搜索后仍会保留完整数量，方便确认筛选范围。</p>
          </article>
          <article className="detail-info-card">
            <p className="detail-info-card__kicker">Filtered</p>
            <p className="detail-info-card__value">{filteredTracks.length}</p>
            <p className="detail-info-card__meta">输入关键词后会即时收窄当前歌单列表。</p>
          </article>
          <article className="detail-info-card detail-info-card--wide">
            <p className="detail-info-card__kicker">搜索歌单</p>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索歌曲、艺人或专辑"
              className="detail-search-input"
            />
            <p className="detail-info-card__meta">输入关键词，快速定位歌单里的歌曲。</p>
          </article>
        </div>
      </section>

      {data.playlist.description ? (
        <section className="detail-section">
          <div className="detail-section__header">
            <h2 className="detail-section__title">歌单介绍</h2>
            <span className="detail-section__count">由 {creatorName} 创建</span>
          </div>
          <article className="detail-info-card detail-info-card--wide">
            <p className="detail-info-card__meta detail-info-card__meta--body">{data.playlist.description}</p>
          </article>
        </section>
      ) : null}

      <section className="detail-section">
        <div className="detail-section__header">
          <h2 className="detail-section__title">歌曲</h2>
          <span className="detail-section__count">
            {keyword.trim() ? `当前筛选 ${filteredTracks.length} / ${tracks.length} 首` : `${tracks.length} 首`}
          </span>
        </div>

        <div className="detail-track-list detail-track-list--dense">
          {filteredTracks.map((track, index) => (
            <article key={track.id} className="detail-track-row detail-track-row--dense">
              <div className="detail-track-row__index">{index + 1}</div>
              <div className="detail-track-row__cover-shell">
                {track.al?.picUrl ?? track.album?.picUrl ? (
                  <img
                    src={track.al?.picUrl ?? track.album?.picUrl}
                    alt={track.name}
                    className="detail-track-row__cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="detail-track-row__cover-placeholder">{track.name.slice(0, 1)}</div>
                )}
              </div>
              <div className="detail-track-row__main">
                <p className="detail-track-row__title">{track.name}</p>
                <p className="detail-track-row__meta">
                  {track.ar?.map((artist) => artist.name).join(' / ') ?? 'Unknown artist'}
                  {track.al?.name ? ` · ${track.al.name}` : ''}
                </p>
              </div>
              <span className="detail-track-row__status">
                {track.playable === false ? track.reason : formatDuration(track.dt ?? 0)}
              </span>
              <PlayTrackButton
                track={track}
                queue={filteredTracks}
                source={queueSource}
                showPlayNext
                className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function PlaylistErrorComponent({
  error,
  reset,
}: {
  error: unknown
  reset: () => void
}) {
  return (
    <RouteErrorState
      title="歌单详情加载失败"
      description="歌单信息或曲目列表请求失败时，这里会给出明确提示，并允许你直接重试。"
      error={error}
      reset={reset}
    />
  )
}
