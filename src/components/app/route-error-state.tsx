import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import RoutePlaceholder from '#/components/app/route-placeholder'

interface RouteErrorStateProps {
  title: string
  description: string
  error?: unknown
  reset?: () => void
  actions?: ReactNode
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim()
  ) {
    return error.message
  }

  return '请求暂时失败，请检查 API 服务是否可用后重试。'
}

export default function RouteErrorState({
  title,
  description,
  error,
  reset,
  actions,
}: RouteErrorStateProps) {
  return (
    <RoutePlaceholder
      eyebrow="Load Error"
      title={title}
      description={description}
      actions={
        actions ?? (
          <>
            {reset ? (
              <button
                type="button"
                onClick={reset}
                className="app-chip cursor-pointer"
              >
                重试加载
              </button>
            ) : null}
            <Link to="/" className="app-chip">
              返回首页
            </Link>
          </>
        )
      }
    >
      <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[rgba(79,184,178,0.04)] px-5 py-4">
        <p className="m-0 text-xs font-semibold tracking-[0.18em] text-[var(--kicker)] uppercase">
          Error Details
        </p>
        <p className="mt-3 mb-0 text-sm leading-7 text-[var(--sea-ink-soft)]">
          {getErrorMessage(error)}
        </p>
      </div>
    </RoutePlaceholder>
  )
}
