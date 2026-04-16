import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Engagement } from '../../types/domain'
import { formatZAR } from '../../lib/format'
import { Card, SectionHeading } from '../ui'

const BRAND_ORANGE = '#F26522'

const STAGE_LABEL: Record<string, string> = {
  prospect: 'Prospect',
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On hold',
}

const STAGE_COLOR: Record<string, string> = {
  prospect: '#94a3b8',
  active: BRAND_ORANGE,
  completed: '#16a34a',
  on_hold: '#ca8a04',
}

const TYPE_LABEL: Record<string, string> = {
  research: 'Research',
  training: 'Training',
  consulting: 'Consulting',
  partnership: 'Partnership',
}

type StaleBuckets = { d30: number; d60: number; d90: number; none: number }

type Props = {
  staleBuckets: StaleBuckets
  engagements: Engagement[]
  pipelineValue: number
  activeContractValue: number
  centreBars: { name: string; count: number }[]
  showMultiCentreChart: boolean
}

export function DashboardCharts({
  staleBuckets,
  engagements,
  pipelineValue,
  activeContractValue,
  centreBars,
  showMultiCentreChart,
}: Props) {
  const contactData = useMemo(
    () => [
      { label: '31–60d', count: staleBuckets.d30 },
      { label: '61–90d', count: staleBuckets.d60 },
      { label: '90+d', count: staleBuckets.d90 },
      { label: 'No log', count: staleBuckets.none },
    ],
    [staleBuckets],
  )

  const stageData = useMemo(() => {
    const stages = ['prospect', 'active', 'completed', 'on_hold'] as const
    return stages
      .map((stage) => ({
        name: STAGE_LABEL[stage],
        value: engagements.filter((e) => e.stage === stage).length,
        stage,
      }))
      .filter((d) => d.value > 0)
  }, [engagements])

  const pipelineRadial = useMemo(
    () => [
      {
        name: 'Pipeline',
        value: Math.max(0, pipelineValue),
        fill: '#94a3b8',
      },
      {
        name: 'Active',
        value: Math.max(0, activeContractValue),
        fill: BRAND_ORANGE,
      },
    ],
    [pipelineValue, activeContractValue],
  )

  const typeData = useMemo(() => {
    const types = ['research', 'training', 'consulting', 'partnership'] as const
    return types.map((t) => ({
      name: TYPE_LABEL[t],
      count: engagements.filter((e) => e.type === t).length,
    }))
  }, [engagements])

  const fourthTitle = showMultiCentreChart
    ? 'Engagements by centre'
    : 'Engagements by type'

  const lineData = showMultiCentreChart ? centreBars : typeData
  const lineKey = showMultiCentreChart ? 'count' : 'count'
  const lineXKey = 'name'

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <Card>
        <SectionHeading>Contact recency</SectionHeading>
        <p className="mt-1 text-sm text-black/60">
          Engagements by days since last logged touchpoint.
        </p>
        <div className="mt-4 h-[260px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={contactData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="contactFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND_ORANGE} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={BRAND_ORANGE} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
                      <p className="font-medium text-black">{label}</p>
                      <p className="text-black/75">{payload[0].value} engagements</p>
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={BRAND_ORANGE}
                strokeWidth={2}
                fill="url(#contactFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <SectionHeading>Engagements by stage</SectionHeading>
        <p className="mt-1 text-sm text-black/60">Distribution in your current scope.</p>
        <div className="mt-2 h-[260px] w-full min-w-0">
          {stageData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-black/50">
              No engagements in view.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={88}
                  paddingAngle={2}
                >
                  {stageData.map((d) => (
                    <Cell key={d.stage} fill={STAGE_COLOR[d.stage] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const p = payload[0]
                    return (
                      <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
                        <p className="font-medium text-black">{p.name}</p>
                        <p className="text-black/75">{p.value} engagements</p>
                      </div>
                    )
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-black/80">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card>
        <SectionHeading>Pipeline vs active revenue</SectionHeading>
        <p className="mt-1 text-sm text-black/60">
          Prospect pipeline compared to active contract value (visible scope).
        </p>
        <div className="mt-4 h-[260px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="18%"
              outerRadius="100%"
              barSize={22}
              data={pipelineRadial}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar background dataKey="value" cornerRadius={8}>
                {pipelineRadial.map((d) => (
                  <Cell key={d.name} fill={d.fill} />
                ))}
              </RadialBar>
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value) => <span className="text-xs text-black/80">{value}</span>}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const row = payload[0].payload as { name: string; value: number }
                  return (
                    <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
                      <p className="font-medium text-black">{row.name}</p>
                      <p className="mt-0.5 tabular-nums text-black/80">{formatZAR(row.value)}</p>
                    </div>
                  )
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <SectionHeading>{fourthTitle}</SectionHeading>
        <p className="mt-1 text-sm text-black/60">
          {showMultiCentreChart
            ? 'Count of engagements linked to each centre in your scope.'
            : 'How work is split across engagement types.'}
        </p>
        <div className="mt-4 h-[260px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey={lineXKey} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
                      <p className="font-medium text-black">{label}</p>
                      <p className="text-black/75">{payload[0].value} engagements</p>
                    </div>
                  )
                }}
              />
              <Line
                type="monotone"
                dataKey={lineKey}
                stroke={BRAND_ORANGE}
                strokeWidth={2}
                dot={{ r: 4, fill: BRAND_ORANGE, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
