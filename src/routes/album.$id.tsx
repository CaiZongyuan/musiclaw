import { Link, createFileRoute } from '@tanstack/react-router'
import RouteErrorState from '#/components/app/route-error-state'
import { albumDetailQueryOptions } from '#/features/album/api/album-api'
import type { fetchAlbumDetail } from '#/features/album/api/album-api'
import type { NeteaseTrack } from '#/features/music/api/types'
import { usePlayableTracks } from '#/lib/music/playability-client'
import PlayTrackButton from '#/features/player/components/play-track-button'
import { buildPlayerQueueFromTracks } from '#/features/player/lib/player-track'
import { usePlayerStore } from '#/features/player/stores/player-store'

export const Route = createFileRoute('/album/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(albumDetailQueryOptions(params.id)),
  errorComponent: AlbumErrorComponent,
  component: AlbumRoute,
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
    return '时长待补充'
  }

  const totalSeconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatAlbumRuntime(tracks: NeteaseTrack[]) {
  const totalMs = tracks.reduce((sum, track) => sum + (track.dt ?? 0), 0)

  if (!totalMs) {
    return '总时长待补充'
  }

  const totalMinutes = Math.round(totalMs / 1000 / 60)
  return `${totalMinutes} 分钟`
}

function AlbumRoute() {
  const data: Awaited<ReturnType<typeof fetchAlbumDetail>> = Route.useLoaderData()
  const loadQueueAndPlay = usePlayerStore((state) => state.loadQueueAndPlay)
  const tracks = usePlayableTracks(data.songs as NeteaseTrack[])
  const albumCoverUrl = data.album.picUrl ?? data.album.blurPicUrl
  const queueSource = {
    label: data.album.name,
    to: '/album/$id' as const,
    params: { id: String(data.album.id) },
  }
  const artistName =
    data.album.artist?.name ??
    data.album.artists?.map((artist) => artist.name).join(' / ') ??
    'Unknown artist'
  const artistId = data.album.artist?.id ?? data.album.artists?.[0]?.id
  const albumType = (data.album as { type?: string }).type

  return (
    <div className="detail-screen detail-screen--album">
      <section className="detail-hero detail-hero--album island-shell">
        <div className="detail-hero__cover-shell">
          {data.album.picUrl ?? data.album.blurPicUrl ? (
            <img
              src={data.album.picUrl ?? data.album.blurPicUrl}
              alt={data.album.name}
              className="detail-hero__cover"
              loading="lazy"
            />
          ) : (
            <div className="detail-hero__cover-placeholder">{data.album.name.slice(0, 1)}</div>
          )}
        </div>

        <div className="detail-hero__main">
          <p className="detail-hero__eyebrow">Album</p>
          <h1 className="detail-hero__title">{data.album.name}</h1>
          <p className="detail-hero__meta">
            {albumType ? `${albumType} · ` : ''}
            {artistId ? (
              <Link to="/artist/$id" params={{ id: String(artistId) }} className="detail-inline-link">
                {artistName}
              </Link>
            ) : (
              artistName
            )}
            {' · '}
            {formatDate(data.album.publishTime)}
            {' · '}
            {tracks.length} 首歌曲
          </p>
          <div className="detail-hero__tag-row">
            <span className="detail-stat-pill">{formatAlbumRuntime(tracks)}</span>
            <span className="detail-stat-pill">{formatDate(data.album.publishTime)}</span>
          </div>
          <p className="detail-hero__description">
            {data.album.description || '专辑页已开始回到原版的封面 + 信息区 + 歌曲列表结构，后续继续补更多专辑附加信息。'}
          </p>
          <div className="detail-hero__actions">
            <button
              type="button"
              onClick={() =>
                loadQueueAndPlay(buildPlayerQueueFromTracks(tracks), undefined, queueSource)
              }
              disabled={tracks.length === 0}
              className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              播放全部
            </button>
          </div>
        </div>
      </section>

      <section className="detail-section">
        <div className="detail-section__header">
          <h2 className="detail-section__title">歌曲</h2>
          <span className="detail-section__count">{tracks.length} 首</span>
        </div>

        <div className="detail-track-list">
          {tracks.map((track, index) => (
            <article key={track.id} className="detail-track-row">
              <div className="detail-track-row__index">{index + 1}</div>
              <div className="detail-track-row__cover-shell">
                {track.al?.picUrl ?? track.album?.picUrl ?? albumCoverUrl ? (
                  <img
                    src={track.al?.picUrl ?? track.album?.picUrl ?? albumCoverUrl}
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
                </p>
              </div>
              <span className="detail-track-row__status">
                {track.playable === false ? track.reason : formatDuration(track.dt ?? 0)}
              </span>
              <PlayTrackButton
                track={track}
                queue={tracks}
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

function AlbumErrorComponent({
  error,
  reset,
}: {
  error: unknown
  reset: () => void
}) {
  return (
    <RouteErrorState
      title="专辑详情加载失败"
      description="专辑信息或曲目列表请求失败时，这里会展示错误态，避免页面直接白屏。"
      error={error}
      reset={reset}
    />
  )
}
