import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Database,
  Globe2,
  HardDriveDownload,
  Music2,
  Palette,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  Type,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  defaultSettingsSnapshot,
  type ProxyProtocol,
  type ThemeMode,
  useSettingsStore,
} from '#/features/settings/stores/settings-store'
import {
  persistLegacyThemeMode,
  resolveThemeMode,
} from '#/features/settings/lib/theme'
import { usePlayerStore } from '#/features/player/stores/player-store'
import { STORAGE_KEYS } from '#/lib/constants/storage'

export const Route = createFileRoute('/settings')({ component: SettingsRoute })

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string; description: string }> = [
  {
    value: 'auto',
    label: '跟随系统',
    description: '默认按系统外观自动切换。',
  },
  {
    value: 'light',
    label: '浅色',
    description: '更接近白天场景下的旧版亮色节奏。',
  },
  {
    value: 'dark',
    label: '深色',
    description: '更适合播放器和歌词层的沉浸感。',
  },
]

const QUALITY_OPTIONS = [
  { value: 'standard', label: '标准', detail: '96Kbps · 最省流量' },
  { value: 'higher', label: '较高', detail: '192Kbps · 默认推荐' },
  { value: 'exhigh', label: '极高', detail: '320Kbps · 更接近桌面端默认' },
  { value: 'lossless', label: '无损', detail: 'FLAC · 适合高带宽环境' },
  { value: 'hires', label: 'Hi-Res', detail: '仅在音源支持时生效' },
] as const

const CACHE_OPTIONS: Array<{ value: number | false; label: string }> = [
  { value: false, label: '不限制' },
  { value: 512, label: '512 MB' },
  { value: 1024, label: '1 GB' },
  { value: 2048, label: '2 GB' },
  { value: 4096, label: '4 GB' },
  { value: 8192, label: '8 GB' },
]

const PROXY_PROTOCOL_OPTIONS: Array<{ value: ProxyProtocol; label: string }> = [
  { value: 'noProxy', label: '不使用代理' },
  { value: 'HTTP', label: 'HTTP' },
  { value: 'HTTPS', label: 'HTTPS' },
]

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="settings-panel island-shell rounded-[1.75rem] p-5 sm:p-6">
      <div className="settings-panel__header">
        <div className="settings-panel__icon">{icon}</div>
        <div>
          <h2 className="settings-panel__title">{title}</h2>
          <p className="settings-panel__description">{description}</p>
        </div>
      </div>
      <div className="settings-panel__body">{children}</div>
    </section>
  )
}

function SettingsRow({
  label,
  hint,
  control,
}: {
  label: string
  hint: string
  control: ReactNode
}) {
  return (
    <div className="settings-row">
      <div className="min-w-0">
        <p className="settings-row__label">{label}</p>
        <p className="settings-row__hint">{hint}</p>
      </div>
      <div className="settings-row__control">{control}</div>
    </div>
  )
}

function estimateLocalStorageSize() {
  if (typeof window === 'undefined') {
    return 0
  }

  return Object.entries(window.localStorage).reduce((total, [key, value]) => {
    return total + (key.length + String(value).length) * 2
  }, 0)
}

function formatBytes(bytes: number) {
  if (!bytes) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB']
  let current = bytes
  let index = 0

  while (current >= 1024 && index < units.length - 1) {
    current /= 1024
    index += 1
  }

  return `${current.toFixed(current >= 100 || index === 0 ? 0 : 1)} ${units[index]}`
}

