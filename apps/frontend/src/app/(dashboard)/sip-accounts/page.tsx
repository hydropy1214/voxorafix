'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Wifi, WifiOff, Loader2, Trash2, TestTube, Info } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { getStatusColor, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { AddSipAccountModal } from '@/components/sip-accounts/AddSipAccountModal'

export default function SipAccountsPage() {
  const [showAdd, setShowAdd] = useState(false)
  const qc = useQueryClient()

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['sip-accounts'],
    queryFn: () => api.get('/sip-accounts').then(r => r.data),
    refetchInterval: 30000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/sip-accounts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sip-accounts'] })
      toast.success('SIP account removed')
    },
    onError: () => toast.error('Failed to remove account'),
  })

  const testMutation = useMutation({
    mutationFn: (id: string) => api.post(`/sip-accounts/${id}/test`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sip-accounts'] })
      toast.success('SIP connection test completed')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Test failed'),
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">SIP Accounts</h1>
          <p className="page-subtitle">Connect your SIP providers for outbound calling</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add SIP Account
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-brand-500/[0.08] border border-brand-500/20 rounded-2xl">
        <Info className="h-4 w-4 text-brand-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-brand-200">Direct SIP Protocol</p>
          <p className="text-xs text-brand-300/70 mt-0.5">
            Connect any SIP provider (UDP, TCP, TLS). Voxora routes calls through FreeSWITCH — no telecom APIs needed.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className={cn('h-52 rounded-2xl skeleton', i > 0 && 'opacity-60')} />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-20">
          <div className="h-16 w-16 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-4">
            <Wifi className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No SIP accounts</h3>
          <p className="text-muted-foreground text-sm mb-6">Add your first SIP provider account to start calling</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            Add SIP Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc: any) => (
            <SipAccountCard
              key={acc.id}
              account={acc}
              onTest={() => testMutation.mutate(acc.id)}
              onDelete={() => deleteMutation.mutate(acc.id)}
              testing={testMutation.isPending}
            />
          ))}
        </div>
      )}

      {showAdd && <AddSipAccountModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}

function SipAccountCard({ account, onTest, onDelete, testing }: {
  account: any; onTest: () => void; onDelete: () => void; testing: boolean
}) {
  const isRegistered = account.status === 'REGISTERED'

  return (
    <div className={cn(
      'bg-card border rounded-2xl p-5 transition-all duration-200',
      isRegistered
        ? 'border-green-500/20 hover:border-green-500/30'
        : 'border-border hover:border-brand-500/20',
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center',
            isRegistered ? 'bg-green-500/15' : 'bg-muted/50',
          )}>
            {isRegistered
              ? <Wifi className="h-5 w-5 text-green-400" />
              : <WifiOff className="h-5 w-5 text-muted-foreground" />
            }
          </div>
          <div>
            <h3 className="font-semibold text-[15px]">{account.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">
              {account.sipServer}:{account.sipPort}
            </p>
          </div>
        </div>
        <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-semibold', getStatusColor(account.status))}>
          {account.status}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 text-xs mb-4 bg-muted/20 rounded-xl p-3">
        {[
          { label: 'Username', value: account.username, mono: true },
          { label: 'Transport', value: account.transport },
          { label: 'Max Concurrent', value: `${account.maxConcurrentCalls} calls` },
          { label: 'Calls / Second', value: `${account.callsPerSecond}/s` },
          account.lastCheckedAt && { label: 'Last Checked', value: timeAgo(account.lastCheckedAt) },
        ].filter(Boolean).map((item: any) => (
          <div key={item.label} className="flex justify-between items-center">
            <span className="text-muted-foreground">{item.label}</span>
            <span className={cn('font-medium', item.mono ? 'font-mono' : '')}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Error badge */}
      {account.lastError && (
        <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-xs text-red-400 leading-relaxed">{account.lastError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTest}
          disabled={testing}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-border hover:bg-accent text-xs font-medium transition-all disabled:opacity-50"
        >
          {testing
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <TestTube className="h-3.5 w-3.5" />
          }
          Test Connection
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-xl border border-border hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
