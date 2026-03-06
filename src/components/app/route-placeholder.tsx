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
    <section className="island-shell rounded-[2rem] p-6 sm:p-8">
      {eyebrow ? (
        <p className="island-kicker mb-3 text-xs tracking-[0.24em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="display-title m-0 text-4xl leading-none font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--sea-ink-soft)] sm:text-base">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-3">{actions}</div>
        ) : null}
      </div>
      {children ? <div className="mt-8">{children}</div> : null}
    </section>
  )
}
