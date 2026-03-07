import { apiClient } from '#/lib/api/client'
import type { NeteaseUserProfile } from '#/features/auth/stores/auth-store'

interface LoginResponse {
  code: number
  cookie?: string
  message?: string
  msg?: string
}

interface UserAccountResponse {
  code: number
  profile?: NeteaseUserProfile
  account?: {
    id: number
    userName?: string
  }
  message?: string
  msg?: string
}

interface LoginQrKeyResponse {
  code: number
  data?: {
    unikey?: string
  }
  message?: string
  msg?: string
}

interface LoginQrCheckResponse {
  code: 800 | 801 | 802 | 803 | number
  cookie?: string
  message?: string
  msg?: string
}

export async function loginWithPhone(params: {
  phone: string
  password: string
  countrycode?: string
}) {
  const response = await apiClient.post<LoginResponse>('/login/cellphone', null, {
    params: {
      phone: params.phone,
      password: params.password,
      countrycode: params.countrycode,
      timestamp: Date.now(),
    },
    meta: {
      attachRealIp: true,
    },
  })

  return response.data
}

export async function loginWithEmail(params: {
  email: string
  password: string
}) {
  const response = await apiClient.post<LoginResponse>('/login', null, {
    params: {
      email: params.email,
      password: params.password,
      timestamp: Date.now(),
    },
    meta: {
      attachRealIp: true,
    },
  })

  return response.data
}

export async function loginQrCodeKey() {
  const response = await apiClient.get<LoginQrKeyResponse>('/login/qr/key', {
    params: {
      timestamp: Date.now(),
    },
    meta: {
      attachRealIp: true,
    },
  })

  return response.data
}

export async function loginQrCodeCheck(key: string) {
  const response = await apiClient.get<LoginQrCheckResponse>('/login/qr/check', {
    params: {
      key,
      timestamp: Date.now(),
    },
    meta: {
      attachRealIp: true,
    },
  })

  return response.data
}

export async function fetchUserAccount() {
  const response = await apiClient.get<UserAccountResponse>('/user/account', {
    params: {
      timestamp: Date.now(),
    },
    meta: {
      attachNeteaseCookie: true,
      attachRealIp: true,
    },
  })

  return response.data
}

export function sanitizeSerializedCookie(cookie: string) {
  return cookie.replaceAll(' HTTPOnly', '').trim()
}

export function extractCookieValue(cookie: string, key: string) {
  const normalized = sanitizeSerializedCookie(cookie).replaceAll(';;', '; ')
  const segments = normalized.split(';').map((segment) => segment.trim())

  for (const segment of segments) {
    if (segment.startsWith(`${key}=`)) {
      return segment.slice(key.length + 1)
    }
  }

  return null
}
