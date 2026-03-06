import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'
import { playlistDetailQueryOptions } from '#/features/playlist/api/playlist-api'

export const Route = createFileRoute('/playlist/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(playlistDetailQueryOptions(params.id)),
  component: PlaylistRoute,
})

function PlaylistRoute() {
  const data = Route.useLoaderData()

  return (
    <RoutePlaceholder
      eyebrow="Playlist"
      title={data.playlist.name}
      description={
        data.playlist.description ||
        '歌单详情、歌曲列表和播放入口已经接到真实数据，下一步会补播放全部、收藏与更多交互。'
      }
    >
      <div className="grid gap-3">
        {data.playlist.tracks.slice(0, 12).map((track, index) => (
          <article
            key={track.id}
            className="flex items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3"
          >
            <div>
              <p className="m-0 font-medium text-[var(--sea-ink)]">
                {index + 1}. {track.name}
              </p>
              <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
                {track.ar?.map((artist) => artist.name).join(' / ') ??
                  'Unknown artist'}
              </p>
            </div>
            <span className="text-xs text-[var(--sea-ink-soft)]">
              {track.playable === false ? track.reason : 'Playable'}
            </span>
          </article>
        ))}
      </div>
    </RoutePlaceholder>
  )
}