function SettingsRoute() {
  const {
    cacheLimitMb,
    enableRealIp,
    lyricFontSize,
    musicQuality,
    proxyConfig,
    realIp,
    resetSettings,
    setCacheLimitMb,
    setLyricFontSize,
    setMusicQuality,
    setProxyConfig,
    setRealIpConfig,
    setTheme,
    theme,
  } = useSettingsStore(
    useShallow((state) => ({
      cacheLimitMb: state.cacheLimitMb,
      enableRealIp: state.enableRealIp,
      lyricFontSize: state.lyricFontSize,
      musicQuality: state.musicQuality,
      proxyConfig: state.proxyConfig,
      realIp: state.realIp,
      resetSettings: state.resetSettings,
      setCacheLimitMb: state.setCacheLimitMb,
      setLyricFontSize: state.setLyricFontSize,
      setMusicQuality: state.setMusicQuality,
      setProxyConfig: state.setProxyConfig,
      setRealIpConfig: state.setRealIpConfig,
      setTheme: state.setTheme,
      theme: state.theme,
    })),
  )
  const [storageBytes, setStorageBytes] = useState(0)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    setStorageBytes(estimateLocalStorageSize())
  }, [])

  const activeThemeLabel = theme === 'auto' ? `跟随系统（当前 ${resolveThemeMode(theme) === 'dark' ? '深色' : '浅色'}）` : theme === 'dark' ? '深色' : '浅色'
  const qualityLabel = QUALITY_OPTIONS.find((option) => option.value === musicQuality)?.label ?? '较高'
  const cacheLabel = CACHE_OPTIONS.find((option) => option.value === cacheLimitMb)?.label ?? `${cacheLimitMb} MB`
  const playerQueueSize = usePlayerStore((state) => state.queue.length)

  const settingsDiffCount = useMemo(() => {
    return Object.entries(defaultSettingsSnapshot).reduce((count, [key, value]) => {
      const currentValue = {
        theme,
        musicQuality,
        lyricFontSize,
        cacheLimitMb,
        enableRealIp,
        realIp,
        proxyConfig,
      }[key as keyof typeof defaultSettingsSnapshot]

      return JSON.stringify(currentValue) === JSON.stringify(value) ? count : count + 1
    }, 0)
  }, [
    cacheLimitMb,
    enableRealIp,
    lyricFontSize,
    musicQuality,
    proxyConfig,
    realIp,
    theme,
  ])

  function refreshStorageUsage(nextMessage?: string) {
    setStorageBytes(estimateLocalStorageSize())
    if (nextMessage) {
      setStatusMessage(nextMessage)
    }
  }

  function handleThemeChange(nextTheme: ThemeMode) {
    setTheme(nextTheme)
    persistLegacyThemeMode(nextTheme)
    refreshStorageUsage(`主题已切换为${nextTheme === 'auto' ? '跟随系统' : nextTheme === 'dark' ? '深色' : '浅色'}。`)
  }

  function handleResetSettings() {
    resetSettings()
    persistLegacyThemeMode(defaultSettingsSnapshot.theme)
    usePlayerStore.getState().setVolume(1)
    refreshStorageUsage('已恢复默认设置。')
  }

  function handleClearPlayerCache() {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.removeItem(STORAGE_KEYS.player)
    usePlayerStore.getState().resetPlayer()
    refreshStorageUsage('已清空本地播放器队列与播放进度缓存。')
  }

  return (
    <div className="settings-screen py-10">
      <section className="settings-hero island-shell rounded-[2rem] p-6 sm:p-8">
        <div className="settings-hero__copy">
          <p className="island-kicker mb-3">Settings</p>
          <h1 className="display-title m-0 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
            把播放器、歌词和网络细节收拢到一页
          </h1>
          <p className="settings-hero__description mt-4">
            这里承接 YesPlayMusic Web 里最常用的几个设置入口：主题、音质、歌词字号、缓存与网络参数。
            当前这页已经能直接驱动全局主题和本地持久化设置，不再是占位骨架。
          </p>
          <div className="settings-hero__pills">
            <span className="detail-stat-pill">当前主题：{activeThemeLabel}</span>
            <span className="detail-stat-pill">音质：{qualityLabel}</span>
            <span className="detail-stat-pill">歌词字号：{lyricFontSize}px</span>
            <span className="detail-stat-pill">缓存上限：{cacheLabel}</span>
          </div>
        </div>
        <div className="settings-hero__actions">
          <Link to="/" className="app-chip">
            返回首页
          </Link>
          <button type="button" onClick={handleResetSettings} className="app-chip cursor-pointer">
            <RefreshCcw size={14} />
            恢复默认
          </button>
        </div>
      </section>

      <div className="settings-grid">
        <SettingsSection
          icon={<Palette size={18} />}
          title="外观"
          description="主题在全局壳体和歌词层都会立即生效，并保留到下次打开。"
        >
          <div className="settings-choice-grid">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleThemeChange(option.value)}
                className={`settings-choice-card ${theme === option.value ? 'settings-choice-card--active' : ''}`}
              >
                <span className="settings-choice-card__label">{option.label}</span>
                <span className="settings-choice-card__detail">{option.description}</span>
              </button>
            ))}
          </div>
          <SettingsRow
            label="当前生效外观"
            hint="`跟随系统` 会根据系统主题自动切换。"
            control={<span className="settings-inline-value">{activeThemeLabel}</span>}
          />
        </SettingsSection>

        <SettingsSection
          icon={<Music2 size={18} />}
          title="播放与音质"
          description="这里集中处理默认音源质量和播放器本地缓存行为。"
        >
          <SettingsRow
            label="默认音质"
            hint="播放器获取音源时会优先按这里的质量策略尝试。"
            control={
              <select
                value={musicQuality}
                onChange={(event) => setMusicQuality(event.target.value)}
                className="settings-select"
              >
                {QUALITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} · {option.detail}
                  </option>
                ))}
              </select>
            }
          />
          <SettingsRow
            label="播放器队列缓存"
            hint="会保存最近播放队列、音量和进度；清空后播放器会回到初始状态。"
            control={
              <button
                type="button"
                onClick={handleClearPlayerCache}
                className="app-chip cursor-pointer"
              >
                <Trash2 size={14} />
                清空播放器缓存
              </button>
            }
          />
          <SettingsRow
            label="当前队列状态"
            hint="仅统计本地保存的队列，不会影响账号侧歌单数据。"
            control={<span className="settings-inline-value">{playerQueueSize} 首</span>}
          />
        </SettingsSection>

        <SettingsSection
          icon={<Type size={18} />}
          title="歌词"
          description="歌词字号会直接影响底部歌词层和展开歌词面板的排版节奏。"
        >
          <SettingsRow
            label="歌词字号"
            hint="向旧版大字号歌词靠拢，默认值为 54px。"
            control={<span className="settings-inline-value">{lyricFontSize}px</span>}
          />
          <input
            type="range"
            min="24"
            max="72"
            step="2"
            value={lyricFontSize}
            onChange={(event) => setLyricFontSize(Number(event.target.value))}
            className="settings-range"
            aria-label="歌词字号"
          />
          <div className="settings-lyric-preview">
            <p className="settings-lyric-preview__eyebrow">歌词预览</p>
            <p className="settings-lyric-preview__line" style={{ fontSize: `${Math.max(24, lyricFontSize * 0.42)}px` }}>
              如果你也听说 会不会相信我
            </p>
            <p className="settings-lyric-preview__subline">
              预览会跟随当前设置实时更新，方便你在桌面和移动端之间找平衡。
            </p>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={<Database size={18} />}
          title="缓存与网络"
          description="这部分收口本地缓存容量、realIP 和代理设置，方便切换不同网络环境。"
        >
          <SettingsRow
            label="缓存上限"
            hint="当前主要用于约束后续本地缓存策略，先把入口保留到位。"
            control={
              <select
                value={String(cacheLimitMb)}
                onChange={(event) =>
                  setCacheLimitMb(event.target.value === 'false' ? false : Number(event.target.value))
                }
                className="settings-select"
              >
                {CACHE_OPTIONS.map((option) => (
                  <option key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
            }
          />
          <SettingsRow
            label="强制 realIP"
            hint="某些接口在跨区或受限网络下更依赖 realIP 参数。"
            control={
              <label className="settings-checkbox-row">
                <input
                  type="checkbox"
                  checked={enableRealIp}
                  onChange={(event) =>
                    setRealIpConfig({
                      enableRealIp: event.target.checked,
                      realIp,
                    })
                  }
                />
                <span>{enableRealIp ? '已开启' : '已关闭'}</span>
              </label>
            }
          />
          <SettingsRow
            label="realIP 地址"
            hint="开启后会在客户端请求里优先使用这里的 IP。"
            control={
              <input
                value={realIp}
                onChange={(event) =>
                  setRealIpConfig({
                    enableRealIp,
                    realIp: event.target.value,
                  })
                }
                placeholder="例如 211.161.244.70"
                className="settings-input"
              />
            }
          />
          <SettingsRow
            label="代理协议"
            hint="给后续代理配置留出和原版接近的参数入口。"
            control={
              <select
                value={proxyConfig.protocol}
                onChange={(event) =>
                  setProxyConfig({
                    ...proxyConfig,
                    protocol: event.target.value as ProxyProtocol,
                  })
                }
                className="settings-select"
              >
                {PROXY_PROTOCOL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            }
          />
          <div className="settings-field-grid">
            <div className="settings-field-card">
              <label className="settings-field-card__label" htmlFor="proxy-server">
                代理地址
              </label>
              <p className="settings-field-card__hint">例如 `127.0.0.1` 或域名。</p>
              <input
                id="proxy-server"
                value={proxyConfig.server}
                onChange={(event) =>
                  setProxyConfig({
                    ...proxyConfig,
                    server: event.target.value,
                  })
                }
                placeholder="127.0.0.1"
                className="settings-input"
              />
            </div>
            <div className="settings-field-card">
              <label className="settings-field-card__label" htmlFor="proxy-port">
                端口
              </label>
              <p className="settings-field-card__hint">例如 `7890`。</p>
              <input
                id="proxy-port"
                value={proxyConfig.port}
                onChange={(event) =>
                  setProxyConfig({
                    ...proxyConfig,
                    port: event.target.value,
                  })
                }
                placeholder="7890"
                className="settings-input"
              />
            </div>
          </div>
        </SettingsSection>
      </div>

      <section className="settings-footer island-shell rounded-[1.75rem] p-5 sm:p-6">
        <div className="settings-footer__summary">
          <div>
            <p className="settings-footer__title">本地状态摘要</p>
            <p className="settings-footer__copy">
              已偏离默认值 {settingsDiffCount} 项 · 当前 localStorage 约 {formatBytes(storageBytes)}
            </p>
          </div>
          <div className="settings-footer__chips">
            <span className="detail-stat-pill">
              <HardDriveDownload size={14} />
              本地缓存 {formatBytes(storageBytes)}
            </span>
            <span className="detail-stat-pill">
              <ShieldCheck size={14} />
              realIP {enableRealIp ? '启用' : '关闭'}
            </span>
            <span className="detail-stat-pill">
              <Globe2 size={14} />
              代理 {proxyConfig.protocol === 'noProxy' ? '关闭' : `${proxyConfig.protocol} ${proxyConfig.server || '未配置'}`}
            </span>
          </div>
        </div>
        {statusMessage ? <p className="settings-footer__status">{statusMessage}</p> : null}
      </section>
    </div>
  )
}
