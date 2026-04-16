export function formatZAR(n: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''))
  return d.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function daysSince(iso: string): number {
  const then = new Date(iso + 'T12:00:00').getTime()
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24))
}
