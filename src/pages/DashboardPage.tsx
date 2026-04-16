import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DashboardCharts } from '../components/dashboard/DashboardCharts'
import { useCrmData } from '../context/DataContext'
import { useSession } from '../context/SessionContext'
import { alerts, centres, clients, getPerson } from '../data/mock'
import { contactStaleBucket, getLastContactIso } from '../lib/contactHealth'
import { filterAlertsForUser } from '../lib/alertAccess'
import { daysSince, formatZAR } from '../lib/format'
import { Badge, Card, PageHeader, SectionHeading, StatCard } from '../components/ui'

export function DashboardPage() {
  const { engagements } = useCrmData()
  const {
    user,
    canSeeAllCentres,
    canSeeEngagement,
    canSeeClient,
  } = useSession()

  const scopedEngagements = engagements.filter((e) =>
    canSeeEngagement({
      centreId: e.centreId,
      leadStaffId: e.leadStaffId,
      supportingStaffIds: e.supportingStaffIds,
      visibility: e.visibility,
    }),
  )

  const scopedClients = clients.filter((c) =>
    canSeeClient({
      centreId: c.centreId,
      leadStaffId: c.leadStaffId,
      supportingStaffIds: c.supportingStaffIds,
      visibility: c.visibility,
    }),
  )

  const visibleAlerts = useMemo(
    () =>
      filterAlertsForUser(
        alerts,
        user,
        engagements,
        clients,
        canSeeEngagement,
        canSeeClient,
      ),
    [user, engagements, clients, canSeeEngagement, canSeeClient],
  )

  const totalRevenue = scopedEngagements
    .filter((e) => e.stage === 'active' || e.stage === 'prospect')
    .reduce((s, e) => s + e.contractValue, 0)

  const pipeline = scopedEngagements
    .filter((e) => e.stage === 'prospect')
    .reduce((s, e) => s + e.contractValue, 0)

  const activeContractValue = scopedEngagements
    .filter((e) => e.stage === 'active')
    .reduce((s, e) => s + e.contractValue, 0)

  const centreBars = useMemo(() => {
    const list = canSeeAllCentres
      ? centres
      : centres.filter((c) => c.id === user.centreId)
    return list.map((c) => ({
      name: c.shortName,
      count: scopedEngagements.filter((e) => e.centreId === c.id).length,
    }))
  }, [canSeeAllCentres, scopedEngagements, user.centreId])

  const showMultiCentreChart = canSeeAllCentres && centres.length > 1

  const alertCount = visibleAlerts.length

  const staleBuckets = { d30: 0, d60: 0, d90: 0, none: 0 }
  for (const e of scopedEngagements) {
    const iso = getLastContactIso(e)
    const b = contactStaleBucket(iso)
    if (b === 'none') staleBuckets.none += 1
    else if (b === 'd30') staleBuckets.d30 += 1
    else if (b === 'd60') staleBuckets.d60 += 1
    else if (b === 'd90plus') staleBuckets.d90 += 1
  }

  const dashboardTitle =
    user.role === 'super_admin'
      ? 'Institutional dashboard'
      : user.role === 'centre_director'
        ? 'Centre dashboard'
        : 'My dashboard'

  const subtitle =
    user.role === 'super_admin'
      ? 'Institutional intelligence — who, which centre, lead, financials, communication & delivery.'
      : user.role === 'centre_director'
        ? 'Centre performance, engagements and team activity for your unit.'
        : 'Your engagements, touchpoints and tasks — scoped to your access.'

  return (
    <div>
      <PageHeader
        title={dashboardTitle}
        subtitle={subtitle}
        actions={
          <Link
            to="/alerts"
            className="inline-flex items-center rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-black shadow-sm transition hover:border-brand-orange/35 hover:bg-brand-orange/[0.06]"
          >
            View alerts ({alertCount})
          </Link>
        }
      />

      <Card className="mb-8 border-brand-orange/25 bg-gradient-to-br from-brand-orange/[0.09] to-brand-orange/[0.03]">
        <SectionHeading>Core purpose</SectionHeading>
        <p className="mt-1 text-xs text-black/55">
          Who we work with · which centre owns the relationship · who leads · financial value ·
          communication &amp; delivery health.
        </p>
        <dl className="mt-4 grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-5 xl:gap-x-10">
          <div className="min-w-0">
            <dt className="text-xs uppercase text-black/55">Who we work with</dt>
            <dd className="mt-1 text-sm font-medium text-black">
              {scopedClients.length} client orgs (visible)
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs uppercase text-black/55">Centre ownership</dt>
            <dd className="mt-1 text-sm font-medium text-black">
              {canSeeAllCentres
                ? `${centres.length} centres`
                : centres.find((c) => c.id === user.centreId)?.shortName ?? '—'}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs uppercase text-black/55">Who leads</dt>
            <dd className="mt-1 text-sm font-medium text-black">
              {scopedEngagements.length} engagements in view
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs uppercase text-black/55">Financial value</dt>
            <dd className="mt-1 text-sm font-medium text-black">
              {formatZAR(totalRevenue)} contract value (active + prospect)
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs uppercase text-black/55">Communication & delivery</dt>
            <dd className="mt-1 text-sm font-medium text-black">
              {staleBuckets.none} with no logged contact; see 30/60/90 below
            </dd>
          </div>
        </dl>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={canSeeAllCentres ? 'Scoped pipeline value' : 'Pipeline (visible)'}
          value={formatZAR(pipeline)}
          hint="Prospect-stage engagements"
        />
        <StatCard
          label="Active contract value (visible)"
          value={formatZAR(totalRevenue)}
          hint="Active + prospect in your scope"
        />
        <StatCard
          label="Engagements in scope"
          value={String(scopedEngagements.length)}
          hint={`${scopedClients.length} client organisations`}
        />
        <StatCard
          label="Open alerts"
          value={String(alertCount)}
          hint="Payments, dormancy, overlap, deadlines"
        />
      </div>

      <DashboardCharts
        staleBuckets={staleBuckets}
        engagements={scopedEngagements}
        pipelineValue={pipeline}
        activeContractValue={activeContractValue}
        centreBars={centreBars}
        showMultiCentreChart={showMultiCentreChart}
      />

      <Card className="mt-8">
        <SectionHeading>
          Contact health — no contact in 30 / 60 / 90 days
        </SectionHeading>
        <p className="mt-1 text-sm text-black/70">
          Counts of engagements in your scope by days since last logged interaction.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-black/[0.06] bg-black/[0.03] px-3 py-3 text-sm shadow-sm">
            <p className="text-xs font-medium text-black/50">31–60 days</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{staleBuckets.d30}</p>
          </div>
          <div className="rounded-xl border border-black/[0.06] bg-black/[0.03] px-3 py-3 text-sm shadow-sm">
            <p className="text-xs font-medium text-black/50">61–90 days</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{staleBuckets.d60}</p>
          </div>
          <div className="rounded-xl border border-black/[0.06] bg-black/[0.03] px-3 py-3 text-sm shadow-sm">
            <p className="text-xs font-medium text-black/50">90+ days</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{staleBuckets.d90}</p>
          </div>
          <div className="rounded-xl border border-brand-orange/25 bg-brand-orange/10 px-3 py-3 text-sm shadow-sm">
            <p className="text-xs font-medium text-black/50">No log / never</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{staleBuckets.none}</p>
          </div>
        </div>
        <ul className="mt-4 divide-y divide-black/[0.06] text-sm">
          {scopedEngagements.slice(0, 8).map((e) => {
            const iso = getLastContactIso(e)
            const bucket = contactStaleBucket(iso)
            const client = clients.find((c) => c.id === e.clientId)
            const d = iso ? daysSince(iso) : null
            return (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <Link className="font-medium text-brand-orange" to={`/engagements/${e.id}`}>
                  {e.title}
                </Link>
                <span className="text-black/55">
                  {client?.organisationName} · last{' '}
                  {iso ? `${d}d ago` : '—'}
                </span>
                {bucket !== 'current' ? (
                  <Badge tone="warning">{bucket}</Badge>
                ) : null}
              </li>
            )
          })}
        </ul>
      </Card>

      {user.role === 'super_admin' ? (
        <Card className="mt-8 border-black/[0.08]">
          <SectionHeading>Super Admin</SectionHeading>
          <p className="mt-2 text-sm text-black/70">
            Full visibility across all centres, financials, engagements and communications.
            Permission overrides and enforcement are server-side in production; this preview
            models Dean / executive oversight including institutional reporting and governance
            signals.
          </p>
        </Card>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeading>Centres snapshot</SectionHeading>
          <ul className="mt-4 space-y-3">
            {(canSeeAllCentres ? centres : centres.filter((c) => c.id === user.centreId)).map(
              (c) => {
                const dir = getPerson(c.directorId)
                const ec = scopedEngagements.filter((e) => e.centreId === c.id).length
                return (
                  <li
                    key={c.id}
                    className="flex items-start justify-between gap-3 border-b border-black/[0.06] pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <Link
                        to={`/centres/${c.id}`}
                        className="font-medium text-brand-orange hover:underline"
                      >
                        {c.shortName}
                      </Link>
                      <p className="text-xs text-black/55">{dir?.name}</p>
                    </div>
                    <Badge tone="info">{ec} engagements</Badge>
                  </li>
                )
              },
            )}
          </ul>
        </Card>

        <Card>
          <SectionHeading>Recent engagements</SectionHeading>
          <ul className="mt-4 space-y-3">
            {scopedEngagements.slice(0, 5).map((e) => {
              const client = clients.find((x) => x.id === e.clientId)
              const lead = getPerson(e.leadStaffId)
              return (
                <li
                  key={e.id}
                  className="border-b border-black/[0.06] pb-3 last:border-0 last:pb-0"
                >
                  <Link
                    to={`/engagements/${e.id}`}
                    className="font-medium text-black hover:text-brand-orange"
                  >
                    {e.title}
                  </Link>
                  <p className="text-xs text-black/70">
                    {client?.organisationName} · Lead {lead?.name}
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
