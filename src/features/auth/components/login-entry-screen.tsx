import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, LockKeyhole, Search, UserRound } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { hasActiveNeteaseSession, useAuthStore } from '#/features/auth/stores/auth-store'

const DEFAULT_AVATAR_URL =
  'https://s4.music.126.net/style/web2/img/default/default_avatar.jpg?param=120y120'

const loginEntries = [
  {
    to: '/login/account' as const,
    title: '登录网易云账号',
    description: '支持二维码、手机号和邮箱登录，进入完整音乐库与用户态页面。',
    icon: LockKeyhole,
  },
  {
    to: '/login/username' as const,
    title: '仅查找用户名',
    description: '搜索用户并进入公开音乐库，不会影响当前账号数据。',
    icon: Search,
  },
]

export default function LoginEntryScreen() {
  const navigate = useNavigate()
  const { clearSession, loginMode, musicU, profile, rawCookie } = useAuthStore(
    useShallow((state) => ({
      clearSession: state.clearSession,
      loginMode: state.loginMode,
      musicU: state.musicU,
      profile: state.profile,
      rawCookie: state.rawCookie,
    })),
  )

  const hasSession = hasActiveNeteaseSession({
    loginMode,
    profile,
    musicU,
    csrfToken: null,
    rawCookie,
  })

  if (hasSession) {
    return (
      <main className="py-10">
        <section className="island-shell rounded-[2rem] p-6 sm:p-8">
          <p className="island-kicker mb-3">Login</p>
          <h1 className="display-title m-0 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
            你已经登录了
          </h1>
          <div className="mt-6 flex items-center gap-4 rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.45)] p-4 sm:max-w-xl">
            <img
              src={profile?.avatarUrl ? `${profile.avatarUrl}?param=120y120` : DEFAULT_AVATAR_URL}
              alt={profile?.nickname ?? 'User avatar'}
              className="h-16 w-16 rounded-full border border-[var(--line)] object-cover"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
                {profile?.nickname ?? '网易云用户'}
              </p>
              <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                当前模式：{loginMode === 'username' ? '用户名只读模式' : '账号登录'}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void navigate({ to: '/library' })}
              className="app-chip cursor-pointer"
            >
              进入音乐库
            </button>
            <button type="button" onClick={clearSession} className="app-chip cursor-pointer">
              清空本地登录态
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="login-screen py-10">
      <section className="island-shell rounded-[2rem] p-6 sm:p-8">
        <div className="login-shell__hero">
          <p className="island-kicker mb-3">Login</p>
          <h1 className="display-title m-0 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
            选择登录方式
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--sea-ink-soft)] sm:text-base">
            账号登录可使用完整功能，用户名模式适合浏览公开内容。
          </p>
        </div>

        <div className="login-entry-grid mt-8">
          {loginEntries.map(({ to, title, description, icon: Icon }) => (
            <Link key={to} to={to} className="login-entry-card">
              <div className="login-entry-card__icon">
                <Icon size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="login-entry-card__title">{title}</p>
                <p className="login-entry-card__description">{description}</p>
              </div>
              <ArrowRight size={18} className="text-[var(--sea-ink-soft)]" />
            </Link>
          ))}
        </div>

        <div className="login-entry-note mt-8 rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.42)] p-5">
          <div className="flex items-center gap-3">
            <span className="login-entry-card__icon h-11 w-11">
              <UserRound size={18} />
            </span>
            <div>
              <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">也可以直接访问登录分支</p>
              <p className="mt-1 text-sm leading-6 text-[var(--sea-ink-soft)]">
                你也可以直接访问 `/login/account` 或 `/login/username`。
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
