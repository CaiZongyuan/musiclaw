import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBrowserJsonStorage } from '#/lib/browser-storage'
import { STORAGE_KEYS } from '#/lib/constants/storage'

export type LoginMode = 'account' | 'username' | null

export interface NeteaseUserProfile {
  userId: number
  nickname: string
  avatarUrl?: string
  vipType?: number
  [key: string]: unknown
}

export interface AuthStoreSnapshot {
  loginMode: LoginMode
  profile: NeteaseUserProfile | null
  musicU: string | null
  csrfToken: string | null
  rawCookie: string | null
}

interface AuthStoreActions {
  clearSession: () => void
  setLoginMode: (loginMode: LoginMode) => void
  setProfile: (profile: NeteaseUserProfile | null) => void
  setSession: (payload: Partial<AuthStoreSnapshot>) => void
}

export type AuthStoreState = AuthStoreSnapshot & AuthStoreActions

export const defaultAuthSnapshot: AuthStoreSnapshot = {
  loginMode: null,
  profile: null,
  musicU: null,
  csrfToken: null,
  rawCookie: null,
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      ...defaultAuthSnapshot,
      clearSession: () => set(defaultAuthSnapshot),
      setLoginMode: (loginMode) => set({ loginMode }),
      setProfile: (profile) => set({ profile }),
      setSession: (payload) => set((state) => ({ ...state, ...payload })),
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createBrowserJsonStorage<AuthStoreSnapshot>(),
      partialize: (state) => ({
        loginMode: state.loginMode,
        profile: state.profile,
        musicU: state.musicU,
        csrfToken: state.csrfToken,
        rawCookie: state.rawCookie,
      }),
    },
  ),
)

export function hasActiveNeteaseSession(state: AuthStoreSnapshot) {
  return Boolean(state.rawCookie || state.musicU)
}
