import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'
import { albumDetailQueryOptions } from '#/features/album/api/album-api'

export const Route = createFileRoute('/album/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(albumDetailQueryOptions(params.id)),
  component: AlbumRoute,
})

function AlbumRoute() {
  const data = Route.useLoaderData()

  return (
    <RoutePlaceholder
      eyebrow="Album"
      title={data.album.name}
      description={
        data.album.description ||
        '专辑页已经接通真实数据。后续会继续补封面主视觉、播放全部和专辑动态信息。'
      }
    >
      <div className="grid gap-3">
        {data.songs.slice(0, 12).map((track, index) => (
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
