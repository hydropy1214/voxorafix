'use client'

import { useQuery } from '@tanstack/react-query'
import { Clock, Phone, CheckCircle2, XCircle, Voicemail, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { formatPhoneNumber, getStatusColor, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

const getEventConfig = (status: string, amdResult: string) => {
  if (amdResult === 'HUMAN') return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' }
  if (amdResult === 'MACHINE') return { icon: Voicemail, color: 'text-orange-400', bg: 'bg-orange-500/10' }
  if (status === 'FAILED' || status === 'BUSY') return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' }
  return { icon: Phone, color: 'text-muted-foreground', bg: 'bg-muted/50' }
}

export function RecentEvents() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['analytics', 'events'],
    queryFn: () => api.get('/analytics/events?limit=10').then(r => r.data),
    refetchInterval: 15000,
  })

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-[13px] leading-none">Recent Events</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Updated every 15 seconds</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={cn('h-12 rounded-xl skeleton', i > 2 && 'opacity-50')} />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center">
            <Clock className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">No events yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Start a campaign to see live activity
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-0.5">
          {data.map((event: any, i: number) => {
            const { icon: EventIcon, color, bg } = getEventConfig(event.status, event.amdResult)
            return (
              <div
                key={event.id ?? i}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-accent/30 transition-colors group"
              >
                <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0', bg)}>
                  <EventIcon className={cn('h-3.5 w-3.5', color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-foreground text-[13px]">
                      {formatPhoneNumber(event.contact?.phone || event.phone || '')}
                    </span>
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-md border font-medium',
                      getStatusColor(event.amdResult || event.status),
                    )}>
                      {event.amdResult || event.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {event.campaign?.name}
                    {event.duration ? ` · ${event.duration}s` : ''}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground/60 flex-shrink-0 group-hover:text-muted-foreground transition-colors">
                  {timeAgo(event.createdAt)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
