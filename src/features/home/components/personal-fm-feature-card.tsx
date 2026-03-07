import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Pause, Play, SkipForward, ThumbsDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { hasAccountNeteaseSession, useAuthStore } from '#/features/auth/stores/auth-store'
import {
  fetchPersonalFm,
  personalFmQueryOptions,
  trashPersonalFm,
} from '#/features/home/api/for-you-api'
import { buildPlayerQueueFromTracks } from '#/features/player/lib/player-track'
import { usePlayerStore } from '#/features/player/stores/player-store'

export default function PersonalFmFeatureCard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const authSnapshot = useAuthStore(
    useShallow((state) => ({
      csrfToken: state.csrfToken,
      loginMode: state.loginMode,
      musicU: state.musicU,
      profile: state.profile,
      rawCookie: state.rawCookie,
    })),
  )
  const { currentTrackId, isPlaying, loadQueueAndPlay, pause } = usePlayerStore(
    useShallow((state) => ({
      currentTrackId: state.currentTrackId,
      isPlaying: state.isPlaying,
      loadQueueAndPlay: state.loadQueueAndPlay,
      pause: state.pause,
    })),
  )

  const hasAccountSession = hasAccountNeteaseSession(authSnapshot)
  const { data: fmTracks = [], isFetching, refetch } = useQuery({
    ...personalFmQueryOptions(),
    enabled: hasAccountSession,
  })
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
  }, [fmTracks])

  const activeTrack = fmTracks[activeIndex] ?? fmTracks[0] ?? null
  const activeArtists = useMemo(() => {
    if (!activeTrack) {
      return ''
    }

    return (
      activeTrack.artists?.map((artist) => artist.name).join(' / ') ??
      activeTrack.ar?.map((artist) => artist.name).join(' / ') ??
      'Unknown artist'
    )
  }, [activeTrack])
  const albumId = activeTrack?.album?.id ?? activeTrack?.al?.id
  const albumName = activeTrack?.album?.name ?? activeTrack?.al?.name
  const albumCover = activeTrack?.album?.picUrl ?? activeTrack?.al?.picUrl
  const isCurrentTrackPlaying = Boolean(activeTrack && currentTrackId === activeTrack.id && isPlaying)

  const trashMutation = useMutation({
    mutationFn: trashPersonalFm,
    onSuccess: async () => {
      const nextTracks = await queryClient.fetchQuery({
        ...personalFmQueryOptions(),
        queryFn: fetchPersonalFm,
      })

      setActiveIndex(0)

      if (nextTracks[0]) {
        loadQueueAndPlay(buildPlayerQueueFromTracks(nextTracks), nextTracks[0].id, { label: '私人 FM' })
      }
    },
  })

  const handlePlay = () => {
    if (!hasAccountSession) {
      navigate({ to: '/login/account' })
      return
    }

    if (!activeTrack || fmTracks.length === 0) {
      void refetch()
      return
    }

    if (isCurrentTrackPlaying) {
      pause()
      return
    }

    loadQueueAndPlay(buildPlayerQueueFromTracks(fmTracks), activeTrack.id, { label: '私人 FM' })
  }

  const handleNext = async () => {
    if (!hasAccountSession) {
      navigate({ to: '/login/account' })
      return
    }

    if (fmTracks.length === 0) {
      const result = await refetch()
      const nextTracks = result.data ?? []

      if (nextTracks[0]) {
        loadQueueAndPlay(buildPlayerQueueFromTracks(nextTracks), nextTracks[0].id, { label: '私人 FM' })
      }

      return
    }

    const nextTrack = fmTracks[activeIndex + 1]

    if (nextTrack) {
      setActiveIndex(activeIndex + 1)
      loadQueueAndPlay(buildPlayerQueueFromTracks(fmTracks), nextTrack.id, { label: '私人 FM' })
      return
    }

    const result = await refetch()
    const nextTracks = result.data ?? []

    if (nextTracks[0]) {
      loadQueueAndPlay(buildPlayerQueueFromTracks(nextTracks), nextTracks[0].id, { label: '私人 FM' })
    }
  }

  return (
    <section className="home-fm-card feature-card">
      <div className="home-fm-card__cover-shell">
        {albumId && albumCover ? (
          <Link
            to="/album/$id"
            params={{ id: String(albumId) }}
            className="home-fm-card__cover-link"
          >
            <img
              src={albumCover}
              alt={activeTrack?.name ?? 'Personal FM'}
              className="home-fm-card__cover"
              loading="lazy"
            />
          </Link>
        ) : (
          <div className="home-fm-card__cover-placeholder">FM</div>
        )}
      </div>

      <div className="home-fm-card__body">
        <div>
          <p className="home-feature-card__eyebrow">Personal FM</p>
          <h3 className="home-feature-card__title home-fm-card__title">
            {activeTrack?.name ?? (hasAccountSession ? '私人 FM 正在待命' : '登录后开启私人 FM')}
          </h3>
          <p className="home-feature-card__description home-fm-card__description">
            {!hasAccountSession
              ? '旧版首页的 FM 卡片依赖账号态；登录后这里会直接显示当前 FM 歌曲并允许切歌。'
              : activeTrack
                ? `${activeArtists}${albumName ? ` · ${albumName}` : ''}`
                : isFetching
                  ? '正在拉取私人 FM…'
                  : '暂时没有拿到 FM 歌曲，可以稍后重试。'}
          </p>
        </div>

        <div className="home-fm-card__controls">
          <div className="home-fm-card__buttons">
            <button
              type="button"
              className="home-fm-card__button"
              onClick={() => {
                if (!activeTrack) {
                  navigate({ to: '/login/account' })
                  return
                }

                void trashMutation.mutateAsync(activeTrack.id)
              }}
              disabled={!hasAccountSession || !activeTrack || trashMutation.isPending}
              aria-label="不喜欢这首 FM"
            >
              <ThumbsDown size={16} />
            </button>
            <button
              type="button"
              className="home-fm-card__button home-fm-card__button--primary"
              onClick={handlePlay}
              disabled={hasAccountSession && !activeTrack && isFetching}
              aria-label={isCurrentTrackPlaying ? '暂停私人 FM' : '播放私人 FM'}
            >
              {isCurrentTrackPlaying ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
            </button>
            <button
              type="button"
              className="home-fm-card__button"
              onClick={() => void handleNext()}
              disabled={!hasAccountSession || isFetching}
              aria-label="下一首私人 FM"
            >
              <SkipForward size={16} />
            </button>
          </div>

          <p className="home-fm-card__label">私人 FM</p>
        </div>
      </div>
    </section>
  )
}
