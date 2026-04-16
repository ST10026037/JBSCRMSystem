import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <header className="mb-8 md:mb-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="max-w-3xl text-sm leading-relaxed text-black/60 md:text-[15px]">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">{actions}</div>
        ) : null}
      </div>
      <div
        className="mt-6 h-px w-full bg-gradient-to-r from-brand-orange/30 via-black/10 to-transparent md:mt-8"
        aria-hidden
      />
    </header>
  )
}

/** In-card section title — consistent hierarchy below PageHeader. */
export function SectionHeading({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <h2
      className={`text-base font-semibold tracking-tight text-black ${className}`}
    >
      {children}
    </h2>
  )
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-black/[0.06] bg-brand-white p-6 shadow-card ring-1 ring-black/[0.03] ${className}`}
    >
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-brand-white p-5 shadow-card ring-1 ring-black/[0.03]">
      <div className="border-l-[3px] border-brand-orange pl-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-black/50">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-black">
          {value}
        </p>
        {hint ? (
          <p className="mt-1.5 text-xs leading-snug text-black/50">{hint}</p>
        ) : null}
      </div>
    </div>
  )
}

const badgeStyles: Record<string, string> = {
  default: 'bg-black/[0.06] text-black',
  success: 'bg-emerald-500/12 text-emerald-900',
  warning: 'bg-amber-500/15 text-amber-900',
  danger: 'bg-red-500/12 text-red-900 ring-1 ring-inset ring-red-500/25',
  info: 'bg-brand-orange/12 text-black',
}

export function Badge({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: keyof typeof badgeStyles
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyles[tone]}`}
    >
      {children}
    </span>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/12 bg-white/90 px-6 py-14 text-center shadow-sm ring-1 ring-black/[0.03]">
      <p className="mx-auto max-w-sm text-sm leading-relaxed text-black/60">
        {message}
      </p>
    </div>
  )
}
