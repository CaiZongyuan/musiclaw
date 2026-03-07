import { Link, createFileRoute } from '@tanstack/react-router'
import RouteErrorState from '#/components/app/route-error-state'
import { homePageQueryOptions } from '#/features/home/api/home-api'
import type {
  NeteaseAlbumSummary,
  NeteaseArtistSummary,
  NeteasePlaylistSummary,
} from '#/features/music/api/types'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(homePageQueryOptions(8)),
  errorComponent: HomeErrorComponent,
  component: HomeRoute,
})

function ensureArray<TItem>(value: unknown): TItem[] {
  return Array.isArray(value) ? (value as TItem[]) : []
}

function formatPlayCount(playCount?: number) {
  if (!playCount || playCount < 10_000) {
    return playCount ? `${playCount}` : '精选推荐'
  }

  return `${Math.round(playCount / 10_000)} 万播放`
}

function HomeSectionHeader({
  title,
  moreTo,
  moreSearch,
}: {
  title: string
  moreTo?: '/explore' | '/new-album'
  moreSearch?: Record<string, string>
}) {
  return (
    <div className="home-row__header">
      <h2 className="home-row__title">{title}</h2>
      {moreTo ? (
        <Link to={moreTo} search={moreSearch} className="home-row__more">
          See more
        </Link>
      ) : null}
    </div>
  )
}

function HomeCoverCard({
  imageUrl,
  title,
  subtitle,
  to,
  params,
}: {
  imageUrl?: string
  title: string
  subtitle: string
  to: '/playlist/$id' | '/album/$id' | '/artist/$id'
  params: { id: string }
}) {
  return (
    <Link to={to} params={params} className="home-cover-card feature-card">
      <div className="home-cover-card__artwork-shell">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="home-cover-card__artwork"
            loading="lazy"
          />
        ) : (
          <div className="home-cover-card__artwork-placeholder">{title.slice(0, 1)}</div>
        )}
      </div>
      <div className="min-w-0">
        <p className="home-cover-card__title">{title}</p>
        <p className="home-cover-card__subtitle">{subtitle}</p>
      </div>
    </Link>
  )
}

function HomeFeatureCard({
  title,
  subtitle,
  description,
  to,
}: {
  title: string
  subtitle: string
  description: string
  to: '/daily/songs' | '/login'
}) {
  return (
    <Link to={to} className="home-feature-card feature-card">
      <p className="home-feature-card__eyebrow">{subtitle}</p>
      <h3 className="home-feature-card__title">{title}</h3>
      <p className="home-feature-card__description">{description}</p>
    </Link>
  )
}

function HomeRoute() {
  const data = Route.useLoaderData()

  const recommendedPlaylists = ensureArray<NeteasePlaylistSummary>(
    data.recommendedPlaylists.result,
  )
  const toplists = ensureArray<NeteasePlaylistSummary>(data.toplists.list)
  const newAlbums = ensureArray<NeteaseAlbumSummary>(data.newAlbums.albums)
  const topArtists = ensureArray<NeteaseArtistSummary>(data.topArtists.artists)

  return (
    <div className="home-screen rise-in">
      <section className="home-row home-row--first">
        <HomeSectionHeader title="by Apple Music" />
        <div className="home-editorial-strip">
          <article className="home-editorial-card feature-card">
            <p className="home-feature-card__eyebrow">Editorial Row</p>
            <h3 className="home-feature-card__title">原版首屏卡片区已重新纳入复刻范围</h3>
            <p className="home-feature-card__description">
              这一行先作为结构占位，后续会按旧版静态数据与文案继续收口。
            </p>
          </article>
          <article className="home-editorial-card feature-card">
            <p className="home-feature-card__eyebrow">UI Parity</p>
            <h3 className="home-feature-card__title">首页从仪表盘式布局改回纵向内容流</h3>
            <p className="home-feature-card__description">
              先对齐原版的区块顺序、标题节奏、卡片密度，再补齐每一块的真实细节。
            </p>
          </article>
        </div>
      </section>

      <section className="home-row">
        <HomeSectionHeader
          title="推荐歌单"
          moreTo="/explore"
          moreSearch={{ category: '推荐歌单' }}
        />
        <div className="home-cover-grid">
          {recommendedPlaylists.slice(0, 10).map((playlist) => (
            <HomeCoverCard
              key={playlist.id}
              imageUrl={playlist.picUrl ?? playlist.coverImgUrl}
              title={playlist.name}
              subtitle={playlist.copywriter ?? formatPlayCount(playlist.playCount)}
              to="/playlist/$id"
              params={{ id: String(playlist.id) }}
            />
          ))}
        </div>
      </section>

      <section className="home-row">
        <HomeSectionHeader title="For You" />
        <div className="home-feature-grid">
          <HomeFeatureCard
            title="Daily Tracks"
            subtitle="Daily Recommendation"
            description="对齐旧版首页里的每日推荐入口，下一轮继续补日推真实数据与登录态校验。"
            to="/daily/songs"
          />
          <HomeFeatureCard
            title="Personal FM"
            subtitle="Radio"
            description="保留旧版首页双卡片结构，这一块后续接回 FM 业务链路与交互细节。"
            to="/login"
          />
        </div>
      </section>

      <section className="home-row">
        <HomeSectionHeader title="推荐歌手" />
        <div className="home-cover-grid home-cover-grid--artists">
          {topArtists.slice(0, 6).map((artist) => (
            <HomeCoverCard
              key={artist.id}
              imageUrl={artist.picUrl ?? artist.img1v1Url ?? artist.cover}
              title={artist.name}
              subtitle={artist.alias?.join(' / ') || 'Artist'}
              to="/artist/$id"
              params={{ id: String(artist.id) }}
            />
          ))}
        </div>
      </section>

      <section className="home-row">
        <HomeSectionHeader title="新专辑" moreTo="/new-album" />
        <div className="home-cover-grid">
          {newAlbums.slice(0, 10).map((album) => (
            <HomeCoverCard
              key={album.id}
              imageUrl={album.picUrl ?? album.blurPicUrl}
              title={album.name}
              subtitle={
                album.artist?.name ??
                album.artists?.map((artist) => artist.name).join(' / ') ??
                'Unknown artist'
              }
              to="/album/$id"
              params={{ id: String(album.id) }}
            />
          ))}
        </div>
      </section>

      <section className="home-row">
        <HomeSectionHeader
          title="排行榜"
          moreTo="/explore"
          moreSearch={{ category: '排行榜' }}
        />
        <div className="home-cover-grid">
          {toplists.slice(0, 5).map((playlist) => (
            <HomeCoverCard
              key={playlist.id}
              imageUrl={playlist.coverImgUrl ?? playlist.picUrl}
              title={playlist.name}
              subtitle={playlist.copywriter ?? `${playlist.trackCount ?? 0} tracks`}
              to="/playlist/$id"
              params={{ id: String(playlist.id) }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function HomeErrorComponent({
  error,
  reset,
}: {
  error: unknown
  reset: () => void
}) {
  return (
    <RouteErrorState
      title="首页加载失败"
      description="推荐歌单、榜单、新专辑或歌手榜请求失败时，首页现在会显示可恢复的错误态。"
      error={error}
      reset={reset}
    />
  )
}
