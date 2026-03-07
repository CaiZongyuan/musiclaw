import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import RouteErrorState from '#/components/app/route-error-state'
import {
  artistAlbumsQueryOptions,
  artistDetailQueryOptions,
} from '#/features/artist/api/artist-api'
import type {
  fetchArtistAlbums,
  fetchArtistDetail,
} from '#/features/artist/api/artist-api'
import type { NeteaseTrack } from '#/features/music/api/types'
import { usePlayableTracks } from '#/lib/music/playability-client'
import PlayTrackButton from '#/features/player/components/play-track-button'
import { buildPlayerQueueFromTracks } from '#/features/player/lib/player-track'
import { usePlayerStore } from '#/features/player/stores/player-store'
import { trackDetailQueryOptions } from '#/features/track/api/track-api'

interface ArtistRouteLoaderData {
  albums: Awaited<ReturnType<typeof fetchArtistAlbums>>
  detail: Awaited<ReturnType<typeof fetchArtistDetail>>
}

function formatReleaseYear(timestamp?: number) {
  if (!timestamp) {
    return '年份待补充'
  }

  return `${new Date(timestamp).getFullYear()}`
}

export const Route = createFileRoute('/artist/$id')({
  loader: async ({ context, params }) => {
    const [detail, albums] = await Promise.all([
      context.queryClient.ensureQueryData(artistDetailQueryOptions(params.id)),
      context.queryClient.ensureQueryData(artistAlbumsQueryOptions(params.id)),
    ])

    return {
      detail,
      albums,
    } satisfies ArtistRouteLoaderData
  },
  errorComponent: ArtistErrorComponent,
  component: ArtistRoute,
})

function ArtistRoute() {
  const { albums, detail }: ArtistRouteLoaderData = Route.useLoaderData()
  const loadQueueAndPlay = usePlayerStore((state) => state.loadQueueAndPlay)
  const hotSongIds = detail.hotSongs.map((track) => track.id).join(',')
  const hotSongDetailsQuery = useQuery({
    ...trackDetailQueryOptions(hotSongIds),
    enabled: hotSongIds.length > 0,
  })
  const tracks = usePlayableTracks(
    ((hotSongDetailsQuery.data?.songs?.length
      ? hotSongDetailsQuery.data.songs
      : detail.hotSongs) as NeteaseTrack[]),
  )
  const latestRelease = albums.hotAlbums[0] ?? null
  const queueSource = {
    label: detail.artist.name,
    to: '/artist/$id' as const,
    params: { id: String(detail.artist.id) },
  }
  const artistImage = detail.artist.img1v1Url ?? detail.artist.picUrl ?? detail.artist.cover

  return (
    <div className="detail-screen detail-screen--artist">
      <section className="detail-hero detail-hero--artist island-shell">
        <div className="detail-hero__cover-shell detail-hero__cover-shell--artist">
          {artistImage ? (
            <img
              src={artistImage}
              alt={detail.artist.name}
              className="detail-hero__cover"
              loading="lazy"
            />
          ) : (
            <div className="detail-hero__cover-placeholder">{detail.artist.name.slice(0, 1)}</div>
          )}
        </div>

        <div className="detail-hero__main">
          <p className="detail-hero__eyebrow">Artist</p>
          <h1 className="detail-hero__title">{detail.artist.name}</h1>
          <p className="detail-hero__meta">Artist · 热门歌曲、专辑和艺人信息会从这里继续向原版收口</p>
          <div className="detail-hero__tag-row">
            <span className="detail-stat-pill">{detail.artist.musicSize ?? tracks.length} 首歌曲</span>
            <span className="detail-stat-pill">{detail.artist.albumSize ?? albums.hotAlbums.length} 张专辑</span>
            <span className="detail-stat-pill">{detail.artist.mvSize ?? 0} 支 MV</span>
          </div>
          <p className="detail-hero__description">
            {detail.artist.briefDesc || '艺人页已改回原版更接近的头部结构，后续继续补 MV、相似艺人和更多内容块。'}
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
              播放热门歌曲
            </button>
          </div>
        </div>
      </section>

      {latestRelease ? (
        <section className="detail-section">
          <div className="detail-section__header">
            <h2 className="detail-section__title">最新发布</h2>
          </div>
          <div className="detail-card-grid detail-card-grid--single">
            <Link
              to="/album/$id"
              params={{ id: String(latestRelease.id) }}
              className="detail-card"
            >
              <div className="detail-card__cover-shell">
                {latestRelease.picUrl ?? latestRelease.blurPicUrl ? (
                  <img
                    src={latestRelease.picUrl ?? latestRelease.blurPicUrl}
                    alt={latestRelease.name}
                    className="detail-card__cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="detail-card__cover-placeholder">{latestRelease.name.slice(0, 1)}</div>
                )}
              </div>
              <div className="detail-card__body">
                <p className="detail-card__title">{latestRelease.name}</p>
                <p className="detail-card__meta">
                  {formatReleaseYear(latestRelease.publishTime)} · 最近发行
                </p>
              </div>
            </Link>
          </div>
        </section>
      ) : null}

      <section className="detail-section">
        <div className="detail-section__header">
          <h2 className="detail-section__title">热门歌曲</h2>
          <span className="detail-section__count">{tracks.length} 首</span>
        </div>

        <div className="detail-track-list">
          {tracks.slice(0, 24).map((track, index) => (
            <article key={track.id} className="detail-track-row">
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
                  {track.al?.name ?? 'Unknown album'}
                </p>
              </div>
              <span className="detail-track-row__status">
                {track.playable === false ? track.reason : 'Playable'}
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

      <section className="detail-section">
        <div className="detail-section__header">
          <h2 className="detail-section__title">专辑</h2>
          <span className="detail-section__count">{albums.hotAlbums.length} 张</span>
        </div>

        {albums.hotAlbums.length ? (
          <div className="home-cover-grid">
            {albums.hotAlbums.map((album) => (
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
                  <p className="home-cover-card__subtitle">{formatReleaseYear(album.publishTime)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="library-empty-state">暂时没有拿到该艺人的专辑数据。</div>
        )}
      </section>
    </div>
  )
}

function ArtistErrorComponent({
  error,
  reset,
}: {
  error: unknown
  reset: () => void
}) {
  return (
    <RouteErrorState
      title="艺人详情加载失败"
      description="艺人信息、热门歌曲或专辑列表请求失败时，这里会保留应用壳并给出重试入口。"
      error={error}
      reset={reset}
    />
  )
}
