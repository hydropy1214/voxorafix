'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Filter, Phone, ScrollText, Search } from 'lucide-react'
import { api } from '@/lib/api'
import { formatPhoneNumber, timeAgo, getStatusColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Row = {
  id: string
  phone: string
  contactDisplayName?: string | null
  status: string
  direction?: string
  amdResult?: string | null
  duration?: number | null
  rtpMos?: number | null
  hangupCause?: string | null
  sipResponseCode?: number | null
  sipResponseText?: string | null
  createdAt: string
  campaign?: { id: string; name: string } | null
  contact?: { firstName?: string | null; lastName?: string | null; phone?: string } | null
}

function exportCsv(rows: Row[]) {
  const headers = [
    'Started (UTC)',
    'Source',
    'Campaign',
    'Contact label',
    'Phone',
    'Status',
    'AMD',
    'Duration sec',
    'MOS',
    'Hangup / SIP',
  ]
  const lines = rows.map(r => {
    const src = r.campaign ? 'Campaign' : 'Quick dial'
    const camp = r.campaign?.name ?? ''
    const label = r.contactDisplayName || [r.contact?.firstName, r.contact?.lastName].filter(Boolean).join(' ') || ''
    const sip = [r.sipResponseCode, r.sipResponseText].filter(Boolean).join(' ')
    const tail = r.hangupCause || sip || ''
    return [
      new Date(r.createdAt).toISOString(),
      src,
      camp,
      label.replace(/"/g, '""'),
      r.phone,
      r.status,
      r.amdResult ?? '',
      r.duration ?? '',
      r.rtpMos ?? '',
      tail.replace(/"/g, '""'),
    ]
      .map(v => `"${String(v)}"`)
      .join(',')
  })
  const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `voxora-call-logs-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function CallLogsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [source, setSource] = useState<'all' | 'campaign' | 'quick_dial'>('all')
  const [campaignId, setCampaignId] = useState('')
  const [phone, setPhone] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data: campaignsData } = useQuery({
    queryKey: ['campaigns', 'short'],
    queryFn: () => api.get('/campaigns?limit=100').then(r => r.data),
  })

  const campaigns = campaignsData?.data ?? []

  const queryParams = useMemo(() => {
    const p = new URLSearchParams()
    p.set('page', String(page))
    p.set('limit', '25')
    if (status) p.set('status', status)
    if (source !== 'all') p.set('source', source)
    if (campaignId) p.set('campaignId', campaignId)
    if (phone.trim()) p.set('phone', phone.trim())
    if (from) p.set('from', new Date(from).toISOString())
    if (to) p.set('to', new Date(to).toISOString())
    return p.toString()
  }, [page, status, source, campaignId, phone, from, to])

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'call-logs', queryParams],
    queryFn: () => api.get(`/reports/call-logs?${queryParams}`).then(r => r.data),
  })

  const rows: Row[] = data?.data ?? []
  const totalPages = data?.pages ?? 1

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Call logs & reporting</h1>
        <p className="page-subtitle max-w-2xl">
          Search every outbound attempt tied to your workspace — campaigns and Web Dialer quick calls —
          then export a CSV for reconciliation or customer reporting.
        </p>
      </div>

      <div className="glass-card-strong rounded-2xl border border-border/80 p-4 sm:p-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
            <ScrollText className="h-5 w-5" />
          </div>
          <div className="space-y-2 text-[13px] leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">Examples</p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong className="text-foreground/90">Compliance:</strong> filter status <code className="rounded bg-muted px-1 py-0.5 text-[11px]">FAILED</code>,
                export CSV, attach to a ticket with timestamps (stored in UTC).
              </li>
              <li>
                <strong className="text-foreground/90">QA:</strong> pick one campaign, sort by newest, scan AMD + MOS columns for uneven answer quality.
              </li>
              <li>
                <strong className="text-foreground/90">Quick dial:</strong> choose source “Quick dial only” to isolate tests from production campaigns.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="stat-card space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Filters</span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Source</label>
            <select
              className="input-field py-2 text-sm"
              value={source}
              onChange={e => {
                const v = e.target.value as 'all' | 'campaign' | 'quick_dial'
                setSource(v)
                if (v === 'quick_dial') setCampaignId('')
                setPage(1)
              }}
            >
              <option value="all">All calls</option>
              <option value="campaign">Campaigns only</option>
              <option value="quick_dial">Quick dial only</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Campaign</label>
            <select
              className="input-field py-2 text-sm"
              value={campaignId}
              onChange={e => { setCampaignId(e.target.value); setPage(1) }}
              disabled={source === 'quick_dial'}
            >
              <option value="">Any campaign</option>
              {campaigns.map((c: { id: string; name: string }) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Call status</label>
            <select className="input-field py-2 text-sm" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
              <option value="">Any status</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="NOANSWER">No answer</option>
              <option value="BUSY">Busy</option>
              <option value="DIALING">Dialing</option>
              <option value="RINGING">Ringing</option>
              <option value="ANSWERED">Answered</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Phone contains</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                className="input-field py-2 pl-9 text-sm"
                placeholder="Digits…"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onBlur={() => setPage(1)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">From (local)</label>
            <input type="datetime-local" className="input-field py-2 text-sm" value={from} onChange={e => { setFrom(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-muted-foreground">To (local)</label>
            <input type="datetime-local" className="input-field py-2 text-sm" value={to} onChange={e => { setTo(e.target.value); setPage(1) }} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-[12px] text-muted-foreground">
            {data?.total != null ? (
              <span><strong className="text-foreground">{data.total}</strong> matching rows</span>
            ) : (
              'Loading counts…'
            )}
          </p>
          <button
            type="button"
            onClick={() => exportCsv(rows)}
            disabled={rows.length === 0}
            className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Export page CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={cn('h-12 rounded-xl skeleton', i > 3 && 'opacity-40')} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Phone className="h-10 w-10 text-muted-foreground/30" />
            <p className="font-semibold">No calls match these filters</p>
            <p className="max-w-sm text-sm text-muted-foreground">Try widening the date range or clearing the phone fragment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-[12px]">
              <thead className="border-b border-border bg-muted/30 text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Number</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">AMD</th>
                  <th className="px-4 py-3 text-right font-semibold">Sec</th>
                  <th className="px-4 py-3 text-right font-semibold">MOS</th>
                  <th className="px-4 py-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-muted/15">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{timeAgo(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      {r.campaign ? (
                        <span className="badge badge-violet text-[10px]">{r.campaign.name}</span>
                      ) : (
                        <span className="badge badge-cyan text-[10px]">Quick dial</span>
                      )}
                    </td>
                    <td className="max-w-[140px] truncate px-4 py-3 text-muted-foreground" title={r.contactDisplayName || ''}>
                      {r.contactDisplayName || [r.contact?.firstName, r.contact?.lastName].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{formatPhoneNumber(r.phone)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('badge text-[10px]', getStatusColor(r.status))}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.amdResult ? (
                        <span className={cn('badge text-[10px]', getStatusColor(r.amdResult))}>{r.amdResult}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.duration ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {r.rtpMos != null && r.rtpMos > 0 ? r.rtpMos.toFixed(1) : '—'}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground" title={r.hangupCause || r.sipResponseText || ''}>
                      {r.hangupCause || r.sipResponseText || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[12px]">
            <button
              type="button"
              disabled={page <= 1}
              className="btn-ghost px-3 py-1.5 disabled:opacity-40"
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="text-muted-foreground">
              Page <strong className="text-foreground">{page}</strong> of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              className="btn-ghost px-3 py-1.5 disabled:opacity-40"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
