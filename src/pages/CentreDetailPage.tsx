import { Link, useParams } from 'react-router-dom'
import { useCrmData } from '../context/DataContext'
import { useSession } from '../context/SessionContext'
import { clients, getCentre, getPerson } from '../data/mock'
import { formatZAR } from '../lib/format'
import { isStaffOwnPortfolioEngagement } from '../lib/staffOwnEngagements'
import { Badge, Card, EmptyState, PageHeader, SectionHeading } from '../components/ui'

export function CentreDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { engagements } = useCrmData()
  const { user, canSeeAllCentres, canSeeCentreFinancials, canSeeEngagement } =
    useSession()

  const centre = id ? getCentre(id) : undefined
  if (!centre) {
    return <EmptyState message="Centre not found." />
  }

  if (!canSeeAllCentres && user.centreId !== centre.id) {
    return <EmptyState message="You do not have access to this centre." />
  }

  const director = getPerson(centre.directorId)
  const staff = centre.staffIds
    .map((sid) => getPerson(sid))
    .filter(Boolean)
  const centreEngagements = engagements.filter((e) => e.centreId === centre.id)
  const statsEngagements =
    user.role === 'centre_staff'
      ? centreEngagements.filter((e) => isStaffOwnPortfolioEngagement(user, e))
      : centreEngagements

  const revenue = statsEngagements
    .filter((e) => e.stage === 'active')
    .reduce((s, e) => s + e.contractValue, 0)
  const profit = statsEngagements
    .filter((e) => e.stage === 'active')
    .reduce(
      (s, e) => s + (e.contractValue - e.directCosts - e.indirectCosts),
      0,
    )

  const pipeline = statsEngagements
    .filter((e) => e.stage === 'prospect')
    .reduce((s, e) => s + e.contractValue, 0)

  const avgMargin =
    statsEngagements.filter((e) => e.stage === 'active').length > 0
      ? statsEngagements
          .filter((e) => e.stage === 'active')
          .reduce((s, e) => {
            const p = e.contractValue - e.directCosts - e.indirectCosts
            const m = e.contractValue > 0 ? (p / e.contractValue) * 100 : 0
            return s + m
          }, 0) / statsEngagements.filter((e) => e.stage === 'active').length
      : 0

  const visibleEngagements = centreEngagements.filter((e) =>
    user.role === 'centre_staff'
      ? isStaffOwnPortfolioEngagement(user, e)
      : canSeeEngagement({
          centreId: e.centreId,
          leadStaffId: e.leadStaffId,
          supportingStaffIds: e.supportingStaffIds,
          visibility: e.visibility,
        }),
  )

  return (
    <div>
      <PageHeader
        title={centre.name}
        subtitle={`Director: ${director?.name ?? '—'} · Staff: ${staff.length}`}
        actions={
          <Link
            to="/financials"
            className="inline-flex rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-orange/25 transition hover:brightness-105"
          >
            Open financials
          </Link>
        }
      />

      {canSeeCentreFinancials(centre.id) ? (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Card className="p-4">
              <p className="text-xs font-medium uppercase text-black/55">
                Active revenue
              </p>
              <p className="mt-2 text-xl font-semibold">{formatZAR(revenue)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase text-black/55">
                Est. profit
              </p>
              <p className="mt-2 text-xl font-semibold">{formatZAR(profit)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase text-black/55">
                Active engagements
              </p>
              <p className="mt-2 text-xl font-semibold">
                {statsEngagements.filter((e) => e.stage === 'active').length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase text-black/55">
                Pipeline value
              </p>
              <p className="mt-2 text-xl font-semibold">{formatZAR(pipeline)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase text-black/55">
                Avg. margin (active)
              </p>
              <p className="mt-2 text-xl font-semibold">{avgMargin.toFixed(1)}%</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase text-black/55">
                Staff (FTE)
              </p>
              <p className="mt-2 text-xl font-semibold">{staff.length}</p>
            </Card>
          </div>
        </>
      ) : (
        <p className="mb-6 text-sm text-black/70">
          Financial detail for this centre is limited in your role (preview rules).
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeading>Staff</SectionHeading>
          <ul className="mt-4 divide-y divide-black/[0.06]">
            {staff.map((p) => (
              <li key={p!.id} className="flex justify-between py-2 text-sm">
                <span className="font-medium text-black">{p!.name}</span>
                <span className="text-black/55">{p!.title}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SectionHeading>Active & non-completed engagements</SectionHeading>
          <ul className="mt-4 space-y-3">
            {visibleEngagements
              .filter((e) => e.stage !== 'completed')
              .map((e) => {
                const cl = clients.find((c) => c.id === e.clientId)
                return (
                  <li key={e.id}>
                    <Link
                      to={`/engagements/${e.id}`}
                      className="font-medium text-brand-orange hover:underline"
                    >
                      {e.title}
                    </Link>
                    <p className="text-xs text-black/55">
                      {cl?.organisationName} · <Badge tone="default">{e.stage}</Badge>
                    </p>
                  </li>
                )
              })}
          </ul>
        </Card>
      </div>
    </div>
  )
}
