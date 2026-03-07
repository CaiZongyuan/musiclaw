import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Github, Search, Settings } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  hasActiveNeteaseSession,
  useAuthStore,
} from '#/features/auth/stores/auth-store'

const defaultSearch = {
  q: '',
  type: 1018,
  page: 1,
} as const

const DEFAULT_AVATAR_URL =
  'https://s4.music.126.net/style/web2/img/default/default_avatar.jpg?param=60y60'

export default function AppNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { musicU, profile, rawCookie } = useAuthStore(
    useShallow((state) => ({
      musicU: state.musicU,
      profile: state.profile,
      rawCookie: state.rawCookie,
    })),
  )
  const [keywords, setKeywords] = useState('')

  const hasSession = hasActiveNeteaseSession({
    loginMode: null,
    profile,
    musicU,
    csrfToken: null,
    rawCookie,
  })

  useEffect(() => {
    if (location.pathname !== '/search') {
      return
    }

    const search = location.search as { q?: unknown }
    setKeywords(typeof search.q === 'string' ? search.q : '')
  }, [location.pathname, location.search])

  function goBack() {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  function goForward() {
    if (typeof window !== 'undefined') {
      window.history.forward()
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const q = keywords.trim()
    if (!q) {
      return
    }

    void navigate({
      to: '/search',
      search: {
        ...defaultSearch,
        q,
      },
    })
  }

  const avatarUrl = hasSession && profile?.avatarUrl
    ? `${profile.avatarUrl}?param=60y60`
    : DEFAULT_AVATAR_URL

  return (
    <header className="app-navbar">
      <div className="app-navbar__inner page-wrap">
        <div className="app-navbar__buttons">
          <button
            type="button"
            className="app-navbar__icon-button"
            onClick={goBack}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            className="app-navbar__icon-button"
            onClick={goForward}
            aria-label="Go forward"
          >
            <ArrowRight size={18} />
          </button>
        </div>

        <nav className="app-navbar__links" aria-label="Primary">
          <Link
            to="/"
            activeProps={{ className: 'app-navbar__link app-navbar__link--active' }}
            activeOptions={{ exact: true }}
            className="app-navbar__link"
          >
            Home
          </Link>
          <Link
            to="/explore"
            activeProps={{ className: 'app-navbar__link app-navbar__link--active' }}
            className="app-navbar__link"
          >
            Explore
          </Link>
          <Link
            to="/library"
            activeProps={{ className: 'app-navbar__link app-navbar__link--active' }}
            className="app-navbar__link"
          >
            Library
          </Link>
        </nav>

        <div className="app-navbar__right">
          <form className="app-navbar__search" onSubmit={handleSubmit}>
            <Search size={16} className="app-navbar__search-icon" />
            <input
              type="search"
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="Search"
              aria-label="Search songs, albums, artists, playlists"
            />
          </form>

          <a
            href="https://github.com/qier222/YesPlayMusic"
            target="_blank"
            rel="noreferrer"
            className="app-navbar__icon-button app-navbar__icon-link"
            aria-label="Open YesPlayMusic on GitHub"
          >
            <Github size={16} />
          </a>

          <Link
            to="/settings"
            className="app-navbar__icon-button app-navbar__icon-link hidden sm:inline-flex"
            aria-label="Open settings"
          >
            <Settings size={16} />
          </Link>

          <Link
            to={hasSession ? '/settings' : '/login'}
            className="app-navbar__avatar-link"
            aria-label={hasSession ? 'Open user settings' : 'Open login page'}
          >
            <img
              src={avatarUrl}
              alt={hasSession ? profile?.nickname ?? 'User avatar' : 'Default avatar'}
              className="app-navbar__avatar"
              loading="lazy"
            />
          </Link>
        </div>
      </div>
    </header>
  )
}
