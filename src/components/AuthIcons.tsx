/** Inline SVGs for auth fields — stroke icons, inherit `currentColor`. */

/** Apply to `IconEnvelope` / `IconLock` when placed inside a `relative mt-1.5` input row. */
export const authFieldIconClass =
  'pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-black/45'

export function IconEnvelope({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 8.29 6.71a1 1 0 0 0 1.42 0L21 7" />
    </svg>
  )
}

export function IconLock({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
    </svg>
  )
}

/** Eye open — “show password” when the value is hidden. */
export function IconEye({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

/** Eye off — “hide password” when the value is visible. */
export function IconEyeOff({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 3 21 21" />
      <path d="M10.58 10.58a3 3 0 1 0 4.24 4.24" />
      <path d="M9.88 9.88A10.5 10.5 0 0 0 5 12q0 1 .12 2" />
      <path d="M14.12 14.12q1.14-.17 2.24-.57c3.1-1.1 5.64-3.35 5.64-4.55 0-1.43-3.57-5.5-12-5.5-.73 0-1.42.08-2.08.22" />
      <path d="M2 12s3.5 7 10 7q1.57 0 2.94-.47" />
    </svg>
  )
}
