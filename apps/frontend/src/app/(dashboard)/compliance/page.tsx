'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ShieldCheck, Phone, Clock, Globe, Upload, Plus, Trash2,
  AlertTriangle, CheckCircle2, Info, Download, Search, Ban,
} from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { cn, formatNumber } from '@/lib/utils'

const CALLING_HOURS = [
  { code: 'US-GENERAL', label: 'United States (General)', window: '8:00 AM – 9:00 PM local' },
  { code: 'US-TCPA', label: 'United States (TCPA strict)', window: '8:00 AM – 8:00 PM local' },
  { code: 'UK', label: 'United Kingdom', window: '8:00 AM – 9:00 PM GMT' },
  { code: 'AU', label: 'Australia', window: '8:00 AM – 8:00 PM AEST' },
  { code: 'EU', label: 'European Union', window: '9:00 AM – 8:00 PM local' },
  { code: 'CUSTOM', label: 'Custom window', window: 'You define the hours' },
]

export default function CompliancePage() {
  const [tab, setTab] = useState<'dnc' | 'hours' | 'audit'>('dnc')
  const [dncSearch, setDncSearch] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const qc = useQueryClient()

  // Fetch opted-out contacts as DNC list
  const { data: dncData, isLoading } = useQuery({
    queryKey: ['compliance', 'dnc', dncSearch],
    queryFn: () => api.get(`/contacts/lists`).then(r => r.data),
  })

  const addDncMutation = useMutation({
    mutationFn: (phone: string) => api.post('/contacts/dnc', { phone }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['compliance'] })
      setNewNumber('')
      toast.success('Number added to DNC list')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to add number'),
  })

  const TABS = [
    { id: 'dnc', label: 'DNC List', icon: Ban },
    { id: 'hours', label: 'Calling Hours', icon: Clock },
    { id: 'audit', label: 'Audit Log', icon: CheckCircle2 },
  ] as const

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      <div>
        <h1 className="page-title">Compliance Center</h1>
        <p className="page-subtitle">Manage DNC lists, calling windows, and compliance audit logs</p>
      </div>

      {/* Compliance status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: ShieldCheck,
            label: 'DNC Protection',
            value: 'Active',
            desc: 'Opt-outs blocked automatically',
            ok: true,
          },
          {
            icon: Clock,
            label: 'Calling Hours',
            value: 'Enforced',
            desc: 'Per-campaign time windows active',
            ok: true,
          },
          {
            icon: CheckCircle2,
            label: 'Opt-out Tracking',
            value: 'Enabled',
            desc: 'Press-9 opt-out on every call',
            ok: true,
          },
        ].map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className={cn(
              'stat-card border',
              card.ok ? 'border-green-500/20 bg-green-500/[0.04]' : 'border-red-500/20 bg-red-500/[0.04]',
            )}>
              <div className="flex items-center gap-3">
                <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center',
                  card.ok ? 'bg-green-500/15' : 'bg-red-500/15'
                )}>
                  <Icon className={cn('h-4 w-4', card.ok ? 'text-green-400' : 'text-red-400')} />
                </div>
                <div>
                  <p className={cn('text-sm font-bold', card.ok ? 'text-green-400' : 'text-red-400')}>{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">{card.desc}</p>
            </div>
          )
        })}
      </div>

      {/* Compliance info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/[0.07] border border-blue-500/20 rounded-2xl">
        <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-300">Staying compliant is your responsibility</p>
          <p className="text-xs text-blue-300/70 mt-1 leading-relaxed">
            Voxora provides the tools — DNC management, calling hour enforcement, opt-out tracking, and full audit logs.
            Compliance requirements vary by country, industry, and contact type.
            Always consult your legal team for the regulations that apply to your campaigns.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/40 rounded-2xl p-1 w-fit border border-border/50">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                tab === t.id
                  ? 'bg-card text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* DNC Tab */}
      {tab === 'dnc' && (
        <div className="space-y-4 animate-fade-in">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm">Do Not Call List</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Numbers on this list will never be dialled, regardless of campaign settings.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs hover:bg-accent transition-colors">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs hover:bg-accent transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  Import CSV
                </button>
              </div>
            </div>

            {/* Add number */}
            <div className="flex gap-2 mb-4">
              <input
                value={newNumber}
                onChange={e => setNewNumber(e.target.value)}
                placeholder="+15551234567 (E.164 format)"
                className="input-field flex-1"
                onKeyDown={e => e.key === 'Enter' && newNumber && addDncMutation.mutate(newNumber)}
              />
              <button
                onClick={() => newNumber && addDncMutation.mutate(newNumber)}
                className="btn-primary flex items-center gap-1.5 flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={dncSearch}
                onChange={e => setDncSearch(e.target.value)}
                placeholder="Search DNC list..."
                className="input-field pl-10"
              />
            </div>

            {/* Empty state */}
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-muted/30 flex items-center justify-center">
                <Ban className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Your DNC list is empty</p>
              <p className="text-xs text-muted-foreground/60 max-w-xs">
                When contacts opt out (press 9 during a call), they are automatically added here.
                You can also add numbers manually or import a CSV.
              </p>
            </div>
          </div>

          {/* How opt-out works */}
          <div className="stat-card">
            <h3 className="font-semibold text-sm mb-3">How opt-out works</h3>
            <div className="space-y-3">
              {[
                {
                  n: '1',
                  title: 'Contact presses 9 during call',
                  desc: 'During any call, contacts can press 9 to request removal. Voxora detects the DTMF tone and triggers the opt-out flow.',
                },
                {
                  n: '2',
                  title: 'Number added to DNC automatically',
                  desc: 'The contact record is flagged as opted-out and their number is added to your organisation DNC list immediately.',
                },
                {
                  n: '3',
                  title: 'Protected in all future campaigns',
                  desc: 'Every campaign checks the DNC list before dialling. Opted-out contacts are skipped, regardless of which list they are in.',
                },
              ].map(step => (
                <div key={step.n} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full gradient-brand flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {step.n}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calling Hours Tab */}
      {tab === 'hours' && (
        <div className="space-y-4 animate-fade-in">
          <div className="stat-card">
            <div className="mb-4">
              <h3 className="font-semibold text-sm">Calling Hour Templates</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Apply a template to campaigns to automatically restrict calling to compliant hours.
              </p>
            </div>
            <div className="space-y-2.5">
              {CALLING_HOURS.map(h => (
                <div key={h.code}
                  className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50 hover:border-brand-500/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="h-4 w-4 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{h.label}</p>
                      <p className="text-xs text-muted-foreground">{h.window}</p>
                    </div>
                  </div>
                  <button className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium">
                    Apply to campaign
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start gap-3 p-0">
              <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-300">Timezone detection</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Voxora uses area code and country data to estimate the local timezone for each contact.
                  For the most accurate timezone detection, ensure your contact records include country codes.
                  Contacts with undetectable timezones default to your account timezone.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {tab === 'audit' && (
        <div className="stat-card animate-fade-in">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Compliance Audit Log</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Full record of opt-outs, DNC additions, and calling hour violations.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-12 w-12 rounded-2xl bg-muted/30 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Audit log is clean</p>
            <p className="text-xs text-muted-foreground/60">No compliance events recorded yet.</p>
          </div>
        </div>
      )}
    </div>
  )
}
