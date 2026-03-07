import { Link, createFileRoute } from '@tanstack/react-router'
import RouteErrorState from '#/components/app/route-error-state'
import { homePageQueryOptions } from '#/features/home/api/home-api'
import DailyTracksFeatureCard from '#/features/home/components/daily-tracks-feature-card'
import PersonalFmFeatureCard from '#/features/home/components/personal-fm-feature-card'
import { byAppleMusic } from '#/features/home/lib/static-data'
import type {
  NeteaseAlbumSummary,
  NeteaseArtistSummary,
  NeteasePlaylistSummary,
} from '#/features/music/api/types'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(homePageQueryOptions(10)),
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
        <div className="home-cover-grid">
          {byAppleMusic.map((playlist) => (
            <HomeCoverCard
              key={playlist.id}
              imageUrl={playlist.coverImgUrl}
              title={playlist.name}
              subtitle="Apple Music"
              to="/playlist/$id"
              params={{ id: String(playlist.id) }}
            />
          ))}
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
          <DailyTracksFeatureCard />
          <PersonalFmFeatureCard />
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
