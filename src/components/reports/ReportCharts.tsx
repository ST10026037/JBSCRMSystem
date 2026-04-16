import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Engagement, EngagementStage } from '../../types/domain'
import { formatZAR } from '../../lib/format'
import { Card, SectionHeading } from '../ui'
import { CHART_ORANGE } from '../charts/chartTheme'

const STAGE_ORDER: EngagementStage[] = [
  'prospect',
  'active',
  'completed',
  'on_hold',
]

const STAGE_LABEL: Record<EngagementStage, string> = {
  prospect: 'Prospect',
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On hold',
}

const STAGE_COLOR: Record<EngagementStage, string> = {
  prospect: '#94a3b8',
  active: CHART_ORANGE,
  completed: '#16a34a',
  on_hold: '#ca8a04',
}

/** Pipeline — donut: share of total contract value by stage (distinct chart type). */
export function ReportPipelineValueChart({ engagements }: { engagements: Engagement[] }) {
  const pieData = useMemo(() => {
    return STAGE_ORDER.map((stage) => ({
      stage: STAGE_LABEL[stage],
      key: stage,
      value: engagements
        .filter((e) => e.stage === stage)
        .reduce((s, e) => s + e.contractValue, 0),
    })).filter((d) => d.value > 0)
  }, [engagements])

  const total = useMemo(
    () => pieData.reduce((s, d) => s + d.value, 0),
    [pieData],
  )

  if (engagements.length === 0) return null

  if (pieData.length === 0 || total <= 0) {
    return (
      <Card className="mb-6">
        <SectionHeading>Contract value by stage</SectionHeading>
        <p className="mt-1 text-sm text-black/60">No contract value in pipeline stages to chart.</p>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <SectionHeading>Contract value by stage</SectionHeading>
      <p className="mt-1 text-sm text-black/60">
        Each slice is that stage&apos;s share of total pipeline contract value (same engagements as the table).
      </p>
      <div className="mt-4 h-[280px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="stage"
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={100}
              paddingAngle={2}
              stroke="#fff"
              strokeWidth={1}
            >
              {pieData.map((d) => (
                <Cell key={d.key} fill={STAGE_COLOR[d.key]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const row = payload[0].payload as { stage: string; value: number }
                const pct = total > 0 ? ((row.value / total) * 100).toFixed(1) : '0'
                return (
                  <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
                    <p className="font-medium text-black">{row.stage}</p>
                    <p className="mt-0.5 tabular-nums">{formatZAR(row.value)}</p>
                    <p className="text-black/60">{pct}% of charted total</p>
                  </div>
                )
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

type PendingRow = { amount: number; status: string }

/** Revenue — radial bars: pending vs overdue milestone cash (distinct from pipeline donut). */
export function ReportRevenuePendingChart({ pending }: { pending: PendingRow[] }) {
  const radialData = useMemo(() => {
    let pendingSum = 0
    let overdueSum = 0
    for (const row of pending) {
      if (row.status === 'overdue') overdueSum += row.amount
      else pendingSum += row.amount
    }
    return [
      { name: 'Still pending', value: pendingSum, fill: '#94a3b8' },
      { name: 'Overdue', value: overdueSum, fill: '#dc2626' },
    ].filter((d) => d.value > 0)
  }, [pending])

  if (pending.length === 0) {
    return (
      <Card className="mb-6">
        <SectionHeading>Outstanding milestone cash</SectionHeading>
        <p className="mt-1 text-sm text-black/60">No pending or overdue milestones in the dataset.</p>
      </Card>
    )
  }

  if (radialData.length === 0) {
    return (
      <Card className="mb-6">
        <SectionHeading>Outstanding milestone cash</SectionHeading>
        <p className="mt-1 text-sm text-black/60">Milestones exist but amounts net to zero in this view.</p>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <SectionHeading>Outstanding milestone cash</SectionHeading>
      <p className="mt-1 text-sm text-black/60">
        Radial length reflects each bucket&apos;s share of outstanding milestone cash — aligns with the table.
      </p>
      <div className="mt-4 h-[260px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="18%"
            outerRadius="100%"
            data={radialData}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 'dataMax']} tick={false} />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={6}
              max={Math.max(...radialData.map((d) => d.value), 1)}
            >
              {radialData.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </RadialBar>
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const row = payload[0].payload as { name: string; value: number }
                return (
                  <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
                    <p className="font-medium text-black">{row.name}</p>
                    <p className="mt-0.5 tabular-nums">{formatZAR(row.value)}</p>
                  </div>
                )
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

type CentreRow = { name: string; rev: number; profit: number }

/** Centres — dual line chart across centres (distinct from bar-based tabs). */
export function ReportCentreCompareChart({ rows }: { rows: CentreRow[] }) {
  if (rows.length === 0) return null

  return (
    <Card className="mb-6">
      <SectionHeading>Revenue and profit by centre</SectionHeading>
      <p className="mt-1 text-sm text-black/60">
        Two lines over the same centres — active revenue (blue) and estimated profit (orange).
      </p>
      <div className="mt-4 h-[min(320px,42vh)] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 12, left: 4, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              angle={-32}
              textAnchor="end"
              height={56}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => {
                const n = Number(v)
                if (!Number.isFinite(n)) return ''
                if (n >= 1_000_000) return `R ${(n / 1_000_000).toFixed(1)}m`
                if (n >= 1_000) return `R ${(n / 1_000).toFixed(0)}k`
                return `R ${Math.round(n)}`
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const row = payload[0].payload as CentreRow
                return (
                  <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
                    <p className="font-medium text-black">{row.name}</p>
                    <p className="mt-1 tabular-nums text-black/80">
                      Revenue: {formatZAR(row.rev)}
                    </p>
                    <p className="tabular-nums text-black/80">Profit: {formatZAR(row.profit)}</p>
                  </div>
                )
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="rev"
              name="Active revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name="Est. profit"
              stroke={CHART_ORANGE}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

type StaffRow = { name: string; touches: number; engagements: number }

/** Staff — horizontal bars (only tab using this layout). */
export function ReportStaffActivityChart({ rows }: { rows: StaffRow[] }) {
  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.touches - a.touches),
    [rows],
  )

  const yAxisWidth = useMemo(() => {
    const longest = sorted.reduce((max, d) => Math.max(max, d.name.length), 0)
    return Math.min(260, Math.max(100, Math.ceil(longest * 6.5 + 24)))
  }, [sorted])

  const chartHeight = Math.min(400, Math.max(200, 40 + sorted.length * 36))

  if (sorted.length === 0) return null

  return (
    <Card className="mb-6">
      <SectionHeading>Logged interactions by staff</SectionHeading>
      <p className="mt-1 text-sm text-black/60">
        Touches where this person is recorded as the author (see table for centre and engagement counts).
      </p>
      <div className="mt-4 w-full min-w-0" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 8, right: 12, left: 12, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={yAxisWidth}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const row = payload[0].payload as StaffRow
                return (
                  <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
                    <p className="font-medium text-black">{row.name}</p>
                    <p className="mt-1 text-black/80">Interactions logged: {row.touches}</p>
                    <p className="text-black/80">Engagements involved: {row.engagements}</p>
                  </div>
                )
              }}
            />
            <Bar dataKey="touches" fill={CHART_ORANGE} radius={[0, 6, 6, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

type ClientPoint = { name: string; engCount: number; comms: number }

const CLIENT_TOP_N = 12

type ClientBarRow = ClientPoint & { label: string }

/** Client intensity — stacked vertical bars: height = total activity; segments = engagements vs communications. */
export function ReportClientIntensityChart({ points }: { points: ClientPoint[] }) {
  const rows = useMemo(() => {
    const sorted = [...points].sort(
      (a, b) => b.engCount + b.comms - (a.engCount + a.comms),
    )
    const top = sorted.slice(0, CLIENT_TOP_N)
    return top.map((p) => ({
      ...p,
      label: p.name.length > 22 ? `${p.name.slice(0, 20)}…` : p.name,
    }))
  }, [points])

  if (points.length === 0) return null

  if (rows.length === 0) {
    return (
      <Card className="mb-6">
        <SectionHeading>Client engagement intensity</SectionHeading>
        <p className="mt-1 text-sm text-black/60">No client activity to display.</p>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <SectionHeading>Client engagement intensity</SectionHeading>
      <p className="mt-1 text-sm text-black/60">
        Top {rows.length} clients by total activity. Each column stacks engagements (blue) and communication
        entries (orange); total height is combined intensity.
      </p>
      <div className="mt-4 h-[min(360px,45vh)] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 8, right: 12, left: 4, bottom: 56 }}
            barCategoryGap="12%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={64}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const row = payload[0].payload as ClientBarRow
                const total = row.engCount + row.comms
                return (
                  <div className="max-w-[280px] rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
                    <p className="font-medium text-black">{row.name}</p>
                    <p className="mt-1 text-black/80">Engagements: {row.engCount}</p>
                    <p className="text-black/80">Communications: {row.comms}</p>
                    <p className="mt-0.5 text-black/55">Total: {total}</p>
                  </div>
                )
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="engCount"
              name="Engagements"
              stackId="intensity"
              fill="#3b82f6"
              radius={[0, 0, 6, 6]}
              maxBarSize={40}
            />
            <Bar
              dataKey="comms"
              name="Communication entries"
              stackId="intensity"
              fill={CHART_ORANGE}
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
