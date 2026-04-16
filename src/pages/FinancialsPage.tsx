import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCrmData } from '../context/DataContext'
import { useSession } from '../context/SessionContext'
import { centres, clients } from '../data/mock'
import { ProfitByCentreChart } from '../components/charts/DecisionCharts'
import { formatZAR } from '../lib/format'
import { isStaffOwnPortfolioEngagement } from '../lib/staffOwnEngagements'
import { Card, PageHeader, SectionHeading, StatCard } from '../components/ui'

export function FinancialsPage() {
  const { engagements } = useCrmData()
  const { user, canSeeAllCentres, canSeeCentreFinancials, canSeeEngagement } =
    useSession()

  const topClients = useMemo(() => {
    const byClient = new Map<string, number>()
    for (const e of engagements) {
      if (e.stage !== 'active') continue
      if (user.role === 'centre_staff') {
        if (!isStaffOwnPortfolioEngagement(user, e)) continue
      } else if (
        !canSeeEngagement({
          centreId: e.centreId,
          leadStaffId: e.leadStaffId,
          supportingStaffIds: e.supportingStaffIds,
          visibility: e.visibility,
        })
      ) {
        continue
      }
      byClient.set(e.clientId, (byClient.get(e.clientId) ?? 0) + e.contractValue)
    }
    return [...byClient.entries()]
      .map(([clientId, revenue]) => ({
        client: clients.find((c) => c.id === clientId),
        revenue,
      }))
      .filter((x) => x.client)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
  }, [engagements, canSeeEngagement, user])

  const byCentre = centres
    .filter((c) => canSeeAllCentres || c.id === user.centreId)
    .map((c) => {
      const list = engagements.filter((e) => {
        if (e.centreId !== c.id) return false
        if (user.role === 'centre_staff') {
          return isStaffOwnPortfolioEngagement(user, e)
        }
        return true
      })
      const revenue = list
        .filter((e) => e.stage === 'active')
        .reduce((s, e) => s + e.contractValue, 0)
      const profit = list
        .filter((e) => e.stage === 'active')
        .reduce(
          (s, e) => s + (e.contractValue - e.directCosts - e.indirectCosts),
          0,
        )
      const active = list.filter((e) => e.stage === 'active').length
      const completed = list.filter((e) => e.stage === 'completed').length
      return { c, revenue, profit, active, completed }
    })
    .filter((row) => canSeeCentreFinancials(row.c.id))

  const institutionalRevenue = engagements
    .filter((e) => e.stage === 'active')
    .reduce((s, e) => s + e.contractValue, 0)

  const profitabilityByCentre = byCentre.map(({ c, profit }) => ({
    shortName: c.shortName,
    profit,
  }))

  return (
    <div>
      <PageHeader
        title="Financial dashboards"
        subtitle={
          canSeeAllCentres
            ? 'Institutional (Dean): total revenue, profitability by centre, top clients and pipeline.'
            : user.role === 'centre_director'
              ? 'Centre-level revenue, profit, active vs completed engagements and pipeline for your unit.'
              : 'Your portfolio only — engagements where you are lead or supporting (not whole-centre totals).'
        }
      />

      {canSeeAllCentres ? (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total revenue (active)"
              value={formatZAR(institutionalRevenue)}
              hint="Institutional view"
            />
            <StatCard
              label="Pipeline (prospect)"
              value={formatZAR(
                engagements
                  .filter((e) => e.stage === 'prospect')
                  .reduce((s, e) => s + e.contractValue, 0),
              )}
            />
            <StatCard
              label="Centres"
              value={String(centres.length)}
              hint="Profitability by centre below"
            />
          </div>

          <ProfitByCentreChart
            data={profitabilityByCentre.map((row) => ({
              name: row.shortName,
              profit: row.profit,
            }))}
          />

          <Card className="mb-8 overflow-hidden p-0">
            <div className="border-b border-black/[0.06] bg-black/[0.02] px-6 py-4">
              <SectionHeading>Top clients by active revenue</SectionHeading>
            </div>
            <div className="overflow-x-auto">
              <table className="crm-table w-full min-w-[400px] text-sm">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Active revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.map(({ client, revenue }) => (
                    <tr key={client!.id}>
                      <td>
                        <Link
                          className="font-medium text-brand-orange hover:underline"
                          to={`/clients/${client!.id}`}
                        >
                          {client!.organisationName}
                        </Link>
                      </td>
                      <td className="tabular-nums">{formatZAR(revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {byCentre.map(({ c, revenue, profit, active, completed }) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-black">{c.shortName}</h2>
                <p className="text-sm text-black/70">{c.name}</p>
              </div>
              <Link
                to={`/centres/${c.id}`}
                className="text-sm font-medium text-brand-orange hover:underline"
              >
                Centre
              </Link>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-black/55">Revenue (active)</dt>
                <dd className="font-semibold">{formatZAR(revenue)}</dd>
              </div>
              <div>
                <dt className="text-black/55">Est. profit</dt>
                <dd className="font-semibold text-brand-orange">{formatZAR(profit)}</dd>
              </div>
              <div>
                <dt className="text-black/55">Active</dt>
                <dd>{active}</dd>
              </div>
              <div>
                <dt className="text-black/55">Completed</dt>
                <dd>{completed}</dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>
    </div>
  )
}
