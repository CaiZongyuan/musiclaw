import type { ReactNode } from 'react'

interface RoutePlaceholderProps {
  title: string
  description: string
  eyebrow?: string
  actions?: ReactNode
  children?: ReactNode
}

export default function RoutePlaceholder({
  title,
  description,
  eyebrow,
  actions,
  children,
}: RoutePlaceholderProps) {
  return (
    <section className="route-placeholder island-shell rounded-[2rem] p-6 sm:p-8">
      {eyebrow ? (
        <p className="route-placeholder__eyebrow island-kicker mb-3 text-xs tracking-[0.24em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <div className="route-placeholder__hero flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="route-placeholder__copy max-w-3xl">
          <h1 className="route-placeholder__title display-title m-0 text-4xl leading-none font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
            {title}
          </h1>
          <p className="route-placeholder__description mt-4 max-w-2xl text-sm leading-7 text-[var(--sea-ink-soft)] sm:text-base">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="route-placeholder__actions flex shrink-0 items-center gap-3">{actions}</div>
        ) : null}
      </div>
      {children ? <div className="route-placeholder__body mt-8">{children}</div> : null}
    </section>
  )
}
