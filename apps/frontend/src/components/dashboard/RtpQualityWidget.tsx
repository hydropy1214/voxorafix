'use client'

import { useQuery } from '@tanstack/react-query'
import { Signal } from 'lucide-react'
import { api } from '@/lib/api'
import { getMosColor, getMosLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function RtpQualityWidget() {
  const { data } = useQuery({
    queryKey: ['analytics', 'rtp'],
    queryFn: () => api.get('/analytics/rtp').then(r => r.data),
    refetchInterval: 30000,
  })

  const mos = data?.avgMos ?? 0
  const mosPercent = Math.min(100, (mos / 5) * 100)

  const getBarColor = (mos: number) => {
    if (mos >= 4.0) return 'bg-green-500'
    if (mos >= 3.5) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-7 w-7 rounded-lg bg-brand-500/10 flex items-center justify-center">
          <Signal className="h-3.5 w-3.5 text-brand-400" />
        </div>
        <div>
          <h3 className="font-semibold text-[13px] leading-none">RTP Quality</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">MOS Score (0–5)</p>
        </div>
      </div>

      {/* MOS Score display */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className={cn('text-4xl font-bold tabular-nums', getMosColor(mos))}>
            {mos > 0 ? mos.toFixed(1) : '—'}
          </div>
          <p className={cn('text-xs font-medium mt-0.5', getMosColor(mos))}>
            {mos > 0 ? getMosLabel(mos) : 'No data'}
          </p>
        </div>

        {/* Bar chart */}
        <div className="flex-1 space-y-1.5">
          {[
            { label: 'Excellent', value: data?.excellentCalls ?? 0, color: 'bg-green-500', threshold: '≥4.0' },
            { label: 'Good', value: data?.goodCalls ?? 0, color: 'bg-yellow-500', threshold: '3.5–4.0' },
            { label: 'Poor', value: data?.poorCalls ?? 0, color: 'bg-red-500', threshold: '<3.5' },
          ].map(row => {
            const total = (data?.excellentCalls ?? 0) + (data?.goodCalls ?? 0) + (data?.poorCalls ?? 0)
            const pct = total > 0 ? (row.value / total) * 100 : 0
            return (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-muted-foreground">{row.label}</span>
                  <span className="text-[10px] font-medium tabular-nums">{row.value}</span>
                </div>
                <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', row.color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MOS progress arc (simplified as a progress bar) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>0</span>
          <span>Average MOS</span>
          <span>5.0</span>
        </div>
        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700', getBarColor(mos))}
            style={{ width: `${mosPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
