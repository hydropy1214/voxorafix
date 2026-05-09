'use client'

import { useQuery } from '@tanstack/react-query'
import { Phone, Users, TrendingUp, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import { formatNumber, formatDuration, getMosColor, getMosLabel, getStatusColor } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { format, parseISO } from 'date-fns'

const OUTCOME_COLORS = ['#6366f1', '#22c55e', '#f97316', '#ef4444']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-dropdown">
      <p className="text-xs font-semibold text-muted-foreground mb-2">
        {label ? format(parseISO(label), 'EEE, MMM d') : ''}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground capitalize">{entry.name}:</span>
          <span className="font-semibold">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: dashboard } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data),
    refetchInterval: 120000,
  })

  const { data: timeline = [] } = useQuery({
    queryKey: ['analytics', 'timeline', 30],
    queryFn: () => api.get('/analytics/timeline?days=30').then(r => r.data),
    refetchInterval: 120000,
  })

  const { data: campaigns = [] } = useQuery({
    queryKey: ['analytics', 'campaigns'],
    queryFn: () => api.get('/analytics/campaigns').then(r => r.data),
  })

  const { data: rtp } = useQuery({
    queryKey: ['analytics', 'rtp'],
    queryFn: () => api.get('/analytics/rtp').then(r => r.data),
  })

  const stats = dashboard?.last30Days ?? {}

  const pieData = [
    { name: 'Human', value: stats.humanAnswers ?? 0 },
    { name: 'Voicemail', value: stats.machineAnswers ?? 0 },
    { name: 'No Answer', value: Math.max(0, (stats.totalCalls ?? 0) - (stats.answeredCalls ?? 0) - (stats.failedCalls ?? 0)) },
    { name: 'Failed', value: stats.failedCalls ?? 0 },
  ].filter(d => d.value > 0)

  const KPI_CARDS = [
    { icon: Phone, label: 'Total Calls', value: formatNumber(stats.totalCalls ?? 0), color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { icon: TrendingUp, label: 'Answer Rate', value: `${stats.answerRate?.toFixed(1) ?? '0.0'}%`, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { icon: Users, label: 'Human Rate', value: `${stats.humanRate?.toFixed(1) ?? '0.0'}%`, color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/20' },
    { icon: Clock, label: 'Avg Duration', value: formatDuration(stats.avgDuration ?? 0), color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Campaign performance insights — last 30 days</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI_CARDS.map(kpi => (
          <div key={kpi.label} className={`stat-card border ${kpi.border}`}>
            <div className={`inline-flex h-9 w-9 rounded-xl ${kpi.bg} ${kpi.border} border items-center justify-center mb-3`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
            <p className={`text-3xl font-bold ${kpi.color} tabular-nums`}>{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 30-day bar chart */}
        <div className="lg:col-span-2 stat-card">
          <div className="mb-5">
            <h3 className="font-semibold text-sm">Call Volume (30 Days)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Stacked by outcome</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={timeline} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
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
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="human" name="Human" fill="#22c55e" radius={[2, 2, 0, 0]} stackId="a" maxBarSize={24} />
              <Bar dataKey="machine" name="Machine" fill="#f97316" stackId="a" maxBarSize={24} />
              <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[2, 2, 0, 0]} stackId="a" maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            {[
              { color: '#22c55e', label: 'Human' },
              { color: '#f97316', label: 'Machine' },
              { color: '#ef4444', label: 'Failed' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Outcome pie */}
        <div className="stat-card">
          <div className="mb-5">
            <h3 className="font-semibold text-sm">Call Outcomes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Distribution breakdown</p>
          </div>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground/40 text-sm">
              No data yet
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <PieChart width={160} height={160}>
                  <Pie
                    data={pieData}
                    cx={75} cy={75}
                    innerRadius={48}
                    outerRadius={72}
                    dataKey="value"
                    strokeWidth={0}
                    paddingAngle={2}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={OUTCOME_COLORS[i % OUTCOME_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="space-y-2">
                {pieData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: OUTCOME_COLORS[i % OUTCOME_COLORS.length] }} />
                      <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                    <span className="font-semibold">{formatNumber(entry.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* RTP Quality */}
      <div className="stat-card">
        <div className="mb-5">
          <h3 className="font-semibold text-sm">RTP Quality Analysis</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Mean Opinion Score (MOS) breakdown</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: 'Avg MOS Score',
              value: rtp?.avgMos?.toFixed(2) ?? '—',
              color: getMosColor(rtp?.avgMos ?? 0),
              sub: getMosLabel(rtp?.avgMos ?? 0),
            },
            { label: 'Excellent Calls', value: formatNumber(rtp?.excellentCalls ?? 0), color: 'text-green-400', sub: 'MOS ≥ 4.0' },
            { label: 'Good Calls', value: formatNumber(rtp?.goodCalls ?? 0), color: 'text-yellow-400', sub: 'MOS 3.5–4.0' },
            { label: 'Poor Calls', value: formatNumber(rtp?.poorCalls ?? 0), color: 'text-red-400', sub: 'MOS < 3.5' },
          ].map(s => (
            <div key={s.label} className="text-center p-4 bg-muted/20 rounded-2xl border border-border/50">
              <p className={`text-3xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">{s.label}</p>
              <p className="text-[10px] text-muted-foreground/60">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign performance table */}
      {campaigns.length > 0 && (
        <div className="stat-card">
          <div className="mb-5">
            <h3 className="font-semibold text-sm">Campaign Performance</h3>
            <p className="text-xs text-muted-foreground mt-0.5">All-time metrics per campaign</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {['Campaign', 'Status', 'Calls', 'Answer Rate', 'Human Rate', 'Avg Duration'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c: any) => {
                  const answerRate = c.processedContacts > 0
                    ? (c.answeredCalls / c.processedContacts * 100).toFixed(1)
                    : '0.0'
                  const humanRate = c.answeredCalls > 0
                    ? (c.humanAnswers / c.answeredCalls * 100).toFixed(1)
                    : '0.0'
                  return (
                    <tr key={c.id}>
                      <td className="font-medium">{c.name}</td>
                      <td>
                        <span className={`badge text-[10px] ${getStatusColor(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="tabular-nums">{formatNumber(c.processedContacts)}</td>
                      <td className="tabular-nums text-green-400 font-medium">{answerRate}%</td>
                      <td className="tabular-nums text-brand-400 font-medium">{humanRate}%</td>
                      <td className="tabular-nums text-muted-foreground">{formatDuration(c.avgDuration ?? 0)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
