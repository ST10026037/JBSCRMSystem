import { Link } from 'react-router-dom'
import { useCrmData } from '../context/DataContext'
import { useSession } from '../context/SessionContext'
import { centres, clients, getPerson } from '../data/mock'
import { Badge, Card, PageHeader } from '../components/ui'

/** Read-only open engagement directory — no private rows; no financial values in listing. */
export function DirectoryPage() {
  const { engagements } = useCrmData()
  const { user, canSeeEngagement } = useSession()

  const rows = engagements
    .filter((e) => e.visibility !== 'private')
    .filter((e) => e.stage === 'active' || e.stage === 'prospect' || e.stage === 'on_hold')
    .filter((e) =>
      canSeeEngagement({
        centreId: e.centreId,
        leadStaffId: e.leadStaffId,
        supportingStaffIds: e.supportingStaffIds,
        visibility: e.visibility,
      }),
    )
    .map((e) => {
      const client = clients.find((c) => c.id === e.clientId)
      const centre = centres.find((c) => c.id === e.centreId)
      const lead = getPerson(e.leadStaffId)
      return {
        e,
        clientName: client?.organisationName ?? '—',
        centre: centre?.shortName ?? '—',
        lead: lead?.name ?? '—',
        institutional: e.visibility === 'institutional',
      }
    })

  return (
    <div>
      <PageHeader
        title="Open engagement directory"
        subtitle={
          user.role === 'super_admin'
            ? 'All non-private open engagements — client, centre, lead, type, status (no contract values).'
            : 'Engagements you are entitled to see — prevents double-approaching and supports institutional coherence.'
        }
      />

      <Card className="mb-6 border-brand-orange/25 bg-gradient-to-br from-brand-orange/[0.09] to-brand-orange/[0.03] text-sm leading-relaxed text-black/80">
        <p>
          Ensures no double-approaching clients, institutional coherence and a professional
          external image. Records marked <Badge tone="info">institutional</Badge> follow the
          “selected fields only” rule across JBS — financial detail sits on the
          engagement record, not in this listing.
        </p>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="crm-table w-full min-w-[720px] text-sm">
            <thead>
              <tr>
                <th>Client</th>
                <th>Centre</th>
                <th>Lead</th>
                <th>Type</th>
                <th>Status</th>
                <th>Visibility</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ e, clientName, centre, lead, institutional }) => (
                <tr key={e.id}>
                  <td>
                    <Link
                      to={`/engagements/${e.id}`}
                      className="font-medium text-brand-orange hover:underline"
                    >
                      {clientName}
                    </Link>
                  </td>
                  <td className="text-black/70">{centre}</td>
                  <td className="text-black/70">{lead}</td>
                  <td>
                    <Badge tone="default">{e.type}</Badge>
                  </td>
                  <td>
                    <Badge tone="info">{e.stage}</Badge>
                  </td>
                  <td>
                    {institutional ? (
                      <Badge tone="info">institutional</Badge>
                    ) : (
                      <Badge tone="default">shared</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
