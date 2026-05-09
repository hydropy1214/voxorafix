'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Activity, Phone, Wifi, TrendingUp, Zap, Radio, AlertTriangle,
  CheckCircle2, XCircle, Clock, Info, LayoutList,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useLiveStats } from '@/hooks/useLiveStats'
import { getStatusColor, formatPhoneNumber, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'

interface SipError {
  phone: string
  error: string
  code?: string
  severity: 'warning' | 'error' | 'critical'
  suggestion: string
  campaignId?: string
  timestamp: string
}

interface LiveEvent {
  type: string
  uuid?: string
  phone?: string
  status?: string
  hangupCause?: string
  hangupMessage?: string
  amdResult?: string
  duration?: number
  rtpMos?: number
  error?: string
  code?: string
  timestamp: string
}

function eventLabel(ev: LiveEvent): string {
  const t = ev.type || ''
  if (t.includes('dial')) return 'Dialing'
  if (t.includes('answered')) return 'Answered'
  if (t.includes('hangup') || t.includes('completed')) return 'Hangup'
  if (t.includes('error')) return 'SIP error'
  return t.replace(/^call:/, '') || 'Event'
}

export default function LiveMonitorPage() {
  const { data: stats } = useQuery({
    queryKey: ['live-monitor', 'stats'],
    queryFn: () => api.get('/live-monitor/stats').then(r => r.data),
    refetchInterval: 30000,
  })

  const { liveStats, events: rawEvents, connected } = useLiveStats()
  const [sipErrors, setSipErrors] = useState<SipError[]>([])
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([])
  const [activeTab, setActiveTab] = useState<'events' | 'errors' | 'sip'>('events')
  const seenRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (rawEvents.length === 0) return
    const latest = rawEvents[0] as LiveEvent & { type?: string }
    if (!latest?.timestamp) return

    const dedupeKey = `${latest.type}-${latest.uuid}-${latest.timestamp}`
    if (seenRef.current.has(dedupeKey)) return
    seenRef.current.add(dedupeKey)
    if (seenRef.current.size > 300) {
      const arr = Array.from(seenRef.current)
      seenRef.current = new Set(arr.slice(-120))
    }

    if ((latest as { type?: string }).type === 'sip:error') {
      const err = latest as unknown as SipError & { type: string }
      setSipErrors(prev => [{
        phone: err.phone,
        error: err.error,
        code: err.code,
        severity: err.severity || 'warning',
        suggestion: err.suggestion || '',
        campaignId: err.campaignId,
        timestamp: err.timestamp || (latest as LiveEvent).timestamp,
      }, ...prev.slice(0, 49)])
    } else {
      setLiveEvents(prev => [latest as LiveEvent, ...prev.slice(0, 99)])
    }
  }, [rawEvents])

  const activeCalls = liveStats.activeCalls ?? stats?.activeCalls ?? 0

  const METRICS = [
    {
      icon: Phone,
      label: 'Active calls',
      value: activeCalls,
      color: activeCalls > 0 ? 'text-emerald-400' : 'text-foreground',
      bg: activeCalls > 0 ? 'bg-emerald-500/15 border-emerald-500/20' : 'bg-muted/50 border-border',
      live: activeCalls > 0,
    },
    {
      icon: Radio,
      label: 'Campaigns running',
      value: stats?.activeCampaigns?.length ?? 0,
      color: 'text-brand-400',
      bg: 'bg-brand-500/15 border-brand-500/20',
    },
    {
      icon: TrendingUp,
      label: 'Calls / min',
      value: liveStats.callsPerMinute?.toFixed(1) ?? '0.0',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/15 border-cyan-500/20',
    },
    {
      icon: Wifi,
      label: 'Call engine',
      value: stats?.freeswitchConnected ? 'Online' : 'Offline',
      color: stats?.freeswitchConnected ? 'text-emerald-400' : 'text-red-400',
      bg: stats?.freeswitchConnected ? 'bg-emerald-500/15 border-emerald-500/20' : 'bg-red-500/15 border-red-500/20',
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Live Monitor</h1>
          <p className="page-subtitle max-w-xl">
            Structured stream of dial lifecycle events, SIP diagnostics, and trunk status. Use Call logs for searchable history and CSV export.
          </p>
        </div>
        <div
          className={cn(
            'inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-semibold',
            connected
              ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-400'
              : 'border-red-400/25 bg-red-400/10 text-red-400',
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', connected ? 'animate-pulse bg-emerald-400' : 'bg-red-400')} />
          {connected ? 'Live socket connected' : 'Reconnecting…'}
        </div>
      </div>

      <div className="glass-card-strong rounded-2xl border border-border/80 p-4 sm:p-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
            <LayoutList className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-foreground">How to read this screen</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground text-[13px] leading-relaxed">
              <li><strong className="text-foreground/90">Call Events</strong> — chronological phases: dial → ring → answer → hangup, with AMD and MOS when present.</li>
              <li><strong className="text-foreground/90">SIP Errors</strong> — provider-side failures with severity and a suggested fix.</li>
              <li><strong className="text-foreground/90">SIP Status</strong> — registration health for each phone account plus engine connectivity.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {METRICS.map(m => (
          <div key={m.label} className={cn('rounded-2xl border p-4', m.bg)}>
            <div className="flex items-start gap-3">
              <m.icon className={cn('mt-0.5 h-5 w-5', m.color)} />
              <div>
                <div className={cn('text-2xl font-bold tabular-nums leading-none', m.color)}>
                  {m.value}
                  {m.live && (
                    <span className="relative ml-1 inline-flex h-1.5 w-1.5 align-middle">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{m.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="stat-card">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">Active campaigns</h3>
              <p className="text-[11px] text-muted-foreground">Throughput and queue progress</p>
            </div>
            <Zap className="h-4 w-4 text-muted-foreground/40" />
          </div>
          {!stats?.activeCampaigns?.length ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/30">
                <Zap className="h-5 w-5 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground">No campaigns running</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.activeCampaigns.map((c: {
                id: string
                name: string
                processedContacts: number
                totalContacts: number
                activeCalls: number
              }) => {
                const progress = c.totalContacts > 0 ? (c.processedContacts / c.totalContacts) * 100 : 0
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/15 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="truncate text-xs font-semibold">{c.name}</span>
                        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                        <span>{c.processedContacts}/{c.totalContacts} contacts</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-lg font-bold tabular-nums text-emerald-400">{c.activeCalls}</p>
                      <p className="text-[10px] text-muted-foreground">live</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="stat-card overflow-hidden">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {[
              { id: 'events' as const, label: 'Call events', count: liveEvents.length },
              { id: 'errors' as const, label: 'SIP errors', count: sipErrors.length },
              { id: 'sip' as const, label: 'SIP status' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold transition-all',
                  activeTab === t.id ? 'bg-card text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
                {t.count != null && t.count > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                      t.id === 'errors' ? 'bg-red-500/20 text-red-400' : 'bg-brand-500/20 text-brand-400',
                    )}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'events' && (
            <div className="overflow-x-auto">
              <table className="data-table w-full min-w-[520px] text-left text-[11px]">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-2 font-semibold">Time</th>
                    <th className="py-2 pr-2 font-semibold">Event</th>
                    <th className="py-2 pr-2 font-semibold">Number</th>
                    <th className="py-2 pr-2 font-semibold">AMD</th>
                    <th className="py-2 pr-2 font-semibold">Detail</th>
                    <th className="py-2 pr-2 font-semibold text-right">Dur</th>
                    <th className="py-2 font-semibold text-right">MOS</th>
                  </tr>
                </thead>
                <tbody>
                  {liveEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Activity className="h-5 w-5 opacity-40" />
                          <span>Waiting for events — start a campaign or use the Web Dialer.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    liveEvents.slice(0, 40).map((event, i) => (
                      <tr key={`${event.uuid}-${event.timestamp}-${i}`} className="border-b border-border/40 hover:bg-muted/20">
                        <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{timeAgo(event.timestamp)}</td>
                        <td className="py-2 pr-2">
                          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                            {event.amdResult === 'HUMAN' ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            ) : event.amdResult === 'MACHINE' ? (
                              <Phone className="h-3 w-3 text-amber-400" />
                            ) : event.type?.includes('error') ? (
                              <XCircle className="h-3 w-3 text-red-400" />
                            ) : (
                              <Activity className="h-3 w-3 text-muted-foreground/50" />
                            )}
                            {eventLabel(event)}
                          </span>
                        </td>
                        <td className="py-2 pr-2 font-mono text-muted-foreground">{formatPhoneNumber(event.phone || '')}</td>
                        <td className="py-2 pr-2">
                          {event.amdResult ? (
                            <span className={cn('badge text-[9px]', getStatusColor(event.amdResult))}>{event.amdResult}</span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                        <td className="max-w-[140px] truncate py-2 pr-2 text-muted-foreground/90" title={event.hangupMessage}>
                          {event.hangupMessage || event.hangupCause || '—'}
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums text-muted-foreground">
                          {event.duration != null ? `${event.duration}s` : '—'}
                        </td>
                        <td className="py-2 text-right">
                          {event.rtpMos != null && event.rtpMos > 0 ? (
                            <span
                              className={cn(
                                'font-semibold tabular-nums',
                                event.rtpMos >= 4 ? 'text-emerald-400' : event.rtpMos >= 3.5 ? 'text-amber-400' : 'text-red-400',
                              )}
                            >
                              {event.rtpMos.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {sipErrors.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400/40" />
                  <p className="text-sm text-muted-foreground">No SIP errors in this session</p>
                </div>
              ) : (
                sipErrors.slice(0, 24).map((err, i) => (
                  <div
                    key={`${err.phone}-${err.timestamp}-${i}`}
                    className={cn(
                      'space-y-1 rounded-xl border p-3',
                      err.severity === 'critical'
                        ? 'border-red-500/25 bg-red-500/[0.07]'
                        : err.severity === 'error'
                          ? 'border-orange-500/20 bg-orange-500/[0.07]'
                          : 'border-amber-500/15 bg-amber-500/[0.05]',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <AlertTriangle
                          className={cn(
                            'h-3.5 w-3.5 flex-shrink-0',
                            err.severity === 'critical'
                              ? 'text-red-400'
                              : err.severity === 'error'
                                ? 'text-orange-400'
                                : 'text-amber-400',
                          )}
                        />
                        <span className="font-mono text-xs">{formatPhoneNumber(err.phone)}</span>
                        {err.code && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                            SIP {err.code}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/70">{timeAgo(err.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-red-200/90">{err.error}</p>
                    {err.suggestion && <p className="text-[10px] italic text-muted-foreground/80">{err.suggestion}</p>}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sip' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Call engine', ok: stats?.freeswitchConnected, desc: 'Command channel to dialer core' },
                  { label: 'SIP gateway', ok: true, desc: 'Profile loaded for outbound' },
                  { label: 'Live events', ok: connected, desc: 'Browser websocket path' },
                  { label: 'Phone accounts', ok: (stats?.sipStatus?.length ?? 0) > 0, desc: 'Configured SIP lines' },
                ].map(s => (
                  <div
                    key={s.label}
                    className={cn(
                      'rounded-xl border p-3',
                      s.ok ? 'border-emerald-500/15 bg-emerald-500/[0.06]' : 'border-red-500/15 bg-red-500/[0.06]',
                    )}
                  >
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className={cn('h-1.5 w-1.5 rounded-full', s.ok ? 'bg-emerald-400' : 'bg-red-400')} />
                      <span className="text-xs font-semibold">{s.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>

              {stats?.sipStatus && stats.sipStatus.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-border/60">
                  <table className="w-full text-left text-[11px]">
                    <thead className="border-b border-border bg-muted/30 text-[10px] uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Account</th>
                        <th className="px-3 py-2 font-semibold">SIP URI</th>
                        <th className="px-3 py-2 text-right font-semibold">State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.sipStatus.map((acc: { id: string; name: string; username: string; sipServer: string; status: string }) => {
                        const isReg = acc.status === 'REGISTERED'
                        return (
                          <tr key={acc.id} className="border-b border-border/40 last:border-0">
                            <td className="px-3 py-2 font-medium">{acc.name}</td>
                            <td className="px-3 py-2 font-mono text-muted-foreground">
                              {acc.username}@{acc.sipServer}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span
                                className={cn(
                                  'rounded-full px-2 py-0.5 text-[10px] font-bold',
                                  isReg ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground',
                                )}
                              >
                                {acc.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
                  <Info className="h-6 w-6 opacity-30" />
                  No phone accounts on file
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/10 px-4 py-3 text-[12px] text-muted-foreground">
        <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/60" />
        <p>
          This view is optimized for operators watching live traffic. For customer-ready exports, filters, and timestamps in your timezone,
          open <strong className="text-foreground/90">Call logs</strong> in the sidebar.
        </p>
      </div>
    </div>
  )
}
