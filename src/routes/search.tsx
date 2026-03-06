import { Link, createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'
import { searchQueryOptions } from '#/features/search/api/search-api'

interface SearchParams {
  q: string
  type: number
}

const DEFAULT_SEARCH_PARAMS: SearchParams = {
  q: '',
  type: 1018,
}

function normalizeSearchParams(
  search: Partial<SearchParams> | undefined,
): SearchParams {
  return {
    q: typeof search?.q === 'string' ? search.q : '',
    type: typeof search?.type === 'number' ? search.type : 1018,
  }
}

function getSearchLoaderDeps(search: Partial<SearchParams> | undefined) {
  return normalizeSearchParams(search)
}

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === 'string' ? search.q : DEFAULT_SEARCH_PARAMS.q,
    type:
      typeof search.type === 'string'
        ? Number(search.type)
        : typeof search.type === 'number'
          ? search.type
          : DEFAULT_SEARCH_PARAMS.type,
  }),
  loaderDeps: ({ search }) => getSearchLoaderDeps(search),
  loader: ({ context, deps }) => {
    const normalizedSearch = deps

    if (!normalizedSearch.q.trim()) {
      return null
    }

    return context.queryClient.ensureQueryData(
      searchQueryOptions({
        keywords: normalizedSearch.q,
        type: normalizedSearch.type,
      }),
    )
  },
  component: SearchRoute,
})

function SearchRoute() {
  const search = normalizeSearchParams(Route.useSearch())
  const data = Route.useLoaderData()

  return (
    <RoutePlaceholder
      eyebrow="Search"
      title="搜索页已经接入真实接口"
      description="当前通过查询参数 `q` 驱动搜索，例如 `/search?q=Jay Chou`。后续会补完整搜索框、分类切换和分页。"
      actions={
        <>
          <Link
            to="/search"
            search={{ q: 'Taylor Swift', type: 1018 }}
            className="app-chip"
          >
            Try Taylor Swift
          </Link>
          <Link
            to="/search"
            search={{ q: '周杰伦', type: 1018 }}
            className="app-chip"
          >
            Try 周杰伦
          </Link>
        </>
      }
    >
      {search.q.trim() ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="island-shell rounded-3xl p-5">
            <h2 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
              歌曲
            </h2>
            <div className="mt-4 space-y-3">
              {(data?.result.songs ?? []).slice(0, 8).map((track) => (
                <article
                  key={track.id}
                  className="rounded-2xl border border-[var(--line)] px-4 py-3"
                >
                  <p className="m-0 font-medium text-[var(--sea-ink)]">
                    {track.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
                    {track.ar?.map((artist) => artist.name).join(' / ') ??
                      'Unknown artist'}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="island-shell rounded-3xl p-5">
            <h2 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
              专辑 / 歌单 / 歌手
            </h2>
            <div className="mt-4 space-y-3 text-sm text-[var(--sea-ink-soft)]">
              <p>Albums: {data?.result.albums?.length ?? 0}</p>
              <p>Playlists: {data?.result.playlists?.length ?? 0}</p>
              <p>Artists: {data?.result.artists?.length ?? 0}</p>
            </div>
          </section>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[var(--line)] px-6 py-10 text-sm text-[var(--sea-ink-soft)]">
          请输入查询参数，例如 `/search?q=周杰伦`。
        </div>
      )}
    </RoutePlaceholder>
  )
}

export { getSearchLoaderDeps, normalizeSearchParams }
