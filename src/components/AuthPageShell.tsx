import type { ReactNode } from 'react'

const BG_URL = '/jbs-login-bg.png'

/** Shared field styles for login / register (focus ring uses UJ orange). */
export const authLabelClass = 'block text-sm font-medium text-black/75'
/** Field only (no top margin) — use inside a wrapper with `mt-1.5`, e.g. icon rows. */
export const authInputFieldClass =
  'w-full rounded-xl border border-black/12 bg-white px-3.5 py-2.5 text-sm text-black shadow-sm transition placeholder:text-black/35 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/25'
export const authInputClass = `mt-1.5 ${authInputFieldClass}`

/**
 * Auth layout: stacked (image → form) on small screens; from `lg` up, equal 50/50 columns.
 */
export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid min-h-[100dvh] w-full grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-x-hidden bg-neutral-100 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] lg:h-[100dvh] lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-1 lg:overflow-hidden"
    >
      {/* Hero — fixed band on mobile/tablet; fills half the viewport on lg+ */}
      <div className="relative h-[min(38vh,17rem)] min-h-0 w-full shrink-0 overflow-hidden sm:h-[min(36vh,19rem)] lg:h-full lg:min-h-0 lg:shrink">
        <img
          src={BG_URL}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-right"
          decoding="async"
          fetchPriority="high"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/[0.07] to-transparent lg:hidden"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-10 bg-gradient-to-r from-transparent to-black/[0.08] lg:block lg:w-12 xl:w-16"
          aria-hidden
        />
      </div>

      {/* Form — scrolls in its area; min-w-0 keeps 50/50 tracks on lg+ */}
      <div className="relative flex min-h-0 min-w-0 flex-col justify-start overflow-y-auto overscroll-contain bg-gradient-to-b from-neutral-50 via-white to-neutral-50/80 px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:justify-center lg:overflow-y-auto lg:px-10 xl:px-12">
        <div className="mx-auto w-full max-w-md shrink-0 py-1 lg:max-w-lg">{children}</div>
      </div>
    </div>
  )
}

/** White panel for auth forms — subtle depth without fighting the hero image. */
export function AuthFormPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-white p-4 shadow-lg shadow-black/[0.06] ring-1 ring-black/[0.04] sm:rounded-2xl sm:p-6 md:p-8">
      {children}
    </div>
  )
}
