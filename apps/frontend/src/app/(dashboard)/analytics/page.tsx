'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Phone, Users, TrendingUp, Clock, Calendar, ChevronDown } from 'lucide-react'
import { api } from '@/lib/api'
import { formatNumber, formatDuration, getMosColor, getMosLabel, getStatusColor } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from 'recharts'
import { format, parseISO, subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns'
import { cn } from '@/lib/utils'

type Range = 'TODAY' | '7D' | '30D' | '90D' | 'CUSTOM'

const RANGES: { id: Range; label: string; days: number }[] = [
  { id: 'TODAY', label: 'Today',     days: 1  },
  { id: '7D',   label: '7 days',    days: 7  },
  { id: '30D',  label: '30 days',   days: 30 },
  { id: '90D',  label: '90 days',   days: 90 },
  { id: 'CUSTOM', label: 'Custom',  days: 0  },
]

const OUTCOME_COLORS = ['#8b5cf6', '#10b981', '#f97316', '#ef4444']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-dropdown text-xs">
      <p className="font-semibold text-muted-foreground mb-2">
        {label ? (() => { try { return format(parseISO(label), 'EEE, MMM d') } catch { return label } })() : ''}
      </p>
      {payload.map((e: any) => (
        <div key={e.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: e.color }} />
          <span className="text-muted-foreground capitalize">{e.name}:</span>
          <span className="font-bold tabular-nums">{e.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('30D')
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [customEnd,   setCustomEnd]   = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showCustom, setShowCustom]   = useState(false)

  const days = useMemo(() => {
    if (range === 'CUSTOM') {
      const diff = Math.ceil((new Date(customEnd).getTime() - new Date(customStart).getTime()) / 86400000)
      return Math.max(1, diff + 1)
    }
    return RANGES.find(r => r.id === range)?.days ?? 30
  }, [range, customStart, customEnd])

  const startParam = range === 'CUSTOM' ? customStart : format(subDays(new Date(), days - 1), 'yyyy-MM-dd')
  const endParam   = range === 'CUSTOM' ? customEnd   : format(new Date(), 'yyyy-MM-dd')

  const { data: dashboard, isLoading: loadingDash } = useQuery({
    queryKey: ['analytics', 'dashboard', startParam, endParam],
    queryFn: () => api.get(`/analytics/dashboard?start=${startParam}&end=${endParam}`).then(r => r.data),
    refetchInterval: 120000,
  })

  const { data: timeline = [], isLoading: loadingTimeline } = useQuery({
    queryKey: ['analytics', 'timeline', days, startParam, endParam],
    queryFn: () => api.get(`/analytics/timeline?days=${days}&start=${startParam}&end=${endParam}`).then(r => r.data),
    refetchInterval: 120000,
  })

  const { data: campaigns = [] } = useQuery({
    queryKey: ['analytics', 'campaigns'],
    queryFn: () => api.get('/analytics/campaigns').then(r => r.data),
  })

  const { data: rtp } = useQuery({
    queryKey: ['analytics', 'rtp'],
    queryFn: () => api.get('/analytics/rtp').then(r => r.data),
    refetchInterval: 120000,
  })

  const stats = dashboard?.last30Days ?? {}

  const pieData = [
    { name: 'Human',     value: stats.humanAnswers  ?? 0 },
    { name: 'Voicemail', value: stats.machineAnswers ?? 0 },
    { name: 'No Answer', value: Math.max(0, (stats.totalCalls ?? 0) - (stats.answeredCalls ?? 0) - (stats.failedCalls ?? 0)) },
    { name: 'Failed',    value: stats.failedCalls   ?? 0 },
  ].filter(d => d.value > 0)

  const KPIs = [
    { icon: Phone,      label: 'Total Calls',   value: formatNumber(stats.totalCalls ?? 0),              color: 'text-cyan-400',    bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20' },
    { icon: TrendingUp, label: 'Answer Rate',   value: `${stats.answerRate?.toFixed(1) ?? '0.0'}%`,     color: 'text-emerald-400', bg: 'bg-emerald-500/10',border: 'border-emerald-500/20' },
    { icon: Users,      label: 'Human Rate',    value: `${stats.humanRate?.toFixed(1) ?? '0.0'}%`,      color: 'text-violet-400',  bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { icon: Clock,      label: 'Avg Duration',  value: formatDuration(stats.avgDuration ?? 0),            color: 'text-amber-400',   bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header + date filter */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Campaign performance insights</p>
        </div>

        {/* Date range picker */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-1 border border-border">
            {RANGES.filter(r => r.id !== 'CUSTOM').map(r => (
              <button
                key={r.id}
                onClick={() => { setRange(r.id); setShowCustom(false) }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  range === r.id
                    ? 'bg-card text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={() => { setRange('CUSTOM'); setShowCustom(true) }}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                range === 'CUSTOM'
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Calendar className="h-3 w-3" />
              Custom
            </button>
          </div>

          {/* Custom date inputs */}
          {(showCustom || range === 'CUSTOM') && (
            <div className="flex items-center gap-2 animate-fade-in">
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="input-field text-xs py-1.5 px-2.5 w-36"
              />
              <span className="text-muted-foreground text-xs">to</span>
              <input
                type="date"
                value={customEnd}
                max={format(new Date(), 'yyyy-MM-dd')}
                onChange={e => setCustomEnd(e.target.value)}
                className="input-field text-xs py-1.5 px-2.5 w-36"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPIs.map(kpi => (
          <div key={kpi.label} className={`stat-card border ${kpi.border}`}>
            <div className={`inline-flex h-9 w-9 rounded-xl ${kpi.bg} ${kpi.border} border items-center justify-center mb-3`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
            {loadingDash ? (
              <div className="h-8 w-20 skeleton rounded mb-1" />
            ) : (
              <p className={`text-3xl font-bold tabular-nums ${kpi.color}`}>{kpi.value}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Volume chart */}
        <div className="lg:col-span-2 stat-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-sm">Call Volume</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {range === 'TODAY' ? 'Today by hour' : `${days} day breakdown`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {[{ color: '#10b981', l: 'Human' }, { color: '#f97316', l: 'Voicemail' }, { color: '#ef4444', l: 'Failed' }].map(l => (
                <div key={l.l} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <div className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                  {l.l}
                </div>
              ))}
            </div>
          </div>

          {loadingTimeline ? (
            <div className="h-52 skeleton rounded-xl" />
          ) : timeline.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-muted-foreground/50 text-sm">
              No call data for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={timeline} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={v => { try { return days <= 1 ? v : format(parseISO(v), days <= 7 ? 'EEE' : 'MMM d') } catch { return v } }}
                  tick={{ fontSize: 11, fill: 'hsl(224 14% 45%)' }}
                  axisLine={false} tickLine={false} dy={4}
                />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(224 14% 45%)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="human"   name="Human"    fill="#10b981" radius={[3,3,0,0]} stackId="a" maxBarSize={28} />
                <Bar dataKey="machine" name="Voicemail" fill="#f97316" stackId="a" maxBarSize={28} />
                <Bar dataKey="failed"  name="Failed"   fill="#ef4444" radius={[3,3,0,0]} stackId="a" maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Outcome donut */}
        <div className="stat-card">
          <div className="mb-5">
            <h3 className="font-semibold text-sm">Outcomes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Call result breakdown</p>
          </div>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground/40 text-sm">
              No data yet
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <PieChart width={160} height={160}>
                  <Pie data={pieData} cx={75} cy={75} innerRadius={48} outerRadius={72}
                    dataKey="value" strokeWidth={0} paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={OUTCOME_COLORS[i % OUTCOME_COLORS.length]} />)}
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
                    <span className="font-bold tabular-nums">{formatNumber(entry.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Answer rate trend */}
      {timeline.length > 1 && (
        <div className="stat-card">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Answer Rate Trend</h3>
            <p className="text-xs text-muted-foreground mt-0.5">% of calls answered over time</p>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={timeline.map((d: any) => ({
              ...d,
              answerRate: d.total > 0 ? +((d.answered / d.total) * 100).toFixed(1) : 0
            }))} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="arGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date"
                tickFormatter={v => { try { return format(parseISO(v), 'MMM d') } catch { return v } }}
                tick={{ fontSize: 10, fill: 'hsl(224 14% 45%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(224 14% 45%)' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="answerRate" stroke="#8b5cf6" strokeWidth={2}
                fill="url(#arGrad)" name="Answer rate" dot={false}
                activeDot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* RTP Quality */}
      <div className="stat-card">
        <div className="mb-4">
          <h3 className="font-semibold text-sm">Call Quality</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Audio quality score breakdown</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Avg Quality Score', value: rtp?.avgMos?.toFixed(2) ?? '—', color: getMosColor(rtp?.avgMos ?? 0), sub: getMosLabel(rtp?.avgMos ?? 0) },
            { label: 'Excellent calls',   value: formatNumber(rtp?.excellentCalls ?? 0), color: 'text-emerald-400', sub: 'Score ≥ 4.0' },
            { label: 'Good calls',        value: formatNumber(rtp?.goodCalls ?? 0),      color: 'text-amber-400',   sub: 'Score 3.5–4.0' },
            { label: 'Poor calls',        value: formatNumber(rtp?.poorCalls ?? 0),      color: 'text-red-400',     sub: 'Score < 3.5' },
          ].map(s => (
            <div key={s.label} className="text-center p-4 bg-muted/20 rounded-2xl border border-border/50">
              <p className={`text-3xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">{s.label}</p>
              <p className="text-[10px] text-muted-foreground/60">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign table */}
      {campaigns.length > 0 && (
        <div className="stat-card">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Campaign Breakdown</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Performance per campaign</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>{['Campaign', 'Status', 'Calls', 'Answer Rate', 'Human Rate', 'Avg Duration'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {campaigns.map((c: any) => {
                  const ar = c.processedContacts > 0 ? (c.answeredCalls / c.processedContacts * 100).toFixed(1) : '0.0'
                  const hr = c.answeredCalls > 0 ? (c.humanAnswers / c.answeredCalls * 100).toFixed(1) : '0.0'
                  return (
                    <tr key={c.id}>
                      <td className="font-medium text-sm">{c.name}</td>
                      <td><span className={`badge text-[10px] ${getStatusColor(c.status)}`}>{c.status}</span></td>
                      <td className="tabular-nums">{formatNumber(c.processedContacts)}</td>
                      <td className="tabular-nums text-emerald-400 font-semibold">{ar}%</td>
                      <td className="tabular-nums text-violet-400 font-semibold">{hr}%</td>
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
