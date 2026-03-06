import axios, { AxiosError } from 'axios'
import { STORAGE_KEYS } from '#/lib/constants/storage'
import { readPersistedStoreState } from '#/lib/browser-storage'
import type {
  ApiClientOptions,
  ApiErrorDetails,
  NeteaseApiResponse,
} from './types'

const DEFAULT_TIMEOUT = 15_000
const DEFAULT_REAL_IP = '211.161.244.70'

interface AuthStoreSnapshot {
  rawCookie: string | null
}

interface SettingsStoreSnapshot {
  enableRealIp: boolean
  realIp: string
}

function resolveApiBaseUrl() {
  return import.meta.env.VITE_NETEASE_API_URL || '/api'
}

function resolveRealIp() {
  const settingsState = readPersistedStoreState<SettingsStoreSnapshot>(
    STORAGE_KEYS.settings,
  )

  const envRealIp = import.meta.env.VITE_REAL_IP
  if (envRealIp) {
    return envRealIp
  }

  if (settingsState?.enableRealIp && settingsState.realIp) {
    return settingsState.realIp
  }

  return DEFAULT_REAL_IP
}

function resolveSerializedCookie() {
  const authState = readPersistedStoreState<AuthStoreSnapshot>(
    STORAGE_KEYS.auth,
  )
  return authState?.rawCookie ?? null
}

export class ApiClientError extends Error {
  readonly details: ApiErrorDetails

  constructor(details: ApiErrorDetails) {
    super(details.message)
    this.name = 'ApiClientError'
    this.details = details
  }
}

export function createApiClient(options: ApiClientOptions = {}) {
  const client = axios.create({
    baseURL: options.baseURL ?? resolveApiBaseUrl(),
    timeout: options.timeout ?? DEFAULT_TIMEOUT,
    withCredentials: true,
  })

  client.interceptors.request.use((config) => {
    const nextConfig = { ...config }
    nextConfig.params = { ...(config.params ?? {}) }

    if (config.meta?.attachNeteaseCookie) {
      const serializedCookie = resolveSerializedCookie()
      if (serializedCookie) {
        nextConfig.params.cookie = serializedCookie
      }
    }

    if (config.meta?.attachRealIp) {
      nextConfig.params.realIP = resolveRealIp()
    }

    return nextConfig
  })

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<NeteaseApiResponse>) => {
      if (error.response) {
        const payload = error.response.data
        throw new ApiClientError({
          kind: 'http',
          message:
            payload?.message ??
            payload?.msg ??
            error.message ??
            'Request failed',
          status: error.response.status,
          code: payload?.code,
          payload,
        })
      }

      if (error.request) {
        throw new ApiClientError({
          kind: 'network',
          message: 'Network request failed',
        })
      }

      throw new ApiClientError({
        kind: 'unknown',
        message: error.message || 'Unknown request error',
      })
    },
  )

  return client
}

export const apiClient = createApiClient()

export { resolveApiBaseUrl }
