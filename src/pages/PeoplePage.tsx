import { Link } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { centres, clients, people } from '../data/mock'
import { Badge, Card, PageHeader, SectionHeading } from '../components/ui'

export function PeoplePage() {
  const { canSeeStaffProfile } = useSession()

  const staffAndDirectors = people.filter((p) => p.role !== 'executive')
  const executives = people.filter((p) => p.role === 'executive')

  return (
    <div>
      <PageHeader
        title="People"
        subtitle="Staff and directors by centre. Client organisations are managed under Clients."
      />

      <Card className="mb-8">
        <SectionHeading>Executives</SectionHeading>
        <ul className="mt-4 divide-y divide-black/[0.06]">
          {executives.map((p) => (
            <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
              <span className="font-medium">{p.name}</span>
              <span className="text-black/55">{p.title}</span>
            </li>
          ))}
        </ul>
      </Card>

      <h2 className="mb-4 text-base font-semibold tracking-tight text-black">
        Centre staff & directors
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {centres.map((c) => {
          const rows = staffAndDirectors.filter((p) => p.centreId === c.id)
          return (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-black">
                  <Link
                    className="text-brand-orange hover:underline"
                    to={`/centres/${c.id}`}
                  >
                    {c.shortName}
                  </Link>
                </h3>
              </div>
              <ul className="mt-4 divide-y divide-black/[0.06]">
                {rows.map((p) => {
                  const visible = canSeeStaffProfile(p)
                  if (!visible) {
                    return (
                      <li key={p.id} className="flex items-center gap-2 py-2 text-sm text-black/55">
                        <span className="italic">Restricted profile</span>
                        <Badge tone="warning">Private</Badge>
                      </li>
                    )
                  }
                  return (
                    <li
                      key={p.id}
                      className="flex flex-col gap-1 py-2 text-sm sm:flex-row sm:justify-between"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-black/55">{p.title}</span>
                      {p.profileVisibility ? (
                        <Badge tone="default">{p.profileVisibility}</Badge>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </Card>
          )
        })}
      </div>

      <Card className="mt-8">
        <SectionHeading>Client organisations (summary)</SectionHeading>
        <p className="mt-1 text-sm text-black/70">
          Full client profiles (contacts, ownership, history) live under{' '}
          <Link className="font-medium text-brand-orange" to="/clients">
            Clients
          </Link>
          .
        </p>
        <p className="mt-2 text-sm text-black/55">
          {clients.length} organisations in mock data.
        </p>
      </Card>
    </div>
  )
}
