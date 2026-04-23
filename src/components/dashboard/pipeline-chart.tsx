'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { STAGE_COLORS } from '@/lib/constants'
import { formatCurrency, getStageName } from '@/lib/utils'

interface PipelineChartProps {
  data: Array<{
    stage: string
    value: number
    count: number
  }>
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: { stage: string; value: number; count: number } }>
}) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
      <p className="font-semibold text-[#1A202C]">{getStageName(data.stage)}</p>
      <p className="text-sm text-gray-600">
        Value: <span className="font-medium">{formatCurrency(data.value)}</span>
      </p>
      <p className="text-sm text-gray-600">
        Deals: <span className="font-medium">{data.count}</span>
      </p>
    </div>
  )
}

export function PipelineChart({ data }: PipelineChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    name: getStageName(d.stage),
  }))

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold text-[#1A202C]">Pipeline Overview</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => {
                const words = payload.value.split(' ')
                return (
                  <text x={x} y={y} textAnchor="middle" fill="#718096" fontSize={11}>
                    {words.map((word, i) => (
                      <tspan key={i} x={x} dy={i === 0 ? 12 : 14}>{word}</tspan>
                    ))}
                  </text>
                )
              }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              interval={0}
              height={50}
            />
            <YAxis
              tickFormatter={(val: number) => formatCurrency(val)}
              tick={{ fontSize: 11, fill: '#718096' }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={44}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STAGE_COLORS[data[index].stage] || '#94a3b8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
