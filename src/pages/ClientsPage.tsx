import { Link } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { centres, clients, getPerson } from '../data/mock'
import { Badge, Card, EmptyState, PageHeader } from '../components/ui'

const statusTone = {
  active: 'success' as const,
  dormant: 'warning' as const,
  prospect: 'info' as const,
}

export function ClientsPage() {
  const { canSeeClient } = useSession()

  const rows = clients.filter((c) =>
    canSeeClient({
      centreId: c.centreId,
      leadStaffId: c.leadStaffId,
      supportingStaffIds: c.supportingStaffIds,
      visibility: c.visibility,
    }),
  )

  return (
    <div>
      <PageHeader
        title="Clients & stakeholders"
        subtitle="Organisation profiles, relationship ownership and engagement history — scoped by centre and visibility (private / shared / institutional)."
      />

      {rows.length === 0 ? (
        <EmptyState message="No client records visible for your role." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="crm-table w-full min-w-[720px] text-sm">
              <thead>
                <tr>
                  <th>Organisation</th>
                  <th>Sector</th>
                  <th>Centre</th>
                  <th>Lead owner</th>
                  <th>Status</th>
                  <th>Visibility</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const centre = centres.find((x) => x.id === c.centreId)
                  const lead = getPerson(c.leadStaffId)
                  return (
                    <tr key={c.id}>
                      <td>
                        <Link
                          to={`/clients/${c.id}`}
                          className="font-medium text-brand-orange hover:underline"
                        >
                          {c.organisationName}
                        </Link>
                      </td>
                      <td className="text-black/70">{c.industry}</td>
                      <td className="text-black/70">{centre?.shortName}</td>
                      <td className="text-black/70">{lead?.name}</td>
                      <td>
                        <Badge tone={statusTone[c.status]}>{c.status}</Badge>
                      </td>
                      <td>
                        <Badge tone="default">{c.visibility}</Badge>
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
