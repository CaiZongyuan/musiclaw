import { Link, createFileRoute } from '@tanstack/react-router'
import { Ellipsis, Play } from 'lucide-react'
import { type MouseEvent, useEffect, useMemo, useState } from 'react'
import RouteErrorState from '#/components/app/route-error-state'
import { getPlaylistDetail } from '#/features/playlist/api/playlist-api'
import type { NeteasePlaylistSummary } from '#/features/music/api/types'
import {
  DEFAULT_EXPLORE_PAGE_SIZE,
  exploreCategoryQueryOptions,
  getExploreCategoryPage,
} from '#/features/explore/api/explore-api'
import {
  buildExploreQueueSource,
  buildVisibleExploreCategories,
  EXPLORE_BIG_CATEGORIES,
  EXPLORE_CATEGORY_STORAGE_KEY,
  getDefaultEnabledExploreCategories,
  normalizeEnabledExploreCategories,
  normalizeExploreCategory,
  exploreCategoryOptions,
} from '#/features/explore/lib/explore-helpers'
import { buildPlayerQueueFromTracks } from '#/features/player/lib/player-track'
import { usePlayerStore } from '#/features/player/stores/player-store'
import {
  remapTracksPlayableStatusForAuth,
} from '#/lib/music/playability-client'
import { useAuthStore } from '#/features/auth/stores/auth-store'

interface ExploreSearch {
  category: string
}

