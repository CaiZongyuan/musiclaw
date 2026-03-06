/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NETEASE_API_URL?: string
  readonly VITE_NETEASE_API_URL?: string
  readonly VITE_REAL_IP?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
