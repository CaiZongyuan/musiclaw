import { useEffect } from 'react'
import { useSettingsStore } from '#/features/settings/stores/settings-store'
import {
  applyThemeMode,
  persistLegacyThemeMode,
} from '#/features/settings/lib/theme'

export default function ThemeToggle() {
  const mode = useSettingsStore((state) => state.theme)
  const setTheme = useSettingsStore((state) => state.setTheme)

  useEffect(() => {
    if (mode !== 'auto') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyThemeMode('auto')

    media.addEventListener('change', onChange)
    return () => {
      media.removeEventListener('change', onChange)
    }
  }, [mode])

  useEffect(() => {
    applyThemeMode(mode)
    persistLegacyThemeMode(mode)
  }, [mode])

  function toggleMode() {
    const nextMode =
      mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light'
    setTheme(nextMode)
  }

  const label =
    mode === 'auto'
      ? 'Theme mode: auto (system). Click to switch to light mode.'
      : `Theme mode: ${mode}. Click to switch mode.`

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.08)] transition hover:-translate-y-0.5"
    >
      {mode === 'auto' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light'}
    </button>
  )
}
