import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { hasAccountNeteaseSession, useAuthStore } from '#/features/auth/stores/auth-store'
import { toggleTrackLike } from '#/features/track/api/track-api'
import { likedSongIdsQueryOptions } from '#/features/user/api/user-api'

interface TrackLikeButtonProps {
  trackId?: number | null
  className?: string
}

export default function TrackLikeButton({
  trackId,
  className,
}: TrackLikeButtonProps) {
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

  const hasAccountSession = hasAccountNeteaseSession(authSnapshot)
  const userId = authSnapshot.profile?.userId ?? null
  const { data } = useQuery({
    ...likedSongIdsQueryOptions(userId ?? 0),
    enabled: Boolean(trackId && userId && hasAccountSession),
  })

  const likedSongIds = data?.ids ?? []
  const isLiked = useMemo(
    () => (trackId ? likedSongIds.includes(trackId) : false),
    [likedSongIds, trackId],
  )

  const likeMutation = useMutation({
    mutationFn: async (nextLiked: boolean) => {
      if (!trackId) {
        return null
      }

      return toggleTrackLike(trackId, nextLiked)
    },
    onMutate: async (nextLiked) => {
      if (!userId) {
        return { previous: undefined as number[] | undefined }
      }

      await queryClient.cancelQueries({
        queryKey: ['user', Number(userId), 'liked-song-ids'],
      })

      const previous = queryClient.getQueryData<{ ids: number[] }>([
        'user',
        Number(userId),
        'liked-song-ids',
      ])?.ids

      queryClient.setQueryData<{ code?: number; ids: number[] }>(
        ['user', Number(userId), 'liked-song-ids'],
        (current) => {
          const currentIds = current?.ids ?? []

          return {
            ...current,
            ids: nextLiked
              ? [...currentIds.filter((id) => id !== trackId), trackId!]
              : currentIds.filter((id) => id !== trackId),
          }
        },
      )

      return { previous }
    },
    onError: (_error, _nextLiked, context) => {
      if (!userId || context?.previous === undefined) {
        return
      }

      queryClient.setQueryData(
        ['user', Number(userId), 'liked-song-ids'],
        { ids: context.previous },
      )
    },
    onSettled: async () => {
      if (!userId) {
        return
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['user', Number(userId), 'liked-song-ids'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['user', Number(userId)],
        }),
        queryClient.invalidateQueries({
          queryKey: ['playlist'],
        }),
      ])
    },
  })

  const buttonLabel = isLiked ? '取消喜欢当前歌曲' : '喜欢当前歌曲'

  return (
    <button
      type="button"
      onClick={() => {
        if (!trackId) {
          return
        }

        if (!hasAccountSession || !userId) {
          void navigate({ to: '/login/account' })
          return
        }

        likeMutation.mutate(!isLiked)
      }}
      className={className}
      aria-label={buttonLabel}
      aria-pressed={isLiked}
      disabled={!trackId || likeMutation.isPending}
      title={buttonLabel}
    >
      <Heart
        size={16}
        fill={isLiked ? 'currentColor' : 'none'}
        className={isLiked ? 'player-dock__like-icon player-dock__like-icon--active' : 'player-dock__like-icon'}
      />
    </button>
  )
}
