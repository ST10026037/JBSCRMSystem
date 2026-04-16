import type { Engagement } from '../types/domain'
import { daysSince } from './format'

export function getLastContactIso(e: Engagement): string | null {
  const dates = e.communications.map((c) => c.date)
  if (!dates.length) return null
  return dates.sort().at(-1) ?? null
}

/** Contact stale buckets: no contact in 30 / 60 / 90+ days. */
export type ContactStaleBucket = 'current' | 'd30' | 'd60' | 'd90plus' | 'none'

export function contactStaleBucket(iso: string | null): ContactStaleBucket {
  if (!iso) return 'none'
  const d = daysSince(iso)
  if (d <= 30) return 'current'
  if (d <= 60) return 'd30'
  if (d <= 90) return 'd60'
  return 'd90plus'
}
