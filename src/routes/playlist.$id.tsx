import { createFileRoute } from '@tanstack/react-router'
import RouteErrorState from '#/components/app/route-error-state'
import RoutePlaceholder from '#/components/app/route-placeholder'
import type { NeteaseTrack } from '#/features/music/api/types'
import PlayTrackButton from '#/features/player/components/play-track-button'
import { buildPlayerQueueFromTracks } from '#/features/player/lib/player-track'
import { usePlayerStore } from '#/features/player/stores/player-store'
import { playlistDetailQueryOptions } from '#/features/playlist/api/playlist-api'
import type { fetchPlaylistDetail } from '#/features/playlist/api/playlist-api'

export const Route = createFileRoute('/playlist/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(playlistDetailQueryOptions(params.id)),
  errorComponent: PlaylistErrorComponent,
  component: PlaylistRoute,
})

function PlaylistRoute() {
  const data: Awaited<ReturnType<typeof fetchPlaylistDetail>> =
    Route.useLoaderData()
  const loadQueueAndPlay = usePlayerStore((state) => state.loadQueueAndPlay)
  const tracks = data.playlist.tracks as NeteaseTrack[]

  return (
    <RoutePlaceholder
      eyebrow="Playlist"
      title={data.playlist.name}
      description={
        data.playlist.description ||
        '歌单详情、歌曲列表和播放入口已经接到真实数据，下一步会继续补真实音频播放与更多交互。'
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
                className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </article>
        ))}
      </div>
    </RoutePlaceholder>
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
