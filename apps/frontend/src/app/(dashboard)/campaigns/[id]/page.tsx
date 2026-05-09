'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  ArrowLeft, Play, Pause, Square, Phone, Users, TrendingUp, Clock,
  Activity, CheckCircle2, Voicemail, XCircle, AlertCircle, Radio, Zap,
  BarChart3, RefreshCw,
} from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { cn, formatNumber, formatDuration, getStatusColor, timeAgo } from '@/lib/utils'
import { useLiveStats } from '@/hooks/useLiveStats'

interface CallEvent {
  type: string
  phone?: string
  amdResult?: string
  hangupCause?: string
  hangupMessage?: string
  duration?: number
  rtpMos?: number
  error?: string
  code?: string
  severity?: string
  timestamp: string
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const qc = useQueryClient()
  const campaignId = params.id as string

  const [callEvents, setCallEvents] = useState<CallEvent[]>([])
  const { events, joinCampaign, leaveCampaign } = useLiveStats()

  // Join campaign room for real-time events
  useEffect(() => {
    if (campaignId) joinCampaign(campaignId)
    return () => { if (campaignId) leaveCampaign(campaignId) }
  }, [campaignId, joinCampaign, leaveCampaign])

  // Push new events to local list
  useEffect(() => {
    if (!events.length) return
    const latest = events[0]
    if (latest && ((latest as any).campaignId === campaignId || !(latest as any).campaignId)) {
      setCallEvents(prev => [latest as CallEvent, ...prev.slice(0, 199)])
    }
  }, [events, campaignId])

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => api.get(`/campaigns/${campaignId}`).then(r => r.data),
    refetchInterval: 15000,
  })

  const startMutation = useMutation({
    mutationFn: () => api.post(`/campaigns/${campaignId}/start`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaign', campaignId] }); toast.success('Campaign started') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to start'),
  })

  const pauseMutation = useMutation({
    mutationFn: () => api.post(`/campaigns/${campaignId}/pause`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaign', campaignId] }); toast.success('Campaign paused') },
  })

  const stopMutation = useMutation({
    mutationFn: () => api.post(`/campaigns/${campaignId}/stop`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaign', campaignId] }); toast.success('Campaign stopped') },
  })

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 skeleton rounded-xl" />
        <div className="h-32 skeleton rounded-2xl" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (!campaign) return null

  const progress = campaign.totalContacts > 0
    ? Math.min(100, (campaign.processedContacts / campaign.totalContacts) * 100)
    : 0

  const answerRate = campaign.processedContacts > 0
    ? (campaign.answeredCalls / campaign.processedContacts * 100).toFixed(1)
    : '0.0'
  const humanRate = campaign.answeredCalls > 0
    ? (campaign.humanAnswers / campaign.answeredCalls * 100).toFixed(1)
    : '0.0'

  const isRunning = campaign.status === 'RUNNING'

  return (
    <div className="space-y-5 animate-fade-in max-w-screen-xl">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.push('/campaigns')}
          className="p-2 rounded-xl border border-border hover:bg-accent transition-colors mt-1 flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <span className={cn(
              'text-xs px-2.5 py-1 rounded-full border font-semibold',
              getStatusColor(campaign.status),
              isRunning && 'status-running',
            )}>
              {campaign.status}
            </span>
            {isRunning && campaign.activeCalls > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                <span className="text-green-400 text-xs font-semibold">{campaign.activeCalls} live</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {campaign.sipAccount?.name} · {campaign.contactList?.name} · {campaign.audioFile?.name}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isRunning ? (
            <>
              <button onClick={() => pauseMutation.mutate()} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 text-sm font-medium transition-all">
                <Pause className="h-4 w-4" /> Pause
              </button>
              <button onClick={() => stopMutation.mutate()} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-all">
                <Square className="h-4 w-4" /> Stop
              </button>
            </>
          ) : ['DRAFT', 'PAUSED'].includes(campaign.status) ? (
            <button onClick={() => startMutation.mutate()} className="btn-primary flex items-center gap-2">
              <Play className="h-4 w-4" /> Start Campaign
            </button>
          ) : null}
        </div>
      </div>

      {/* Progress bar */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Campaign Progress</span>
            <span className="text-xs text-muted-foreground">
              {formatNumber(campaign.processedContacts)} / {formatNumber(campaign.totalContacts)} contacts
            </span>
          </div>
          <span className="text-sm font-bold text-brand-400">{progress.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700',
              isRunning
                ? 'bg-gradient-to-r from-brand-500 via-green-500 to-brand-400 animate-shimmer'
                : 'bg-brand-500/60',
            )}
            style={{ width: `${progress}%`, backgroundSize: '200% 100%' }}
          />
        </div>
        {campaign.startedAt && (
          <p className="text-xs text-muted-foreground mt-2">
            Started {timeAgo(campaign.startedAt)}
            {campaign.completedAt && ` · Completed ${timeAgo(campaign.completedAt)}`}
          </p>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Phone, label: 'Total Processed', value: formatNumber(campaign.processedContacts), color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { icon: TrendingUp, label: 'Answer Rate', value: `${answerRate}%`, sub: `${formatNumber(campaign.answeredCalls)} answered`, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { icon: Users, label: 'Human Rate', value: `${humanRate}%`, sub: `${formatNumber(campaign.humanAnswers)} humans`, color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
          { icon: Clock, label: 'Avg Duration', value: formatDuration(campaign.avgDuration ?? 0), color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        ].map(kpi => (
          <div key={kpi.label} className={cn('stat-card border', kpi.bg)}>
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={cn('h-4 w-4', kpi.color)} />
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
            </div>
            <p className={cn('text-3xl font-bold', kpi.color)}>{kpi.value}</p>
            {kpi.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</p>}
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Voicemail', value: formatNumber(campaign.machineAnswers), color: 'text-orange-400' },
          { label: 'No Answer', value: formatNumber(campaign.noanswer), color: 'text-gray-400' },
          { label: 'Busy', value: formatNumber(campaign.busyCalls), color: 'text-yellow-400' },
          { label: 'Failed', value: formatNumber(campaign.failedCalls), color: 'text-red-400' },
          { label: 'Active Now', value: campaign.activeCalls, color: campaign.activeCalls > 0 ? 'text-green-400' : 'text-muted-foreground', live: campaign.activeCalls > 0 },
        ].map(s => (
          <div key={s.label} className="stat-card compact p-4 text-center">
            <p className={cn('text-2xl font-bold tabular-nums', s.color)}>
              {s.value}
              {s.live && (
                <span className="relative inline-flex ml-1 h-1.5 w-1.5 align-middle">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
              )}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Live call feed */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand-400" />
            <h3 className="font-semibold text-sm">Live Call Feed</h3>
            {isRunning && (
              <span className="badge-green text-[10px]">Live</span>
            )}
          </div>
          <button onClick={() => setCallEvents([])} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {callEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground/50">
            <Radio className="h-8 w-8" />
            <p className="text-sm">
              {isRunning ? 'Waiting for call events...' : 'No live events yet. Start the campaign to see real-time calls.'}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5 max-h-96 overflow-y-auto">
            {callEvents.slice(0, 50).map((event, i) => (
              <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-accent/20 transition-colors text-xs">
                {/* Type icon */}
                <div className="flex-shrink-0">
                  {event.amdResult === 'HUMAN' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  ) : event.amdResult === 'MACHINE' ? (
                    <Voicemail className="h-3.5 w-3.5 text-orange-400" />
                  ) : event.type === 'sip:error' ? (
                    <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                  ) : event.type === 'call:dialing' ? (
                    <Phone className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                  ) : event.hangupCause === 'NORMAL_CLEARING' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground/40" />
                  )}
                </div>

                {/* AMD badge */}
                {event.amdResult && (
                  <span className={cn('px-1.5 py-0.5 rounded-md border text-[10px] font-bold flex-shrink-0', getStatusColor(event.amdResult))}>
                    {event.amdResult}
                  </span>
                )}

                {/* Phone */}
                <span className="font-mono text-muted-foreground flex-1">
                  {event.phone || '—'}
                </span>

                {/* Event type label */}
                <span className="text-muted-foreground/60 text-[10px] flex-shrink-0">
                  {event.hangupMessage || event.type?.replace('call:', '').replace('sip:', 'SIP ')}
                </span>

                {/* Duration + MOS */}
                {event.duration != null && <span className="tabular-nums text-muted-foreground/60">{event.duration}s</span>}
                {event.rtpMos != null && event.rtpMos > 0 && (
                  <span className={cn('font-bold tabular-nums text-[10px] flex-shrink-0',
                    event.rtpMos >= 4 ? 'text-green-400' : event.rtpMos >= 3.5 ? 'text-yellow-400' : 'text-red-400'
                  )}>
                    MOS {event.rtpMos.toFixed(1)}
                  </span>
                )}

                {/* SIP error code */}
                {event.code && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded-md font-bold">
                    {event.code}
                  </span>
                )}

                <span className="text-muted-foreground/40 flex-shrink-0">{timeAgo(event.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configuration summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'SIP Configuration',
            icon: Radio,
            items: [
              { label: 'Provider', value: campaign.sipAccount?.name },
              { label: 'Server', value: `${campaign.sipAccount?.sipServer}:${campaign.sipAccount?.sipPort}` },
              { label: 'Transport', value: campaign.sipAccount?.transport },
              { label: 'Status', value: campaign.sipAccount?.status, colored: true },
            ],
          },
          {
            title: 'Call Settings',
            icon: Zap,
            items: [
              { label: 'Max Concurrent', value: `${campaign.maxConcurrentCalls} calls` },
              { label: 'Calls per Second', value: `${campaign.callsPerSecond} CPS` },
              { label: 'AMD', value: campaign.amdEnabled ? `Enabled (${campaign.amdAction})` : 'Disabled' },
              { label: 'Caller ID', value: campaign.callerIdNumber || 'Auto (provider)' },
            ],
          },
          {
            title: 'Resources',
            icon: BarChart3,
            items: [
              { label: 'Contact List', value: campaign.contactList?.name },
              { label: 'Total Contacts', value: formatNumber(campaign.totalContacts) },
              { label: 'Audio', value: campaign.audioFile?.name },
              { label: 'Duration', value: `${campaign.audioFile?.duration ?? 0}s` },
            ],
          },
        ].map(section => {
          const Icon = section.icon
          return (
            <div key={section.title} className="stat-card">
              <div className="flex items-center gap-2 mb-4">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">{section.title}</h3>
              </div>
              <div className="space-y-2">
                {section.items.map(item => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={cn(
                      'font-medium truncate max-w-[140px] text-right',
                      item.colored && item.value === 'REGISTERED' ? 'text-green-400' :
                      item.colored && item.value === 'FAILED' ? 'text-red-400' :
                      'text-foreground',
                    )}>
                      {item.value || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
