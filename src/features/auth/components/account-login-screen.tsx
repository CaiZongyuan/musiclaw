import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import QRCode from 'qrcode'
import { LoaderCircle, Mail, QrCode, Smartphone } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  extractCookieValue,
  fetchUserAccount,
  loginQrCodeCheck,
  loginQrCodeKey,
  loginWithEmail,
  loginWithPhone,
  sanitizeSerializedCookie,
} from '#/features/auth/api/auth-api'
import {
  hasActiveNeteaseSession,
  useAuthStore,
} from '#/features/auth/stores/auth-store'

type LoginMode = 'qr' | 'phone' | 'email'

export default function AccountLoginScreen() {
  const navigate = useNavigate()
  const { clearSession, loginMode, profile, rawCookie, setLoginMode, setSession } = useAuthStore(
    useShallow((state) => ({
      clearSession: state.clearSession,
      loginMode: state.loginMode,
      profile: state.profile,
      rawCookie: state.rawCookie,
      setLoginMode: state.setLoginMode,
      setSession: state.setSession,
    })),
  )

  const [mode, setMode] = useState<LoginMode>('qr')
  const [countryCode, setCountryCode] = useState('+86')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [qrKey, setQrKey] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [qrMessage, setQrMessage] = useState('打开网易云音乐 APP 扫码登录')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [qrRefreshSeed, setQrRefreshSeed] = useState(0)

  const hasSession = hasActiveNeteaseSession({
    loginMode,
    profile,
    musicU: extractCookieValue(rawCookie ?? '', 'MUSIC_U'),
    csrfToken: extractCookieValue(rawCookie ?? '', '__csrf'),
    rawCookie,
  })

  async function finalizeLogin(cookie: string | undefined) {
    if (!cookie) {
      throw new Error('登录成功但没有拿到 cookie，请检查后端登录接口返回')
    }

    const sanitizedCookie = sanitizeSerializedCookie(cookie)
    const musicU = extractCookieValue(sanitizedCookie, 'MUSIC_U')
    const csrfToken = extractCookieValue(sanitizedCookie, '__csrf')

    setLoginMode('account')
    setSession({
      loginMode: 'account',
      rawCookie: sanitizedCookie,
      musicU,
      csrfToken,
    })

    try {
      const accountResult = await fetchUserAccount()
      setSession({
        profile: accountResult.profile ?? null,
      })
    } catch {
      setSession({
        profile: null,
      })
    }

    void navigate({ to: '/library' })
  }

  const accountMutation = useMutation({
    mutationFn: async (payload: {
      mode: 'phone' | 'email'
      identifier: string
      password: string
      countrycode?: string
    }) => {
      if (payload.mode === 'phone') {
        return loginWithPhone({
          phone: payload.identifier,
          password: payload.password,
          countrycode: payload.countrycode,
        })
      }

      return loginWithEmail({
        email: payload.identifier,
        password: payload.password,
      })
    },
    onSuccess: async (result) => {
      if (result.code !== 200) {
        setErrorMessage(result.msg ?? result.message ?? '账号或密码错误，请检查')
        return
      }

      try {
        await finalizeLogin(result.cookie)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : '登录失败，请稍后重试')
      }
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : '登录失败，请稍后重试')
    },
  })

  const isBusy = accountMutation.isPending

  useEffect(() => {
    let cancelled = false

    async function prepareQrCode() {
      if (mode !== 'qr') {
        return
      }

      try {
        const result = await loginQrCodeKey()
        const nextQrKey = result.data?.unikey

        if (!nextQrKey || cancelled) {
          return
        }

        setQrKey(nextQrKey)
        setQrCodeUrl(
          await QRCode.toDataURL(`https://music.163.com/login?codekey=${nextQrKey}`, {
            width: 220,
            margin: 0,
            color: {
              dark: '#335eea',
              light: '#00000000',
            },
          }),
        )
        setQrMessage('打开网易云音乐 APP 扫码登录')
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : '二维码生成失败')
        }
      }
    }

    void prepareQrCode()

    return () => {
      cancelled = true
    }
  }, [mode, qrRefreshSeed])

  useEffect(() => {
    if (mode !== 'qr' || !qrKey) {
      return
    }

    const timer = window.setInterval(async () => {
      try {
        const result = await loginQrCodeCheck(qrKey)

        if (result.code === 800) {
          setQrMessage('二维码已失效，正在重新生成…')
          setQrKey('')
          setQrCodeUrl('')
          setQrRefreshSeed((value) => value + 1)
          return
        }

        if (result.code === 801) {
          setQrMessage('打开网易云音乐 APP 扫码登录')
          return
        }

        if (result.code === 802) {
          setQrMessage('扫描成功，请在手机上确认登录')
          return
        }

        if (result.code === 803) {
          window.clearInterval(timer)
          setQrMessage('登录成功，正在进入音乐库…')
          await finalizeLogin(result.cookie)
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : '二维码状态检查失败')
      }
    }, 1200)

    return () => {
      window.clearInterval(timer)
    }
  }, [mode, qrKey])

  const loginCards = useMemo(
    () => [
      {
        key: 'qr' as const,
        title: '二维码登录',
        description: '与旧版一致，优先保留网易云 APP 扫码登录链路。',
        icon: QrCode,
      },
      {
        key: 'phone' as const,
        title: '手机号登录',
        description: '输入区号、手机号与密码，直接写入本地账号态。',
        icon: Smartphone,
      },
      {
        key: 'email' as const,
        title: '邮箱登录',
        description: '保留旧版账号登录分支，便于对齐 YesPlayMusic 路径。',
        icon: Mail,
      },
    ],
    [],
  )

  function handleAccountLogin() {
    setErrorMessage(null)

    if (mode === 'phone') {
      if (!countryCode.trim() || !phone.trim() || !password.trim()) {
        setErrorMessage('请输入国家区号、手机号和密码')
        return
      }

      accountMutation.mutate({
        mode: 'phone',
        identifier: phone.trim(),
        password: password.trim(),
        countrycode: countryCode.replace('+', '').trim(),
      })
      return
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('请输入邮箱和密码')
      return
    }

    accountMutation.mutate({
      mode: 'email',
      identifier: email.trim(),
      password: password.trim(),
    })
  }

  if (hasSession) {
    return (
      <main className="py-10">
        <section className="island-shell rounded-[2rem] p-6 sm:p-8">
          <p className="island-kicker mb-3">Login Account</p>
          <h1 className="display-title m-0 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
            你已经登录了
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--sea-ink-soft)] sm:text-base">
            当前登录账号：{profile?.nickname ?? '网易云用户'}。你可以直接进入音乐库，或者清空本地登录态重新登录。
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
      <section className="login-shell island-shell rounded-[2rem] p-6 sm:p-8">
        <div className="login-shell__hero">
          <p className="island-kicker mb-3">Login Account</p>
          <h1 className="display-title m-0 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
            登录网易云账号
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--sea-ink-soft)] sm:text-base">
            这一页对齐旧版 `/login/account`，支持二维码、手机号和邮箱三种账号登录方式。
          </p>
        </div>

        <div className="login-mode-grid mt-8">
          {loginCards.map(({ key, title, description, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setMode(key)
                setErrorMessage(null)
              }}
              className={`login-mode-card ${mode === key ? 'login-mode-card--active' : ''}`}
            >
              <div className="login-mode-card__icon">
                <Icon size={20} />
              </div>
              <div className="min-w-0 text-left">
                <p className="login-mode-card__title">{title}</p>
                <p className="login-mode-card__description">{description}</p>
              </div>
            </button>
          ))}
        </div>

        {mode === 'qr' ? (
          <section className="login-panel mt-8">
            <div className="login-qr-panel">
              <div className="login-qr-panel__code-shell">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Netease QR code" className="login-qr-panel__code" />
                ) : (
                  <div className="login-qr-panel__placeholder">
                    <LoaderCircle size={28} className="animate-spin" />
                  </div>
                )}
              </div>
              <p className="login-qr-panel__tip">{qrMessage}</p>
            </div>
          </section>
        ) : (
          <section className="login-panel mt-8">
            <div className="login-form-grid">
              {mode === 'phone' ? (
                <>
                  <label className="login-field">
                    <span>国家区号</span>
                    <input
                      value={countryCode}
                      onChange={(event) => setCountryCode(event.target.value)}
                      placeholder="+86"
                    />
                  </label>
                  <label className="login-field">
                    <span>手机号</span>
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="请输入手机号"
                    />
                  </label>
                </>
              ) : (
                <label className="login-field login-field--full">
                  <span>邮箱</span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="请输入邮箱"
                  />
                </label>
              )}
              <label className={`login-field ${mode === 'phone' ? '' : 'login-field--full'}`}>
                <span>密码</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="请输入密码"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleAccountLogin()
                    }
                  }}
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAccountLogin}
                disabled={isBusy}
                className="app-chip cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBusy ? '登录中…' : '登录'}
              </button>
              <Link to="/login" className="app-chip">
                返回登录入口
              </Link>
            </div>
          </section>
        )}

        {errorMessage ? (
          <div className="login-error mt-6 rounded-[1.25rem] border border-[rgba(220,38,38,0.18)] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[rgb(153,27,27)] dark:text-[rgb(254,202,202)]">
            {errorMessage}
          </div>
        ) : null}
      </section>
    </main>
  )
}
