'use client'

import Link from 'next/link'
import { useState, useEffect, memo } from 'react'
import {
  Waves, ArrowRight, CheckCircle2, ChevronDown, Star,
  Phone, TrendingUp, Clock, Users, Shield, Zap, BarChart3,
  Target, MessageSquare, RefreshCw, Lock, HeadphonesIcon,
  Building2, ShoppingCart, Heart, X, Menu, Check, ChevronRight,
  Activity, Radio, Voicemail, Globe, Key, Wifi, AlertTriangle,
  Eye, Cpu, Filter, LineChart,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Design tokens ──────────────────────────────────────────────── */
const T = {
  bg:       'bg-[hsl(234_30%_5%)]',
  bgCard:   'bg-[hsl(234_28%_8%)]',
  bgEl:     'bg-[hsl(234_28%_10%)]',
  border:   'border-[hsl(234_22%_14%)]',
  muted:    'text-[hsl(224_14%_52%)]',
}

/* ─── Nav ──────────────────────────────────────────────────────────── */
const Nav = memo(function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const links = [
    { l: 'How it works',  h: '#how'       },
    { l: 'Use cases',     h: '#cases'     },
    { l: 'Why Voxora',    h: '#why'       },
    { l: 'Pricing',       h: '#pricing'   },
  ]
  return (
    <header className={cn(
      'fixed inset-x-0 top-0 z-50 transition-all duration-300',
      scrolled ? `${T.bgCard} backdrop-blur-2xl border-b ${T.border}` : 'bg-transparent',
    )}>
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center shadow-glow-violet">
            <Waves className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-[17px] tracking-tight text-white">Voxora</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-8">
          {links.map(l => (
            <a key={l.l} href={l.h} className={`text-sm font-medium ${T.muted} hover:text-white transition-colors`}>{l.l}</a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login" className={`text-sm font-medium px-3 py-1.5 ${T.muted} hover:text-white transition-colors`}>Sign in</Link>
          <Link href="/signup" className="btn-primary text-sm py-2 px-5 flex items-center gap-1.5">
            Start free <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <button className={`lg:hidden p-2 rounded-xl ${T.muted} hover:text-white`} onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className={`lg:hidden ${T.bgCard} border-t ${T.border} px-5 py-4 space-y-1`}>
          {links.map(l => (
            <a key={l.l} href={l.h} onClick={() => setOpen(false)}
              className={`block py-2.5 text-sm font-medium ${T.muted} hover:text-white transition-colors`}>{l.l}</a>
          ))}
          <div className={`flex gap-3 pt-3 border-t ${T.border} mt-2`}>
            <Link href="/login" className={`flex-1 text-center py-2.5 text-sm border ${T.border} rounded-xl ${T.muted}`}>Sign in</Link>
            <Link href="/signup" className="flex-1 text-center py-2.5 text-sm gradient-brand text-white rounded-xl font-bold">Start free</Link>
          </div>
        </div>
      )}
    </header>
  )
})

/* ─── Hero ────────────────────────────────────────────────────────── */
const Hero = memo(function Hero() {
  const [calls, setCalls] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCalls(c => c < 2847 ? c + 19 : 2847), 16)
    return () => clearInterval(t)
  }, [])

  return (
    <section className={`relative min-h-screen flex items-center pt-16 overflow-hidden ${T.bg}`}>
      <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 90% 55% at 50% -10%, hsl(263 70% 40% / 0.11), transparent)' }} />

      <div className="relative max-w-7xl mx-auto px-5 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="space-y-8">
          {/* Kicker */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-400">
            <span className="h-px w-8 bg-violet-500" />
            Outbound Voice Infrastructure
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-5xl xl:text-[60px] font-bold tracking-tight leading-[1.05] text-white">
              Your contacts.<br />
              Your voice.<br />
              <span className="text-gradient">Your control.</span>
            </h1>
            <p className="text-xl leading-relaxed pt-1" style={{ color: 'hsl(224 14% 62%)' }}>
              Outbound calling infrastructure built for scale —
              without losing visibility or control.
            </p>
          </div>

          {/* Bullets */}
          <div className="space-y-2.5">
            {[
              'Start a campaign in under 10 minutes',
              'See every call outcome live as it happens',
              'Detect human vs voicemail in seconds',
              'Use your own SIP or phone providers',
            ].map(v => (
              <div key={v} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-violet-400 flex-shrink-0" />
                <span className="text-sm" style={{ color: 'hsl(224 14% 62%)' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* No lock-in bar */}
          <div className={`flex items-center gap-4 text-xs font-bold uppercase tracking-widest ${T.muted} border-t ${T.border} pt-5`}>
            {['No lock-in', 'No black box', 'No guesswork'].map((t, i) => (
              <span key={t} className="flex items-center gap-1.5 text-white/40">
                {i > 0 && <span className="text-white/20">·</span>}
                {t}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary flex items-center gap-2 px-7 py-3.5 text-base rounded-xl">
              Start free — no credit card required
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Right — dashboard preview */}
        <div className="hidden lg:block relative">
          <div className={`rounded-2xl overflow-hidden shadow-modal ${T.bgCard} border ${T.border}`}>
            {/* Chrome bar */}
            <div className={`px-4 py-3 flex items-center gap-3 border-b ${T.border}`}>
              <div className="flex gap-1.5">
                {['bg-red-500/50', 'bg-yellow-500/50', 'bg-green-500/50'].map(c => (
                  <div key={c} className={`h-2.5 w-2.5 rounded-full ${c}`} />
                ))}
              </div>
              <div className={`flex-1 h-5 rounded-md px-3 flex items-center ${T.bgEl}`}>
                <span className="text-[10px]" style={{ color: 'hsl(224 14% 38%)' }}>app.voxora.io / live</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-300">LIVE</span>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Current activity header */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-3">Current activity snapshot</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Active campaigns', value: '18', color: 'text-violet-300' },
                    { label: 'Live calls',        value: calls.toLocaleString(), color: 'text-white', live: true },
                    { label: 'Human answer rate', value: '71%',   color: 'text-emerald-300' },
                    { label: "Today's reach",     value: '4,812', color: 'text-cyan-300' },
                  ].map(s => (
                    <div key={s.label} className={`p-3 rounded-xl ${T.bgEl} border ${T.border}`}>
                      <div className={`flex items-center gap-1.5 text-base font-bold tabular-nums ${s.color}`}>
                        {s.value}
                        {s.live && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] mt-0.5" style={{ color: 'hsl(224 14% 46%)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live events */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'hsl(224 14% 38%)' }}>Live feed</p>
                <div className="space-y-1.5">
                  {[
                    { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', msg: 'Human detected in 0.4s', sub: '+1 (415) 555-0142 · Sales Outreach' },
                    { icon: TrendingUp,   color: 'text-violet-400',  bg: 'bg-violet-500/10',  msg: 'Answer rate +8% this campaign', sub: 'vs previous 30 days' },
                    { icon: Voicemail,    color: 'text-orange-400',  bg: 'bg-orange-500/10',  msg: 'Voicemail drop delivered', sub: '+1 (628) 555-0199 · Win-back' },
                  ].map((ev, i) => {
                    const Icon = ev.icon
                    return (
                      <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${T.bgEl} border ${T.border}`}>
                        <div className={`h-7 w-7 rounded-xl ${ev.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`h-3.5 w-3.5 ${ev.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-white truncate">{ev.msg}</p>
                          <p className="text-[10px] truncate" style={{ color: 'hsl(224 14% 46%)' }}>{ev.sub}</p>
                        </div>
                        <p className="text-[10px] flex-shrink-0" style={{ color: 'hsl(224 14% 38%)' }}>just now</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Floating label */}
          <div className={`absolute -bottom-4 left-4 right-4 ${T.bgCard} border ${T.border} rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-dropdown`}>
            <Eye className="h-4 w-4 text-violet-400 flex-shrink-0" />
            <p className="text-[11px] font-semibold text-white">Live operations, not reports.</p>
            <p className="text-[10px] ml-auto" style={{ color: 'hsl(224 14% 48%)' }}>Every event · Real time</p>
          </div>
        </div>
      </div>

      {/* Trust strip — inside hero */}
      <div className={`absolute bottom-0 inset-x-0 border-t ${T.border} ${T.bgCard} py-3`}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs font-bold">
            <span className="text-white/30">Trusted by 500+ teams running outbound operations globally</span>
            {[
              { v: '3B+',    l: 'calls processed' },
              { v: '99.9%',  l: 'uptime' },
              { v: '<3s',    l: 'detection latency' },
            ].map(s => (
              <div key={s.l} className="flex items-center gap-1.5">
                <span className="text-white">{s.v}</span>
                <span className="text-white/35">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})

/* ─── How it works ───────────────────────────────────────────────── */
const HowItWorks = memo(function HowItWorks() {
  return (
    <section id="how" className={`py-28 ${T.bg}`}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">Setup</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            From setup to live calls<br />in 4 steps
          </h2>
          <p className="text-lg" style={{ color: 'hsl(224 14% 55%)' }}>
            No professional services. No telephony expertise required. Connect, configure, and launch.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {[
            { n: '01', icon: Globe,    title: 'Connect your SIP or phone provider',    desc: 'Bring your existing infrastructure. Paste your credentials. Voxora verifies in seconds.', note: 'No migration required.' },
            { n: '02', icon: Users,    title: 'Upload your contacts',                  desc: 'CSV import with automatic validation, cleanup, and deduplication. See what was accepted and why.', note: 'Validation report included.' },
            { n: '03', icon: Radio,    title: 'Configure your campaign',               desc: 'Set message, timing, retry logic, and voicemail behavior. Guided setup — no decisions left ambiguous.', note: 'Full control at every step.' },
            { n: '04', icon: Activity, title: 'Launch and monitor live',               desc: 'Watch calls connect, get answered, or fail — in real time. Not in a report tomorrow morning.', note: 'Pause or adjust any time.' },
          ].map(step => {
            const Icon = step.icon
            return (
              <div key={step.n}
                className={`${T.bgCard} border ${T.border} rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/30`}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-5xl font-bold" style={{ color: 'hsl(263 70% 40% / 0.2)' }}>{step.n}</span>
                  <Icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="font-bold text-[15px] text-white mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'hsl(224 14% 55%)' }}>{step.desc}</p>
                <p className="text-[11px] font-semibold text-violet-400/70">{step.note}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
})

/* ─── Core value proposition ─────────────────────────────────────── */
const CoreValue = memo(function CoreValue() {
  return (
    <section className={`py-24 ${T.bgCard}`}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Core capability</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Outbound calling<br />without blind spots
            </h2>
            <p className="text-lg" style={{ color: 'hsl(224 14% 60%)' }}>
              Traditional dialers tell you what happened after the fact.
              Voxora shows you what is happening as it happens.
            </p>
            <div className="space-y-4">
              {[
                { icon: Shield,     title: 'Human vs machine detection in seconds',  desc: 'Know instantly if a real person picked up. The right message plays automatically.' },
                { icon: Activity,   title: 'Real-time call flow monitoring',         desc: 'Every call status — connecting, ringing, answered, ended — visible as it occurs.' },
                { icon: Target,     title: 'Instant callback tagging',               desc: 'Contacts that engage get flagged immediately for follow-up. No manual sorting.' },
                { icon: BarChart3,  title: 'Full event-level audit trail',           desc: 'Every event logged. Export anything. Full visibility for every stakeholder.' },
              ].map(item => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'hsl(224 14% 55%)' }}>{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stat display */}
          <div className="space-y-3">
            {[
              { label: 'Detection latency',    value: '<3 seconds',  sub: 'Human or machine — always',   color: 'text-violet-300',  bar: 95 },
              { label: 'Visibility gap',       value: '0 seconds',   sub: 'No polling. Pure real time',  color: 'text-emerald-300', bar: 100 },
              { label: 'Event completeness',   value: '100%',        sub: 'Every call, every outcome',   color: 'text-cyan-300',    bar: 100 },
              { label: 'Avg campaign setup',   value: '<10 min',     sub: 'From credentials to live',    color: 'text-amber-300',   bar: 85 },
            ].map(s => (
              <div key={s.label} className={`${T.bgEl} border ${T.border} rounded-2xl p-5`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white/70">{s.label}</p>
                  <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
                </div>
                <div className="h-1 rounded-full bg-muted/30">
                  <div className={`h-full rounded-full bg-violet-500 transition-all`} style={{ width: `${s.bar}%` }} />
                </div>
                <p className="text-[10px] mt-1.5" style={{ color: 'hsl(224 14% 45%)' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})

/* ─── Use cases ──────────────────────────────────────────────────── */
const UseCases = memo(function UseCases() {
  const cases = [
    { icon: ShoppingCart, label: 'Sales teams',            desc: 'High-volume prospecting with real human connection tracking. Know who answered. Know who to call back.' },
    { icon: Clock,        label: 'Operations teams',       desc: 'Appointment confirmations, reminders, and scheduling automation. Outbound at scale without headcount growth.' },
    { icon: RefreshCw,    label: 'Customer re-engagement', desc: 'Win-back campaigns with structured retry logic. Reach lapsed customers before they become lost ones.' },
    { icon: Building2,    label: 'Financial services',     desc: 'Collections and follow-ups with compliance controls. DNC-ready. Calling windows enforced. Full audit trail.' },
  ]
  return (
    <section id="cases" className={`py-28 ${T.bg}`}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">Use cases</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Built for real<br />outbound operations
          </h2>
          <p className="text-lg" style={{ color: 'hsl(224 14% 55%)' }}>
            Every team running outbound at scale faces the same problem: no visibility, no control, and costs that spiral as volume grows. Voxora fixes all three.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cases.map(c => {
            const Icon = c.icon
            return (
              <div key={c.label}
                className={`${T.bgCard} border ${T.border} rounded-2xl p-6 transition-all duration-200 hover:border-violet-500/30 hover:-translate-y-0.5`}>
                <div className="h-11 w-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
                  <Icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="font-bold text-base text-white mb-2">{c.label}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'hsl(224 14% 55%)' }}>{c.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
})

/* ─── Feature list ───────────────────────────────────────────────── */
const Features = memo(function Features() {
  const list = [
    'Broadcast dialing engine — parallel calling infrastructure',
    'Human / voicemail detection in under 3 seconds',
    'Smart retry logic — behavior-based rescheduling',
    'Voicemail drop automation',
    'Live campaign monitoring dashboard',
    'Timezone-aware calling windows',
    'Opt-out and compliance tracking (DNC-ready)',
    'API and webhooks for full integration',
    'Team roles and audit logs',
    'Multi-number support — bring your own SIP',
  ]
  return (
    <section className={`py-24 ${T.bgCard}`}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">Capabilities</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Everything you need<br />to run outbound at scale
            </h2>
            <p className="text-lg mb-8" style={{ color: 'hsl(224 14% 55%)' }}>
              No third-party integrations for core functionality. No essential features behind a higher tier. The infrastructure you need, available from day one.
            </p>
            <Link href="/signup" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-base rounded-xl">
              Start free trial <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {list.map((f, i) => (
              <div key={i} className={`flex items-center gap-3 p-4 ${T.bgEl} border ${T.border} rounded-xl transition-all hover:border-violet-500/20`}>
                <div className="h-5 w-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-violet-400" />
                </div>
                <span className="text-sm font-medium text-white/85">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})

/* ─── Why Voxora (differentiator) ─────────────────────────────────── */
const WhyVoxora = memo(function WhyVoxora() {
  return (
    <section id="why" className={`py-28 ${T.bg} relative overflow-hidden`}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, hsl(263 70% 40% / 0.07), transparent)' }} />
      <div className="relative max-w-4xl mx-auto px-5 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-6">Pricing model</p>
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
          You do not pay us per call.<br />
          <span className="text-gradient">You keep control.</span>
        </h2>
        <p className="text-xl mb-10 max-w-xl mx-auto" style={{ color: 'hsl(224 14% 60%)' }}>
          Voxora is not a carrier. We do not mark up your call traffic.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Wifi,      title: 'You connect your own SIP or provider',   desc: 'Bring your existing carrier relationship. Any standard SIP-compatible service works.' },
            { icon: Building2, title: 'You pay your carrier directly',          desc: 'Your call traffic goes through your account at your negotiated rates. We never touch it.' },
            { icon: Cpu,       title: 'We provide the orchestration layer',     desc: 'Voxora handles the campaign logic, monitoring, compliance, and real-time event processing.' },
          ].map(item => {
            const Icon = item.icon
            return (
              <div key={item.title} className={`${T.bgCard} border ${T.border} rounded-2xl p-6 text-left`}>
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="font-bold text-sm text-white mb-1.5">{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'hsl(224 14% 52%)' }}>{item.desc}</p>
              </div>
            )
          })}
        </div>
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <p className="text-sm font-bold text-white">
            Lower cost at scale. No hidden per-minute fees.
          </p>
        </div>
      </div>
    </section>
  )
})

/* ─── Pricing ─────────────────────────────────────────────────────── */
const Pricing = memo(function Pricing() {
  const plans = [
    { name: 'Starter', price: 49,  desc: 'For early-stage outbound teams', concurrent: 10,  contacts: '50K',  extras: ['Basic campaigns', 'Live monitoring', 'DNC management'] },
    { name: 'Growth',  price: 149, desc: 'For active sales operations',    concurrent: 50,  contacts: '500K', extras: ['Voicemail drop', 'API + webhooks', 'Analytics'], popular: true },
    { name: 'Pro',     price: 399, desc: 'For high-volume daily dialing',  concurrent: 200, contacts: '5M',   extras: ['A/B testing', 'Advanced analytics', 'Custom windows'] },
    { name: 'Enterprise', price: 0, desc: 'Dedicated infra, SLA, and compliance', concurrent: 1000, contacts: '∞', extras: ['Dedicated infra', 'Custom SLA', 'Compliance controls'] },
  ]
  return (
    <section id="pricing" className={`py-28 ${T.bgCard}`}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Simple pricing.<br />Built for scale.
          </h2>
          <p className="text-lg" style={{ color: 'hsl(224 14% 55%)' }}>
            One flat monthly fee for the platform. Your call costs stay between you and your carrier.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map(plan => (
            <div key={plan.name}
              className={cn(
                'relative flex flex-col rounded-2xl border transition-all',
                plan.popular
                  ? `${T.bgCard} border-violet-500/50 shadow-glow-violet lg:scale-[1.03]`
                  : `${T.bg} border-[hsl(234_22%_14%)] hover:border-violet-500/20`,
              )}>
              {plan.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="px-4 py-1.5 gradient-brand rounded-full text-white text-[11px] font-bold shadow-glow-violet flex items-center gap-1.5">
                    <Star className="h-3 w-3 fill-white" />Most popular
                  </span>
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-white mb-1">{plan.name}</h3>
                <p className="text-[11px] mb-5 leading-relaxed" style={{ color: 'hsl(224 14% 50%)' }}>{plan.desc}</p>

                {plan.price > 0 ? (
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-sm" style={{ color: 'hsl(224 14% 48%)' }}>/mo</span>
                    </div>
                    <p className="text-[11px] mt-1" style={{ color: 'hsl(224 14% 40%)' }}>+ your carrier cost</p>
                  </div>
                ) : (
                  <div className="mb-5 text-2xl font-bold" style={{ color: 'hsl(224 14% 55%)' }}>Custom</div>
                )}

                {/* Limits */}
                <div className={`rounded-xl p-3 mb-5 ${T.bgEl} border ${T.border}`}>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><p className="font-bold text-white">{plan.concurrent === 1000 ? '1,000+' : plan.concurrent}</p><p style={{ color: 'hsl(224 14% 46%)' }}>concurrent calls</p></div>
                    <div><p className="font-bold text-white">{plan.contacts}</p><p style={{ color: 'hsl(224 14% 46%)' }}>contacts</p></div>
                  </div>
                </div>

                {/* Extras */}
                <div className="flex-1 space-y-1.5 mb-6">
                  {plan.extras.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                      <span style={{ color: 'hsl(224 14% 58%)' }}>{f}</span>
                    </div>
                  ))}
                </div>

                {plan.name === 'Enterprise' ? (
                  <a href="mailto:sales@voxora.io"
                    className={`flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold border ${T.border} text-white/60 hover:text-white hover:border-violet-500/25 transition-all`}>
                    Contact sales
                  </a>
                ) : (
                  <Link href="/signup"
                    className={cn(
                      'flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold transition-all',
                      plan.popular ? 'gradient-brand text-white shadow-glow-violet hover:opacity-90' : `border ${T.border} text-white/60 hover:text-white hover:border-violet-500/25`,
                    )}>
                    Start free <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

/* ─── Social proof ────────────────────────────────────────────────── */
const SocialProof = memo(function SocialProof() {
  const quotes = [
    { init: 'VP', role: 'VP Sales, B2B SaaS',       stars: 5, quote: 'We replaced manual calling entirely. The biggest win was not speed — it was visibility into every call outcome.' },
    { init: 'OL', role: 'Operations Lead, Fintech',  stars: 5, quote: 'We scaled from hundreds to thousands of daily calls without adding headcount.' },
    { init: 'HC', role: 'Head of Compliance',        stars: 5, quote: 'Compliance controls are built in, not bolted on. That distinction matters enormously at our scale.' },
  ]
  return (
    <section className={`py-24 ${T.bg}`}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="max-w-xl mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">From the field</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            What operators say
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {quotes.map(t => (
            <div key={t.role}
              className={`${T.bgCard} border ${T.border} rounded-2xl p-6 transition-all hover:border-violet-500/20 hover:-translate-y-0.5`}>
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.stars)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />)}
              </div>
              <blockquote className="text-sm leading-relaxed mb-6" style={{ color: 'hsl(224 14% 62%)' }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className={`flex items-center gap-3 pt-4 border-t ${T.border}`}>
                <div className="h-9 w-9 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {t.init}
                </div>
                <p className="text-sm font-medium text-white/80">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

/* ─── FAQ ─────────────────────────────────────────────────────────── */
const FAQ = memo(function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    { q: 'Do I need to change my phone provider?',   a: 'No. You bring your existing SIP or carrier. Voxora connects to your provider using standard credentials — no migration, no porting required.' },
    { q: 'Is Voxora a dialer or a PBX?',             a: 'Neither. Voxora is outbound call orchestration infrastructure. It sits on top of your phone service and handles campaign logic, routing, monitoring, and compliance — not the carrier layer.' },
    { q: 'Can I pause campaigns in real time?',      a: 'Yes. Everything is real-time controlled. Pause, resume, or stop any campaign instantly from the dashboard. Calls in progress finish gracefully.' },
    { q: 'Is it compliant out of the box?',          a: 'Voxora includes opt-out management, DNC list enforcement, calling window restrictions, and a full audit trail. These are built into the platform, not add-ons.' },
    { q: 'How does the 3-day trial work?',           a: 'You get full access to your chosen plan for 3 days, no credit card required. At the end you can add payment details to continue — or your account pauses with no charge.' },
    { q: 'What happens on voicemail?',               a: 'You decide. Voxora detects voicemail within 3 seconds and executes your configured action: play a specific message, drop a silent voicemail and hang up, or move on to the next contact.' },
  ]
  return (
    <section id="faq" className={`py-24 ${T.bgCard}`}>
      <div className="max-w-3xl mx-auto px-5">
        <div className="max-w-xl mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Questions answered</h2>
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={i}
              className={`${T.bgCard} rounded-2xl overflow-hidden transition-all border ${open === i ? 'border-violet-500/35' : T.border}`}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
                <span className="font-semibold text-sm text-white">{f.q}</span>
                <ChevronDown className={cn('h-4 w-4 text-violet-400 flex-shrink-0 transition-transform', open === i && 'rotate-180')} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'hsl(224 14% 58%)' }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

/* ─── Final CTA ───────────────────────────────────────────────────── */
const CTA = memo(function CTA() {
  return (
    <section className={`py-28 ${T.bg} relative overflow-hidden`}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 50%, hsl(263 70% 40% / 0.1), transparent)' }} />
      <div className="relative max-w-3xl mx-auto px-5 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-6">Get started</p>
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5 leading-tight">
          Start running outbound<br />like infrastructure, not guesswork.
        </h2>
        <p className="text-xl mb-10 max-w-xl mx-auto" style={{ color: 'hsl(224 14% 60%)' }}>
          Launch your first campaign in under 30 minutes.
          Real numbers. Real visibility. Real control.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/signup" className="btn-primary flex items-center gap-2 px-8 py-4 text-base rounded-xl hover:-translate-y-0.5 transition-all">
            Start free trial <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="mailto:sales@voxora.io"
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-base transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <HeadphonesIcon className="h-4 w-4" />
            Talk to the team
          </a>
        </div>
        <p className="text-xs" style={{ color: 'hsl(224 14% 40%)' }}>
          No credit card · Cancel anytime · Live in minutes
        </p>
      </div>
    </section>
  )
})

/* ─── Footer ──────────────────────────────────────────────────────── */
const Footer = memo(function Footer() {
  return (
    <footer className={`${T.bg} border-t ${T.border}`}>
      <div className="max-w-7xl mx-auto px-5 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center shadow-glow-violet">
                <Waves className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Voxora</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs mb-5" style={{ color: 'hsl(224 14% 48%)' }}>
              Outbound calling infrastructure. Real-time visibility. Full operator control.
            </p>
            <div className="flex flex-wrap gap-2">
              {['SOC 2', 'GDPR', 'HIPAA Ready', 'TCPA'].map(b => (
                <span key={b} className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold ${T.bgEl} border ${T.border}`}
                  style={{ color: 'hsl(224 14% 48%)' }}>{b}</span>
              ))}
            </div>
          </div>
          {[
            { title: 'Platform',   links: ['Broadcast Calling', 'Voicemail Drop', 'Live Monitor', 'Analytics', 'Compliance'] },
            { title: 'Solutions',  links: ['Sales Teams', 'Operations', 'Re-engagement', 'Healthcare', 'Finance'] },
            { title: 'Developers', links: ['API Reference', 'Webhooks', 'Status Page'] },
            { title: 'Company',    links: ['About', 'Blog', 'Careers', 'Contact'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'hsl(224 14% 40%)' }}>{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}><a href="#" className={`text-sm ${T.muted} hover:text-white transition-colors`}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t ${T.border}`}>
          <p className="text-xs" style={{ color: 'hsl(224 14% 38%)' }}>© 2026 Voxora Inc. All rights reserved.</p>
          <div className="flex gap-5 text-xs" style={{ color: 'hsl(224 14% 38%)' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'DPA'].map(l => (
              <a key={l} href="#" className="hover:text-white/60 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
})

/* ─── Main export ─────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className={`min-h-screen ${T.bg} text-white`}>
      <Nav />
      <Hero />
      <HowItWorks />
      <CoreValue />
      <UseCases />
      <Features />
      <WhyVoxora />
      <Pricing />
      <SocialProof />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
