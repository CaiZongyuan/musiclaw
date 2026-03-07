import { createFileRoute } from '@tanstack/react-router'
import RouteErrorState from '#/components/app/route-error-state'
import RoutePlaceholder from '#/components/app/route-placeholder'
import { artistDetailQueryOptions } from '#/features/artist/api/artist-api'
import type { fetchArtistDetail } from '#/features/artist/api/artist-api'
import type { NeteaseTrack } from '#/features/music/api/types'
import PlayTrackButton from '#/features/player/components/play-track-button'
import { buildPlayerQueueFromTracks } from '#/features/player/lib/player-track'
import { usePlayerStore } from '#/features/player/stores/player-store'

export const Route = createFileRoute('/artist/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(artistDetailQueryOptions(params.id)),
  errorComponent: ArtistErrorComponent,
  component: ArtistRoute,
})

function ArtistRoute() {
  const data: Awaited<ReturnType<typeof fetchArtistDetail>> = Route.useLoaderData()
  const loadQueueAndPlay = usePlayerStore((state) => state.loadQueueAndPlay)
  const tracks = data.hotSongs as NeteaseTrack[]

  return (
    <RoutePlaceholder
      eyebrow="Artist"
      title={data.artist.name}
      description={
        data.artist.briefDesc ||
        '艺人页已经接通基础数据和热门歌曲播放入口。后续会继续补专辑列表、MV 列表和更多关联内容。'
      }
      actions={
        <button
          type="button"
          onClick={() => loadQueueAndPlay(buildPlayerQueueFromTracks(tracks))}
          disabled={tracks.length === 0}
          className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          播放热门歌曲
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
                className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </article>
        ))}
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
      description="艺人信息或热门歌曲请求失败时，这里会保留应用壳并给出重试入口。"
      error={error}
      reset={reset}
    />
  )
}
