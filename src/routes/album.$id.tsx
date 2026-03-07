import { createFileRoute } from '@tanstack/react-router'
import RouteErrorState from '#/components/app/route-error-state'
import RoutePlaceholder from '#/components/app/route-placeholder'
import { albumDetailQueryOptions } from '#/features/album/api/album-api'
import type { fetchAlbumDetail } from '#/features/album/api/album-api'
import type { NeteaseTrack } from '#/features/music/api/types'
import PlayTrackButton from '#/features/player/components/play-track-button'
import { buildPlayerQueueFromTracks } from '#/features/player/lib/player-track'
import { usePlayerStore } from '#/features/player/stores/player-store'

export const Route = createFileRoute('/album/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(albumDetailQueryOptions(params.id)),
  errorComponent: AlbumErrorComponent,
  component: AlbumRoute,
})

function AlbumRoute() {
  const data: Awaited<ReturnType<typeof fetchAlbumDetail>> = Route.useLoaderData()
  const loadQueueAndPlay = usePlayerStore((state) => state.loadQueueAndPlay)
  const tracks = data.songs as NeteaseTrack[]

  return (
    <RoutePlaceholder
      eyebrow="Album"
      title={data.album.name}
      description={
        data.album.description ||
        '专辑页已经接通真实数据，并补上了播放入口。后续会继续补封面主视觉和更多专辑信息。'
      }
      actions={
        <button
          type="button"
          onClick={() => loadQueueAndPlay(buildPlayerQueueFromTracks(tracks))}
          disabled={tracks.length === 0}
          className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          播放全部
        </button>
      }
    >
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
                {track.ar?.map((artist) => artist.name).join(' / ') ??
                  'Unknown artist'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--sea-ink-soft)]">
                {track.playable === false ? track.reason : 'Playable'}
              </span>
              <PlayTrackButton
                track={track}
                queue={tracks}
                showPlayNext
                className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </article>
        ))}
      </div>
    </RoutePlaceholder>
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
