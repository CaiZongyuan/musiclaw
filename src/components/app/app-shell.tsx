import type { ReactNode } from 'react'
import {
  Disc3,
  House,
  Library,
  ListMusic,
  Search,
  Settings,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import ThemeToggle from '#/components/ThemeToggle'
import PlayerDock from './player-dock'

const defaultSearch = {
  q: '',
  type: 1018,
  page: 1,
} as const

const navigationItems = [
  { to: '/', label: 'Home', icon: House },
  { to: '/search', label: 'Search', icon: Search, search: defaultSearch },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px]">
        <aside className="hidden w-72 shrink-0 border-r border-[var(--line)] px-6 py-8 lg:flex lg:flex-col lg:gap-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-base font-semibold text-[var(--sea-ink)] no-underline"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-[rgba(79,184,178,0.16)] text-[var(--lagoon-deep)] shadow-[0_16px_40px_rgba(30,90,72,0.12)]">
                <Disc3 size={20} />
              </span>
              <span>
                <span className="block">music-claw</span>
                <span className="mt-1 block text-xs font-medium text-[var(--sea-ink-soft)]">
                  YesPlayMusic · Web Rewrite
                </span>
              </span>
            </Link>
          </div>

          <nav className="flex flex-col gap-2">
            {navigationItems.map(({ to, label, icon: Icon, ...linkProps }) => (
              <Link
                key={to}
                to={to}
                {...linkProps}
                activeProps={{ className: 'app-nav-link app-nav-link--active' }}
                className="app-nav-link"
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <section className="island-shell rounded-[1.5rem] p-5">
            <p className="island-kicker mb-3 text-xs tracking-[0.24em] uppercase">
              Migration Focus
            </p>
            <ul className="m-0 space-y-3 pl-5 text-sm text-[var(--sea-ink-soft)]">
              <li>先打通首页、详情页和搜索页</li>
              <li>再接 howler 播放链路与歌词</li>
              <li>最后补登录、用户库和 MV</li>
            </ul>
          </section>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 py-4 backdrop-blur-lg sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="island-kicker mb-1 text-xs tracking-[0.24em] uppercase">
                  Web First
                </p>
                <h1 className="m-0 text-lg font-semibold tracking-tight text-[var(--sea-ink)]">
                  TanStack Start migration workspace
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/search"
                  search={defaultSearch}
                  className="app-chip hidden sm:inline-flex"
                >
                  <Search size={16} />
                  <span>Search</span>
                </Link>
                <Link
                  to="/playlist/$id"
                  params={{ id: '0' }}
                  className="app-chip hidden sm:inline-flex"
                >
                  <ListMusic size={16} />
                  <span>Sample Playlist</span>
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50">
        <PlayerDock />
      </div>
    </div>
  )
}
