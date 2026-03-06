import type { AxiosRequestConfig } from 'axios'

export interface ApiRequestMeta {
  attachNeteaseCookie?: boolean
  attachRealIp?: boolean
}

export interface NeteaseApiResponse<TData = unknown> {
  code: number
  data?: TData
  message?: string
  msg?: string
  [key: string]: unknown
}

export type ApiErrorKind = 'network' | 'http' | 'unknown'

export interface ApiErrorDetails {
  kind: ApiErrorKind
  message: string
  status?: number
  code?: number | string
  payload?: unknown
}

export interface ApiClientOptions {
  baseURL?: string
  timeout?: number
}

export interface ApiRequestConfig<
  TData = unknown,
> extends AxiosRequestConfig<TData> {
  meta?: ApiRequestMeta
}

declare module 'axios' {
  interface AxiosRequestConfig {
    meta?: ApiRequestMeta
  }
}
