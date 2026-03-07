import { Link, createFileRoute } from '@tanstack/react-router'
import RouteErrorState from '#/components/app/route-error-state'
import RoutePlaceholder from '#/components/app/route-placeholder'
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

interface ArtistRouteLoaderData {
  albums: Awaited<ReturnType<typeof fetchArtistAlbums>>
  detail: Awaited<ReturnType<typeof fetchArtistDetail>>
}

function formatReleaseYear(timestamp?: number) {
  if (!timestamp) {
    return '发行时间待补充'
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
  const tracks = usePlayableTracks(detail.hotSongs as NeteaseTrack[])
  const latestRelease = albums.hotAlbums[0] ?? null
  const queueSource = {
    label: detail.artist.name,
    to: '/artist/$id' as const,
    params: { id: String(detail.artist.id) },
  }

  return (
    <RoutePlaceholder
      eyebrow="Artist"
      title={detail.artist.name}
      description={
        detail.artist.briefDesc ||
        '艺人页已经接通基础信息、热门歌曲和专辑列表。后续会继续补 MV 列表与更多关联内容。'
      }
      actions={
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
      }
    >
      <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="rounded-3xl border border-[var(--line)] bg-[rgba(79,184,178,0.04)] p-5">
            <p className="island-kicker mb-3 text-xs tracking-[0.24em] uppercase">
              Artist Snapshot
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-[var(--sea-ink-soft)]">
              <span className="rounded-full border border-[var(--line)] px-3 py-1.5">
                {detail.artist.musicSize ?? tracks.length} 首歌曲
              </span>
              <span className="rounded-full border border-[var(--line)] px-3 py-1.5">
                {detail.artist.albumSize ?? albums.hotAlbums.length} 张专辑
              </span>
              <span className="rounded-full border border-[var(--line)] px-3 py-1.5">
                {detail.artist.mvSize ?? 0} 支 MV
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3">
                <p className="m-0 text-xs tracking-[0.18em] text-[var(--kicker)] uppercase">
                  Hot Songs
                </p>
                <p className="mt-2 mb-0 text-sm text-[var(--sea-ink-soft)]">
                  当前已展示热门歌曲和直接播放入口。
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3">
                <p className="m-0 text-xs tracking-[0.18em] text-[var(--kicker)] uppercase">
                  MV Entry
                </p>
                <p className="mt-2 mb-0 text-sm text-[var(--sea-ink-soft)]">
                  MV 页面仍在迁移中，先保留数量和后续接入入口。
                </p>
              </div>
            </div>
          </div>

          {albums.hotAlbums.length > 0 ? (
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_20px_60px_rgba(23,58,64,0.06)]">
              <p className="island-kicker mb-3 text-xs tracking-[0.24em] uppercase">
                Latest Release
              </p>
              <Link
                to="/album/$id"
                params={{ id: String(latestRelease.id) }}
                className="block rounded-2xl border border-[var(--line)] p-4 text-inherit no-underline transition hover:bg-[rgba(79,184,178,0.08)]"
              >
                <p className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
                  {latestRelease.name}
                </p>
                <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
                  {formatReleaseYear(latestRelease.publishTime)} · 最近发行
                </p>
              </Link>
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
              热门歌曲
            </h2>
            <span className="text-xs text-[var(--sea-ink-soft)]">
              {tracks.length} 首
            </span>
          </div>

          <div className="grid gap-3">
            {tracks.slice(0, 12).map((track, index) => (
              <article
                key={track.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="m-0 truncate font-medium text-[var(--sea-ink)]">
                    {index + 1}. {track.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-[var(--sea-ink-soft)]">
                    {track.al?.name ?? 'Unknown album'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--sea-ink-soft)]">
                    {track.playable === false ? track.reason : 'Playable'}
                  </span>
                  <PlayTrackButton
                    track={track}
                    queue={tracks}
                    source={queueSource}
                    showPlayNext
                    className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
              专辑
            </h2>
            <span className="text-xs text-[var(--sea-ink-soft)]">
              {albums.hotAlbums.length} 张
            </span>
          </div>

          {albums.hotAlbums.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {albums.hotAlbums.map((album) => (
                <Link
                  key={album.id}
                  to="/album/$id"
                  params={{ id: String(album.id) }}
                  className="rounded-2xl border border-[var(--line)] px-4 py-4 text-inherit no-underline transition hover:bg-[rgba(79,184,178,0.08)]"
                >
                  <p className="m-0 font-medium text-[var(--sea-ink)]">
                    {album.name}
                  </p>
                  <p className="mt-2 text-xs text-[var(--sea-ink-soft)]">
                    {formatReleaseYear(album.publishTime)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--sea-ink-soft)]/80">
                    {album.artist?.name ??
                      album.artists?.map((artist) => artist.name).join(' / ') ??
                      detail.artist.name}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[var(--line)] px-6 py-10 text-sm text-[var(--sea-ink-soft)]">
              暂时没有拿到该艺人的专辑数据。
            </div>
          )}
        </section>
      </div>
    </RoutePlaceholder>
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
