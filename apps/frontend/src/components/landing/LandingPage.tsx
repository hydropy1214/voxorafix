'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import {
  Waves, ArrowRight, CheckCircle2, ChevronDown, Star, Play,
  Phone, TrendingUp, Clock, Users, Shield, Zap, BarChart3,
  Target, MessageSquare, RefreshCw, Lock, HeadphonesIcon,
  Building2, ShoppingCart, Heart, X, Menu, Check, ChevronRight,
  Activity, Calendar, Radio, Voicemail, Globe, Key,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ── Nav ────────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const links = [
    { label: 'How it works', href: '#how' },
    { label: 'Use cases', href: '#use-cases' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ]
  return (
    <header className={cn(
      'fixed inset-x-0 top-0 z-50 transition-all duration-300',
      scrolled ? 'bg-[hsl(234_30%_5%/0.97)] backdrop-blur-2xl border-b border-[hsl(234_22%_13%)] shadow-lg' : 'bg-transparent',
    )}>
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center shadow-glow-violet group-hover:shadow-lg transition-all">
            <Waves className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-[17px] tracking-tight text-white">Voxora</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-7">
          {links.map(l => (
            <a key={l.label} href={l.href}
              className="text-sm text-white/60 hover:text-white transition-colors font-medium">{l.label}</a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5 font-medium">
            Sign in
          </Link>
          <Link href="/signup"
            className="flex items-center gap-1.5 px-5 py-2 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-glow-violet">
            Get started free
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <button className="lg:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden bg-[hsl(234_30%_6%)] border-t border-[hsl(234_22%_13%)] px-5 py-4 space-y-1">
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="block py-2.5 text-sm text-white/60 hover:text-white transition-colors font-medium">{l.label}</a>
          ))}
          <div className="flex gap-3 pt-3 border-t border-[hsl(234_22%_13%)] mt-3">
            <Link href="/login" className="flex-1 text-center py-2.5 text-sm border border-white/10 rounded-xl text-white/70 hover:text-white hover:border-white/20 transition-all">Sign in</Link>
            <Link href="/signup" className="flex-1 text-center py-2.5 text-sm gradient-brand text-white rounded-xl font-semibold">Get started</Link>
          </div>
        </div>
      )}
    </header>
  )
}

