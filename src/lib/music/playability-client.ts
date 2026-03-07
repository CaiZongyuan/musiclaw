import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  hasAccountNeteaseSession,
  type AuthStoreSnapshot,
  useAuthStore,
} from '#/features/auth/stores/auth-store'
import type { NeteaseTrack } from '#/features/music/api/types'
import { mapTrackPlayableStatus } from '#/lib/music/playability'

export function resolvePlayabilityOptionsFromAuth(state: AuthStoreSnapshot) {
  return {
    hasCloudPrivilege: hasAccountNeteaseSession(state),
    userVipType: state.profile?.vipType,
  }
}

export function remapTracksPlayableStatusForAuth<TTrack extends NeteaseTrack>(
  tracks: TTrack[] | undefined,
  state: AuthStoreSnapshot,
) {
  return mapTrackPlayableStatus(
    tracks,
    [],
    resolvePlayabilityOptionsFromAuth(state),
  ) as TTrack[]
}

export function usePlayableTracks<TTrack extends NeteaseTrack>(
  tracks: TTrack[] | undefined,
) {
  const authSnapshot = useAuthStore(
    useShallow((state) => ({
      csrfToken: state.csrfToken,
      loginMode: state.loginMode,
      musicU: state.musicU,
      profile: state.profile,
      rawCookie: state.rawCookie,
    })),
  )

  return useMemo(
    () => remapTracksPlayableStatusForAuth(tracks, authSnapshot),
    [
      authSnapshot.csrfToken,
      authSnapshot.loginMode,
      authSnapshot.musicU,
      authSnapshot.profile,
      authSnapshot.rawCookie,
      tracks,
    ],
  )
}
