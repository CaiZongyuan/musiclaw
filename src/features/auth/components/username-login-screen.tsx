import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { LoaderCircle, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  searchUsersByNickname,
  type NeteaseSearchUserProfile,
} from '#/features/auth/api/auth-api'
import { hasActiveNeteaseSession, useAuthStore } from '#/features/auth/stores/auth-store'

const DEFAULT_AVATAR_URL =
  'https://s4.music.126.net/style/web2/img/default/default_avatar.jpg?param=120y120'

export default function UsernameLoginScreen() {
  const navigate = useNavigate()
  const { clearSession, loginMode, musicU, profile, rawCookie, setSession } = useAuthStore(
    useShallow((state) => ({
      clearSession: state.clearSession,
      loginMode: state.loginMode,
      musicU: state.musicU,
      profile: state.profile,
      rawCookie: state.rawCookie,
      setSession: state.setSession,
    })),
  )

  const [keyword, setKeyword] = useState('')
  const [activeUserId, setActiveUserId] = useState<number | null>(null)
  const [result, setResult] = useState<NeteaseSearchUserProfile[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const hasSession = hasActiveNeteaseSession({
    loginMode,
    profile,
    musicU,
    csrfToken: null,
    rawCookie,
  })

  const activeUser = useMemo(
    () => result.find((user) => user.userId === activeUserId) ?? result[0] ?? null,
    [activeUserId, result],
  )

  const searchMutation = useMutation({
    mutationFn: (value: string) => searchUsersByNickname(value, 9),
    onSuccess: (users) => {
      setResult(users)
      setActiveUserId(users[0]?.userId ?? null)
      if (users.length === 0) {
        setErrorMessage('没有找到匹配的网易云用户')
        return
      }

      setErrorMessage(null)
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : '用户搜索失败，请稍后重试')
    },
  })

  function handleSearch() {
    if (!keyword.trim()) {
      setErrorMessage('请输入用户名关键词')
      return
    }

    setErrorMessage(null)
    searchMutation.mutate(keyword.trim())
  }

  function handleConfirm() {
    if (!activeUser) {
      setErrorMessage('请先选择一个用户')
      return
    }

    setSession({
      loginMode: 'username',
      profile: {
        userId: activeUser.userId,
        nickname: activeUser.nickname,
        avatarUrl: activeUser.avatarUrl,
        vipType: activeUser.vipType,
      },
      rawCookie: null,
      musicU: null,
      csrfToken: null,
    })
    void navigate({ to: '/library' })
  }

  if (hasSession) {
    return (
      <main className="py-10">
        <section className="island-shell rounded-[2rem] p-6 sm:p-8">
          <p className="island-kicker mb-3">Login Username</p>
          <h1 className="display-title m-0 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
            当前已有登录态
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--sea-ink-soft)] sm:text-base">
            如果你想重新选择用户，可先清空本地登录态，再重新进入用户名模式。
          </p>
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
            <Link to="/login" className="app-chip">
              返回登录入口
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="login-screen py-10">
      <section className="island-shell rounded-[2rem] p-6 sm:p-8">
        <div className="login-shell__hero">
          <p className="island-kicker mb-3">Login Username</p>
          <h1 className="display-title m-0 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
            查找用户名进入音乐库
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--sea-ink-soft)] sm:text-base">
            对齐旧版 `/login/username`。该模式只写入公开用户资料，不持有账号 cookie，因此更适合只读浏览。
          </p>
        </div>

        <section className="login-panel mt-8">
          <div className="login-username-search">
            <label className="login-field login-field--full">
              <span>搜索用户名</span>
              <div className="login-username-search__box">
                <Search size={18} className="text-[var(--sea-ink-soft)]" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="输入昵称关键字"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                />
              </div>
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSearch}
                disabled={searchMutation.isPending}
                className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {searchMutation.isPending ? '搜索中…' : '搜索'}
              </button>
              <Link to="/login" className="app-chip">
                返回登录入口
              </Link>
            </div>
          </div>

          <div className="login-username-result mt-8">
            <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
              {result.length > 0 ? '请选择一个用户' : '搜索结果会显示在这里'}
            </p>

            {searchMutation.isPending ? (
              <div className="login-username-empty mt-4">
                <LoaderCircle size={20} className="animate-spin" />
                <span>正在搜索用户…</span>
              </div>
            ) : result.length > 0 ? (
              <div className="login-username-grid mt-4">
                {result.map((user) => {
                  const isActive = user.userId === (activeUser?.userId ?? null)

                  return (
                    <button
                      key={user.userId}
                      type="button"
                      onClick={() => setActiveUserId(user.userId)}
                      className={`login-user-card ${isActive ? 'login-user-card--active' : ''}`}
                    >
                      <img
                        src={user.avatarUrl ? `${user.avatarUrl}?param=120y120` : DEFAULT_AVATAR_URL}
                        alt={user.nickname}
                        className="login-user-card__avatar"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1 text-left">
                        <p className="login-user-card__name">{user.nickname}</p>
                        <p className="login-user-card__signature">
                          {user.signature || '这个用户没有公开签名'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="login-username-empty mt-4">
                <span>输入关键字后搜索网易云用户，再选择一个进入音乐库。</span>
              </div>
            )}
          </div>

          {activeUser ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={handleConfirm} className="app-chip cursor-pointer">
                进入音乐库
              </button>
            </div>
          ) : null}
        </section>

        {errorMessage ? (
          <div className="login-error mt-6 rounded-[1.25rem] border border-[rgba(220,38,38,0.18)] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[rgb(153,27,27)] dark:text-[rgb(254,202,202)]">
            {errorMessage}
          </div>
        ) : null}
      </section>
    </main>
  )
}
