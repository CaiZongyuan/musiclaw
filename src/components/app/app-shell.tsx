import type { ReactNode } from 'react'
import PlayerEngine from '#/features/player/components/player-engine'
import AppNavbar from './app-navbar'
import PlayerDock from './player-dock'

export default function AppShell({ children }: { children: ReactNode }) {
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
