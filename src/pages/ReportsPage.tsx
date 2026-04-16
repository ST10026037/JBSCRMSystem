import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCrmData } from '../context/DataContext'
import { useSession } from '../context/SessionContext'
import { centres, clients, people } from '../data/mock'
import { formatZAR } from '../lib/format'
import { isStaffOwnPortfolioEngagement } from '../lib/staffOwnEngagements'
import { getLastContactIso } from '../lib/contactHealth'
import {
  ReportCentreCompareChart,
  ReportClientIntensityChart,
  ReportPipelineValueChart,
  ReportRevenuePendingChart,
  ReportStaffActivityChart,
} from '../components/reports/ReportCharts'
import { Card, PageHeader } from '../components/ui'

const tabs = [
  { id: 'pipeline', label: 'Engagement pipeline' },
  { id: 'revenue', label: 'Revenue forecasts' },
  { id: 'centres', label: 'Centre performance' },
  { id: 'staff', label: 'Staff activity' },
  { id: 'clients', label: 'Client intensity' },
] as const

type TabId = (typeof tabs)[number]['id']

export function ReportsPage() {
  const { engagements } = useCrmData()
  const { user, canSeeEngagement, canSeeClient } = useSession()
  const [tab, setTab] = useState<TabId>('pipeline')

  /** Centre Staff: own engagements only (lead/support). Directors & Super Admin: role-based visibility. */
  const visibleEngagements = useMemo(
    () =>
      engagements.filter((e) =>
        user.role === 'centre_staff'
          ? isStaffOwnPortfolioEngagement(user, e)
          : canSeeEngagement({
              centreId: e.centreId,
              leadStaffId: e.leadStaffId,
              supportingStaffIds: e.supportingStaffIds,
              visibility: e.visibility,
            }),
      ),
    [engagements, user, canSeeEngagement],
  )

  const visibleClients = useMemo(() => {
    if (user.role === 'centre_staff') {
      const ids = new Set(
        engagements
          .filter((e) => isStaffOwnPortfolioEngagement(user, e))
          .map((e) => e.clientId),
      )
      return clients.filter(
        (c) =>
          ids.has(c.id) &&
          canSeeClient({
            centreId: c.centreId,
            leadStaffId: c.leadStaffId,
            supportingStaffIds: c.supportingStaffIds,
            visibility: c.visibility,
          }),
      )
    }
    return clients.filter((c) =>
      canSeeClient({
        centreId: c.centreId,
        leadStaffId: c.leadStaffId,
        supportingStaffIds: c.supportingStaffIds,
        visibility: c.visibility,
      }),
    )
  }, [user, engagements, clients, canSeeClient])

  const pipelineRows = useMemo(
    () =>
      [...visibleEngagements]
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((e) => ({
          e,
          client: clients.find((c) => c.id === e.clientId)?.organisationName,
          centre: centres.find((c) => c.id === e.centreId)?.shortName,
        })),
    [visibleEngagements],
  )

  const revenueForecast = useMemo(() => {
    const active = visibleEngagements.filter((e) => e.stage === 'active')
    const pending = visibleEngagements.flatMap((e) =>
      e.paymentSchedule
        .filter((p) => p.status === 'pending' || p.status === 'overdue')
        .map((p) => ({
          engagement: e.title,
          label: p.label,
          due: p.dueDate,
          amount: p.amount,
          status: p.status,
        })),
    )
    return { activeTotal: active.reduce((s, e) => s + e.contractValue, 0), pending }
  }, [visibleEngagements])

  const centreCompare = useMemo(() => {
    const centreList =
      user.role === 'centre_staff' && user.centreId
        ? centres.filter((c) => c.id === user.centreId)
        : centres
    return centreList.map((c) => {
      const list = visibleEngagements.filter((e) => e.centreId === c.id)
      const rev = list
        .filter((e) => e.stage === 'active')
        .reduce((s, e) => s + e.contractValue, 0)
      const profit = list
        .filter((e) => e.stage === 'active')
        .reduce(
          (s, e) => s + (e.contractValue - e.directCosts - e.indirectCosts),
          0,
        )
      return { c, rev, profit, n: list.length }
    })
  }, [visibleEngagements, user.centreId, user.role, centres])

  const staffActivity = useMemo(() => {
    return people
      .filter((p) => p.role === 'staff')
      .filter(
        (p) =>
          user.role !== 'centre_staff' ||
          (p.centreId === user.centreId && p.id === user.id),
      )
      .map((p) => {
        const mine = visibleEngagements.filter(
          (e) => e.leadStaffId === p.id || e.supportingStaffIds.includes(p.id),
        )
        const touches = mine.reduce(
          (s, e) => s + e.communications.filter((x) => x.authorId === p.id).length,
          0,
        )
        return { p, mine: mine.length, touches }
      })
  }, [visibleEngagements, user.centreId, user.id, user.role])

  const clientIntensity = useMemo(() => {
    return visibleClients.map((cl) => {
      const rel = visibleEngagements.filter((e) => e.clientId === cl.id)
      const comms = rel.reduce((s, e) => s + e.communications.length, 0)
      return { cl, engCount: rel.length, comms }
    })
  }, [visibleClients, visibleEngagements])

  const centreChartRows = useMemo(
    () => centreCompare.map(({ c, rev, profit }) => ({ name: c.shortName, rev, profit })),
    [centreCompare],
  )

  const staffChartRows = useMemo(
    () =>
      staffActivity.map(({ p, mine, touches }) => ({
        name: p.name,
        touches,
        engagements: mine,
      })),
    [staffActivity],
  )

  const clientScatterPoints = useMemo(
    () =>
      clientIntensity.map(({ cl, engCount, comms }) => ({
        name: cl.organisationName,
        engCount,
        comms,
      })),
    [clientIntensity],
  )

  return (
    <div>
      <PageHeader
        title="Reporting & analytics"
        subtitle={
          user.role === 'super_admin'
            ? 'Pipeline, revenue forecasts, centre performance, staff activity and client intensity — institutional view.'
            : user.role === 'centre_director'
              ? 'Centre-wide analytics for your assigned unit.'
              : 'Your engagements only (lead or supporting) — not whole-centre totals.'
        }
      />

      <div className="mb-8 flex flex-wrap gap-2 border-b border-black/[0.08] pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20'
                : 'bg-black/[0.05] text-black/75 hover:bg-black/[0.08]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pipeline' ? (
        <>
        <ReportPipelineValueChart engagements={visibleEngagements} />
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="crm-table w-full min-w-[720px] text-sm">
              <thead>
                <tr>
                  <th>Engagement</th>
                  <th>Client</th>
                  <th>Centre</th>
                  <th>Stage</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {pipelineRows.map(({ e, client, centre }) => (
                  <tr key={e.id}>
                    <td>
                      <Link
                        className="font-medium text-brand-orange hover:underline"
                        to={`/engagements/${e.id}`}
                      >
                        {e.title}
                      </Link>
                    </td>
                    <td className="text-black/70">{client}</td>
                    <td>{centre}</td>
                    <td>{e.stage}</td>
                    <td className="tabular-nums">{formatZAR(e.contractValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        </>
      ) : null}

      {tab === 'revenue' ? (
        <div className="space-y-4">
          <ReportRevenuePendingChart pending={revenueForecast.pending} />
          <Card>
            <p className="text-sm text-black/70">
              Active contract value (sum of active engagements):{' '}
              <strong>{formatZAR(revenueForecast.activeTotal)}</strong>
            </p>
          </Card>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="crm-table w-full text-sm">
                <thead>
                  <tr>
                    <th>Engagement</th>
                    <th>Milestone</th>
                    <th>Due</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueForecast.pending.map((row, i) => (
                    <tr key={`${row.engagement}-${i}`}>
                      <td>{row.engagement}</td>
                      <td>{row.label}</td>
                      <td>{row.due}</td>
                      <td className="tabular-nums">{formatZAR(row.amount)}</td>
                      <td>{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : null}

      {tab === 'centres' ? (
        <>
        <ReportCentreCompareChart rows={centreChartRows} />
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="crm-table w-full text-sm">
              <thead>
                <tr>
                  <th>Centre</th>
                  <th>Active revenue</th>
                  <th>Est. profit</th>
                  <th>Engagements</th>
                </tr>
              </thead>
              <tbody>
                {centreCompare.map(({ c, rev, profit, n }) => (
                  <tr key={c.id}>
                    <td className="font-medium">{c.shortName}</td>
                    <td className="tabular-nums">{formatZAR(rev)}</td>
                    <td className="tabular-nums">{formatZAR(profit)}</td>
                    <td className="tabular-nums">{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        </>
      ) : null}

      {tab === 'staff' ? (
        <>
        <ReportStaffActivityChart rows={staffChartRows} />
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="crm-table w-full text-sm">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Centre</th>
                  <th>Engagements (involved)</th>
                  <th>Logged interactions (as author)</th>
                </tr>
              </thead>
              <tbody>
                {staffActivity.map(({ p, mine, touches }) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{centres.find((c) => c.id === p.centreId)?.shortName}</td>
                    <td className="tabular-nums">{mine}</td>
                    <td className="tabular-nums">{touches}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        </>
      ) : null}

      {tab === 'clients' ? (
        <>
        <ReportClientIntensityChart points={clientScatterPoints} />
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="crm-table w-full text-sm">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Engagements</th>
                  <th>Communication entries</th>
                  <th>Last contact (any eng.)</th>
                </tr>
              </thead>
              <tbody>
                {clientIntensity.map(({ cl, engCount: n, comms }) => {
                  const rel = visibleEngagements.filter((e) => e.clientId === cl.id)
                  const last = rel
                    .map((e) => getLastContactIso(e))
                    .filter(Boolean) as string[]
                  const lastIso = last.sort().at(-1) ?? null
                  return (
                    <tr key={cl.id}>
                      <td>
                        <Link
                          className="font-medium text-brand-orange hover:underline"
                          to={`/clients/${cl.id}`}
                        >
                          {cl.organisationName}
                        </Link>
                      </td>
                      <td className="tabular-nums">{n}</td>
                      <td className="tabular-nums">{comms}</td>
                      <td className="text-black/70">{lastIso ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
        </>
      ) : null}
    </div>
  )
}
