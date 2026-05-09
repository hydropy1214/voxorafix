'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Megaphone, Users, FileAudio, Wifi,
  Activity, Mic, BarChart3, CreditCard, Settings, Waves, ChevronRight,
  ShieldCheck, Key,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'

const NAV_ITEMS = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/live-monitor', label: 'Live Monitor', icon: Activity, live: true },
    ],
  },
  {
    label: 'Campaigns',
    items: [
      { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
      { href: '/contacts', label: 'Contacts', icon: Users },
      { href: '/audio-files', label: 'Audio Files', icon: FileAudio },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { href: '/sip-accounts', label: 'SIP Accounts', icon: Wifi },
      { href: '/recordings', label: 'Recordings', icon: Mic },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/compliance', label: 'Compliance', icon: ShieldCheck },
      { href: '/billing', label: 'Billing', icon: CreditCard },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

const PLAN_LIMITS: Record<string, { label: string; calls: number; color: string }> = {
  TRIAL: { label: 'Trial', calls: 2, color: 'text-gray-400' },
  STARTER: { label: 'Starter', calls: 5, color: 'text-blue-400' },
  GROWTH: { label: 'Growth', calls: 25, color: 'text-brand-400' },
  PRO: { label: 'Pro', calls: 100, color: 'text-purple-400' },
  ENTERPRISE: { label: 'Enterprise', calls: 500, color: 'text-yellow-400' },
}

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore(s => s.user)
  const plan = (user?.organization as any)?.subscription?.plan ?? 'TRIAL'
  const planInfo = PLAN_LIMITS[plan] ?? PLAN_LIMITS.TRIAL

  return (
    <aside className="w-[232px] flex-shrink-0 bg-card border-r border-border flex flex-col relative">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-brand-500/[0.03] to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-border flex-shrink-0">
        <div className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0 shadow-glow-violet">
          <Waves className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="font-bold text-[15px] leading-none">Voxora</span>
          <span className="block text-[10px] text-muted-foreground leading-none mt-0.5">
            Voice Broadcasting
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        {NAV_ITEMS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-3 mb-1 select-none">
              {group.label}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'nav-item group',
                    isActive ? 'active' : '',
                  )}
                >
                  <Icon className={cn(
                    'h-[15px] w-[15px] flex-shrink-0 transition-colors',
                    isActive ? 'text-brand-400' : 'text-muted-foreground/70 group-hover:text-foreground/70',
                  )} />
                  <span className="flex-1 text-[13px]">{item.label}</span>
                  {'live' in item && item.live && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="h-3 w-3 text-brand-400/60 flex-shrink-0" />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom: user info + plan */}
      <div className="p-3 border-t border-border flex-shrink-0 space-y-2">
        {/* Plan card */}
        <div className="bg-brand-500/[0.08] border border-brand-500/15 rounded-xl p-3 hover:border-brand-500/25 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className={cn('text-xs font-semibold', planInfo.color)}>{planInfo.label} Plan</span>
            </div>
            <Link
              href="/billing"
              className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-0.5"
            >
              Upgrade <ChevronRight className="h-2.5 w-2.5" />
            </Link>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Concurrent calls</span>
            <span className="font-medium text-foreground">{planInfo.calls}</span>
          </div>
          {/* Usage bar — static placeholder */}
          <div className="mt-2 h-1 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full gradient-brand rounded-full transition-all"
              style={{ width: plan === 'TRIAL' ? '20%' : '45%' }}
            />
          </div>
        </div>

        {/* User row */}
        {user && (
          <Link
            href="/settings"
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-accent/50 transition-colors group"
          >
            <div className="h-7 w-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate leading-none">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email}</p>
            </div>
            <Settings className="h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground flex-shrink-0 transition-colors" />
          </Link>
        )}
      </div>
    </aside>
  )
}
