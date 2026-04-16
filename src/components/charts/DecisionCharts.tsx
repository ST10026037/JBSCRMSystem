import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatZAR } from '../../lib/format'
import { Card, SectionHeading } from '../ui'
import { CHART_ORANGE } from './chartTheme'

function formatZARShort(n: number): string {
  if (!Number.isFinite(n)) return ''
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}R ${(abs / 1_000_000).toFixed(1)}m`
  if (abs >= 1_000) return `${sign}R ${(abs / 1_000).toFixed(0)}k`
  return `${sign}R ${Math.round(abs)}`
}

/** Estimated profit by centre — horizontal bars (easy to compare at a glance). */
export function ProfitByCentreChart({
  data,
}: {
  data: { name: string; profit: number }[]
}) {
  const sorted = useMemo(
    () => [...data].sort((a, b) => b.profit - a.profit),
    [data],
  )

  const chartHeight = Math.min(420, Math.max(220, 48 + sorted.length * 44))

  /** Enough pixels so long centre names (e.g. "Entrepreneurship") are not clipped. */
  const yAxisWidth = useMemo(() => {
    const longest = sorted.reduce((max, d) => Math.max(max, d.name.length), 0)
    return Math.min(300, Math.max(112, Math.ceil(longest * 7.2 + 32)))
  }, [sorted])

  if (sorted.length <= 1) return null

  return (
    <Card className="mb-8">
      <SectionHeading>Estimated profit by centre (active work)</SectionHeading>
      <p className="mt-1 text-sm text-black/60">
        Longer bars mean higher estimated profit from active engagements. Centre cards below add
        revenue and engagement counts.
      </p>
      <div
        className="mt-4 w-full min-w-0"
        style={{ height: chartHeight }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 8, right: 8, left: 12, bottom: 8 }}
            barCategoryGap="18%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatZARShort(Number(v))}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={yAxisWidth}
              interval={0}
              tick={{
                fontSize: 12,
                fill: 'rgba(0,0,0,0.85)',
              }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(242, 101, 34, 0.06)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const row = payload[0].payload as { name: string; profit: number }
                return (
                  <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
                    <p className="font-medium text-black">{row.name}</p>
                    <p className="mt-0.5 tabular-nums text-black/80">{formatZAR(row.profit)}</p>
                  </div>
                )
              }}
            />
            <Bar dataKey="profit" radius={[0, 6, 6, 0]} fill={CHART_ORANGE} maxBarSize={36}>
              <LabelList
                dataKey="profit"
                position="right"
                offset={8}
                fontSize={11}
                fill="rgba(0,0,0,0.55)"
                formatter={(label) => formatZARShort(Number(label))}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