export const Route = createFileRoute('/explore')({
  validateSearch: (search: Record<string, unknown>): ExploreSearch => ({
    category: normalizeExploreCategory(search.category),
  }),
  loaderDeps: ({ search }) => ({ category: search.category }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(exploreCategoryQueryOptions(deps.category)),
  errorComponent: ExploreErrorComponent,
  component: ExploreRoute,
})

function formatPlayCount(playCount?: number) {
  if (!playCount) {
    return '精选推荐'
  }

  if (playCount < 10_000) {
    return `${playCount}`
  }

  if (playCount < 100_000_000) {
    return `${Math.round(playCount / 10_000)} 万`
  }

  return `${(playCount / 100_000_000).toFixed(1)} 亿`
}

function getPlaylistImageUrl(playlist: NeteasePlaylistSummary) {
  return playlist.coverImgUrl ?? playlist.picUrl
}

function getPlaylistSubtitle(category: string, playlist: NeteasePlaylistSummary) {
  if (category === '推荐歌单') {
    return playlist.copywriter ?? '为你挑选的歌单'
  }

  if (category === '排行榜') {
    return playlist.updateFrequency ?? `${playlist.trackCount ?? 0} 首歌曲`
  }

  return null
}

function getNextBeforeCursor(playlists: NeteasePlaylistSummary[]) {
  const nextItem = [...playlists].reverse().find((item) => typeof item.updateTime === 'number')
  return nextItem?.updateTime
}

function ExplorePlaylistCard({
  playlist,
  category,
}: {
  playlist: NeteasePlaylistSummary
  category: string
}) {
  const loadQueueAndPlay = usePlayerStore((state) => state.loadQueueAndPlay)
  const [isPlayingPlaylist, setIsPlayingPlaylist] = useState(false)
  const subtitle = getPlaylistSubtitle(category, playlist)
  const showPlayCount = category !== '排行榜'

  async function handlePlay(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    if (isPlayingPlaylist) {
      return
    }

    setIsPlayingPlaylist(true)

    try {
      const detail = await getPlaylistDetail({ data: { id: playlist.id } })
      const tracks = remapTracksPlayableStatusForAuth(
        detail.playlist.tracks,
        useAuthStore.getState(),
      )
      const playableTracks = tracks.filter((track) => track.playable !== false)
      const firstPlayableTrack = playableTracks[0]

      if (!firstPlayableTrack) {
        return
      }

      loadQueueAndPlay(
        buildPlayerQueueFromTracks(playableTracks),
        firstPlayableTrack.id,
        buildExploreQueueSource(category),
      )
    } finally {
      setIsPlayingPlaylist(false)
    }
  }

  return (
    <article className="explore-card">
      <Link
        to="/playlist/$id"
        params={{ id: String(playlist.id) }}
        className="explore-card__link"
      >
        <div className="explore-card__artwork-shell">
          {getPlaylistImageUrl(playlist) ? (
            <img
              src={getPlaylistImageUrl(playlist)}
              alt={playlist.name}
              className="explore-card__artwork"
              loading="lazy"
            />
          ) : (
            <div className="explore-card__artwork-placeholder">{playlist.name.slice(0, 1)}</div>
          )}

          {showPlayCount ? (
            <span className="explore-card__play-count">▶ {formatPlayCount(playlist.playCount)}</span>
          ) : null}

          <button
            type="button"
            onClick={handlePlay}
            disabled={isPlayingPlaylist}
            className="explore-card__play-button"
            aria-label={isPlayingPlaylist ? `正在播放 ${playlist.name}` : `播放歌单 ${playlist.name}`}
          >
            <Play size={18} fill="currentColor" />
          </button>
        </div>

        <div className="explore-card__text">
          <p className="explore-card__title">{playlist.name}</p>
          {subtitle ? <p className="explore-card__subtitle">{subtitle}</p> : null}
        </div>
      </Link>
    </article>
  )
}

function ExploreRoute() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const activeCategory = normalizeExploreCategory(search.category)
  const authProfile = useAuthStore((state) => state.profile)
  const [playlists, setPlaylists] = useState<NeteasePlaylistSummary[]>(data.playlists)
  const [hasMore, setHasMore] = useState(data.hasMore)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showCatOptions, setShowCatOptions] = useState(false)
  const [enabledCategories, setEnabledCategories] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return getDefaultEnabledExploreCategories()
    }

    const rawValue = window.localStorage.getItem(EXPLORE_CATEGORY_STORAGE_KEY)

    if (!rawValue) {
      return getDefaultEnabledExploreCategories()
    }

    try {
      return normalizeEnabledExploreCategories(JSON.parse(rawValue))
    } catch {
      return getDefaultEnabledExploreCategories()
    }
  })

  useEffect(() => {
    setPlaylists(data.playlists)
    setHasMore(data.hasMore)
    setLoadingMore(false)
  }, [data.hasMore, data.playlists, activeCategory])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      EXPLORE_CATEGORY_STORAGE_KEY,
      JSON.stringify(enabledCategories),
    )
  }, [enabledCategories])

  const visibleCategories = useMemo(
    () => buildVisibleExploreCategories(enabledCategories, activeCategory),
    [activeCategory, enabledCategories],
  )

  function goToCategory(category: string) {
    setShowCatOptions(false)
    void navigate({ to: '/explore', search: { category } })
  }

  function toggleCategory(category: string) {
    setEnabledCategories((current) => {
      if (category === '全部') {
        return current
      }

      if (current.includes(category)) {
        const nextCategories = current.filter((item) => item !== category)
        return nextCategories.length > 0 ? nextCategories : getDefaultEnabledExploreCategories()
      }

      return [...current, category]
    })
  }

  async function handleLoadMore() {
    if (loadingMore || !hasMore) {
      return
    }

    setLoadingMore(true)

    try {
      const nextPage = await getExploreCategoryPage({
        data: {
          category: activeCategory,
          limit: DEFAULT_EXPLORE_PAGE_SIZE,
          offset: playlists.length,
          before: getNextBeforeCursor(playlists),
        },
      })

      setPlaylists((current) => [...current, ...nextPage.playlists])
      setHasMore(nextPage.hasMore)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="explore-screen rise-in">
      <section className="explore-hero">
        <div>
          <p className="explore-hero__eyebrow">Explore</p>
          <h1 className="explore-hero__title">发现</h1>
          <p className="explore-hero__description">
            这一页已经从占位页回到原版的分类发现结构：上方切分类，下方看歌单与榜单，并且可直接从卡片播放。
          </p>
        </div>
        <div className="explore-hero__meta">
          <span className="detail-stat-pill">当前分类：{activeCategory}</span>
          <span className="detail-stat-pill">{playlists.length} 个条目</span>
          {authProfile?.nickname ? (
            <span className="detail-stat-pill">Hi, {authProfile.nickname}</span>
          ) : null}
        </div>
      </section>

      <section className="explore-toolbar">
        <div className="explore-toolbar__chips">
          {visibleCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => goToCategory(category)}
              className={`explore-filter-button ${category === activeCategory && !showCatOptions ? 'explore-filter-button--active' : ''}`}
            >
              {category}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowCatOptions((current) => !current)}
            className={`explore-filter-button explore-filter-button--icon ${showCatOptions ? 'explore-filter-button--active' : ''}`}
            aria-label="更多分类"
          >
            <Ellipsis size={18} />
          </button>
        </div>

        {showCatOptions ? (
          <div className="explore-category-panel island-shell">
            {EXPLORE_BIG_CATEGORIES.map((bigCategory) => {
              const categories = exploreCategoryOptions.filter(
                (item) => item.bigCat === bigCategory,
              )

              return (
                <section key={bigCategory} className="explore-category-panel__group">
                  <h2 className="explore-category-panel__title">{bigCategory}</h2>
                  <div className="explore-category-panel__items">
                    {categories.map((category) => {
                      const isEnabled = enabledCategories.includes(category.name)

                      return (
                        <button
                          key={category.name}
                          type="button"
                          onClick={() => toggleCategory(category.name)}
                          className={`explore-category-option ${isEnabled ? 'explore-category-option--enabled' : ''}`}
                        >
                          {category.name}
                        </button>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        ) : null}
      </section>

      <section className="explore-results">
        <div className="explore-results__header">
          <div>
            <h2 className="explore-results__title">{activeCategory}</h2>
            <p className="explore-results__description">
              {activeCategory === '推荐歌单'
                ? '保留原版推荐歌单入口和文案语义。'
                : activeCategory === '排行榜'
                  ? '这里显示榜单更新频率，不再混成普通歌单列表。'
                  : '继续沿用原版 Explore 的分类歌单浏览路径。'}
            </p>
          </div>
          {(activeCategory === '推荐歌单' || activeCategory === '排行榜') && playlists.length > 0 ? (
            <Link to="/" className="app-chip">
              返回首页
            </Link>
          ) : null}
        </div>

        {playlists.length > 0 ? (
          <div className="explore-cover-grid">
            {playlists.map((playlist) => (
              <ExplorePlaylistCard
                key={`${activeCategory}-${playlist.id}`}
                playlist={playlist}
                category={activeCategory}
              />
            ))}
          </div>
        ) : (
          <div className="explore-empty-state island-shell">
            当前分类暂无内容，可切换别的分类或稍后重试。
          </div>
        )}

        {activeCategory !== '推荐歌单' && activeCategory !== '排行榜' ? (
          <div className="explore-load-more">
            {hasMore ? (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingMore ? '正在加载…' : '加载更多'}
              </button>
            ) : (
              <span className="explore-load-more__end">这个分类已经到底了。</span>
            )}
          </div>
        ) : null}
      </section>
    </div>
  )
}

function ExploreErrorComponent({
  error,
  reset,
}: {
  error: unknown
  reset: () => void
}) {
  return (
    <RouteErrorState
      title="Explore 加载失败"
      description="分类歌单、精品歌单或排行榜请求失败时，这里会保留应用壳并提供重试入口。"
      error={error}
      reset={reset}
    />
  )
}
