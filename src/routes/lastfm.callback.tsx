import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { getLastfmSession } from '#/features/lastfm/api/lastfm-api'
import type { LastfmSession } from '#/features/lastfm/api/lastfm-api'

const LASTFM_STORAGE_KEY = 'lastfm'

type LastfmCallbackState =
  | {
      status: 'pending'
      message: string
    }
  | {
      status: 'missing'
      message: string
    }
  | {
      status: 'success'
      message: string
      session: LastfmSession
    }
  | {
      status: 'failed'
      message: string
    }

export const Route = createFileRoute('/lastfm/callback')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : '',
  }),
  component: LastfmCallbackRoute,
})

function LastfmCallbackRoute() {
  const { token } = Route.useSearch()
  const [state, setState] = useState<LastfmCallbackState>({
    status: 'pending',
    message: '请稍等，正在连接 Last.fm…',
  })

  useEffect(() => {
    if (!token.trim()) {
      setState({
        status: 'missing',
        message: '连接失败，请重试。',
      })
      return
    }

    let cancelled = false

    async function connectLastfm() {
      try {
        const session = await getLastfmSession({ data: { token } })

        if (cancelled) {
          return
        }

        window.localStorage.setItem(LASTFM_STORAGE_KEY, JSON.stringify(session))
        setState({
          status: 'success',
          message: '已成功连接到 Last.fm。',
          session,
        })
      } catch (error) {
        if (cancelled) {
          return
        }

        setState({
          status: 'failed',
          message:
            error instanceof Error
              ? `连接失败：${error.message}`
              : '连接失败，请重试。',
        })
      }
    }

    void connectLastfm()

    return () => {
      cancelled = true
    }
  }, [token])

  function closeWindow() {
    if (typeof window === 'undefined') {
      return
    }

    window.close()
  }

  return (
    <main className="py-10">
      <section className="island-shell mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center rounded-[2rem] px-6 py-10 text-center sm:px-10">
        <div className="mb-6 flex items-center gap-4 text-2xl font-semibold text-[var(--sea-ink)] sm:text-3xl">
          <span>music-claw</span>
          <span className="text-[var(--sea-ink-soft)]">×</span>
          <span>Last.fm</span>
        </div>
        <h1 className="m-0 text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
          {state.status === 'success' ? 'Last.fm 已连接' : 'Last.fm 连接结果'}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--sea-ink-soft)] sm:text-base">
          {state.message}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {state.status === 'success' ? (
            <button type="button" onClick={closeWindow} className="app-chip cursor-pointer">
              完成
            </button>
          ) : null}
          <Link to="/settings" className="app-chip">
            前往设置
          </Link>
          <Link to="/" className="app-chip">
            回到首页
          </Link>
        </div>
        {state.status === 'success' ? (
          <p className="mt-6 text-xs text-[var(--sea-ink-soft)]">
            你现在可以返回应用，继续使用 Last.fm 相关功能。
          </p>
        ) : null}
      </section>
    </main>
  )
}
