import { useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Play } from 'lucide-react'
import { type MouseEvent, useState } from 'react'
import RouteErrorState from '#/components/app/route-error-state'
import {
  albumDetailQueryOptions,
  newAlbumsPageQueryOptions,
} from '#/features/album/api/album-api'
import {
  buildNewAlbumPlaybackQueue,
  buildNewAlbumQueueSource,
  DEFAULT_NEW_ALBUM_AREA,
  formatNewAlbumYear,
  getNewAlbumArtists,
  getNewAlbumLoaderDeps,
  NEW_ALBUM_AREA_OPTIONS,
  NEW_ALBUM_PAGE_SIZE,
  type NewAlbumSearch,
} from '#/features/album/lib/new-album'
import type {
  NeteaseAlbumSummary,
  NeteaseTrack,
} from '#/features/music/api/types'
import { usePlayerStore } from '#/features/player/stores/player-store'
import { remapTracksPlayableStatusForAuth } from '#/lib/music/playability-client'
import { useAuthStore } from '#/features/auth/stores/auth-store'

export const Route = createFileRoute('/new-album')({
  validateSearch: (search: Record<string, unknown>): NewAlbumSearch =>
    getNewAlbumLoaderDeps(search),
  loaderDeps: ({ search }) => getNewAlbumLoaderDeps(search),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      newAlbumsPageQueryOptions({
        area: deps.area,
        limit: NEW_ALBUM_PAGE_SIZE,
        offset: (deps.page - 1) * NEW_ALBUM_PAGE_SIZE,
      }),
    ),
  errorComponent: NewAlbumErrorComponent,
  component: NewAlbumRoute,
})

function NewAlbumCard({
  album,
  area,
}: {
  album: NeteaseAlbumSummary
  area: string
}) {
  const queryClient = useQueryClient()
  const loadQueueAndPlay = usePlayerStore((state) => state.loadQueueAndPlay)
  const [isPlayingAlbum, setIsPlayingAlbum] = useState(false)

  async function handlePlay(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    if (isPlayingAlbum) {
      return
    }

    setIsPlayingAlbum(true)

    try {
      const detail = await queryClient.fetchQuery(albumDetailQueryOptions(album.id))
      const tracks = remapTracksPlayableStatusForAuth(
        (detail.songs ?? []) as NeteaseTrack[],
        useAuthStore.getState(),
      )
      const queue = buildNewAlbumPlaybackQueue(tracks, album)
      const firstPlayableTrack = queue[0]

      if (!firstPlayableTrack) {
        return
      }

      loadQueueAndPlay(
        queue,
        firstPlayableTrack.id,
        buildNewAlbumQueueSource(area),
      )
    } finally {
      setIsPlayingAlbum(false)
    }
  }

  return (
    <article className="new-album-card feature-card">
      <Link
        to="/album/$id"
        params={{ id: String(album.id) }}
        className="new-album-card__link"
      >
        <div className="new-album-card__artwork-shell">
          {album.picUrl ?? album.blurPicUrl ? (
            <img
              src={album.picUrl ?? album.blurPicUrl}
              alt={album.name}
              className="new-album-card__artwork"
              loading="lazy"
            />
          ) : (
            <div className="new-album-card__artwork-placeholder">
              {album.name.slice(0, 1)}
            </div>
          )}

          <button
            type="button"
            onClick={handlePlay}
            disabled={isPlayingAlbum}
            className="new-album-card__play-button"
            aria-label={
              isPlayingAlbum ? `正在播放 ${album.name}` : `播放专辑 ${album.name}`
            }
          >
            <Play size={18} fill="currentColor" />
          </button>
        </div>

        <div className="new-album-card__body">
          <p className="new-album-card__title">{album.name}</p>
          <p className="new-album-card__subtitle">{getNewAlbumArtists(album)}</p>
          <p className="new-album-card__meta">
            {formatNewAlbumYear(album.publishTime)} · Album #{album.id}
          </p>
        </div>
      </Link>
    </article>
  )
}

function NewAlbumRoute() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const albums = Array.isArray(data.albums) ? data.albums : []
  const area = search.area || DEFAULT_NEW_ALBUM_AREA
  const page = search.page || 1
  const hasNextPage = albums.length === NEW_ALBUM_PAGE_SIZE
  const activeAreaLabel =
    NEW_ALBUM_AREA_OPTIONS.find((option) => option.value === area)?.label ?? '欧美'

  function setArea(nextArea: string) {
    void navigate({
      to: '/new-album',
      search: { area: nextArea, page: 1 },
    })
  }

  function setPage(nextPage: number) {
    void navigate({
      to: '/new-album',
      search: { area, page: Math.max(1, nextPage) },
    })
  }

  return (
    <main className="new-album-screen py-10">
      <header className="new-album-header">
        <div className="new-album-header__top">
          <h1 className="new-album-header__title">新专辑</h1>
          <div className="new-album-header__meta">
            <span>{activeAreaLabel}</span>
            <span>·</span>
            <span>{albums.length} 张</span>
            <span>·</span>
            <span>第 {page} 页</span>
          </div>
        </div>

        <div className="new-album-toolbar">
          <div className="new-album-toolbar__areas">
            {NEW_ALBUM_AREA_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setArea(option.value)}
                className={`app-chip cursor-pointer ${option.value === area ? 'new-album-toolbar__chip--active' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="new-album-toolbar__hint">
            当前已进入稳定阶段，后续只保留零碎视觉微调，可直接进入专辑详情或播放整张专辑。
          </p>
        </div>
      </header>

      {albums.length > 0 ? (
        <section className="new-album-grid">
          {albums.map((album) => (
            <NewAlbumCard key={album.id} album={album} area={area} />
          ))}
        </section>
      ) : (
        <section className="new-album-empty island-shell">
          当前区域暂时没有拿到新专辑数据，可以切换区域或稍后再试。
        </section>
      )}

      <section className="new-album-pagination">
        <button
          type="button"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          上一页
        </button>
        <span className="new-album-pagination__status">每页 {NEW_ALBUM_PAGE_SIZE} 张</span>
        <button
          type="button"
          onClick={() => setPage(page + 1)}
          disabled={!hasNextPage}
          className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          下一页
        </button>
      </section>
    </main>
  )
}

function NewAlbumErrorComponent({
  error,
  reset,
}: {
  error: unknown
  reset: () => void
}) {
  return (
    <RouteErrorState
      title="新专辑页面加载失败"
      description="新专辑列表请求失败时，这里会展示明确错误态，并允许你直接重试。"
      error={error}
      reset={reset}
    />
  )
}
