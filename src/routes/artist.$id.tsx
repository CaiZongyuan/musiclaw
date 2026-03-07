import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import RouteErrorState from '#/components/app/route-error-state'
import {
  artistAlbumsQueryOptions,
  artistDetailQueryOptions,
  similarArtistsQueryOptions,
} from '#/features/artist/api/artist-api'
import type {
  fetchArtistAlbums,
  fetchArtistDetail,
  fetchSimilarArtists,
} from '#/features/artist/api/artist-api'
import type { NeteaseAlbumSummary, NeteaseTrack } from '#/features/music/api/types'
import PlayTrackButton from '#/features/player/components/play-track-button'
import { buildPlayerQueueFromTracks } from '#/features/player/lib/player-track'
import { usePlayerStore } from '#/features/player/stores/player-store'
import { trackDetailQueryOptions } from '#/features/track/api/track-api'
import { usePlayableTracks } from '#/lib/music/playability-client'

interface ArtistRouteLoaderData {
  albums: Awaited<ReturnType<typeof fetchArtistAlbums>>
  detail: Awaited<ReturnType<typeof fetchArtistDetail>>
  similarArtists: Awaited<ReturnType<typeof fetchSimilarArtists>>
}

function formatReleaseYear(timestamp?: number) {
  if (!timestamp) {
    return '年份待补充'
  }

  return `${new Date(timestamp).getFullYear()}`
}

function isEpOrSingle(album: NeteaseAlbumSummary) {
  const albumType = String(album.type ?? '').toLowerCase()

  return (
    albumType.includes('ep') ||
    albumType.includes('single') ||
    albumType.includes('single') ||
    (album.size ?? 0) > 0 && (album.size ?? 0) <= 2
  )
}

export const Route = createFileRoute('/artist/$id')({
  loader: async ({ context, params }) => {
    const [detail, albums, similarArtists] = await Promise.all([
      context.queryClient.ensureQueryData(artistDetailQueryOptions(params.id)),
      context.queryClient.ensureQueryData(artistAlbumsQueryOptions(params.id, 36)),
      context.queryClient.ensureQueryData(similarArtistsQueryOptions(params.id)),
    ])

    return {
      detail,
      albums,
      similarArtists,
    } satisfies ArtistRouteLoaderData
  },
  errorComponent: ArtistErrorComponent,
  component: ArtistRoute,
})

