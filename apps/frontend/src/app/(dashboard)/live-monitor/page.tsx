'use client'

import { useQuery } from '@tanstack/react-query'
import { Activity, Phone, Wifi, Server, TrendingUp, Zap, Radio, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import { useLiveStats } from '@/hooks/useLiveStats'
import { getStatusColor, formatPhoneNumber, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'

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

export default function LiveMonitorPage() {
  const { data: stats } = useQuery({
    queryKey: ['live-monitor', 'stats'],
    queryFn: () => api.get('/live-monitor/stats').then(r => r.data),
    refetchInterval: 3000,
  })

  const { liveStats, events: rawEvents, connected } = useLiveStats()
  const [sipErrors, setSipErrors] = useState<SipError[]>([])
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([])
  const [activeTab, setActiveTab] = useState<'events' | 'errors' | 'sip'>('events')
  const errorCount = useRef(0)

  // Merge rawEvents into our typed live events list
  useEffect(() => {
    if (rawEvents.length === 0) return
    const latest = rawEvents[0]
    if (!latest) return

    // Check for SIP errors
    if ((latest as any).type === 'sip:error') {
      const err = latest as any
      setSipErrors(prev => [{
        phone: err.phone,
        error: err.error,
        code: err.code,
        severity: err.severity || 'warning',
        suggestion: err.suggestion || '',
        campaignId: err.campaignId,
        timestamp: err.timestamp,
      }, ...prev.slice(0, 49)])
      errorCount.current++
    } else {
      setLiveEvents(prev => [latest as LiveEvent, ...prev.slice(0, 99)])
    }
  }, [rawEvents])

  const activeCalls = liveStats.activeCalls ?? stats?.activeCalls ?? 0

  const METRICS = [
    { icon: Phone, label: 'Active Calls', value: activeCalls, color: activeCalls > 0 ? 'text-green-400' : 'text-foreground', bg: activeCalls > 0 ? 'bg-green-500/15 border-green-500/20' : 'bg-muted/50 border-border', live: activeCalls > 0 },
    { icon: Radio, label: 'Campaigns Running', value: stats?.activeCampaigns?.length ?? 0, color: 'text-brand-400', bg: 'bg-brand-500/15 border-brand-500/20' },
    { icon: TrendingUp, label: 'Calls / Min', value: liveStats.callsPerMinute?.toFixed(1) ?? '0.0', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/20' },
    { icon: Wifi, label: 'SIP / ESL', value: stats?.freeswitchConnected ? 'Online' : 'Offline', color: stats?.freeswitchConnected ? 'text-green-400' : 'text-red-400', bg: stats?.freeswitchConnected ? 'bg-green-500/15 border-green-500/20' : 'bg-red-500/15 border-red-500/20' },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Live Monitor</h1>
          <p className="page-subtitle">Real-time campaign activity & SIP diagnostics</p>
        </div>
        <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border',
          connected ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'
        )}>
          <div className={cn('h-1.5 w-1.5 rounded-full', connected ? 'bg-green-400 animate-pulse' : 'bg-red-400')} />
          {connected ? 'WebSocket Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {METRICS.map(m => (
          <div key={m.label} className={cn('rounded-2xl border p-4 flex items-center gap-3', m.bg)}>
            <m.icon className={cn('h-5 w-5', m.color)} />
            <div>
              <div className={cn('text-2xl font-bold tabular-nums leading-none', m.color)}>
                {m.value}
                {m.live && (
                  <span className="relative inline-flex ml-1.5 h-1.5 w-1.5 align-middle">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Campaigns */}
        <div className="stat-card">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Active Campaigns</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Currently running dials</p>
          </div>
          {(!stats?.activeCampaigns || stats.activeCampaigns.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="h-12 w-12 rounded-2xl bg-muted/30 flex items-center justify-center">
                <Zap className="h-5 w-5 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground">No active campaigns</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.activeCampaigns.map((c: any) => {
                const progress = c.totalContacts > 0 ? (c.processedContacts / c.totalContacts) * 100 : 0
                return (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-semibold text-xs truncate">{c.name}</span>
                        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>{c.processedContacts}/{c.totalContacts} contacts</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-green-400 tabular-nums">{c.activeCalls}</p>
                      <p className="text-[10px] text-muted-foreground">live</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Tabbed Event Feed */}
        <div className="stat-card">
          {/* Tab nav */}
          <div className="flex items-center gap-1 mb-4 bg-muted/40 rounded-xl p-0.5 w-fit">
            {[
              { id: 'events', label: 'Call Events', count: liveEvents.length },
              { id: 'errors', label: 'SIP Errors', count: sipErrors.length },
              { id: 'sip', label: 'SIP Status' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all',
                  activeTab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.label}
                {t.count != null && t.count > 0 && (
                  <span className={cn('px-1.5 py-0.5 rounded-full text-[9px] font-bold',
                    t.id === 'errors' && t.count > 0 ? 'bg-red-500/20 text-red-400' : 'bg-brand-500/20 text-brand-400'
                  )}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Call Events */}
          {activeTab === 'events' && (
            <div className="space-y-0.5 max-h-72 overflow-y-auto">
              {liveEvents.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground/50 gap-2">
                  <Activity className="h-4 w-4" />
                  <p className="text-xs">Waiting for call events...</p>
                </div>
              ) : (
                liveEvents.slice(0, 30).map((event, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-accent/30 transition-colors">
                    {/* Status icon */}
                    {event.amdResult === 'HUMAN' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                    ) : event.amdResult === 'MACHINE' ? (
                      <Phone className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                    ) : event.type?.includes('error') || event.type?.includes('fail') ? (
                      <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                    ) : (
                      <Activity className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                    )}
                    {/* AMD badge */}
                    {event.amdResult && (
                      <span className={cn('px-1.5 py-0.5 rounded-md border text-[10px] font-semibold flex-shrink-0', getStatusColor(event.amdResult))}>
                        {event.amdResult}
                      </span>
                    )}
                    {/* Phone + event type */}
                    <span className="font-mono flex-1 truncate text-[11px] text-muted-foreground">
                      {formatPhoneNumber(event.phone || '')}
                    </span>
                    {/* Hang cause */}
                    {event.hangupMessage && (
                      <span className="text-[10px] text-muted-foreground/60 truncate max-w-[80px]">{event.hangupMessage}</span>
                    )}
                    {/* Duration + MOS */}
                    {event.duration != null && (
                      <span className="text-[10px] text-muted-foreground/60 tabular-nums">{event.duration}s</span>
                    )}
                    {event.rtpMos != null && event.rtpMos > 0 && (
                      <span className={cn('text-[10px] font-semibold tabular-nums',
                        event.rtpMos >= 4 ? 'text-green-400' : event.rtpMos >= 3.5 ? 'text-yellow-400' : 'text-red-400'
                      )}>
                        {event.rtpMos.toFixed(1)}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground/40">{timeAgo(event.timestamp)}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SIP Errors */}
          {activeTab === 'errors' && (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {sipErrors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-400/40" />
                  <p className="text-sm text-muted-foreground">No SIP errors</p>
                  <p className="text-xs text-muted-foreground/60">All calls completing normally</p>
                </div>
              ) : (
                sipErrors.slice(0, 20).map((err, i) => (
                  <div key={i} className={cn(
                    'p-3 rounded-xl border space-y-1',
                    err.severity === 'critical' ? 'bg-red-500/[0.07] border-red-500/25' :
                    err.severity === 'error' ? 'bg-orange-500/[0.07] border-orange-500/20' :
                    'bg-yellow-500/[0.05] border-yellow-500/15'
                  )}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={cn('h-3.5 w-3.5 flex-shrink-0',
                          err.severity === 'critical' ? 'text-red-400' :
                          err.severity === 'error' ? 'text-orange-400' : 'text-yellow-400'
                        )} />
                        <span className="text-xs font-mono text-foreground">{formatPhoneNumber(err.phone)}</span>
                        {err.code && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-bold text-muted-foreground">
                            SIP {err.code}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/60">{timeAgo(err.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-red-300/90">{err.error}</p>
                    {err.suggestion && (
                      <p className="text-[10px] text-muted-foreground/70 italic">{err.suggestion}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* SIP Status */}
          {activeTab === 'sip' && (
            <div className="space-y-3">
              {/* System status */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Call Engine', ok: stats?.freeswitchConnected, desc: 'Connected' },
                  { label: 'SIP Gateway', ok: true, desc: 'UDP/TCP active' },
                  { label: 'Live Events', ok: connected, desc: 'WebSocket' },
                  { label: 'Phone Account', ok: true, desc: 'Registered' },
                ].map(s => (
                  <div key={s.label} className={cn(
                    'p-3 rounded-xl border',
                    s.ok ? 'bg-green-500/[0.06] border-green-500/15' : 'bg-red-500/[0.06] border-red-500/15'
                  )}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className={cn('h-1.5 w-1.5 rounded-full', s.ok ? 'bg-green-400' : 'bg-red-400')} />
                      <span className="text-xs font-semibold">{s.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>

              {/* SIP Accounts */}
              {stats?.sipStatus && stats.sipStatus.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wide">SIP Accounts</p>
                  {stats.sipStatus.map((acc: any) => {
                    const isReg = acc.status === 'REGISTERED'
                    return (
                      <div key={acc.id} className={cn(
                        'flex items-center gap-3 p-2.5 rounded-xl border',
                        isReg ? 'bg-green-500/[0.06] border-green-500/15' : 'bg-muted/20 border-border/50'
                      )}>
                        <Wifi className={cn('h-4 w-4', isReg ? 'text-green-400' : 'text-muted-foreground')} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{acc.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            {acc.username}@{acc.sipServer}
                          </p>
                        </div>
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
                          isReg ? 'bg-green-500/15 text-green-400' : 'bg-muted text-muted-foreground'
                        )}>
                          {acc.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {(!stats?.sipStatus || stats.sipStatus.length === 0) && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <Server className="h-6 w-6 mx-auto mb-2 opacity-30" />
                  No SIP accounts configured
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
