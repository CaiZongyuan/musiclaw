import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useShallow } from 'zustand/react/shallow'
import RouteErrorState from '#/components/app/route-error-state'
import RoutePlaceholder from '#/components/app/route-placeholder'
import { hasAccountNeteaseSession, useAuthStore } from '#/features/auth/stores/auth-store'
import { dailySongsQueryOptions } from '#/features/home/api/for-you-api'
import type { NeteaseTrack } from '#/features/music/api/types'
import PlayTrackButton from '#/features/player/components/play-track-button'
import { usePlayableTracks } from '#/lib/music/playability-client'

export const Route = createFileRoute('/daily/songs')({
  component: DailySongsRoute,
})

function getTrackCoverUrl(track: NeteaseTrack) {
  return track.al?.picUrl ?? track.album?.picUrl
}

function getTrackArtists(track: NeteaseTrack) {
  return (
    track.ar?.map((artist) => artist.name).join(' / ') ??
    track.artists?.map((artist) => artist.name).join(' / ') ??
    'Unknown artist'
  )
}

function DailySongsRoute() {
  const authSnapshot = useAuthStore(
    useShallow((state) => ({
      csrfToken: state.csrfToken,
      loginMode: state.loginMode,
      musicU: state.musicU,
      profile: state.profile,
      rawCookie: state.rawCookie,
    })),
  )
  const hasAccountSession = hasAccountNeteaseSession(authSnapshot)
  const {
    data: dailyTracks = [],
    error,
    isPending,
    refetch,
  } = useQuery({
    ...dailySongsQueryOptions(),
    enabled: hasAccountSession,
  })
  const playableDailyTracks = usePlayableTracks(dailyTracks)

  if (!hasAccountSession) {
    return (
      <main className="py-10">
        <RoutePlaceholder
          eyebrow="Daily Songs"
          title="账号登录后才能查看每日推荐"
          description="旧版首页的 Daily Tracks 依赖网易云账号态。登录账号后，这里会展示当天推荐歌曲并支持播放全部。"
          actions={
            <Link to="/login/account" className="app-chip">
              去账号登录
            </Link>
          }
        />
      </main>
    )
  }

  if (error) {
    return (
      <main className="py-10">
        <RouteErrorState
          title="每日推荐加载失败"
          description="日推歌曲依赖账号 cookie 和外部 Netease API。你可以重试，或重新登录后再回来。"
          error={error}
          reset={() => {
            void refetch()
          }}
        />
      </main>
    )
  }

  if (isPending) {
    return (
      <main className="py-10">
        <RoutePlaceholder
          eyebrow="Daily Songs"
          title="正在同步今天的推荐歌曲"
          description="正在拉取今天的推荐歌曲。"
        />
      </main>
    )
  }

  return (
    <main className="py-10">
      <RoutePlaceholder
        eyebrow="Daily Songs"
        title="每日推荐"
        description="今天的推荐歌曲已准备好，你可以直接播放全部，或把单曲加入“下一首”。"
        actions={
          playableDailyTracks.length > 0 ? (
            <PlayTrackButton
              track={playableDailyTracks[0]}
              queue={playableDailyTracks}
              source={{ label: '每日推荐', to: '/daily/songs' }}
              className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              label="播放全部"
            />
          ) : null
        }
      >
        {playableDailyTracks.length > 0 ? (
          <div className="mt-8 grid gap-3">
            {playableDailyTracks.map((track, index) => {
              const coverUrl = getTrackCoverUrl(track)

              return (
                <article key={track.id} className="library-track-row">
                  <div className="library-track-row__cover-shell">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={track.name}
                        className="library-track-row__cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="library-track-row__cover-placeholder">
                        {track.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="library-track-row__title">
                      {index + 1}. {track.name}
                    </p>
                    <p className="library-track-row__meta">
                      {getTrackArtists(track)}
                      {track.al?.name || track.album?.name
                        ? ` · ${track.al?.name ?? track.album?.name}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--sea-ink-soft)]">
                      {track.playable === false ? track.reason : 'Daily Tracks'}
                    </span>
                    <PlayTrackButton
                      track={track}
                      queue={playableDailyTracks}
                      source={{ label: '每日推荐', to: '/daily/songs' }}
                      showPlayNext
                      className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] px-6 py-10 text-sm text-[var(--sea-ink-soft)]">
            今天还没有拿到日推歌曲，稍后重试或重新登录后再试一次。
          </div>
        )}
      </RoutePlaceholder>
    </main>
  )
}
