import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, ChevronDown, Search } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
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
  const menuRef = useRef<HTMLDivElement | null>(null)
  const { clearSession, loginMode, musicU, profile, rawCookie } = useAuthStore(
    useShallow((state) => ({
      clearSession: state.clearSession,
      loginMode: state.loginMode,
      musicU: state.musicU,
      profile: state.profile,
      rawCookie: state.rawCookie,
    })),
  )
  const [keywords, setKeywords] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const hasSession = hasActiveNeteaseSession({
    loginMode,
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

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      window.addEventListener('mousedown', handlePointerDown)
    }

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
    }
  }, [menuOpen])

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

    setMenuOpen(false)
    void navigate({
      to: '/search',
      search: {
        ...defaultSearch,
        q,
      },
    })
  }

  const avatarUrl =
    hasSession && profile?.avatarUrl
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
            search={{ category: '全部' }}
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
          <form
            className={`app-navbar__search ${isSearchFocused ? 'app-navbar__search--focused' : ''}`}
            onSubmit={handleSubmit}
          >
            <Search size={16} className="app-navbar__search-icon" />
            <input
              type="search"
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder={isSearchFocused ? '' : 'Search'}
              aria-label="Search songs, albums, artists, playlists"
            />
          </form>

          <div ref={menuRef} className="app-navbar__menu-shell">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className={`app-navbar__avatar-button ${menuOpen ? 'app-navbar__avatar-button--open' : ''}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <img
                src={avatarUrl}
                alt={hasSession ? profile?.nickname ?? 'User avatar' : 'Default avatar'}
                className="app-navbar__avatar"
                loading="lazy"
              />
              <ChevronDown size={14} className="app-navbar__avatar-caret" />
            </button>

            {menuOpen ? (
              <div className="app-navbar__menu" role="menu">
                {hasSession ? (
                  <>
                    <div className="app-navbar__menu-header">
                      <p className="app-navbar__menu-title">{profile?.nickname ?? '网易云用户'}</p>
                      <p className="app-navbar__menu-subtitle">
                        {loginMode === 'username' ? '用户名只读模式' : '账号登录'}
                      </p>
                    </div>
                    <Link to="/library" className="app-navbar__menu-item" onClick={() => setMenuOpen(false)}>
                      音乐库
                    </Link>
                    <Link to="/settings" className="app-navbar__menu-item" onClick={() => setMenuOpen(false)}>
                      设置
                    </Link>
                    <button
                      type="button"
                      className="app-navbar__menu-item"
                      onClick={() => {
                        clearSession()
                        setMenuOpen(false)
                      }}
                    >
                      退出当前登录态
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="app-navbar__menu-item" onClick={() => setMenuOpen(false)}>
                      登录入口
                    </Link>
                    <Link
                      to="/login/account"
                      className="app-navbar__menu-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      账号登录
                    </Link>
                    <Link
                      to="/login/username"
                      className="app-navbar__menu-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      用户名模式
                    </Link>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
