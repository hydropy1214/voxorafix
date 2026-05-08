'use client'

import { Phone, Activity } from 'lucide-react'
import { useLiveStats } from '@/hooks/useLiveStats'
import { formatPhoneNumber, getStatusColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function LiveCallsWidget() {
  const { events, liveStats } = useLiveStats()
  const recentCalls = events.slice(0, 6)
  const hasActive = liveStats.activeCalls > 0

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            'h-7 w-7 rounded-lg flex items-center justify-center',
            hasActive ? 'bg-green-500/15' : 'bg-muted/50',
          )}>
            <Phone className={cn('h-3.5 w-3.5', hasActive ? 'text-green-400' : 'text-muted-foreground')} />
          </div>
          <div>
            <h3 className="font-semibold text-[13px] leading-none">Live Calls</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Real-time feed</p>
          </div>
        </div>
        <div className={cn(
          'text-2xl font-bold tabular-nums flex items-center gap-1.5',
          hasActive ? 'text-green-400' : 'text-muted-foreground',
        )}>
          {hasActive && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          )}
          {liveStats.activeCalls}
        </div>
      </div>

      <div className="space-y-1">
        {recentCalls.length === 0 ? (
          <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground/50">
            <Activity className="h-4 w-4" />
            <p className="text-xs">No active calls</p>
          </div>
        ) : (
          recentCalls.map((event, i) => {
            const statusLabel = event.amdResult ?? (event.type === 'call:answered' ? 'LIVE' : 'END')
            return (
              <div
                key={i}
                className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-accent/30 transition-colors text-xs"
              >
                <span className={cn(
                  'px-1.5 py-0.5 rounded-md border text-[10px] font-semibold flex-shrink-0',
                  event.amdResult
                    ? getStatusColor(event.amdResult)
                    : 'text-muted-foreground bg-muted/50 border-border',
                )}>
                  {statusLabel}
                </span>
                <span className="flex-1 font-mono text-muted-foreground truncate text-[11px]">
                  {formatPhoneNumber(event.phone || '')}
                </span>
                {event.duration !== undefined && (
                  <span className="text-muted-foreground/60 tabular-nums text-[10px]">{event.duration}s</span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
