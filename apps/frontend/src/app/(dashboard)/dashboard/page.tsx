'use client'

import { useQuery } from '@tanstack/react-query'
import { Activity, Phone, Users, TrendingUp, Zap, Radio, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { CallsChart } from '@/components/dashboard/CallsChart'
import { RecentEvents } from '@/components/dashboard/RecentEvents'
import { LiveCallsWidget } from '@/components/dashboard/LiveCallsWidget'
import { RtpQualityWidget } from '@/components/dashboard/RtpQualityWidget'
import { useLiveStats } from '@/hooks/useLiveStats'

export default function DashboardPage() {
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

  const { liveStats } = useLiveStats()
  const stats = analytics?.last30Days ?? {}

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Campaign performance at a glance</p>
        </div>
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
      </div>

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
        <StatsCard
          title="Calls Today"
          value={analytics?.todayCalls ?? 0}
          icon={Phone}
          color="blue"
        />
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
        <StatsCard
          title="Active Calls"
          value={liveStats?.activeCalls ?? 0}
          icon={Activity}
          live
          color="green"
          compact
        />
        <StatsCard
          title="Total Calls (30d)"
          value={stats.totalCalls ?? 0}
          icon={Phone}
          color="blue"
          compact
        />
        <StatsCard
          title="Voicemail Rate"
          value={`${stats.machineRate?.toFixed(1) ?? '0.0'}%`}
          icon={Zap}
          color="yellow"
          compact
        />
        <StatsCard
          title="Failure Rate"
          value={`${stats.failureRate?.toFixed(1) ?? '0.0'}%`}
          icon={AlertCircle}
          color="red"
          compact
        />
      </div>

      {/* Charts & Live Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CallsChart data={timelineData ?? []} loading={isLoading} />
        </div>
        <div className="space-y-4">
          <LiveCallsWidget />
          <RtpQualityWidget />
        </div>
      </div>

      {/* Recent Events */}
      <RecentEvents />
    </div>
  )
}
