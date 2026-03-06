import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import RoutePlaceholder from '#/components/app/route-placeholder'
import type {
  NeteaseAlbumSummary,
  NeteaseArtistSummary,
  NeteasePlaylistSummary,
  NeteaseTrack,
} from '#/features/music/api/types'
import {
  type NormalizedSearchResponse,
  searchQueryOptions,
} from '#/features/search/api/search-api'

interface SearchParams {
  q: string
  type: number
  page: number
}

const PAGE_SIZE = 20

const SEARCH_TYPE_OPTIONS = [
  { value: 1018, label: '综合' },
  { value: 1, label: '单曲' },
  { value: 10, label: '专辑' },
  { value: 100, label: '歌手' },
  { value: 1000, label: '歌单' },
] as const

const DEFAULT_SEARCH_PARAMS: SearchParams = {
  q: '',
  type: 1018,
  page: 1,
}

function normalizePositiveInteger(value: unknown, fallback: number) {
  const normalized =
    typeof value === 'string'
      ? Number(value)
      : typeof value === 'number'
        ? value
        : Number.NaN

  if (!Number.isFinite(normalized) || normalized < 1) {
    return fallback
  }

  return Math.floor(normalized)
}

function normalizeSearchParams(
  search: Partial<SearchParams> | undefined,
): SearchParams {
  return {
    q: typeof search?.q === 'string' ? search.q : DEFAULT_SEARCH_PARAMS.q,
    type: normalizePositiveInteger(search?.type, DEFAULT_SEARCH_PARAMS.type),
    page: normalizePositiveInteger(search?.page, DEFAULT_SEARCH_PARAMS.page),
  }
}

function getSearchLoaderDeps(search: Partial<SearchParams> | undefined) {
  return normalizeSearchParams(search)
}

function getTrackArtists(track: NeteaseTrack) {
  return track.ar?.map((artist) => artist.name).join(' / ') || 'Unknown artist'
}

function getAlbumArtistNames(album: NeteaseAlbumSummary) {
  return (
    album.artist?.name ||
    album.artists?.map((artist) => artist.name).join(' / ') ||
    'Unknown artist'
  )
}

function getSearchTotalCount(
  type: number,
  data: NormalizedSearchResponse | null | undefined,
) {
  switch (type) {
    case 1:
      return data?.result.songCount ?? data?.result.songs.length ?? 0
    case 10:
      return data?.result.albumCount ?? data?.result.albums.length ?? 0
    case 100:
      return data?.result.artistCount ?? data?.result.artists.length ?? 0
    case 1000:
      return data?.result.playlistCount ?? data?.result.playlists.length ?? 0
    default:
      return 0
  }
}

