import type { AxiosRequestConfig } from 'axios'
import { createApiClient } from '#/lib/api/client'

const DEFAULT_REAL_IP = '211.161.244.70'

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//.test(value)
}

export function resolveServerNeteaseApiBaseUrl() {
  const explicitBaseUrl =
    process.env.NETEASE_API_URL ||
    process.env.VITE_NETEASE_API_URL ||
    import.meta.env.VITE_NETEASE_API_URL

  if (!explicitBaseUrl) {
    throw new Error(
      'Missing NETEASE_API_URL or VITE_NETEASE_API_URL for server-side Netease requests',
    )
  }

  if (!isAbsoluteUrl(explicitBaseUrl)) {
    throw new Error(
      'Server-side Netease API requests require an absolute URL, for example http://127.0.0.1:3001',
    )
  }

  return explicitBaseUrl
}

export async function requestNeteaseApi<TResponse>(
  config: AxiosRequestConfig,
  options?: {
    includeRealIp?: boolean
  },
) {
  const client = createApiClient({
    baseURL: resolveServerNeteaseApiBaseUrl(),
  })

  const nextConfig: AxiosRequestConfig = {
    ...config,
    params: {
      ...(config.params ?? {}),
    },
  }

  if (options?.includeRealIp !== false) {
    nextConfig.params = {
      ...nextConfig.params,
      realIP:
        process.env.VITE_REAL_IP ||
        import.meta.env.VITE_REAL_IP ||
        DEFAULT_REAL_IP,
    }
  }

  const response = await client.request<TResponse>(nextConfig)
  return response.data
}
