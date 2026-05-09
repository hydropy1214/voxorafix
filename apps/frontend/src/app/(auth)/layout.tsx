'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Waves, Phone, Activity, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'

const FEATURES = [
  { icon: Phone, label: 'Direct SIP Protocol', desc: 'No API middlemen — pure SIP/RTP' },
  { icon: Activity, label: 'Live Monitoring', desc: 'Real-time call status & MOS scoring' },
  { icon: Shield, label: 'AMD Detection', desc: 'Human vs. machine answering detection' },
  { icon: Zap, label: 'Intelligent Queue Engine', desc: 'Precise concurrency control and retry logic' },
]

const STATS = [
  { value: '1,000+', label: 'Concurrent Calls' },
  { value: 'AMD', label: 'Detection' },
  { value: 'Live', label: 'Monitoring' },
  { value: 'Any', label: 'SIP Provider' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const token = useAuthStore(s => s.accessToken)
  const hasHydrated = useAuthStore(s => s._hasHydrated)

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (hasHydrated && token) {
      router.replace('/dashboard')
    }
  }, [token, hasHydrated, router])

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-[#12103a] to-[#0c0a2e]" />
        <div className="absolute inset-0 bg-grid opacity-40" />

        {/* Ambient glows */}
        <div className="absolute -top-48 -right-48 w-[480px] h-[480px] rounded-full bg-brand-600/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-48 -left-32 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-brand-500/[0.04] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-brand-500/[0.07] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-brand-500/[0.1] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl gradient-brand flex items-center justify-center shadow-glow-brand group-hover:shadow-lg transition-shadow">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Voxora</span>
          </Link>
        </div>

        {/* Hero content */}
        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500/15 border border-brand-500/25 rounded-full text-brand-300 text-xs font-medium">
              <span className="flex h-1.5 w-1.5 rounded-full bg-brand-400" />
              Enterprise Voice Broadcasting
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Scale your outreach<br />
              <span className="text-gradient">without limits</span>
            </h1>
            <p className="text-brand-200/80 text-lg leading-relaxed max-w-md">
              Launch voice campaigns with direct SIP — no telecom APIs, no per-minute markups, full infrastructure control.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {STATS.map(stat => (
              <div key={stat.label} className="glass-card p-3 text-center group hover:border-brand-500/20 transition-colors">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-brand-300/70 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {FEATURES.map(feature => {
              const Icon = feature.icon
              return (
                <div key={feature.label} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-brand-500/15 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/90">{feature.label}</p>
                    <p className="text-xs text-brand-300/60">{feature.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-3 text-brand-400/60 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-green-400" />
            <span>Enterprise call infrastructure</span>
          </div>
          <span>·</span>
          <span>Direct SIP/RTP</span>
          <span>·</span>
          <span>© 2026 Voxora</span>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        <div className="relative w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-9 w-9 rounded-xl gradient-brand flex items-center justify-center shadow-glow-brand">
              <Waves className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">Voxora</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
