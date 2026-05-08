'use client'

import { useQuery } from '@tanstack/react-query'
import { Activity, Phone, Wifi, Server, TrendingUp, Zap, Radio } from 'lucide-react'
import { api } from '@/lib/api'
import { useLiveStats } from '@/hooks/useLiveStats'
import { getStatusColor, formatPhoneNumber, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'

export default function LiveMonitorPage() {
  const { data: stats } = useQuery({
    queryKey: ['live-monitor', 'stats'],
    queryFn: () => api.get('/live-monitor/stats').then(r => r.data),
    refetchInterval: 3000,
  })

  const { liveStats, events, connected } = useLiveStats()
  const [mosHistory, setMosHistory] = useState<Array<{ time: string; mos: number }>>([])

  useEffect(() => {
    const now = format(new Date(), 'HH:mm:ss')
    if (liveStats.activeCalls > 0) {
      setMosHistory(prev => [...prev.slice(-30), { time: now, mos: 4.1 }])
    }
  }, [liveStats])

  const activeCalls = liveStats.activeCalls ?? stats?.activeCalls ?? 0

  const METRICS = [
    {
      icon: Phone,
      label: 'Active Calls',
      value: activeCalls,
      color: activeCalls > 0 ? 'text-green-400' : 'text-foreground',
      bg: activeCalls > 0 ? 'bg-green-500/15 border-green-500/20' : 'bg-muted/50 border-border',
      live: activeCalls > 0,
    },
    {
      icon: Radio,
      label: 'Campaigns Running',
      value: stats?.activeCampaigns?.length ?? 0,
      color: 'text-brand-400',
      bg: 'bg-brand-500/15 border-brand-500/20',
    },
    {
      icon: TrendingUp,
      label: 'Calls / Min',
      value: liveStats.callsPerMinute?.toFixed(1) ?? '0.0',
      color: 'text-blue-400',
      bg: 'bg-blue-500/15 border-blue-500/20',
    },
    {
      icon: Wifi,
      label: 'SIP Status',
      value: stats?.freeswitchConnected ? 'Online' : 'Offline',
      color: stats?.freeswitchConnected ? 'text-green-400' : 'text-red-400',
      bg: stats?.freeswitchConnected
        ? 'bg-green-500/15 border-green-500/20'
        : 'bg-red-500/15 border-red-500/20',
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Live Monitor</h1>
          <p className="page-subtitle">Real-time campaign activity</p>
        </div>
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border',
          connected
            ? 'text-green-400 bg-green-400/10 border-green-400/20'
            : 'text-red-400 bg-red-400/10 border-red-400/20',
        )}>
          <div className={cn(
            'h-1.5 w-1.5 rounded-full',
            connected ? 'bg-green-400 animate-pulse' : 'bg-red-400',
          )} />
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Live metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {METRICS.map(m => (
          <div key={m.label} className={cn('rounded-2xl border p-4 flex items-center gap-3', m.bg)}>
            <div className="flex-shrink-0">
              <m.icon className={cn('h-5 w-5', m.color)} />
            </div>
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
            <p className="text-[10px] text-muted-foreground mt-0.5">Currently running</p>
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
                const progress = c.totalContacts > 0
                  ? (c.processedContacts / c.totalContacts) * 100
                  : 0
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
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>{c.processedContacts}/{c.totalContacts}</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-green-400 tabular-nums">{c.activeCalls}</p>
                      <p className="text-[10px] text-muted-foreground">active</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Live events feed */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Live Feed</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Real-time events</p>
            </div>
            <span className="badge-brand text-[10px]">{events.length} events</span>
          </div>
          <div className="space-y-0.5 max-h-72 overflow-y-auto">
            {events.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground/50 gap-2">
                <Activity className="h-4 w-4" />
                <p className="text-xs">Waiting for events...</p>
              </div>
            ) : (
              events.slice(0, 25).map((event, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-accent/30 transition-colors text-xs">
                  <span className={cn(
                    'px-1.5 py-0.5 rounded-md border text-[10px] font-semibold flex-shrink-0',
                    event.amdResult
                      ? getStatusColor(event.amdResult)
                      : 'text-muted-foreground bg-muted/50 border-border',
                  )}>
                    {event.amdResult ?? event.type?.replace('call:', '').toUpperCase()}
                  </span>
                  <span className="font-mono flex-1 truncate text-[11px] text-muted-foreground">
                    {formatPhoneNumber(event.phone || '')}
                  </span>
                  {event.duration !== undefined && (
                    <span className="text-muted-foreground/60 tabular-nums text-[10px]">
                      {event.duration}s
                    </span>
                  )}
                  <span className="text-muted-foreground/50 text-[10px]">
                    {timeAgo(event.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SIP Account Status */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <Server className="h-4 w-4 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-sm">SIP Account Status</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Registration status</p>
          </div>
        </div>
        {(!stats?.sipStatus || stats.sipStatus.length === 0) ? (
          <p className="text-sm text-muted-foreground">No SIP accounts configured</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stats.sipStatus.map((acc: any) => {
              const isRegistered = acc.status === 'REGISTERED'
              return (
                <div key={acc.id} className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border',
                  isRegistered ? 'bg-green-500/[0.06] border-green-500/15' : 'bg-muted/20 border-border/50',
                )}>
                  <div className={cn(
                    'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    isRegistered ? 'bg-green-500/15' : 'bg-muted/50',
                  )}>
                    <Wifi className={cn('h-4 w-4', isRegistered ? 'text-green-400' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{acc.name}</p>
                    <span className={cn('text-[10px] font-medium', getStatusColor(acc.status))}>
                      {acc.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
