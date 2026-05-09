'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  trend?: 'up' | 'down'
  trendValue?: string
  color?: 'brand' | 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'orange'
  live?: boolean
  compact?: boolean
}

const colorConfig = {
  brand:  { bg: 'bg-violet-500/10', icon: 'text-violet-400', border: 'border-violet-500/20', glow: 'shadow-glow-violet' },
  blue:   { bg: 'bg-cyan-500/10',   icon: 'text-cyan-400',   border: 'border-cyan-500/20',   glow: '' },
  green:  { bg: 'bg-emerald-500/10',icon: 'text-emerald-400',border: 'border-emerald-500/20',glow: 'shadow-glow-green' },
  purple: { bg: 'bg-violet-500/10', icon: 'text-violet-400', border: 'border-violet-500/20', glow: '' },
  yellow: { bg: 'bg-amber-500/10',  icon: 'text-amber-400',  border: 'border-amber-500/20',  glow: '' },
  red:    { bg: 'bg-red-500/10',    icon: 'text-red-400',    border: 'border-red-500/20',    glow: 'shadow-glow-red' },
  orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400', border: 'border-orange-500/20', glow: '' },
}

export function StatsCard({
  title, value, icon: Icon, subtitle, trend, trendValue,
  color = 'brand', live, compact,
}: StatsCardProps) {
  const c = colorConfig[color]

  return (
    <div className={cn(
      'stat-card group',
      compact ? 'p-4' : 'p-5',
    )}>
      <div className="flex items-start justify-between gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <p className={cn(
              'text-muted-foreground font-medium leading-none',
              compact ? 'text-xs' : 'text-xs',
            )}>
              {title}
            </p>
            {live && (
              <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
            )}
          </div>

          <p className={cn(
            'font-bold tabular-nums tracking-tight leading-none animate-count-up',
            compact ? 'text-2xl' : 'text-3xl',
          )}>
            {value}
          </p>

          {subtitle && (
            <p className="text-[11px] text-muted-foreground/70">{subtitle}</p>
          )}

          {trend && trendValue && (
            <div className={cn(
              'inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full',
              trend === 'up'
                ? 'text-green-400 bg-green-400/10'
                : 'text-red-400 bg-red-400/10',
            )}>
              {trend === 'up'
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />
              }
              {trendValue}
            </div>
          )}
        </div>

        {/* Icon */}
        <div className={cn(
          'rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
          compact ? 'p-2' : 'p-2.5',
          c.bg, c.border,
        )}>
          <Icon className={cn(compact ? 'h-4 w-4' : 'h-[18px] w-[18px]', c.icon)} />
        </div>
      </div>
    </div>
  )
}
