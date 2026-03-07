import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Play } from 'lucide-react'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { hasAccountNeteaseSession, useAuthStore } from '#/features/auth/stores/auth-store'
import { dailySongsQueryOptions } from '#/features/home/api/for-you-api'
import { buildPlayerQueueFromTracks } from '#/features/player/lib/player-track'
import { usePlayerStore } from '#/features/player/stores/player-store'

const DEFAULT_COVERS = [
  'https://p2.music.126.net/0-Ybpa8FrDfRgKYCTJD8Xg==/109951164796696795.jpg',
  'https://p2.music.126.net/QxJA2mr4hhb9DZyucIOIQw==/109951165422200291.jpg',
  'https://p1.music.126.net/AhYP9TET8l-VSGOpWAKZXw==/109951165134386387.jpg',
] as const

function getFallbackCover() {
  const dayOfMonth = new Date().getDate()
  return DEFAULT_COVERS[dayOfMonth % DEFAULT_COVERS.length] ?? DEFAULT_COVERS[0]
}

export default function DailyTracksFeatureCard() {
  const navigate = useNavigate()
  const loadQueueAndPlay = usePlayerStore((state) => state.loadQueueAndPlay)
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
  const { data: dailyTracks = [], isFetching } = useQuery({
    ...dailySongsQueryOptions(),
    enabled: hasAccountSession,
  })

  const coverUrl = useMemo(
    () => dailyTracks[0]?.al?.picUrl ?? dailyTracks[0]?.album?.picUrl ?? getFallbackCover(),
    [dailyTracks],
  )

  const trackSummary = useMemo(() => {
    if (!hasAccountSession) {
      return '登录账号后即可像旧版一样直接播放当天推荐歌曲。'
    }

    if (dailyTracks.length === 0) {
      return isFetching
        ? '正在同步今日推荐歌曲…'
        : '今天的推荐歌曲还没加载出来，进入日推页后可以再试一次。'
    }

    return dailyTracks
      .slice(0, 3)
      .map((track) => track.name)
      .join(' · ')
  }, [dailyTracks, hasAccountSession, isFetching])

  return (
    <article
      className="home-daily-card feature-card"
      onClick={() => navigate({ to: '/daily/songs' })}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          navigate({ to: '/daily/songs' })
        }
      }}
    >
      <img
        src={coverUrl}
        alt="每日推荐封面"
        className="home-daily-card__background"
        loading="lazy"
      />
      <div className="home-daily-card__overlay">
        <div className="home-daily-card__title-grid" aria-hidden>
          <span>每</span>
          <span>日</span>
          <span>推</span>
          <span>荐</span>
        </div>
        <div className="home-daily-card__meta">
          <p className="home-feature-card__eyebrow">Daily Tracks</p>
          <p className="home-daily-card__description">{trackSummary}</p>
        </div>
      </div>
      <button
        type="button"
        className="home-daily-card__play-button"
        onClick={(event) => {
          event.stopPropagation()

          if (!hasAccountSession) {
            navigate({ to: '/login/account' })
            return
          }

          if (dailyTracks.length === 0) {
            navigate({ to: '/daily/songs' })
            return
          }

          loadQueueAndPlay(buildPlayerQueueFromTracks(dailyTracks), dailyTracks[0]?.id, { label: '每日推荐', to: '/daily/songs' })
        }}
        aria-label="播放每日推荐"
      >
        <Play size={16} fill="currentColor" />
      </button>
    </article>
  )
}
