import { Link, useParams } from 'react-router-dom'
import { useCrmData } from '../context/DataContext'
import { useSession } from '../context/SessionContext'
import { getCentre, getClient, getPerson } from '../data/mock'
import { Badge, Card, EmptyState, PageHeader, SectionHeading } from '../components/ui'

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { engagements } = useCrmData()
  const { canSeeClient } = useSession()

  const client = id ? getClient(id) : undefined
  if (!client) {
    return <EmptyState message="Client not found." />
  }

  const allowed = canSeeClient({
    centreId: client.centreId,
    leadStaffId: client.leadStaffId,
    supportingStaffIds: client.supportingStaffIds,
    visibility: client.visibility,
  })
  if (!allowed) {
    return <EmptyState message="You do not have access to this client record." />
  }

  const centre = getCentre(client.centreId)
  const lead = getPerson(client.leadStaffId)
  const support = client.supportingStaffIds
    .map((sid) => getPerson(sid))
    .filter(Boolean)
  const related = engagements.filter((e) => e.clientId === client.id)

  return (
    <div>
      <PageHeader
        title={client.organisationName}
        subtitle={`${client.industry} · ${centre?.name ?? ''}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeading>Relationship ownership</SectionHeading>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-black/55">Primary owner (lead)</dt>
              <dd className="font-medium text-black">{lead?.name}</dd>
            </div>
            <div>
              <dt className="text-black/55">Centre ownership</dt>
              <dd className="font-medium text-black">{centre?.shortName}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-black/55">Supporting team</dt>
              <dd className="text-black">
                {support.length ? support.map((p) => p!.name).join(', ') : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-black/55">Client status</dt>
              <dd>
                <Badge tone="info">{client.status}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-black/55">Record visibility</dt>
              <dd>
                <Badge tone="default">{client.visibility}</Badge>
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <SectionHeading>Contact persons</SectionHeading>
          <ul className="mt-3 space-y-3 text-sm">
            {client.contacts.map((cp) => (
              <li key={cp.id} className="border-b border-black/8 pb-3 last:border-0">
                <p className="font-medium">{cp.name}</p>
                <p className="text-black/55">{cp.role}</p>
                <p className="text-black/70">{cp.email}</p>
                <p className="text-black/70">{cp.phone}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <SectionHeading>Engagement history (linked)</SectionHeading>
        <ul className="mt-4 divide-y divide-black/[0.06]">
          {related.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <Link
                  to={`/engagements/${e.id}`}
                  className="font-medium text-brand-orange hover:underline"
                >
                  {e.title}
                </Link>
                <p className="text-xs text-black/55">
                  {e.type} ·{' '}
                  <Badge tone="default">{e.stage}</Badge>
                </p>
              </div>
              <span className="text-xs text-black/55">
                {e.startDate} → {e.expectedEndDate}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
