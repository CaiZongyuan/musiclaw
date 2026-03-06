import { Link, createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'
import type {
  NeteaseAlbumSummary,
  NeteaseArtistSummary,
  NeteasePlaylistSummary,
} from '#/features/music/api/types'
import { homePageQueryOptions } from '#/features/home/api/home-api'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(homePageQueryOptions(8)),
  component: HomeRoute,
})

function ensureArray<TItem>(value: unknown): TItem[] {
  return Array.isArray(value) ? (value as TItem[]) : []
}

function HomeRoute() {
  const data = Route.useLoaderData()

  const recommendedPlaylists = ensureArray<NeteasePlaylistSummary>(
    data.recommendedPlaylists?.result,
  )
  const toplists = ensureArray<NeteasePlaylistSummary>(data.toplists?.list)
  const newAlbums = ensureArray<NeteaseAlbumSummary>(data.newAlbums?.albums)
  const topArtists = ensureArray<NeteaseArtistSummary>(data.topArtists?.artists)

  return (
    <div className="space-y-6">
      <RoutePlaceholder
        eyebrow="Home"
        title="YesPlayMusic Web 重写已经开始接真实数据。"
        description="首页已接入第一批只读接口：推荐歌单、榜单、新专辑和歌手榜。后续会继续补歌单/专辑/艺人详情与搜索结果。"
        actions={
          <>
            <Link to="/search" className="app-chip">
              Search page
            </Link>
            <Link to="/library" className="app-chip">
              User library
            </Link>
          </>
        }
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="island-shell rounded-3xl p-5">
            <h2 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
              推荐歌单
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {recommendedPlaylists.slice(0, 6).map((playlist) => (
                <Link
                  key={playlist.id}
                  to="/playlist/$id"
                  params={{ id: String(playlist.id) }}
                  className="rounded-2xl border border-[var(--line)] bg-[rgba(79,184,178,0.06)] p-4 text-inherit no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.1)]"
                >
                  <p className="m-0 font-semibold text-[var(--sea-ink)]">
                    {playlist.name}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-[var(--sea-ink-soft)]">
                    {playlist.copywriter ?? '推荐歌单'}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="island-shell rounded-3xl p-5">
            <h2 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
              榜单
            </h2>
            <div className="mt-4 space-y-3">
              {toplists.slice(0, 6).map((playlist) => (
                <Link
                  key={playlist.id}
                  to="/playlist/$id"
                  params={{ id: String(playlist.id) }}
                  className="flex items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3 text-inherit no-underline transition hover:bg-[rgba(79,184,178,0.08)]"
                >
                  <span className="font-medium text-[var(--sea-ink)]">
                    {playlist.name}
                  </span>
                  <span className="text-xs text-[var(--sea-ink-soft)]">
                    {playlist.trackCount ?? 0} tracks
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="island-shell rounded-3xl p-5">
            <h2 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
              新专辑
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {newAlbums.slice(0, 6).map((album) => (
                <Link
                  key={album.id}
                  to="/album/$id"
                  params={{ id: String(album.id) }}
                  className="rounded-2xl border border-[var(--line)] px-4 py-3 text-inherit no-underline transition hover:bg-[rgba(79,184,178,0.08)]"
                >
                  <p className="m-0 font-semibold text-[var(--sea-ink)]">
                    {album.name}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-[var(--sea-ink-soft)]">
                    {album.artist?.name ??
                      album.artists?.map((artist) => artist.name).join(' / ') ??
                      'Unknown artist'}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="island-shell rounded-3xl p-5">
            <h2 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
              歌手榜
            </h2>
            <div className="mt-4 space-y-3">
              {topArtists.slice(0, 6).map((artist) => (
                <Link
                  key={artist.id}
                  to="/artist/$id"
                  params={{ id: String(artist.id) }}
                  className="flex items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3 text-inherit no-underline transition hover:bg-[rgba(79,184,178,0.08)]"
                >
                  <span className="font-medium text-[var(--sea-ink)]">
                    {artist.name}
                  </span>
                  <span className="text-xs text-[var(--sea-ink-soft)]">
                    Artist #{artist.id}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </RoutePlaceholder>
    </div>
  )
}
