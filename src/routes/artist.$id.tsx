import { createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'
import { artistDetailQueryOptions } from '#/features/artist/api/artist-api'

export const Route = createFileRoute('/artist/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(artistDetailQueryOptions(params.id)),
  component: ArtistRoute,
})

function ArtistRoute() {
  const data = Route.useLoaderData()

  return (
    <RoutePlaceholder
      eyebrow="Artist"
      title={data.artist.name}
      description={
        data.artist.briefDesc ||
        '艺人页已经接通基础数据。后续会继续补专辑列表、MV 列表和更多艺人关联内容。'
      }
    >
      <div className="grid gap-3">
        {data.hotSongs.slice(0, 12).map((track, index) => (
          <article
            key={track.id}
            className="flex items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3"
          >
            <div>
              <p className="m-0 font-medium text-[var(--sea-ink)]">
                {index + 1}. {track.name}
              </p>
              <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
                {track.al?.name ?? 'Unknown album'}
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
