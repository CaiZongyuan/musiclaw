import { STORAGE_KEYS } from '#/lib/constants/storage'
import type { ThemeMode } from '#/features/settings/stores/settings-store'

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'auto' || value === 'light' || value === 'dark'
}

function getStoredSettingsTheme(): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEYS.settings)
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as {
      state?: {
        theme?: ThemeMode
      }
    }

    return isThemeMode(parsed?.state?.theme) ? parsed.state.theme : null
  } catch {
    return null
  }
}

export function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'auto'
  }

  const settingsTheme = getStoredSettingsTheme()
  if (settingsTheme) {
    return settingsTheme
  }

  const legacyTheme = window.localStorage.getItem('theme')
  return isThemeMode(legacyTheme) ? legacyTheme : 'auto'
}

export function resolveThemeMode(mode: ThemeMode) {
  if (typeof window === 'undefined') {
    return mode === 'dark' ? 'dark' : 'light'
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode
}

export function applyThemeMode(mode: ThemeMode) {
  if (typeof window === 'undefined') {
    return
  }

  const resolvedMode = resolveThemeMode(mode)
  const root = window.document.documentElement

  root.classList.remove('light', 'dark')
  root.classList.add(resolvedMode)

  if (mode === 'auto') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', mode)
  }

  root.style.colorScheme = resolvedMode
}

export function persistLegacyThemeMode(mode: ThemeMode) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem('theme', mode)
}
