'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Play, Pause, Square, Megaphone, Search } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { formatNumber, getStatusColor } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { CampaignWizard } from '@/components/campaigns/CampaignWizard'

export default function CampaignsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/campaigns').then(r => r.data),
    refetchInterval: 10000,
  })

  const startMutation = useMutation({
    mutationFn: (id: string) => api.post(`/campaigns/${id}/start`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Campaign started') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to start'),
  })

  const pauseMutation = useMutation({
    mutationFn: (id: string) => api.post(`/campaigns/${id}/pause`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Campaign paused') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to pause'),
  })

  const stopMutation = useMutation({
    mutationFn: (id: string) => api.post(`/campaigns/${id}/stop`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Campaign stopped') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to stop'),
  })

  const campaigns = data?.data ?? []
  const filtered = campaigns.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-subtitle">Manage your voice broadcast campaigns</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="input-field pl-10 w-64"
          />
        </div>
        {campaigns.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {filtered.length} of {campaigns.length} campaigns
          </span>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={cn('h-28 rounded-2xl skeleton', i > 0 && 'opacity-60')} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="h-16 w-16 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-4">
            <Megaphone className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <h3 className="font-semibold text-lg mb-2">
            {search ? 'No matching campaigns' : 'No campaigns yet'}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {search ? 'Try a different search term' : 'Create your first broadcast campaign to get started'}
          </p>
          {!search && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary"
            >
              Create Campaign
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((campaign: any) => (
            <CampaignRow
              key={campaign.id}
              campaign={campaign}
              onStart={() => startMutation.mutate(campaign.id)}
              onPause={() => pauseMutation.mutate(campaign.id)}
              onStop={() => stopMutation.mutate(campaign.id)}
            />
          ))}
        </div>
      )}

      {showCreate && <CampaignWizard onClose={() => setShowCreate(false)} />}
    </div>
  )
}

function CampaignRow({
  campaign, onStart, onPause, onStop,
}: {
  campaign: any; onStart: () => void; onPause: () => void; onStop: () => void
}) {
  const progress = campaign.totalContacts > 0
    ? Math.min(100, (campaign.processedContacts / campaign.totalContacts) * 100)
    : 0

  const answerRate = campaign.processedContacts > 0
    ? ((campaign.answeredCalls / campaign.processedContacts) * 100).toFixed(1)
    : '0.0'

  const isRunning = campaign.status === 'RUNNING'

  return (
    <div className={cn(
      'bg-card border rounded-2xl p-5 transition-all duration-200 hover-glow',
      isRunning ? 'border-green-500/20' : 'border-border',
    )}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center',
          isRunning ? 'bg-green-500/15' : 'bg-muted/50',
        )}>
          <Megaphone className={cn(
            'h-5 w-5',
            isRunning ? 'text-green-400' : 'text-muted-foreground',
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <Link
              href={`/campaigns/${campaign.id}`}
              className="font-semibold text-[15px] hover:text-brand-300 transition-colors truncate"
            >
              {campaign.name}
            </Link>
            <span className={cn(
              'text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0',
              getStatusColor(campaign.status),
              isRunning && 'status-running',
            )}>
              {campaign.status}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
            {campaign.contactList?.name && <span>{campaign.contactList.name}</span>}
            {campaign.sipAccount?.name && (
              <>
                <span>·</span>
                <span>{campaign.sipAccount.name}</span>
              </>
            )}
            <span>·</span>
            <span>
              {formatNumber(campaign.processedContacts)}/{formatNumber(campaign.totalContacts)} contacts
            </span>
          </div>

          {/* Progress */}
          <div className="progress-bar mb-3">
            <div
              className={cn(
                'progress-bar-fill',
                isRunning
                  ? 'bg-gradient-to-r from-brand-500 via-green-500 to-brand-400'
                  : 'bg-brand-500/60',
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-5">
            {[
              { label: 'Answer Rate', value: `${answerRate}%`, highlight: parseFloat(answerRate) > 30 },
              { label: 'Human', value: formatNumber(campaign.humanAnswers) },
              { label: 'Voicemail', value: formatNumber(campaign.machineAnswers) },
              { label: 'Failed', value: formatNumber(campaign.failedCalls) },
              {
                label: 'Active',
                value: campaign.activeCalls,
                highlight: campaign.activeCalls > 0,
                live: campaign.activeCalls > 0,
              },
            ].map(s => (
              <div key={s.label}>
                <p className={cn(
                  'text-sm font-bold leading-none',
                  s.highlight ? 'text-green-400' : 'text-foreground',
                )}>
                  {s.value}
                  {s.live && (
                    <span className="relative inline-flex ml-1.5 h-1.5 w-1.5 align-middle">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isRunning ? (
            <>
              <button
                onClick={onPause}
                className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-all"
                title="Pause campaign"
              >
                <Pause className="h-4 w-4" />
              </button>
              <button
                onClick={onStop}
                className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                title="Stop campaign"
              >
                <Square className="h-4 w-4" />
              </button>
            </>
          ) : ['DRAFT', 'PAUSED'].includes(campaign.status) ? (
            <button
              onClick={onStart}
              className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all"
              title="Start campaign"
            >
              <Play className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
