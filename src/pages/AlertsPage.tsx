import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCrmData } from '../context/DataContext'
import { useSession } from '../context/SessionContext'
import { alerts, clients } from '../data/mock'
import type { AlertKind } from '../types/domain'
import { filterAlertsForUser } from '../lib/alertAccess'
import { formatDate } from '../lib/format'
import { Badge, Card, PageHeader } from '../components/ui'

const tone: Record<
  (typeof alerts)[0]['severity'],
  'warning' | 'danger' | 'default'
> = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
}

const kinds: { id: AlertKind | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'no_contact', label: 'No contact' },
  { id: 'deadline', label: 'Deadlines' },
  { id: 'payment', label: 'Payments' },
  { id: 'dormant_client', label: 'Dormant clients' },
  { id: 'overlap', label: 'Overlap' },
]

export function AlertsPage() {
  const { engagements } = useCrmData()
  const { user, canSeeEngagement, canSeeClient } = useSession()
  const [filter, setFilter] = useState<(typeof kinds)[number]['id']>('all')

  const roleFiltered = useMemo(
    () =>
      filterAlertsForUser(
        alerts,
        user,
        engagements,
        clients,
        canSeeEngagement,
        canSeeClient,
      ),
    [user, engagements, canSeeEngagement, canSeeClient],
  )

  const rows = useMemo(() => {
    if (filter === 'all') return roleFiltered
    return roleFiltered.filter((a) => a.kind === filter)
  }, [filter, roleFiltered])

  return (
    <div>
      <PageHeader
        title="Notifications & alerts"
        subtitle={
          user.role === 'super_admin'
            ? 'Contact risk, deadlines, payments, dormant clients, overlaps — scoped to your visibility where linked to records.'
            : 'Alerts tied to engagements and clients you can access; centre-level notices for directors.'
        }
      />

      <div className="mb-8 flex flex-wrap gap-2">
        {kinds.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setFilter(k.id)}
            className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
              filter === k.id
                ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20'
                : 'bg-black/[0.05] text-black/75 hover:bg-black/[0.08]'
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {rows.map((a) => (
          <Card
            key={a.id}
            className="flex flex-col gap-3 transition-shadow hover:shadow-md sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight text-black">
                  {a.title}
                </h2>
                <Badge tone={tone[a.severity]}>{a.kind.replace(/_/g, ' ')}</Badge>
              </div>
              <p className="mt-1 text-sm text-black/70">{a.detail}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                {a.engagementId ? (
                  <Link
                    className="font-medium text-brand-orange hover:underline"
                    to={`/engagements/${a.engagementId}`}
                  >
                    Open engagement
                  </Link>
                ) : null}
                {a.clientId ? (
                  <Link
                    className="font-medium text-brand-orange hover:underline"
                    to={`/clients/${a.clientId}`}
                  >
                    Open client
                  </Link>
                ) : null}
              </div>
            </div>
            <p className="text-xs text-black/55">{formatDate(a.date)}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
