'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface CallsChartProps {
  data: Array<{
    date: string
    total: number
    answered: number
    human: number
    machine: number
    failed: number
  }>
  loading?: boolean
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-2xl p-3.5 shadow-dropdown">
      <p className="text-xs font-semibold text-muted-foreground mb-2.5">
        {label ? format(parseISO(label), 'EEEE, MMM d') : ''}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground capitalize flex-1">{entry.name}</span>
            <span className="font-semibold tabular-nums">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const LEGEND_ITEMS = [
  { color: '#6366f1', label: 'Total Calls' },
  { color: '#22c55e', label: 'Human Answered' },
  { color: '#f97316', label: 'Voicemail' },
]

export function CallsChart({ data, loading }: CallsChartProps) {
  if (loading) {
    return (
      <div className="stat-card h-[296px] flex flex-col gap-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-muted rounded-lg" />
            <div className="h-3 w-20 bg-muted/60 rounded" />
          </div>
          <div className="h-6 w-20 bg-muted rounded-lg" />
        </div>
        <div className="flex-1 bg-muted/40 rounded-xl" />
      </div>
    )
  }

  const hasData = data && data.length > 0

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm">Call Volume</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last 14 days</p>
        </div>
        {hasData && (
          <div className="flex items-center gap-3">
            {LEGEND_ITEMS.map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="h-52 flex items-center justify-center">
          <div className="text-center">
            <div className="h-10 w-10 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <div className="h-5 w-5 rounded bg-muted" />
            </div>
            <p className="text-sm text-muted-foreground">No data yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Start a campaign to see call volume</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="humanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="machineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={v => format(parseISO(v), 'MMM d')}
              tick={{ fontSize: 11, fill: 'hsl(215 16% 45%)' }}
              axisLine={false}
              tickLine={false}
              dy={4}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(215 16% 45%)' }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#totalGrad)"
              name="total"
              dot={false}
              activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="human"
              stroke="#22c55e"
              strokeWidth={1.5}
              fill="url(#humanGrad)"
              name="human"
              dot={false}
              activeDot={{ r: 3.5, fill: '#22c55e', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="machine"
              stroke="#f97316"
              strokeWidth={1.5}
              fill="url(#machineGrad)"
              name="voicemail"
              dot={false}
              activeDot={{ r: 3.5, fill: '#f97316', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
