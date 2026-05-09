'use client'

import { useQuery } from '@tanstack/react-query'
import { Activity, Phone, Users, TrendingUp, Zap, Radio, AlertCircle, ArrowRight, Plus, Upload, Wifi, FileAudio, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { CallsChart } from '@/components/dashboard/CallsChart'
import { RecentEvents } from '@/components/dashboard/RecentEvents'
import { LiveCallsWidget } from '@/components/dashboard/LiveCallsWidget'
import { RtpQualityWidget } from '@/components/dashboard/RtpQualityWidget'
import { useLiveStats } from '@/hooks/useLiveStats'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data),
    refetchInterval: 30000,
  })
  const { data: timelineData } = useQuery({
    queryKey: ['analytics', 'timeline'],
    queryFn: () => api.get('/analytics/timeline?days=14').then(r => r.data),
    refetchInterval: 60000,
  })
  const { data: sipAccounts = [] } = useQuery({
    queryKey: ['sip-accounts'],
    queryFn: () => api.get('/sip-accounts').then(r => r.data),
  })
  const { data: contactLists = [] } = useQuery({
    queryKey: ['contact-lists'],
    queryFn: () => api.get('/contacts/lists').then(r => r.data),
  })
  const { data: audioFiles = [] } = useQuery({
    queryKey: ['audio-files'],
    queryFn: () => api.get('/audio-files').then(r => r.data),
  })
  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/campaigns').then(r => r.data),
  })

  const { liveStats } = useLiveStats()
  const stats = analytics?.last30Days ?? {}

  // Onboarding checklist
  const hasSip = sipAccounts.some((s: any) => s.status === 'REGISTERED')
  const hasContacts = contactLists.some((l: any) => l.validCount > 0)
  const hasAudio = audioFiles.some((f: any) => f.status === 'READY')
  const hasCampaign = (campaigns?.data?.length ?? 0) > 0 || (campaigns?.length ?? 0) > 0
  const allDone = hasSip && hasContacts && hasAudio && hasCampaign
  const completedSteps = [hasSip, hasContacts, hasAudio, hasCampaign].filter(Boolean).length

  const checklist = [
    {
      done: hasSip,
      label: 'Connect a phone account',
      desc: 'Add your SIP credentials to enable outbound calling',
      href: '/sip-accounts',
      icon: Wifi,
    },
    {
      done: hasContacts,
      label: 'Import contact list',
      desc: 'Upload a CSV with the numbers you want to reach',
      href: '/contacts',
      icon: Users,
    },
    {
      done: hasAudio,
      label: 'Upload audio message',
      desc: 'Add the MP3 or WAV file that will play during calls',
      href: '/audio-files',
      icon: FileAudio,
    },
    {
      done: hasCampaign,
      label: 'Create first campaign',
      desc: 'Configure and launch your first automated outreach',
      href: '/campaigns',
      icon: Radio,
    },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">{greeting}, {user?.firstName}</h1>
          <p className="page-subtitle">
            {analytics?.activeCampaigns > 0
              ? `${analytics.activeCampaigns} campaign${analytics.activeCampaigns > 1 ? 's' : ''} running`
              : "Here's what's happening across your account"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {liveStats?.activeCalls > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/25 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-green-400 text-xs font-semibold">
                {liveStats.activeCalls} active {liveStats.activeCalls === 1 ? 'call' : 'calls'}
              </span>
            </div>
          )}
          <Link href="/campaigns" className="btn-primary flex items-center gap-2 text-sm py-2">
            <Plus className="h-3.5 w-3.5" />
            New Campaign
          </Link>
        </div>
      </div>

      {/* Onboarding checklist — shown until all steps are done */}
      {!allDone && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Get started</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete {4 - completedSteps} more {4 - completedSteps === 1 ? 'step' : 'steps'} to launch your first campaign
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full gradient-brand rounded-full transition-all"
                  style={{ width: `${(completedSteps / 4) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{completedSteps}/4</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {checklist.map(step => {
              const Icon = step.icon
              return (
                <Link
                  key={step.label}
                  href={step.href}
                  className={cn(
                    'flex items-start gap-3 p-3.5 rounded-xl border transition-all',
                    step.done
                      ? 'border-green-500/20 bg-green-500/[0.05]'
                      : 'border-border hover:border-brand-500/30 hover:bg-brand-500/[0.03]',
                  )}
                >
                  <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0',
                    step.done ? 'bg-green-500/15' : 'bg-muted/50'
                  )}>
                    {step.done
                      ? <CheckCircle2 className="h-4 w-4 text-green-400" />
                      : <Icon className="h-4 w-4 text-muted-foreground" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-semibold leading-none', step.done ? 'text-green-400' : 'text-foreground')}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{step.desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          title="Active Campaigns"
          value={analytics?.activeCampaigns ?? 0}
          icon={Radio}
          trend={analytics?.activeCampaigns > 0 ? 'up' : undefined}
          color="brand"
          live={analytics?.activeCampaigns > 0}
        />
        <StatsCard title="Calls Today" value={analytics?.todayCalls ?? 0} icon={Phone} color="blue" />
        <StatsCard
          title="Answer Rate"
          value={`${stats.answerRate?.toFixed(1) ?? '0.0'}%`}
          icon={TrendingUp}
          subtitle="Last 30 days"
          color="green"
        />
        <StatsCard
          title="Human Answers"
          value={`${stats.humanRate?.toFixed(1) ?? '0.0'}%`}
          icon={Users}
          subtitle="Of answered calls"
          color="purple"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard title="Live Calls" value={liveStats?.activeCalls ?? 0} icon={Activity} live color="green" compact />
        <StatsCard title="Total Calls (30d)" value={stats.totalCalls ?? 0} icon={Phone} color="blue" compact />
        <StatsCard title="Voicemail Rate" value={`${stats.machineRate?.toFixed(1) ?? '0.0'}%`} icon={Zap} color="yellow" compact />
        <StatsCard title="Failure Rate" value={`${stats.failureRate?.toFixed(1) ?? '0.0'}%`} icon={AlertCircle} color="red" compact />
      </div>

      {/* Charts + widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CallsChart data={timelineData ?? []} loading={isLoading} />
        </div>
        <div className="space-y-4">
          <LiveCallsWidget />
          <RtpQualityWidget />
        </div>
      </div>

      {/* Quick actions + events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick actions */}
        <div className="stat-card">
          <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { icon: Plus, label: 'Create campaign', desc: 'Start new outreach', href: '/campaigns', color: 'text-brand-400' },
              { icon: Upload, label: 'Import contacts', desc: 'Add to a contact list', href: '/contacts', color: 'text-blue-400' },
              { icon: FileAudio, label: 'Upload audio', desc: 'MP3 or WAV message', href: '/audio-files', color: 'text-green-400' },
              { icon: Wifi, label: 'Add SIP account', desc: 'Connect phone provider', href: '/sip-accounts', color: 'text-purple-400' },
            ].map(action => {
              const Icon = action.icon
              return (
                <Link key={action.label} href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all group">
                  <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0 group-hover:bg-accent transition-colors">
                    <Icon className={cn('h-4 w-4', action.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold leading-none">{action.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                </Link>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-2">
          <RecentEvents />
        </div>
      </div>
    </div>
  )
}