function renderSongs(tracks: NeteaseTrack[]) {
  if (!tracks.length) {
    return <SearchEmptyState message="没有找到匹配的单曲。" />
  }

  return (
    <div className="space-y-3">
      {tracks.map((track) => (
        <article
          key={track.id}
          className="rounded-2xl border border-[var(--line)] px-4 py-3"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="m-0 truncate font-medium text-[var(--sea-ink)]">
                {track.name}
              </p>
              <p className="mt-1 truncate text-xs text-[var(--sea-ink-soft)]">
                {getTrackArtists(track)}
              </p>
              <p className="mt-1 truncate text-xs text-[var(--sea-ink-soft)]">
                {track.al?.name ?? track.album?.name ?? '未知专辑'}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${
                track.playable
                  ? 'bg-[rgba(47,106,74,0.12)] text-[var(--palm)]'
                  : 'bg-[rgba(214,90,90,0.12)] text-[rgb(166,64,64)]'
              }`}
            >
              {track.playable ? '可播放' : track.reason || '不可播放'}
            </span>
          </div>
        </article>
      ))}
    </div>
  )
}

function renderAlbums(albums: NeteaseAlbumSummary[]) {
  if (!albums.length) {
    return <SearchEmptyState message="没有找到匹配的专辑。" />
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {albums.map((album) => (
        <Link
          key={album.id}
          to="/album/$id"
          params={{ id: String(album.id) }}
          className="rounded-2xl border border-[var(--line)] px-4 py-3 text-inherit no-underline transition hover:bg-[rgba(79,184,178,0.08)]"
        >
          <p className="m-0 font-medium text-[var(--sea-ink)]">{album.name}</p>
          <p className="mt-2 text-xs text-[var(--sea-ink-soft)]">
            {getAlbumArtistNames(album)}
          </p>
        </Link>
      ))}
    </div>
  )
}

function renderArtists(artists: NeteaseArtistSummary[]) {
  if (!artists.length) {
    return <SearchEmptyState message="没有找到匹配的歌手。" />
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {artists.map((artist) => (
        <Link
          key={artist.id}
          to="/artist/$id"
          params={{ id: String(artist.id) }}
          className="rounded-2xl border border-[var(--line)] px-4 py-3 text-inherit no-underline transition hover:bg-[rgba(79,184,178,0.08)]"
        >
          <p className="m-0 font-medium text-[var(--sea-ink)]">{artist.name}</p>
          <p className="mt-2 text-xs text-[var(--sea-ink-soft)]">
            Artist #{artist.id}
          </p>
        </Link>
      ))}
    </div>
  )
}

function renderPlaylists(playlists: NeteasePlaylistSummary[]) {
  if (!playlists.length) {
    return <SearchEmptyState message="没有找到匹配的歌单。" />
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {playlists.map((playlist) => (
        <Link
          key={playlist.id}
          to="/playlist/$id"
          params={{ id: String(playlist.id) }}
          className="rounded-2xl border border-[var(--line)] px-4 py-3 text-inherit no-underline transition hover:bg-[rgba(79,184,178,0.08)]"
        >
          <p className="m-0 font-medium text-[var(--sea-ink)]">
            {playlist.name}
          </p>
          <p className="mt-2 text-xs text-[var(--sea-ink-soft)]">
            {playlist.trackCount ?? 0} 首 · 播放 {playlist.playCount ?? 0}
          </p>
        </Link>
      ))}
    </div>
  )
}

function SearchEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--line)] px-6 py-10 text-sm text-[var(--sea-ink-soft)]">
      {message}
    </div>
  )
}

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === 'string' ? search.q : DEFAULT_SEARCH_PARAMS.q,
    type: normalizePositiveInteger(search.type, DEFAULT_SEARCH_PARAMS.type),
    page: normalizePositiveInteger(search.page, DEFAULT_SEARCH_PARAMS.page),
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
        limit: PAGE_SIZE,
        offset: (normalizedSearch.page - 1) * PAGE_SIZE,
      }),
    )
  },
  component: SearchRoute,
})

function SearchRoute() {
  const navigate = Route.useNavigate()
  const search = normalizeSearchParams(Route.useSearch())
  const data = Route.useLoaderData()
  const [inputValue, setInputValue] = useState(search.q)

  useEffect(() => {
    setInputValue(search.q)
  }, [search.q])

  const currentTypeLabel =
    SEARCH_TYPE_OPTIONS.find((option) => option.value === search.type)?.label ??
    `类型 ${search.type}`

  const totalCount = getSearchTotalCount(search.type, data)
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  )

  function updateSearch(nextSearch: SearchParams) {
    void navigate({
      to: '/search',
      search: nextSearch,
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    updateSearch({
      q: inputValue.trim(),
      type: search.type,
      page: 1,
    })
  }

  function handleTypeChange(nextType: number) {
    updateSearch({
      q: search.q.trim(),
      type: nextType,
      page: 1,
    })
  }

  function handlePageChange(nextPage: number) {
    updateSearch({
      q: search.q.trim(),
      type: search.type,
      page: nextPage,
    })
  }

  const hasQuery = search.q.trim().length > 0
  const showPagination = hasQuery && search.type !== 1018 && totalCount > PAGE_SIZE

  return (
    <RoutePlaceholder
      eyebrow="Search"
      title="搜索已经可以直接使用"
      description="支持关键词输入、综合/分类搜索切换，以及分类结果分页。下一步会继续补播放入口与更完整的筛选。"
      actions={
        <>
          <Link
            to="/search"
            search={{ q: 'Taylor Swift', type: 1018, page: 1 }}
            className="app-chip"
          >
            Try Taylor Swift
          </Link>
          <Link
            to="/search"
            search={{ q: '周杰伦', type: 1018, page: 1 }}
            className="app-chip"
          >
            Try 周杰伦
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_20px_60px_rgba(23,58,64,0.06)]">
          <form className="flex flex-col gap-3 lg:flex-row" onSubmit={handleSubmit}>
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="搜索歌曲、专辑、歌手或歌单"
              className="min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none placeholder:text-[var(--sea-ink-soft)] focus:border-[rgba(79,184,178,0.45)]"
            />
            <button type="submit" className="app-chip cursor-pointer justify-center">
              搜索
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {SEARCH_TYPE_OPTIONS.map((option) => {
              const isActive = option.value === search.type

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleTypeChange(option.value)}
                  className={`cursor-pointer rounded-full border px-3 py-2 text-sm transition ${
                    isActive
                      ? 'border-[rgba(79,184,178,0.4)] bg-[rgba(79,184,178,0.16)] text-[var(--lagoon-deep)]'
                      : 'border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)]'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </section>

        {!hasQuery ? (
          <SearchEmptyState message="先输入关键词再搜索，例如“周杰伦”、“Taylor Swift”或“Midnights”。" />
        ) : (
          <>
            <section className="flex flex-col gap-3 rounded-3xl border border-[var(--line)] bg-[rgba(79,184,178,0.06)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
                  关键词 <span className="font-semibold text-[var(--sea-ink)]">{search.q}</span>
                </p>
                <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
                  当前分类：{currentTypeLabel}
                  {search.type !== 1018 ? ` · 共 ${totalCount} 条 · 第 ${search.page}/${totalPages} 页` : ''}
                </p>
              </div>
            </section>

            {search.type === 1018 ? (
              <div className="grid gap-4 xl:grid-cols-2">
                <section className="island-shell rounded-3xl p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
                      歌曲
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleTypeChange(1)}
                      className="app-chip cursor-pointer"
                    >
                      查看单曲结果
                    </button>
                  </div>
                  {renderSongs((data?.result.songs ?? []).slice(0, 8))}
                </section>

                <section className="island-shell rounded-3xl p-5">
                  <h2 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
                    其他结果
                  </h2>
                  <div className="mt-4 space-y-3">
                    <button
                      type="button"
                      onClick={() => handleTypeChange(10)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3 text-left text-sm text-[var(--sea-ink-soft)] transition hover:bg-[rgba(79,184,178,0.08)]"
                    >
                      <span>专辑</span>
                      <span>{data?.result.albums?.length ?? 0}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange(1000)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3 text-left text-sm text-[var(--sea-ink-soft)] transition hover:bg-[rgba(79,184,178,0.08)]"
                    >
                      <span>歌单</span>
                      <span>{data?.result.playlists?.length ?? 0}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange(100)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3 text-left text-sm text-[var(--sea-ink-soft)] transition hover:bg-[rgba(79,184,178,0.08)]"
                    >
                      <span>歌手</span>
                      <span>{data?.result.artists?.length ?? 0}</span>
                    </button>
                  </div>

                  <div className="mt-6 space-y-3">
                    <h3 className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                      热门专辑
                    </h3>
                    {renderAlbums((data?.result.albums ?? []).slice(0, 3))}
                  </div>
                </section>
              </div>
            ) : null}

            {search.type === 1 ? renderSongs(data?.result.songs ?? []) : null}
            {search.type === 10 ? renderAlbums(data?.result.albums ?? []) : null}
            {search.type === 100 ? renderArtists(data?.result.artists ?? []) : null}
            {search.type === 1000
              ? renderPlaylists(data?.result.playlists ?? [])
              : null}

            {showPagination ? (
              <section className="flex items-center justify-between rounded-3xl border border-[var(--line)] px-5 py-4">
                <button
                  type="button"
                  onClick={() => handlePageChange(search.page - 1)}
                  disabled={search.page <= 1}
                  className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  上一页
                </button>
                <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
                  第 {search.page} / {totalPages} 页
                </p>
                <button
                  type="button"
                  onClick={() => handlePageChange(search.page + 1)}
                  disabled={search.page >= totalPages}
                  className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  下一页
                </button>
              </section>
            ) : null}
          </>
        )}
      </div>
    </RoutePlaceholder>
  )
}

export {
  DEFAULT_SEARCH_PARAMS,
  PAGE_SIZE,
  SEARCH_TYPE_OPTIONS,
  getSearchLoaderDeps,
  getSearchTotalCount,
  normalizeSearchParams,
}
