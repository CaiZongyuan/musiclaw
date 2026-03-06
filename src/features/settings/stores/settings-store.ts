import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBrowserJsonStorage } from '#/lib/browser-storage'
import { STORAGE_KEYS } from '#/lib/constants/storage'

export type ThemeMode = 'auto' | 'light' | 'dark'
export type ProxyProtocol = 'noProxy' | 'HTTP' | 'HTTPS'

export interface ProxyConfig {
  protocol: ProxyProtocol
  server: string
  port: string
}

export interface SettingsStoreSnapshot {
  theme: ThemeMode
  musicQuality: string
  lyricFontSize: number
  cacheLimitMb: number | false
  enableRealIp: boolean
  realIp: string
  proxyConfig: ProxyConfig
}

interface SettingsStoreActions {
  resetSettings: () => void
  setTheme: (theme: ThemeMode) => void
  setMusicQuality: (musicQuality: string) => void
  setLyricFontSize: (lyricFontSize: number) => void
  setCacheLimitMb: (cacheLimitMb: number | false) => void
  setRealIpConfig: (payload: { enableRealIp: boolean; realIp: string }) => void
  setProxyConfig: (proxyConfig: ProxyConfig) => void
}

export type SettingsStoreState = SettingsStoreSnapshot & SettingsStoreActions

export const defaultSettingsSnapshot: SettingsStoreSnapshot = {
  theme: 'auto',
  musicQuality: 'higher',
  lyricFontSize: 54,
  cacheLimitMb: 1024,
  enableRealIp: false,
  realIp: '',
  proxyConfig: {
    protocol: 'noProxy',
    server: '',
    port: '',
  },
}

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      ...defaultSettingsSnapshot,
      resetSettings: () => set(defaultSettingsSnapshot),
      setTheme: (theme) => set({ theme }),
      setMusicQuality: (musicQuality) => set({ musicQuality }),
      setLyricFontSize: (lyricFontSize) => set({ lyricFontSize }),
      setCacheLimitMb: (cacheLimitMb) => set({ cacheLimitMb }),
      setRealIpConfig: ({ enableRealIp, realIp }) =>
        set({
          enableRealIp,
          realIp,
        }),
      setProxyConfig: (proxyConfig) => set({ proxyConfig }),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createBrowserJsonStorage<SettingsStoreSnapshot>(),
      partialize: (state) => ({
        theme: state.theme,
        musicQuality: state.musicQuality,
        lyricFontSize: state.lyricFontSize,
        cacheLimitMb: state.cacheLimitMb,
        enableRealIp: state.enableRealIp,
        realIp: state.realIp,
        proxyConfig: state.proxyConfig,
      }),
    },
  ),
)
