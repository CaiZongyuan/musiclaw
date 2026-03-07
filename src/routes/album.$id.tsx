import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useShallow } from 'zustand/react/shallow'
import RouteErrorState from '#/components/app/route-error-state'
import { albumDetailQueryOptions } from '#/features/album/api/album-api'
import type { fetchAlbumDetail } from '#/features/album/api/album-api'
import { artistAlbumsQueryOptions } from '#/features/artist/api/artist-api'
import type { NeteaseTrack } from '#/features/music/api/types'
import PlayTrackButton from '#/features/player/components/play-track-button'
import { buildPlayerQueueFromTracks } from '#/features/player/lib/player-track'
import { usePlayerStore } from '#/features/player/stores/player-store'
import { usePlayableTracks } from '#/lib/music/playability-client'

export const Route = createFileRoute('/album/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(albumDetailQueryOptions(params.id)),
  errorComponent: AlbumErrorComponent,
  component: AlbumRoute,
})

function formatDate(timestamp?: number, variant: 'short' | 'long' = 'short') {
  if (!timestamp) {
    return '日期待补充'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: variant === 'long' ? 'long' : 'short',
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

function formatAlbumRuntime(tracks: NeteaseTrack[]) {
  const totalMs = tracks.reduce((sum, track) => sum + (track.dt ?? 0), 0)

  if (!totalMs) {
    return '总时长待补充'
  }

  const totalMinutes = Math.round(totalMs / 1000 / 60)
  return `${totalMinutes} 分钟`
}

function groupTracksByDisc(tracks: NeteaseTrack[]) {
  const discMap = new Map<string, NeteaseTrack[]>()

  for (const track of tracks) {
    const discKey = String(track.cd ?? '1')
    discMap.set(discKey, [...(discMap.get(discKey) ?? []), track])
  }

  return [...discMap.entries()]
}

function AlbumRoute() {
  const data: Awaited<ReturnType<typeof fetchAlbumDetail>> = Route.useLoaderData()
  const { enqueueToPlayNext, loadQueueAndPlay } = usePlayerStore(
    useShallow((state) => ({
      enqueueToPlayNext: state.enqueueToPlayNext,
      loadQueueAndPlay: state.loadQueueAndPlay,
    })),
  )
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
  const albumType = data.album.type
  const trackGroups = groupTracksByDisc(tracks)
  const moreAlbumsQuery = useQuery({
    ...artistAlbumsQueryOptions(artistId ?? 0, 12),
    enabled: Boolean(artistId),
  })
  const moreAlbums = (moreAlbumsQuery.data?.hotAlbums ?? []).filter(
    (album) => album.id !== data.album.id,
  )

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

    window.open(`https://music.163.com/#/album?id=${data.album.id}`, '_blank', 'noopener,noreferrer')
  }

  function enqueueAlbumLeadTrack() {
    const firstTrack = tracks[0]

    if (!firstTrack) {
      return
    }

    enqueueToPlayNext(buildPlayerQueueFromTracks([firstTrack])[0])
  }

  return (
    <div className="detail-screen detail-screen--album">
      <section className="detail-hero detail-hero--album island-shell">
        <div className="detail-hero__cover-shell">
          {albumCoverUrl ? (
            <img
              src={albumCoverUrl}
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
            <span className="detail-stat-pill">发行于 {formatDate(data.album.publishTime)}</span>
            {data.album.company ? <span className="detail-stat-pill">{data.album.company}</span> : null}
          </div>
          <p className="detail-hero__description">
            {data.album.description || '专辑页已补回更多附加信息区、按钮组与同艺人更多发行，列表密度也继续向原版靠拢。'}
          </p>
          <div className="detail-hero__actions detail-hero__actions--wrap">
            <button
              type="button"
              onClick={() => loadQueueAndPlay(buildPlayerQueueFromTracks(tracks), undefined, queueSource)}
              disabled={tracks.length === 0}
              className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              播放全部
            </button>
            <button
              type="button"
              onClick={enqueueAlbumLeadTrack}
              disabled={tracks.length === 0}
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
          <span className="detail-section__count">补回原版里的信息区节奏</span>
        </div>
        <div className="detail-info-grid">
          <article className="detail-info-card">
            <p className="detail-info-card__kicker">Release</p>
            <p className="detail-info-card__value detail-info-card__value--small">
              {formatDate(data.album.publishTime, 'long')}
            </p>
            <p className="detail-info-card__meta">完整发布日期会固定展示在曲目列表前。</p>
          </article>
          <article className="detail-info-card">
            <p className="detail-info-card__kicker">Runtime</p>
            <p className="detail-info-card__value">{formatAlbumRuntime(tracks)}</p>
            <p className="detail-info-card__meta">总时长按当前已加载曲目聚合。</p>
          </article>
          <article className="detail-info-card">
            <p className="detail-info-card__kicker">Tracks</p>
            <p className="detail-info-card__value">{tracks.length}</p>
            <p className="detail-info-card__meta">多碟专辑会按 Disc 自动分组显示。</p>
          </article>
          <article className="detail-info-card detail-info-card--wide">
            <p className="detail-info-card__kicker">Label</p>
            <p className="detail-info-card__meta detail-info-card__meta--body">
              {data.album.company || '当前接口没有返回版权公司信息。'}
            </p>
          </article>
        </div>
      </section>

      <section className="detail-section">
        <div className="detail-section__header">
          <h2 className="detail-section__title">歌曲</h2>
          <span className="detail-section__count">{tracks.length} 首</span>
        </div>

        {trackGroups.length > 1 ? (
          <div className="detail-disc-stack">
            {trackGroups.map(([disc, discTracks]) => (
              <div key={disc} className="detail-disc-group">
                <div className="detail-disc-group__title">Disc {disc}</div>
                <div className="detail-track-list detail-track-list--dense">
                  {discTracks.map((track, index) => (
                    <article key={track.id} className="detail-track-row detail-track-row--dense">
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
              </div>
            ))}
          </div>
        ) : (
          <div className="detail-track-list detail-track-list--dense">
            {tracks.map((track, index) => (
              <article key={track.id} className="detail-track-row detail-track-row--dense">
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
        )}
      </section>

      {data.album.description ? (
        <section className="detail-section">
          <div className="detail-section__header">
            <h2 className="detail-section__title">专辑介绍</h2>
          </div>
          <article className="detail-info-card detail-info-card--wide">
            <p className="detail-info-card__meta detail-info-card__meta--body">{data.album.description}</p>
          </article>
        </section>
      ) : null}

      {moreAlbums.length ? (
        <section className="detail-section">
          <div className="detail-section__header">
            <h2 className="detail-section__title">更多来自 {artistName}</h2>
            <span className="detail-section__count">{moreAlbums.length} 张</span>
          </div>
          <div className="home-cover-grid">
            {moreAlbums.slice(0, 6).map((album) => (
              <Link
                key={album.id}
                to="/album/$id"
                params={{ id: String(album.id) }}
                className="home-cover-card feature-card"
              >
                <div className="home-cover-card__artwork-shell">
                  {album.picUrl ?? album.blurPicUrl ? (
                    <img
                      src={album.picUrl ?? album.blurPicUrl}
                      alt={album.name}
                      className="home-cover-card__artwork"
                      loading="lazy"
                    />
                  ) : (
                    <div className="home-cover-card__artwork-placeholder">{album.name.slice(0, 1)}</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="home-cover-card__title">{album.name}</p>
                  <p className="home-cover-card__subtitle">
                    {album.type || 'Album'} · {formatDate(album.publishTime)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
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