/* ── Hero ───────────────────────────────────────────────────────── */
function Hero() {
  const [calls, setCalls] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCalls(c => (c < 2847 ? c + 23 : 2847)), 14)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'hsl(234 30% 5%)' }} />
      <div className="absolute inset-0 bg-dots opacity-[0.35]" />
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, hsl(263 70% 40% / 0.12) 0%, transparent 70%)' }} />
      <div className="absolute top-1/2 left-[15%] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'hsl(191 97% 42% / 0.05)' }} />

      <div className="relative max-w-7xl mx-auto px-5 py-24 grid lg:grid-cols-[1fr_1.1fr] gap-14 items-center">
        {/* Left copy */}
        <div className="space-y-8">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium"
            style={{ background: 'hsl(263 70% 58% / 0.1)', borderColor: 'hsl(263 70% 58% / 0.25)', color: 'hsl(263 70% 80%)' }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: 'hsl(263 70% 65%)' }} />
            Trusted by 500+ outreach teams
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-5xl xl:text-[62px] font-bold tracking-tight leading-[1.06] text-white">
              Your calls.<br />
              Your contacts.<br />
              <span className="text-gradient">Automated.</span>
            </h1>
            <p className="text-xl text-white/55 leading-relaxed mt-5 max-w-lg">
              A professional call automation platform. Connect your phone numbers,
              upload your message, and reach thousands of people — automatically,
              compliantly, and with full visibility into every outcome.
            </p>
          </div>

          {/* Value bullets */}
          <div className="space-y-2.5">
            {[
              'Set up and launch a campaign in under 10 minutes',
              'Know if a human or voicemail answered — every call',
              'Watch every call happen live on your dashboard',
              'Works with your existing phone numbers',
            ].map(v => (
              <div key={v} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-white/65">{v}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link href="/signup"
              className="flex items-center gap-2 px-7 py-3.5 gradient-brand rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-glow-violet hover:-translate-y-0.5 active:translate-y-0">
              Start free — no card needed
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-medium text-white/75 hover:text-white transition-all"
              style={{ background: 'hsl(234 22% 12%)', border: '1px solid hsl(234 22% 18%)' }}>
              <Play className="h-4 w-4 text-violet-400" />
              See how it works
            </a>
          </div>

          {/* Trust */}
          <div className="flex flex-wrap items-center gap-5">
            {['14-day free trial', 'No credit card', 'Cancel anytime'].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-white/40">
                <Check className="h-3 w-3 text-emerald-500" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Right — product mockup */}
        <div className="hidden lg:block relative">
          {/* Main card */}
          <div className="rounded-2xl overflow-hidden shadow-modal"
            style={{ background: 'hsl(234 28% 7.5%)', border: '1px solid hsl(234 22% 13%)' }}>
            {/* Window chrome */}
            <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid hsl(234 22% 13%)' }}>
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ background: 'hsl(0 60% 50% / 0.7)' }} />
                <div className="h-3 w-3 rounded-full" style={{ background: 'hsl(45 80% 50% / 0.7)' }} />
                <div className="h-3 w-3 rounded-full" style={{ background: 'hsl(140 60% 40% / 0.7)' }} />
              </div>
              <div className="flex-1 h-6 rounded-md flex items-center px-3"
                style={{ background: 'hsl(234 22% 12%)' }}>
                <span className="text-[10px] text-white/35">app.voxora.io/dashboard</span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Dashboard</p>
                  <p className="text-[11px]" style={{ color: 'hsl(224 14% 52%)' }}>Good morning, Alex</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                  style={{ background: 'hsl(160 84% 39% / 0.12)', border: '1px solid hsl(160 84% 39% / 0.25)', color: 'hsl(160 84% 60%)' }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  {calls.toLocaleString()} active calls
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: '4,812', l: 'Calls today', c: 'hsl(263 70% 65%)' },
                  { v: '43%',   l: 'Answer rate', c: 'hsl(160 84% 55%)' },
                  { v: '71%',   l: 'Human rate',  c: 'hsl(191 97% 55%)' },
                ].map(s => (
                  <div key={s.l} className="p-3 rounded-xl text-center"
                    style={{ background: 'hsl(234 22% 10%)', border: '1px solid hsl(234 22% 15%)' }}>
                    <p className="text-base font-bold tabular-nums" style={{ color: s.c }}>{s.v}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'hsl(224 14% 50%)' }}>{s.l}</p>
                  </div>
                ))}
              </div>

              {/* Campaign rows */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'hsl(224 14% 45%)' }}>ACTIVE CAMPAIGNS</p>
                {[
                  { name: 'Q2 Sales Outreach', pct: 68, live: 18, human: '44%', color: '#7c3aed' },
                  { name: 'Appointment Reminders', pct: 91, live: 3, human: '82%', color: '#06b6d4' },
                  { name: 'Customer Win-back', pct: 35, live: 12, human: '39%', color: '#10b981' },
                ].map(c => (
                  <div key={c.name} className="p-3 rounded-xl" style={{ background: 'hsl(234 22% 10%)', border: '1px solid hsl(234 22% 14%)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white">{c.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold">{c.live} live</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full mb-2" style={{ background: 'hsl(234 22% 15%)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${c.pct}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}bb)` }} />
                    </div>
                    <div className="flex items-center gap-3 text-[10px]" style={{ color: 'hsl(224 14% 48%)' }}>
                      <span>{c.pct}% complete</span>
                      <span style={{ color: 'hsl(160 84% 55%)' }}>{c.human} human</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating event notifications */}
          <div className="absolute -left-14 top-20 animate-slide-in-right rounded-xl p-3 shadow-dropdown"
            style={{ background: 'hsl(234 28% 9%)', border: '1px solid hsl(234 22% 16%)', animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(160 84% 39% / 0.15)' }}>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white">Human answered</p>
                <p className="text-[10px]" style={{ color: 'hsl(224 14% 50%)' }}>AMD detected · 0.4s</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-10 bottom-20 animate-slide-in-right rounded-xl p-3 shadow-dropdown"
            style={{ background: 'hsl(234 28% 9%)', border: '1px solid hsl(234 22% 16%)', animationDelay: '0.9s' }}>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(263 70% 40% / 0.15)' }}>
                <TrendingUp className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white">Answer rate +8%</p>
                <p className="text-[10px]" style={{ color: 'hsl(224 14% 50%)' }}>vs last campaign</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <a href="#how"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/25 hover:text-white/50 transition-colors">
        <span className="text-[10px] font-semibold tracking-widest uppercase">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  )
}

/* ── Stats bar ──────────────────────────────────────────────────── */
function StatsBar() {
  return (
    <div style={{ borderTop: '1px solid hsl(234 22% 13%)', borderBottom: '1px solid hsl(234 22% 13%)', background: 'hsl(234 28% 6.5%)' }}
      className="py-4">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {[
            { v: '500+',    l: 'businesses' },
            { v: '3B+',     l: 'calls delivered' },
            { v: '99.9%',   l: 'platform uptime' },
            { v: '<3 sec',  l: 'human detection' },
            { v: '180+',    l: 'countries' },
            { v: '4.9 ★',  l: 'customer rating' },
          ].map(s => (
            <div key={s.l} className="flex items-center gap-2 text-sm">
              <span className="font-bold text-white">{s.v}</span>
              <span style={{ color: 'hsl(224 14% 50%)' }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── How it works ───────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      n: '01',
      icon: Globe,
      title: 'Connect your phone numbers',
      desc: 'Plug in your existing phone account credentials in under 2 minutes. Voxora verifies the connection and you are ready to make calls.',
      detail: 'Works with any standard SIP-compatible phone service.',
    },
    {
      n: '02',
      icon: Users,
      title: 'Upload your contacts',
      desc: 'Import a CSV file with the numbers you want to reach. Voxora automatically validates, deduplicates, and formats every number.',
      detail: 'Supports E.164 international format. Duplicate detection included.',
    },
    {
      n: '03',
      icon: Radio,
      title: 'Build your campaign',
      desc: 'Choose your message, set calling hours, configure what happens when voicemail answers, and define retry rules — all in a guided setup.',
      detail: 'Full control over AMD actions, concurrency, and compliance settings.',
    },
    {
      n: '04',
      icon: Activity,
      title: 'Launch and track live',
      desc: 'Start with one click. Every call appears on your live dashboard in real time — who answered, what they heard, and what happened next.',
      detail: 'Real-time stats, live event feed, and downloadable reports.',
    },
  ]

  return (
    <section id="how" className="py-28" style={{ background: 'hsl(234 30% 5%)' }}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ background: 'hsl(160 84% 39% / 0.1)', border: '1px solid hsl(160 84% 39% / 0.25)', color: 'hsl(160 84% 65%)' }}>
            Up and running in 30 minutes
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Four steps from sign-up<br />
            to <span className="text-gradient">your first campaign</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'hsl(224 14% 55%)' }}>
            No technical setup. No engineers required. Just follow the guided flow and you will be reaching your audience in minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.n}
                className="rounded-2xl p-6 group hover:-translate-y-1 transition-all duration-200"
                style={{ background: 'hsl(234 28% 7.5%)', border: '1px solid hsl(234 22% 13%)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'hsl(263 70% 58% / 0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'hsl(234 22% 13%)')}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-xl gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {step.n}
                  </div>
                  <Icon className="h-5 w-5 text-violet-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-[15px] text-white mb-2">{step.title}</h3>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: 'hsl(224 14% 55%)' }}>{step.desc}</p>
                <p className="text-[11px] font-medium" style={{ color: 'hsl(263 70% 68%)' }}>{step.detail}</p>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 gradient-brand rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-glow-violet">
            Start free trial
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs mt-3" style={{ color: 'hsl(224 14% 45%)' }}>
            14-day trial · No credit card · Setup takes under 30 minutes
          </p>
        </div>
      </div>
    </section>
  )
}

/* ── Use cases ──────────────────────────────────────────────────── */
function UseCases() {
  const [active, setActive] = useState(0)
  const cases = [
    {
      icon: ShoppingCart,
      label: 'Sales teams',
      headline: 'Turn your contact list into conversations',
      body: 'Automatically reach hundreds of prospects per hour. When a live person answers, your recorded message plays instantly. When voicemail picks up, a separate pre-recorded drop is left — and the call moves on. Your team spends time on callbacks, not cold dialling.',
      bullets: ['10x more outbound reach per hour', 'Instant callback identification', 'Answer rate analytics by time of day', 'Scales from 10 to 10,000 contacts'],
      result: '10x reach',
    },
    {
      icon: Calendar,
      label: 'Appointment reminders',
      headline: 'Cut no-shows. Protect your revenue.',
      body: 'Send automated voice reminders 24, 48, or 72 hours before any appointment. Clients confirm or cancel by pressing a key — which updates your records in real time through a webhook. Fewer missed appointments means predictable income.',
      bullets: ['Configurable reminder timing (1h to 7 days)', 'Keypress confirm or cancel flow', 'Automatic follow-up on no-response', 'Works for any appointment type'],
      result: '70% fewer no-shows',
    },
    {
      icon: RefreshCw,
      label: 'Customer re-engagement',
      headline: 'Win back customers who went quiet',
      body: 'Target lapsed customers with a personal-sounding voice message. Test two different messages against the same list. See which one drives more callbacks. Connect with customers who respond while the conversation is fresh.',
      bullets: ['Contact segmentation by last activity', 'A/B message testing built in', 'Callback tracking per message variant', 'Integrates with your CRM via webhooks'],
      result: '3x re-engagement',
    },
    {
      icon: Heart,
      label: 'Healthcare reminders',
      headline: 'Reach patients reliably and compliantly',
      body: 'Send appointment, medication, and follow-up reminders to patients at scale. Calling hours are enforced automatically based on the patient timezone. Full audit logs for every call, opt-out tracking, and encrypted storage keep you protected.',
      bullets: ['Timezone-aware calling enforcement', 'Consent-first flows with opt-out key', 'Full call log and audit trail', 'Restricted calling hours by region'],
      result: '94% contact rate',
    },
    {
      icon: Building2,
      label: 'Collections & finance',
      headline: 'Reach more accounts. Recover more revenue.',
      body: 'Intelligent retry logic means every reachable account gets reached. Busy lines retry in 30 minutes. No-answer numbers try again in 4 hours. Every opt-out is captured instantly. Calling hours are enforced automatically based on the account location.',
      bullets: ['Smart retry: busy, no-answer, and failed calls', 'Full DNC and opt-out management', 'Calling hour enforcement by region', 'Per-call outcome reporting'],
      result: '3x recovery rate',
    },
  ]

  const c = cases[active]
  const Icon = c.icon

  return (
    <section id="use-cases" className="py-28" style={{ background: 'hsl(234 28% 6.5%)' }}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            One platform.<br />
            <span className="text-gradient-cyan">Every calling use case.</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'hsl(224 14% 55%)' }}>
            Sales, reminders, re-engagement, healthcare, collections — Voxora handles every outbound calling scenario with the same reliable engine.
          </p>
        </div>

        {/* Tab row */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {cases.map((cs, i) => {
            const TabIcon = cs.icon
            return (
              <button key={cs.label} onClick={() => setActive(i)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                  active === i
                    ? 'text-violet-300'
                    : 'text-white/50 hover:text-white/75',
                )}
                style={active === i
                  ? { background: 'hsl(263 70% 40% / 0.15)', border: '1px solid hsl(263 70% 58% / 0.3)' }
                  : { background: 'hsl(234 22% 10%)', border: '1px solid hsl(234 22% 15%)' }}>
                <TabIcon className="h-4 w-4" />
                {cs.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-10 items-center" key={active}>
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-3xl font-bold text-white tracking-tight">{c.headline}</h3>
            <p className="leading-relaxed" style={{ color: 'hsl(224 14% 60%)' }}>{c.body}</p>
            <div className="space-y-3">
              {c.bullets.map(b => (
                <div key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm" style={{ color: 'hsl(224 14% 60%)' }}>{b}</span>
                </div>
              ))}
            </div>
            <Link href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 gradient-brand rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="animate-fade-in">
            <div className="rounded-2xl p-10 text-center"
              style={{ background: 'hsl(263 70% 40% / 0.08)', border: '1px solid hsl(263 70% 58% / 0.2)' }}>
              <div className="h-16 w-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6 shadow-glow-violet">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-6xl font-bold text-gradient mb-3">{c.result}</div>
              <p className="text-sm font-medium" style={{ color: 'hsl(263 70% 70%)' }}>
                typical result for {c.label}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Features ───────────────────────────────────────────────────── */
function Features() {
  const list = [
    { icon: Target,        title: 'Broadcast dialling',     desc: 'Reach thousands of contacts simultaneously with a single campaign. Full concurrency control.' },
    { icon: Voicemail,     title: 'Voicemail drop',         desc: 'Detect voicemail in seconds. Leave a pre-recorded message and move on automatically.' },
    { icon: Shield,        title: 'Human detection',        desc: 'Know if a live person answered within 3 seconds. Play the right message every time.' },
    { icon: Activity,      title: 'Live monitor',           desc: 'Watch every call in real time. AMD result, duration, and audio quality — all live.' },
    { icon: RefreshCw,     title: 'Smart retry logic',      desc: 'Busy = retry in 30 min. No answer = retry in 4 hours. Fully configurable per campaign.' },
    { icon: Clock,         title: 'Calling hour control',   desc: 'Set allowed calling windows. Contacts in other timezones are handled automatically.' },
    { icon: Lock,          title: 'DNC management',         desc: 'Opt-out tracking, DNC lists, and automatic scrubbing across every campaign.' },
    { icon: BarChart3,     title: 'Deep analytics',         desc: 'Answer rates, human rates, best time to call, audio quality scores, and cost per contact.' },
    { icon: MessageSquare, title: 'A/B message testing',    desc: 'Run two messages against the same list. See which one performs better.' },
    { icon: Key,           title: 'REST API & webhooks',    desc: 'Every call event fires a webhook. Full API access for custom integrations.' },
    { icon: Users,         title: 'Team access',            desc: 'Role-based permissions for agents, managers, and admins. Full audit logs.' },
    { icon: Globe,         title: 'Any phone number',       desc: 'Bring your existing phone service. No switching. No carrier lock-in.' },
  ]

  return (
    <section className="py-28" style={{ background: 'hsl(234 30% 5%)' }}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Built for businesses that<br />
            <span className="text-gradient">take calling seriously</span>
          </h2>
          <p className="text-lg max-w-lg mx-auto" style={{ color: 'hsl(224 14% 55%)' }}>
            Every feature was designed around the reality of running outbound calls at scale.
            Nothing missing. Nothing wasted.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title}
                className="group p-5 rounded-2xl transition-all duration-200 cursor-default"
                style={{ background: 'hsl(234 28% 7.5%)', border: '1px solid hsl(234 22% 13%)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'hsl(263 70% 58% / 0.28)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'hsl(234 22% 13%)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}>
                <div className="h-10 w-10 rounded-xl mb-4 flex items-center justify-center"
                  style={{ background: 'hsl(263 70% 40% / 0.12)', border: '1px solid hsl(263 70% 58% / 0.2)' }}>
                  <Icon className="h-4.5 w-4.5 text-violet-400" style={{ height: '18px', width: '18px' }} />
                </div>
                <h3 className="font-bold text-[14px] text-white mb-1.5">{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'hsl(224 14% 52%)' }}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ── Pricing ────────────────────────────────────────────────────── */
function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: 49,
      desc: 'For small teams making their first automated calls',
      concurrent: '10',
      contacts: '50K',
      campaigns: '5',
      features: ['10 simultaneous calls', '5 active campaigns', '50,000 contacts', 'Human detection (AMD)', 'Live call monitor', 'DNC management', 'CSV import', 'Email support'],
      popular: false,
    },
    {
      name: 'Growth',
      price: 149,
      desc: 'For growing teams that need scale and automation',
      concurrent: '50',
      contacts: '500K',
      campaigns: '∞',
      features: ['50 simultaneous calls', 'Unlimited campaigns', '500,000 contacts', 'Voicemail drop', 'Timezone-aware calling', 'Smart retry logic', 'Webhooks & REST API', 'Analytics export', 'Call recordings (30 days)', 'Priority support (12h)'],
      popular: true,
    },
    {
      name: 'Pro',
      price: 399,
      desc: 'For high-volume operations that run campaigns daily',
      concurrent: '200',
      contacts: '5M',
      campaigns: '∞',
      features: ['200 simultaneous calls', '5 million contacts', 'Unlimited everything', 'A/B message testing', 'Advanced analytics', 'Full recording archive', 'Custom calling windows', 'Dedicated processing', 'Slack support (4h)'],
      popular: false,
    },
    {
      name: 'Enterprise',
      price: 0,
      desc: 'Dedicated infrastructure and custom SLA',
      concurrent: '1,000+',
      contacts: 'Unlimited',
      campaigns: '∞',
      features: ['1,000+ simultaneous calls', 'Dedicated infrastructure', 'Custom SLA (99.99%)', 'White-label option', 'On-premise available', 'Compliance audit', 'Dedicated account manager', '24/7 support'],
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-28 relative overflow-hidden" style={{ background: 'hsl(234 28% 6.5%)' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, hsl(263 70% 40% / 0.08), transparent)' }} />

      <div className="relative max-w-7xl mx-auto px-5">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ background: 'hsl(263 70% 40% / 0.1)', border: '1px solid hsl(263 70% 58% / 0.25)', color: 'hsl(263 70% 75%)' }}>
            Simple, transparent pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            One monthly fee.<br />
            <span className="text-gradient">You keep the savings.</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'hsl(224 14% 55%)' }}>
            Voxora charges a flat platform fee. You connect your own phone numbers directly — keeping full control of your calling costs without any per-minute markup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map(plan => (
            <div key={plan.name}
              className="relative flex flex-col rounded-2xl transition-all"
              style={{
                background: plan.popular ? 'hsl(263 70% 20% / 0.25)' : 'hsl(234 28% 7.5%)',
                border: plan.popular ? '1px solid hsl(263 70% 58% / 0.5)' : '1px solid hsl(234 22% 13%)',
                boxShadow: plan.popular ? '0 0 40px hsl(263 70% 40% / 0.18)' : 'none',
                transform: plan.popular ? 'scale(1.03)' : 'scale(1)',
              }}>
              {plan.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="flex items-center gap-1.5 px-4 py-1.5 gradient-brand rounded-full text-white text-[11px] font-bold shadow-glow-violet">
                    <Star className="h-3 w-3 fill-white" />
                    Most popular
                  </span>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-base text-white mb-1">{plan.name}</h3>
                <p className="text-[11px] mb-5 leading-relaxed" style={{ color: 'hsl(224 14% 50%)' }}>{plan.desc}</p>

                {plan.price > 0 ? (
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-sm" style={{ color: 'hsl(224 14% 50%)' }}>/mo</span>
                    </div>
                    <p className="text-[11px] mt-1" style={{ color: 'hsl(224 14% 45%)' }}>+ your phone number costs</p>
                  </div>
                ) : (
                  <div className="mb-5">
                    <div className="text-2xl font-bold" style={{ color: 'hsl(224 14% 60%)' }}>Custom</div>
                    <p className="text-[11px] mt-1" style={{ color: 'hsl(224 14% 45%)' }}>Contact us for pricing</p>
                  </div>
                )}

                {/* Limits */}
                <div className="grid grid-cols-3 gap-1.5 mb-5">
                  {[
                    { v: plan.concurrent, l: 'calls' },
                    { v: plan.contacts,   l: 'contacts' },
                    { v: plan.campaigns,  l: 'campaigns' },
                  ].map(m => (
                    <div key={m.l} className="rounded-xl p-2 text-center"
                      style={{ background: 'hsl(234 22% 11%)', border: '1px solid hsl(234 22% 16%)' }}>
                      <p className="text-xs font-bold text-white">{m.v}</p>
                      <p className="text-[9px] mt-0.5" style={{ color: 'hsl(224 14% 48%)' }}>{m.l}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="flex-1 space-y-1.5 mb-6">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span style={{ color: 'hsl(224 14% 58%)' }}>{f}</span>
                    </div>
                  ))}
                </div>

                {plan.name === 'Enterprise' ? (
                  <a href="mailto:sales@voxora.io"
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ border: '1px solid hsl(234 22% 20%)', color: 'hsl(224 14% 70%)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'hsl(263 70% 58% / 0.3)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'hsl(234 22% 20%)')}>
                    Contact sales
                  </a>
                ) : (
                  <Link href="/signup"
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={plan.popular
                      ? { background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: 'white' }
                      : { border: '1px solid hsl(234 22% 20%)', color: 'hsl(224 14% 70%)' }}
                    onMouseEnter={e => !plan.popular && (e.currentTarget.style.borderColor = 'hsl(263 70% 58% / 0.3)')}
                    onMouseLeave={e => !plan.popular && (e.currentTarget.style.borderColor = 'hsl(234 22% 20%)')}>
                    Start free trial
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Savings note */}
        <div className="mt-10 rounded-2xl p-6 md:p-7 flex flex-col md:flex-row items-center gap-5 justify-between"
          style={{ background: 'hsl(160 84% 25% / 0.1)', border: '1px solid hsl(160 84% 39% / 0.2)' }}>
          <div>
            <p className="font-bold text-base text-white mb-1 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Businesses that own their calling costs pay significantly less per call
            </p>
            <p className="text-sm" style={{ color: 'hsl(224 14% 55%)' }}>
              By connecting your own phone numbers, you pay your carrier directly at wholesale rates — without any per-minute platform markup from Voxora.
            </p>
          </div>
          <Link href="/signup"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 20px hsl(160 84% 39% / 0.3)' }}>
            Start saving now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── Testimonials ───────────────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    {
      init: 'MR', name: 'Marcus R.', role: 'VP Sales',
      quote: 'We went from 200 manual calls a day to over 4,000 automated contacts. The human detection alone changed how our team operates — they only ever handle real conversations.',
      result: '20x outbound volume',
    },
    {
      init: 'SK', name: 'Sarah K.', role: 'Head of Operations',
      quote: 'The compliance features are what sold us. Opt-out tracking, calling hour enforcement, and the audit log — it is all automatic. Our legal team was satisfied from the first demo.',
      result: 'Zero compliance incidents',
    },
    {
      init: 'DO', name: 'David O.', role: 'CTO',
      quote: 'We send 50,000 appointment reminders per week. No-shows dropped by 68% and our staff spend zero time making reminder calls. The ROI was obvious within the first two weeks.',
      result: '68% fewer no-shows',
    },
  ]

  return (
    <section className="py-24" style={{ background: 'hsl(234 28% 6.5%)' }}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
            Results that matter
          </h2>
          <p style={{ color: 'hsl(224 14% 55%)' }}>Real outcomes from real customers</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {quotes.map(t => (
            <div key={t.name}
              className="rounded-2xl p-6 transition-all"
              style={{ background: 'hsl(234 28% 7.5%)', border: '1px solid hsl(234 22% 13%)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'hsl(263 70% 58% / 0.22)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'hsl(234 22% 13%)')}>
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />)}
              </div>
              <blockquote className="text-sm leading-relaxed mb-6" style={{ color: 'hsl(224 14% 60%)' }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid hsl(234 22% 13%)' }}>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
                    {t.init}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-[11px]" style={{ color: 'hsl(224 14% 50%)' }}>{t.role}</p>
                  </div>
                </div>
                <div className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'hsl(160 84% 39% / 0.12)', border: '1px solid hsl(160 84% 39% / 0.25)', color: 'hsl(160 84% 60%)' }}>
                  {t.result}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── FAQ ────────────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    {
      q: 'What phone numbers do I need?',
      a: 'You need a phone service that supports SIP — a standard protocol used by virtually every business phone provider. Most businesses already have one. If not, signing up with a wholesale SIP provider takes under 10 minutes. You bring your own numbers and pay your provider directly.',
    },
    {
      q: 'How does the free trial work?',
      a: 'Every plan includes a 14-day free trial. No credit card is required to start. You get full access to your chosen plan tier. At the end of the trial you can add payment details to continue — or your account simply pauses with no charge.',
    },
    {
      q: 'What happens when voicemail answers?',
      a: 'Voxora detects voicemail answering within 2–3 seconds using audio pattern analysis. You decide what happens: play a different pre-recorded message, drop a voicemail and hang up immediately, or hang up silently. This is configured per campaign.',
    },
    {
      q: 'Is this legal in my country?',
      a: 'Voxora provides the compliance tools: timezone-aware calling windows, DNC list management, opt-out tracking, and full audit logs. The legal requirements for automated calling vary by country and industry. We recommend verifying the rules that apply to your situation with a legal professional.',
    },
    {
      q: 'Can I connect Voxora to my CRM?',
      a: 'Yes. Every call event — answered, human detected, voicemail, keypress, hang up — triggers a webhook to any URL you configure. You can push data into any CRM or system in real time. A full REST API is also available for custom integrations.',
    },
    {
      q: 'What happens if a contact wants to opt out?',
      a: 'During any call, contacts can press 9 to request removal. Voxora detects the keypress, adds the number to your DNC list immediately, and that number is never called again — regardless of which campaign or contact list it appears in.',
    },
  ]

  return (
    <section id="faq" className="py-24" style={{ background: 'hsl(234 30% 5%)' }}>
      <div className="max-w-3xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">Questions answered</h2>
          <p style={{ color: 'hsl(224 14% 55%)' }}>Everything you need to know before getting started</p>
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={i}
              className="rounded-2xl overflow-hidden transition-all"
              style={{ background: 'hsl(234 28% 7.5%)', border: open === i ? '1px solid hsl(263 70% 58% / 0.35)' : '1px solid hsl(234 22% 13%)' }}>
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
        <div className="text-center mt-10">
          <p className="text-sm" style={{ color: 'hsl(224 14% 50%)' }}>
            Still have a question?{' '}
            <a href="mailto:hello@voxora.io" className="text-violet-400 hover:text-violet-300 transition-colors">
              Email us at hello@voxora.io
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

/* ── CTA ────────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(263 60% 12%) 0%, hsl(234 40% 8%) 50%, hsl(263 60% 12%) 100%)' }}>
      <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, hsl(263 70% 40% / 0.15), transparent)' }} />

      <div className="relative max-w-4xl mx-auto px-5 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
          style={{ background: 'hsl(263 70% 40% / 0.18)', border: '1px solid hsl(263 70% 58% / 0.3)', color: 'hsl(263 70% 78%)' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
          </span>
          Platform live — start your first campaign in 30 minutes
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-5 leading-[1.08]">
          Ready to automate<br />your outreach?
        </h2>
        <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed"
          style={{ color: 'hsl(263 30% 70%)' }}>
          Join hundreds of sales, marketing, and operations teams that use Voxora to reach their contacts at scale — automatically and compliantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link href="/signup"
            className="flex items-center gap-2 px-8 py-4 gradient-brand rounded-xl text-white font-bold text-base hover:opacity-90 transition-all shadow-glow-violet hover:-translate-y-0.5">
            Start free trial
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="mailto:sales@voxora.io"
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-base transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <HeadphonesIcon className="h-4 w-4" />
            Talk to the team
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs" style={{ color: 'hsl(263 20% 60%)' }}>
          {['14-day free trial', 'No credit card', 'Setup in 30 minutes', 'Cancel any time'].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Footer ─────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid hsl(234 22% 11%)', background: 'hsl(234 30% 5%)' }}>
      <div className="max-w-7xl mx-auto px-5 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center shadow-glow-violet">
                <Waves className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Voxora</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs mb-5" style={{ color: 'hsl(224 14% 50%)' }}>
              A professional call automation platform for businesses that need to reach people at scale — reliably, compliantly, and with full visibility.
            </p>
            <div className="flex flex-wrap gap-2">
              {['SOC 2', 'GDPR', 'HIPAA Ready', 'TCPA'].map(b => (
                <span key={b} className="text-[10px] px-2.5 py-1 rounded-lg font-semibold"
                  style={{ background: 'hsl(234 22% 12%)', border: '1px solid hsl(234 22% 17%)', color: 'hsl(224 14% 50%)' }}>
                  {b}
                </span>
              ))}
            </div>
          </div>

          {[
            { title: 'Platform', links: ['Broadcast Calling', 'Power Dialler', 'Voicemail Drop', 'Live Monitor', 'Analytics', 'Compliance'] },
            { title: 'Solutions', links: ['Sales Outreach', 'Appointment Reminders', 'Re-engagement', 'Healthcare', 'Collections'] },
            { title: 'Developers', links: ['API Reference', 'Webhooks', 'Status Page', 'Changelog'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'hsl(224 14% 45%)' }}>
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm transition-colors"
                      style={{ color: 'hsl(224 14% 50%)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'hsl(224 14% 50%)')}>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid hsl(234 22% 11%)' }}>
          <p className="text-xs" style={{ color: 'hsl(224 14% 40%)' }}>© 2026 Voxora Inc. All rights reserved.</p>
          <div className="flex gap-5 text-xs" style={{ color: 'hsl(224 14% 40%)' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Data Processing Agreement'].map(l => (
              <a key={l} href="#"
                onMouseEnter={e => (e.currentTarget.style.color = 'hsl(224 14% 65%)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'hsl(224 14% 40%)')}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── Export ─────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'hsl(234 30% 5%)', color: 'hsl(220 20% 94%)' }}>
      <Nav />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <UseCases />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
