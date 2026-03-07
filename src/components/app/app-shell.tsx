import { useEffect, type ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { fetchUserAccount } from '#/features/auth/api/auth-api'
import { hasAccountNeteaseSession, useAuthStore } from '#/features/auth/stores/auth-store'
import PlayerEngine from '#/features/player/components/player-engine'
import { useSettingsStore } from '#/features/settings/stores/settings-store'
import {
  applyThemeMode,
  persistLegacyThemeMode,
} from '#/features/settings/lib/theme'
import AppNavbar from './app-navbar'
import PlayerDock from './player-dock'

export default function AppShell({ children }: { children: ReactNode }) {
  const theme = useSettingsStore((state) => state.theme)
  const { loginMode, musicU, profile, rawCookie, setSession } = useAuthStore(
    useShallow((state) => ({
      loginMode: state.loginMode,
      musicU: state.musicU,
      profile: state.profile,
      rawCookie: state.rawCookie,
      setSession: state.setSession,
    })),
  )

  useEffect(() => {
    if (!hasAccountNeteaseSession({ loginMode, musicU, profile, rawCookie, csrfToken: null })) {
      return
    }

    let cancelled = false

    void fetchUserAccount()
      .then((accountResult) => {
        if (cancelled || !accountResult.profile) {
          return
        }

        setSession({
          profile: {
            ...(profile ?? {}),
            ...accountResult.profile,
          },
        })
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [loginMode, musicU, profile, rawCookie, setSession])

  useEffect(() => {
    applyThemeMode(theme)
    persistLegacyThemeMode(theme)
  }, [theme])

  return (
    <div className="app-shell min-h-screen pb-36 md:pb-44">
      <AppNavbar />

      <div className="app-shell__content">
        <main className="app-shell__main page-wrap">{children}</main>
      </div>

      <PlayerEngine />

      <div className="fixed inset-x-0 bottom-0 z-50">
        <PlayerDock />
      </div>
    </div>
  )
}