function ArtistRoute() {
  const { albums, detail, similarArtists }: ArtistRouteLoaderData = Route.useLoaderData()
  const loadQueueAndPlay = usePlayerStore((state) => state.loadQueueAndPlay)
  const hotSongIds = detail.hotSongs.map((track) => track.id).join(',')
  const [showMoreTracks, setShowMoreTracks] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
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
  const description = detail.artist.briefDesc?.trim() ?? ''
  const albumReleases = useMemo(
    () => albums.hotAlbums.filter((album) => !isEpOrSingle(album)).slice(0, 12),
    [albums.hotAlbums],
  )
  const epReleases = useMemo(
    () => albums.hotAlbums.filter((album) => isEpOrSingle(album)).slice(0, 8),
    [albums.hotAlbums],
  )
  const visibleTracks = showMoreTracks ? tracks.slice(0, 24) : tracks.slice(0, 12)

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
          <p className="detail-hero__meta">
            {detail.artist.alias?.length ? `${detail.artist.alias.join(' / ')} · ` : ''}
            {detail.artist.musicSize ?? tracks.length} 首歌曲 · {detail.artist.albumSize ?? albums.hotAlbums.length} 张发行
            {' · '}
            {detail.artist.mvSize ?? 0} 支 MV
          </p>
          <div className="detail-hero__tag-row">
            <span className="detail-stat-pill">热门歌曲 {tracks.length} 首</span>
            <span className="detail-stat-pill">专辑 {albumReleases.length} 张</span>
            {epReleases.length > 0 ? <span className="detail-stat-pill">EP / Single {epReleases.length} 张</span> : null}
            {similarArtists.artists.length > 0 ? <span className="detail-stat-pill">相似艺人 {similarArtists.artists.length} 位</span> : null}
          </div>
          <p className="detail-hero__description">
            {description
              ? showFullDescription || description.length <= 120
                ? description
                : `${description.slice(0, 120)}…`
              : '艺人页已进入补完阶段：热门歌曲、专辑、EP / Single、相似艺人与更多信息区都集中在这里。'}
          </p>
          <div className="detail-hero__actions detail-hero__actions--wrap">
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
            {description.length > 120 ? (
              <button
                type="button"
                onClick={() => setShowFullDescription((value) => !value)}
                className="app-chip cursor-pointer"
              >
                {showFullDescription ? '收起介绍' : '展开介绍'}
              </button>
            ) : null}
            <a href="#artist-popular" className="app-chip">
              热门歌曲
            </a>
            <a href="#artist-albums" className="app-chip">
              专辑
            </a>
            {similarArtists.artists.length > 0 ? (
              <a href="#artist-similar" className="app-chip">
                相似艺人
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="detail-section">
        <div className="detail-section__header">
          <h2 className="detail-section__title">更多信息</h2>
          <span className="detail-section__count">热门歌曲、简介与发行信息</span>
        </div>
        <div className="detail-info-grid">
          <article className="detail-info-card">
            <p className="detail-info-card__kicker">Songs</p>
            <p className="detail-info-card__value">{detail.artist.musicSize ?? tracks.length}</p>
            <p className="detail-info-card__meta">先听热门歌曲，再继续浏览更多内容。</p>
          </article>
          <article className="detail-info-card">
            <p className="detail-info-card__kicker">Albums</p>
            <p className="detail-info-card__value">{detail.artist.albumSize ?? albums.hotAlbums.length}</p>
            <p className="detail-info-card__meta">专辑与 EP / Single 已拆成两块，浏览节奏更接近旧版。</p>
          </article>
          <article className="detail-info-card">
            <p className="detail-info-card__kicker">Aliases</p>
            <p className="detail-info-card__value detail-info-card__value--small">
              {detail.artist.alias?.length ? detail.artist.alias.join(' / ') : '暂无别名'}
            </p>
            <p className="detail-info-card__meta">帮助你快速确认艺人不同语言或不同市场下的名称。</p>
          </article>
          <article className="detail-info-card detail-info-card--wide">
            <p className="detail-info-card__kicker">Brief</p>
            <p className="detail-info-card__meta detail-info-card__meta--body">
              {description || '暂时没有更多艺人简介。'}
            </p>
          </article>
        </div>
      </section>

      {latestRelease ? (
        <section className="detail-section">
          <div className="detail-section__header">
            <h2 className="detail-section__title">最新发布</h2>
            <span className="detail-section__count">{formatReleaseYear(latestRelease.publishTime)}</span>
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
                  {formatReleaseYear(latestRelease.publishTime)} · {latestRelease.type || '最近发行'}
                  {' · '}
                  {latestRelease.size ?? 0} 首歌曲
                </p>
              </div>
            </Link>
          </div>
        </section>
      ) : null}

      <section id="artist-popular" className="detail-section">
        <div className="detail-section__header">
          <h2 className="detail-section__title">热门歌曲</h2>
          <div className="detail-section__actions">
            <span className="detail-section__count">{tracks.length} 首</span>
            {tracks.length > 12 ? (
              <button
                type="button"
                onClick={() => setShowMoreTracks((value) => !value)}
                className="app-chip cursor-pointer"
              >
                {showMoreTracks ? '收起' : '查看更多'}
              </button>
            ) : null}
          </div>
        </div>

        <div className="detail-track-list">
          {visibleTracks.map((track, index) => (
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
                <p className="detail-track-row__meta">{track.al?.name ?? 'Unknown album'}</p>
              </div>
              <span className="detail-track-row__status">
                {track.playable === false ? track.reason : `${Math.round((track.dt ?? 0) / 1000 / 60)} min`}
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

      {albumReleases.length ? (
        <section id="artist-albums" className="detail-section">
          <div className="detail-section__header">
            <h2 className="detail-section__title">专辑</h2>
            <span className="detail-section__count">{albumReleases.length} 张</span>
          </div>
          <div className="home-cover-grid">
            {albumReleases.map((album) => (
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
                    {album.type || 'Album'} · {formatReleaseYear(album.publishTime)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {epReleases.length ? (
        <section className="detail-section">
          <div className="detail-section__header">
            <h2 className="detail-section__title">EP / Single</h2>
            <span className="detail-section__count">{epReleases.length} 张</span>
          </div>
          <div className="home-cover-grid">
            {epReleases.map((album) => (
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
                    {album.type || 'EP / Single'} · {formatReleaseYear(album.publishTime)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {similarArtists.artists.length ? (
        <section id="artist-similar" className="detail-section">
          <div className="detail-section__header">
            <h2 className="detail-section__title">相似艺人</h2>
            <span className="detail-section__count">{similarArtists.artists.length} 位</span>
          </div>
          <div className="home-cover-grid home-cover-grid--artists">
            {similarArtists.artists.slice(0, 12).map((artist) => (
              <Link
                key={artist.id}
                to="/artist/$id"
                params={{ id: String(artist.id) }}
                className="home-cover-card home-cover-card--artist feature-card"
              >
                <div className="home-cover-card__artwork-shell">
                  {artist.picUrl ?? artist.img1v1Url ?? artist.cover ? (
                    <img
                      src={artist.picUrl ?? artist.img1v1Url ?? artist.cover}
                      alt={artist.name}
                      className="home-cover-card__artwork"
                      loading="lazy"
                    />
                  ) : (
                    <div className="home-cover-card__artwork-placeholder">{artist.name.slice(0, 1)}</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="home-cover-card__title">{artist.name}</p>
                  <p className="home-cover-card__subtitle">
                    {artist.alias?.length ? artist.alias.join(' / ') : 'Artist'}
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
      description="艺人信息、热门歌曲、专辑或相似艺人请求失败时，这里会保留应用壳并给出重试入口。"
      error={error}
      reset={reset}
    />
  )
}
