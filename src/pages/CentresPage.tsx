import { Link } from 'react-router-dom'
import { useCrmData } from '../context/DataContext'
import { useSession } from '../context/SessionContext'
import { centres, getPerson } from '../data/mock'
import { isStaffOwnPortfolioEngagement } from '../lib/staffOwnEngagements'
import { Badge, Card, PageHeader } from '../components/ui'

export function CentresPage() {
  const { engagements } = useCrmData()
  const { user, canSeeAllCentres } = useSession()
  const list = canSeeAllCentres
    ? centres
    : centres.filter((c) => c.id === user.centreId)

  return (
    <div>
      <PageHeader
        title="Centres"
        subtitle="Entrepreneurship, CAB, PPAS; each with director, staff, engagements, financials & metrics on the centre page."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => {
          const director = getPerson(c.directorId)
          const count =
            user.role === 'centre_staff'
              ? engagements.filter(
                  (e) =>
                    e.centreId === c.id &&
                    isStaffOwnPortfolioEngagement(user, e),
                ).length
              : engagements.filter((e) => e.centreId === c.id).length
          return (
            <Card
              key={c.id}
              className="flex flex-col transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-black">
                    <Link
                      to={`/centres/${c.id}`}
                      className="text-brand-orange hover:underline"
                    >
                      {c.name}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-black/70">{director?.name}</p>
                </div>
                <Badge tone="info">{count} engagements</Badge>
              </div>
              <p className="mt-4 text-sm text-black/70">
                Staff: {c.staffIds.length} · Director-led coordination for
                external relationships.
              </p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
