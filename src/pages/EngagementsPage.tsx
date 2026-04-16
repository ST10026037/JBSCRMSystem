import { Link } from 'react-router-dom'
import { useCrmData } from '../context/DataContext'
import { useSession } from '../context/SessionContext'
import { clients, getPerson } from '../data/mock'
import type { Engagement } from '../types/domain'
import { formatDate } from '../lib/format'
import { Badge, Card, EmptyState, PageHeader } from '../components/ui'

function lastContactDate(e: Engagement): string | null {
  const dates = e.communications.map((c) => c.date)
  if (!dates.length) return null
  return dates.sort().at(-1) ?? null
}

export function EngagementsPage() {
  const { engagements } = useCrmData()
  const { canSeeEngagement } = useSession()

  const rows = engagements.filter((e) =>
    canSeeEngagement({
      centreId: e.centreId,
      leadStaffId: e.leadStaffId,
      supportingStaffIds: e.supportingStaffIds,
      visibility: e.visibility,
    }),
  )

  return (
    <div>
      <PageHeader
        title="Engagements"
        subtitle="Client, centre, lead, supporting team, type, dates, stage (incl. on hold), last contact."
      />

      {rows.length === 0 ? (
        <EmptyState message="No engagements visible for your role." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="crm-table w-full min-w-[900px] text-sm">
              <thead>
                <tr>
                  <th>Engagement</th>
                  <th>Client</th>
                  <th>Lead</th>
                  <th>Type</th>
                  <th>Stage</th>
                  <th>Last contact</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => {
                  const client = clients.find((c) => c.id === e.clientId)
                  const lead = getPerson(e.leadStaffId)
                  const last = lastContactDate(e)
                  return (
                    <tr key={e.id}>
                      <td>
                        <Link
                          to={`/engagements/${e.id}`}
                          className="font-medium text-brand-orange hover:underline"
                        >
                          {e.title}
                        </Link>
                      </td>
                      <td className="text-black/70">{client?.organisationName}</td>
                      <td className="text-black/70">{lead?.name}</td>
                      <td>
                        <Badge tone="default">{e.type}</Badge>
                      </td>
                      <td>
                        <Badge tone="info">{e.stage}</Badge>
                      </td>
                      <td className="text-black/70">
                        {last ? formatDate(last) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
