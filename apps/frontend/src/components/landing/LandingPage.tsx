'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Waves, ArrowRight, CheckCircle2, ChevronDown, Star, Play,
  Phone, TrendingUp, Clock, Users, Shield, Zap, BarChart3,
  Target, Globe, MessageSquare, RefreshCw, Lock, HeadphonesIcon,
  Building2, ShoppingCart, Briefcase, Heart, X, Menu, Check,
  ChevronRight, Activity, PieChart, Calendar, Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Navigation ───────────────────────────────────────────────────────────────
function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { label: 'Solutions', href: '#solutions' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Resources', href: '#faq' },
  ]

  return (
    <header className={cn(
      'fixed top-0 inset-x-0 z-50 transition-all duration-300',
      scrolled ? 'bg-background/96 backdrop-blur-2xl border-b border-border shadow-sm' : 'bg-transparent',
    )}>
      <div className="max-w-7xl mx-auto px-5 h-[64px] flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center shadow-glow-brand group-hover:shadow-lg transition-all">
            <Waves className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-[17px] tracking-tight">Voxora</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map(l => (
            <a key={l.label} href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
            Sign in
          </Link>
          <Link href="/signup"
            className="flex items-center gap-1.5 px-4 py-2 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-glow-brand">
            Start free
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button className="lg:hidden p-2 rounded-xl hover:bg-accent" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-card border-t border-border px-5 py-4 space-y-1">
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="block py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
          <div className="flex gap-3 pt-3 border-t border-border mt-3">
            <Link href="/login" className="flex-1 py-2 text-center text-sm border border-border rounded-xl">Sign in</Link>
            <Link href="/signup" className="flex-1 py-2 text-center text-sm gradient-brand text-white rounded-xl font-semibold">Start free</Link>
          </div>
        </div>
      )}
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setCount(c => (c < 1247 ? c + 13 : 1247)), 16)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center pt-[64px] overflow-hidden">
      {/* Layered background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-grid opacity-[0.25]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />

      {/* Floating orbs */}
      <div className="absolute top-1/3 left-[10%] w-72 h-72 rounded-full bg-brand-600/[0.07] blur-[80px] animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-[12%] w-56 h-56 rounded-full bg-violet-600/[0.06] blur-[70px] animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />

      <div className="relative max-w-7xl mx-auto px-5 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div className="space-y-7">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
            <span className="flex h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
            Trusted by 500+ outreach teams worldwide
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-5xl xl:text-6xl font-bold tracking-tight leading-[1.08]">
              Reach the right people
              <br />
              <span className="text-gradient">at the right time.</span>
              <br />
              At any scale.
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed pt-2">
              The intelligent auto-dialer that turns your contact list into conversations —
              automatically, compliantly, and with full visibility into every outcome.
            </p>
          </div>

          {/* Value props */}
          <div className="grid grid-cols-2 gap-2.5 text-sm">
            {[
              'Set up a campaign in under 10 minutes',
              'Know if a human or voicemail answered',
              'Real-time dashboard — every call visible',
              'Works with any phone number provider',
            ].map(v => (
              <div key={v} className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>{v}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link href="/signup"
              className="flex items-center gap-2 px-7 py-3.5 gradient-brand rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-glow-brand hover:-translate-y-px">
              Start Free — No Card Needed
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#solutions"
              className="flex items-center gap-2 px-7 py-3.5 bg-card border border-border rounded-xl font-medium hover:bg-accent transition-all">
              <Play className="h-4 w-4 text-brand-400" />
              See use cases
            </a>
          </div>

          {/* Social proof row */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex -space-x-2">
              {['AB', 'MR', 'SC', 'DO', 'LK'].map((init, i) => (
                <div key={i} className="h-8 w-8 rounded-full gradient-brand flex items-center justify-center text-white text-[10px] font-bold border-2 border-background">
                  {init}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-xs text-muted-foreground">
                Rated <span className="text-foreground font-semibold">4.9/5</span> across 200+ reviews
              </p>
            </div>
          </div>
        </div>

        {/* Right — Live dashboard mock */}
        <div className="relative hidden lg:block">
          <div className="relative rounded-2xl border border-border bg-card shadow-modal overflow-hidden">
            {/* Mock header */}
            <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 bg-muted/50 rounded-md h-6 flex items-center px-3">
                <span className="text-[10px] text-muted-foreground">app.voxora.io/dashboard</span>
              </div>
            </div>

            {/* Mock campaign card */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground">LIVE CAMPAIGNS</span>
                <span className="badge-green text-[10px]">3 running</span>
              </div>

              {/* Campaign row */}
              {[
                { name: 'Q2 Sales Outreach', progress: 73, active: 24, human: 42, amd: true },
                { name: 'Re-engagement Blast', progress: 41, active: 8, human: 38, amd: true },
                { name: 'Appointment Reminders', progress: 91, active: 2, human: 67, amd: false },
              ].map(c => (
                <div key={c.name} className="bg-muted/20 rounded-xl p-3 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold">{c.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                      </span>
                      <span className="text-[10px] text-green-400 font-medium">{c.active} live</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-green-500 rounded-full transition-all" style={{ width: `${c.progress}%` }} />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="text-green-400 font-medium">{c.human}% human</span>
                    <span>{c.progress}% done</span>
                    {c.amd && <span className="text-brand-400">AMD on</span>}
                  </div>
                </div>
              ))}

              {/* Live stat row */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { label: 'Active Calls', value: count.toLocaleString(), live: true, color: 'text-green-400' },
                  { label: 'Today', value: '4,812', color: 'text-blue-400' },
                  { label: 'Answer Rate', value: '43%', color: 'text-brand-400' },
                ].map(s => (
                  <div key={s.label} className="bg-muted/30 rounded-xl p-2.5 text-center">
                    <div className={cn('text-base font-bold tabular-nums', s.color)}>
                      {s.value}
                      {s.live && <span className="relative inline-flex ml-1 h-1.5 w-1.5 align-middle">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                      </span>}
                    </div>
                    <div className="text-[9px] text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating event cards */}
          <div className="absolute -left-12 top-16 bg-card border border-border rounded-xl p-3 shadow-dropdown animate-slide-in-right" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-green-500/15 flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold">Human answered</p>
                <p className="text-[9px] text-muted-foreground">+1 (415) 555-0142 · AMD</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-8 bottom-24 bg-card border border-border rounded-xl p-3 shadow-dropdown animate-slide-in-right" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-brand-500/15 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-brand-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold">Answer rate up 12%</p>
                <p className="text-[9px] text-muted-foreground">vs last campaign</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a href="#solutions" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
        <span className="text-[10px] font-medium tracking-widest uppercase">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  )
}

// ─── Social proof bar ─────────────────────────────────────────────────────────
function SocialProofBar() {
  return (
    <div className="border-y border-border bg-card/50 py-4">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs text-muted-foreground">
          {[
            { value: '500+', label: 'companies' },
            { value: '2.4B+', label: 'calls placed' },
            { value: '99.9%', label: 'platform uptime' },
            { value: '< 3s', label: 'AMD detection' },
            { value: '180+', label: 'countries reached' },
            { value: '4.9★', label: 'avg rating' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-foreground">{s.value}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Solutions ────────────────────────────────────────────────────────────────
function Solutions() {
  const [active, setActive] = useState(0)

  const cases = [
    {
      icon: ShoppingCart,
      category: 'Sales Outreach',
      headline: 'Fill your pipeline without lifting a finger',
      desc: 'Automatically reach hundreds of prospects per hour. When a human answers, the right message plays — and your team knows who engaged. When voicemail picks up, leave a perfect drop and move on.',
      bullets: [
        'Reach 10x more prospects in the same time',
        'Voicemail drops keep your brand consistent',
        'Instant callback data — know who to call back',
        'Connect rate analytics by time of day',
      ],
      metric: { value: '10x', label: 'more outbound reach' },
      color: 'brand',
    },
    {
      icon: RefreshCw,
      category: 'Customer Re-engagement',
      headline: 'Wake up dormant customers at scale',
      desc: 'Target churned or inactive customers with personalised voice messages. Trigger follow-up campaigns based on who answered, what they heard, and how long they listened.',
      bullets: [
        'Segment re-engagement by last activity',
        'Human-answered calls trigger live agent routing',
        'Message variation testing built-in',
        'Opt-out management handled automatically',
      ],
      metric: { value: '340%', label: 'higher re-engagement vs email' },
      color: 'green',
    },
    {
      icon: Calendar,
      category: 'Appointment Reminders',
      headline: 'Cut no-shows. Protect revenue.',
      desc: 'Send automated voice reminders 24, 48, or 72 hours before appointments. Contacts can confirm or cancel with a keypress — feeding data straight back to your CRM.',
      bullets: [
        'Configurable reminder windows (1h, 24h, 48h)',
        'Press-1 confirm / press-2 cancel flows',
        'Timezone-aware — never call at the wrong hour',
        'Connects to your calendar or booking system',
      ],
      metric: { value: '71%', label: 'reduction in no-shows' },
      color: 'blue',
    },
    {
      icon: Heart,
      category: 'Healthcare & Wellness',
      headline: 'Reach patients on time, every time',
      desc: 'HIPAA-ready infrastructure for appointment reminders, care plan follow-ups, and wellness check-ins. Full audit trail, encrypted storage, consent-first flows.',
      bullets: [
        'HIPAA-compliant architecture',
        'Consent-first calling with opt-out tracking',
        'Full call log and recording retention',
        'Restricted calling hours by state/region',
      ],
      metric: { value: '94%', label: 'patient contact success rate' },
      color: 'purple',
    },
    {
      icon: Building2,
      category: 'Collections & Finance',
      headline: 'Improve recovery. Reduce cost-per-contact.',
      desc: 'Launch compliant outreach campaigns for payment reminders and debt recovery. Intelligent retry logic means every reachable contact gets reached — and every opt-out is honoured.',
      bullets: [
        'National DNC list scrubbing',
        'Smart retry: busy → 30min, no answer → 4hr',
        'Timezone and state calling hour enforcement',
        'Dispute and opt-out management built-in',
      ],
      metric: { value: '3.2x', label: 'better recovery vs manual calls' },
      color: 'orange',
    },
  ]

  const c = cases[active]
  const Icon = c.icon
  const colorMap: Record<string, { text: string; bg: string; border: string }> = {
    brand:  { text: 'text-brand-400',  bg: 'bg-brand-500/10',  border: 'border-brand-500/20' },
    green:  { text: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
    blue:   { text: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    orange: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  }
  const col = colorMap[c.color]

  return (
    <section id="solutions" className="py-28 relative">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-5">
            Built for every team that makes calls
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            One platform.<br />
            <span className="text-gradient">Every outreach use case.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Whether you are driving sales, reducing churn, or managing appointments —
            Voxora gives you the tools to reach people at scale, with precision.
          </p>
        </div>

        {/* Tab row */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {cases.map((cs, i) => {
            const TabIcon = cs.icon
            return (
              <button key={cs.category} onClick={() => setActive(i)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  active === i
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60 border border-transparent',
                )}>
                <TabIcon className="h-4 w-4" />
                {cs.category}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 animate-fade-in" key={active}>
            <div className={cn('inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border', col.bg, col.text, col.border)}>
              <Icon className="h-3.5 w-3.5" />
              {c.category}
            </div>
            <h3 className="text-3xl font-bold tracking-tight">{c.headline}</h3>
            <p className="text-muted-foreground leading-relaxed">{c.desc}</p>

            <div className="space-y-3">
              {c.bullets.map(b => (
                <div key={b} className="flex items-start gap-3">
                  <CheckCircle2 className={cn('h-4 w-4 flex-shrink-0 mt-0.5', col.text)} />
                  <span className="text-sm text-muted-foreground">{b}</span>
                </div>
              ))}
            </div>

            <Link href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 gradient-brand rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all">
              Get started — free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Metric card */}
          <div className="animate-fade-in" key={`card-${active}`}>
            <div className={cn('rounded-2xl border p-8 text-center', col.bg, col.border)}>
              <div className={cn('text-7xl font-bold mb-2', col.text)}>{c.metric.value}</div>
              <div className="text-muted-foreground text-sm font-medium">{c.metric.label}</div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                {c.bullets.slice(0, 2).map(b => (
                  <div key={b} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className={cn('h-3.5 w-3.5 flex-shrink-0 mt-0.5', col.text)} />
                    {b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: Target,
      title: 'Smart Dialling Modes',
      desc: 'Broadcast to thousands simultaneously, or configure power dialing with agent handoff. Match the mode to your workflow.',
    },
    {
      icon: Shield,
      title: 'Human vs Machine Detection',
      desc: 'Know within 3 seconds who answered. Play different messages for live humans vs voicemail — no wasted plays.',
    },
    {
      icon: Activity,
      title: 'Live Call Monitoring',
      desc: 'Watch every call in real time. See who answered, AMD results, call duration, and audio quality — all on one screen.',
    },
    {
      icon: RefreshCw,
      title: 'Intelligent Retry Logic',
      desc: 'Busy signals retry in 30 minutes. No answers try again in 4 hours. Fully configurable, per-campaign.',
    },
    {
      icon: Clock,
      title: 'Timezone-Aware Calling',
      desc: 'Never call at 6am or 10pm. Set allowed calling windows per campaign. Contacts in different timezones are handled automatically.',
    },
    {
      icon: Lock,
      title: 'Compliance Built In',
      desc: 'DNC list management, opt-out tracking, restricted calling hours, and a full audit trail. Stay compliant without slowing down.',
    },
    {
      icon: BarChart3,
      title: 'Deep Analytics',
      desc: 'Answer rates, human rates, voicemail rates, RTP quality scores, best time to call, and cost per contact — all in one dashboard.',
    },
    {
      icon: Zap,
      title: 'Webhooks & API',
      desc: 'Every event — call answered, AMD result, hangup — fires a webhook to your CRM, database, or automation platform instantly.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      desc: 'Role-based access for agents, managers, and admins. Multiple team members, separate workspaces, full audit logs.',
    },
    {
      icon: Globe,
      title: 'Any Phone Provider',
      desc: 'Plug in any SIP-compatible carrier. Keep your existing contracts. Pay wholesale rates — not API pricing.',
    },
    {
      icon: MessageSquare,
      title: 'Voicemail Drop',
      desc: 'Pre-recorded messages delivered to voicemail the instant AMD detects a machine. Consistent, professional, instant.',
    },
    {
      icon: PieChart,
      title: 'A/B Message Testing',
      desc: 'Run two audio messages against the same list. Compare answer rates, listen rates, and callbacks. Let data drive your script.',
    },
  ]

  return (
    <section id="features" className="py-28 relative">
      <div className="absolute inset-0 bg-card/20 pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-semibold mb-5">
            Everything you need, nothing you need not
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Every feature a professional<br />
            <span className="text-gradient-green">outreach team demands</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Built by people who have run voice campaigns at scale.
            Every detail thought through.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title}
                className="group bg-card border border-border rounded-2xl p-5 hover:border-brand-500/30 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200">
                <div className="h-9 w-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:bg-brand-500/15 transition-colors">
                  <Icon className="h-4 w-4 text-brand-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Connect your phone provider',
      desc: 'Paste your carrier credentials once. Voxora verifies registration and shows you green within 30 seconds. No engineering required.',
    },
    {
      n: '02',
      title: 'Build your contact campaign',
      desc: 'Import your list, upload your audio message, and configure AMD, calling hours, and retry rules in a guided 4-step wizard.',
    },
    {
      n: '03',
      title: 'Launch and watch it work',
      desc: 'Hit start. Calls go out immediately. The live dashboard shows you every outcome — human, voicemail, no answer — as it happens.',
    },
    {
      n: '04',
      title: 'Act on the results',
      desc: 'Export who answered, who pressed a key, who asked for a callback. Feed the data back to your team or CRM with one click.',
    },
  ]

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            From zero to<br />
            <span className="text-gradient">your first campaign in 30 minutes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            No professional services. No complex setup.
            Our guided flow gets you dialling fast.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-5 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent z-0" />

          {steps.map((step, i) => (
            <div key={step.n} className="relative group">
              <div className="bg-card border border-border rounded-2xl p-6 hover:border-brand-500/30 transition-all hover:-translate-y-1 h-full z-10 relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-xl gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {step.n}
                  </div>
                  {i < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 hidden md:block absolute -right-5 top-[34px]" />
                  )}
                </div>
                <h3 className="font-bold text-sm mb-2">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 gradient-brand rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-glow-brand">
            Start your first campaign free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-3">14-day trial · Setup in under 30 minutes · No engineers needed</p>
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: 49,
      tagline: 'Perfect for teams just starting with voice outreach',
      concurrent: 10,
      contacts: '50K',
      campaigns: 5,
      highlights: [
        '10 simultaneous calls',
        '5 active campaigns',
        '50,000 contact records',
        'AMD — human vs voicemail',
        'Real-time live monitor',
        'DNC list management',
        'CSV import & export',
        'Email support',
      ],
      cta: 'Start free trial',
      popular: false,
    },
    {
      name: 'Growth',
      price: 149,
      tagline: 'The platform for scaling sales and marketing teams',
      concurrent: 50,
      contacts: '500K',
      campaigns: -1,
      highlights: [
        '50 simultaneous calls',
        'Unlimited active campaigns',
        '500,000 contact records',
        'Intelligent retry logic',
        'Timezone-aware calling',
        'Voicemail drop',
        'Webhooks & API access',
        'Analytics export',
        'Priority support (12h)',
        'Call recording (30d)',
      ],
      cta: 'Start free trial',
      popular: true,
    },
    {
      name: 'Pro',
      price: 399,
      tagline: 'For high-volume operations and enterprise workflows',
      concurrent: 200,
      contacts: '5M',
      campaigns: -1,
      highlights: [
        '200 simultaneous calls',
        'Unlimited contacts (5M+)',
        'Full API + webhooks',
        'A/B message testing',
        'Advanced analytics & RTP scoring',
        'Custom calling windows',
        'Unlimited call recording',
        'Dedicated queue workers',
        'Slack / priority support (4h)',
        'Custom caller ID management',
      ],
      cta: 'Start free trial',
      popular: false,
    },
    {
      name: 'Enterprise',
      price: 0,
      tagline: 'Dedicated infrastructure, custom SLA, and white-label options',
      concurrent: 1000,
      contacts: 'Unlimited',
      campaigns: -1,
      highlights: [
        '1,000+ simultaneous calls',
        'Dedicated infrastructure',
        'White-label option',
        'On-premise deployment',
        '99.99% uptime SLA',
        'Signed BAA (HIPAA)',
        'Custom integrations',
        '24/7 phone + Slack support',
        'Dedicated account manager',
        'Security & compliance audit',
      ],
      cta: 'Talk to sales',
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_10%,rgba(99,102,241,0.07),transparent)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-5">
            Simple, transparent pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            One monthly fee.<br />
            <span className="text-gradient">You keep the cost savings.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Voxora charges a flat platform fee. You pay your phone carrier directly at
            wholesale rates — saving up to 80% compared to per-minute API pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {plans.map(plan => (
            <div key={plan.name}
              className={cn(
                'relative flex flex-col rounded-2xl border transition-all duration-200',
                plan.popular
                  ? 'bg-card border-brand-500/60 shadow-glow-brand ring-1 ring-brand-500/25 lg:scale-[1.03]'
                  : 'bg-card border-border hover:border-brand-500/25',
              )}>
              {plan.popular && (
                <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                  <span className="flex items-center gap-1 px-4 py-1 gradient-brand rounded-full text-white text-[11px] font-bold shadow-glow-brand">
                    <Star className="h-3 w-3 fill-white" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-base mb-1">{plan.name}</h3>
                <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">{plan.tagline}</p>

                {/* Price */}
                <div className="mb-5">
                  {plan.price > 0 ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground text-sm">/mo</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">+ your carrier cost</p>
                    </>
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground">Custom pricing</div>
                  )}
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-3 gap-1.5 mb-5">
                  {[
                    { v: plan.concurrent === -1 ? '∞' : String(plan.concurrent), l: 'concurrent' },
                    { v: plan.contacts, l: 'contacts' },
                    { v: plan.campaigns === -1 ? '∞' : String(plan.campaigns), l: 'campaigns' },
                  ].map(m => (
                    <div key={m.l} className="bg-muted/30 rounded-xl px-1.5 py-2 text-center border border-border/50">
                      <p className="text-xs font-bold">{m.v}</p>
                      <p className="text-[9px] text-muted-foreground">{m.l}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="flex-1 space-y-1.5 mb-6">
                  {plan.highlights.map(h => (
                    <div key={h} className="flex items-start gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{h}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {plan.name === 'Enterprise' ? (
                  <a href="mailto:sales@voxora.io"
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-accent transition-all">
                    Contact Sales
                  </a>
                ) : (
                  <Link href="/signup"
                    className={cn(
                      'flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold transition-all',
                      plan.popular
                        ? 'gradient-brand text-white hover:opacity-90 shadow-glow-brand'
                        : 'border border-border hover:bg-accent',
                    )}>
                    {plan.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Savings callout */}
        <div className="bg-green-500/[0.06] border border-green-500/20 rounded-2xl p-6 md:p-7 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div>
            <p className="font-bold text-base mb-1 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Average customer saves $2,800/month after switching
            </p>
            <p className="text-sm text-muted-foreground">
              By owning your carrier relationship, you pay wholesale call rates instead of API markup —
              typically <span className="text-green-400 font-semibold">60–80% cheaper</span> per minute.
            </p>
          </div>
          <Link href="/signup"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 rounded-xl text-white font-semibold text-sm transition-all">
            Estimate my savings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials() {
  const quotes = [
    {
      name: 'Marcus R.', role: 'VP Sales · SaaS company (400 staff)', avatar: 'MR', stars: 5,
      quote: 'We went from 150 manual calls a day to 3,000 automated contacts. The human detection alone changed how our team operates — they only pick up when there is a real person on the line.',
      metric: '20x outreach volume',
    },
    {
      name: 'Sarah K.', role: 'Head of Operations · Collections firm', avatar: 'SK', stars: 5,
      quote: 'The compliance features are what sold us. DNC scrubbing, calling hour enforcement, opt-out tracking — it is all automatic. Our legal team was happy from day one.',
      metric: '100% compliant operations',
    },
    {
      name: 'David O.', role: 'CTO · Healthcare platform', avatar: 'DO', stars: 5,
      quote: 'We send 50,000 appointment reminders a week. No-shows dropped 68% and our staff spend zero time on reminder calls. The ROI was clear within the first two weeks.',
      metric: '68% fewer no-shows',
    },
  ]

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-card/30 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Results our customers actually talk about
          </h2>
          <p className="text-muted-foreground">Not vanity metrics. Real outcomes.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {quotes.map(t => (
            <div key={t.name}
              className="bg-card border border-border rounded-2xl p-6 hover:border-brand-500/20 transition-all hover:-translate-y-0.5">
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.stars)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
              </div>
              <blockquote className="text-sm text-muted-foreground leading-relaxed mb-5">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 text-right">
                  {t.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    {
      q: 'Do I need a phone number or carrier contract?',
      a: 'You need a SIP-compatible phone number provider — this can be any carrier that supports SIP trunking. Many businesses already have one; others sign up for a wholesale SIP provider directly. Voxora connects to your carrier and routes calls through your own account, so you pay your carrier directly at their rates.',
    },
    {
      q: 'How does the 14-day free trial work?',
      a: 'When you sign up, you get full access to your chosen plan for 14 days with no credit card required. At the end of the trial you can add a payment method to continue, or your account pauses automatically — no charges, no surprise bills.',
    },
    {
      q: 'What is answering machine detection?',
      a: 'Voxora analyses the audio from the moment the call connects. Within 2-3 seconds, it determines whether a live human or a voicemail greeting answered. You can configure different actions: play message A for humans, play message B for voicemail, or drop a pre-recorded voicemail and hang up instantly.',
    },
    {
      q: 'Is this compliant for my country?',
      a: 'Voxora includes timezone-aware calling windows, national DNC list integration, opt-out tracking, and full call logging — the foundational tools for compliant outreach in most jurisdictions. Compliance requirements vary by country and use case, so we recommend verifying with your legal team for your specific situation.',
    },
    {
      q: 'How do retries work?',
      a: 'You configure retry rules per campaign. A typical setup: if the line is busy, retry in 30 minutes. If there is no answer, retry in 4 hours. Maximum 3 attempts. If a contact opts out or asks not to be called, they are automatically added to your DNC list and never called again.',
    },
    {
      q: 'Can I connect Voxora to my CRM?',
      a: 'Yes. Every call event — answered, voicemail detected, keypress, hangup — fires a webhook to any URL you configure. You can push data into Salesforce, HubSpot, Zapier, or any custom endpoint in real time. The REST API gives you full programmatic access to contacts, campaigns, and call logs.',
    },
  ]

  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Common questions</h2>
          <p className="text-muted-foreground">Everything you need to know before getting started</p>
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={i}
              className={cn(
                'bg-card border rounded-2xl overflow-hidden transition-all',
                open === i ? 'border-brand-500/30' : 'border-border hover:border-brand-500/20',
              )}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
                <span className="font-semibold text-sm">{f.q}</span>
                <ChevronDown className={cn('h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform', open === i && 'rotate-180')} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            Still have a question?{' '}
            <a href="mailto:hello@voxora.io" className="text-brand-400 hover:text-brand-300 transition-colors">
              Email us at hello@voxora.io
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCta() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-[#0e0c2b] to-brand-950" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(99,102,241,0.12),transparent)]" />

      <div className="relative max-w-4xl mx-auto px-5 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/15 border border-brand-500/25 text-brand-300 text-sm font-semibold mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
          </span>
          Platform live — start in under 30 minutes
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5 leading-[1.1]">
          Ready to reach more people<br />
          and pay less to do it?
        </h2>
        <p className="text-lg text-brand-200/80 mb-10 max-w-xl mx-auto leading-relaxed">
          Join hundreds of teams that run smarter outreach every day.
          Start free — no credit card, no commitment, no engineers required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link href="/signup"
            className="flex items-center gap-2 px-8 py-4 gradient-brand rounded-2xl text-white font-bold text-base hover:opacity-90 transition-all shadow-glow-brand hover:-translate-y-0.5">
            Start your free trial
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="mailto:sales@voxora.io"
            className="flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 rounded-2xl text-white font-semibold text-base hover:bg-white/15 transition-all backdrop-blur-sm">
            <HeadphonesIcon className="h-4 w-4" />
            Talk to the team
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-brand-300/60">
          {[
            '14-day free trial',
            'No credit card required',
            'Cancel any time',
            'Setup in under 30 minutes',
            'No engineers needed',
          ].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="max-w-7xl mx-auto px-5 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center">
                <Waves className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">Voxora</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-4">
              The intelligent voice outreach platform for teams that need to reach people at scale — compliantly and efficiently.
            </p>
            <div className="flex gap-2">
              {['SOC 2', 'GDPR', 'HIPAA Ready', 'TCPA'].map(b => (
                <span key={b} className="text-[10px] px-2 py-1 bg-muted/50 border border-border rounded-lg text-muted-foreground font-medium">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {[
            {
              title: 'Platform',
              links: ['Broadcast Dialer', 'Power Dialer', 'Voicemail Drop', 'AMD Detection', 'Live Monitor', 'Analytics'],
            },
            {
              title: 'Solutions',
              links: ['Sales Outreach', 'Appointment Reminders', 'Re-engagement', 'Healthcare', 'Collections'],
            },
            {
              title: 'Developers',
              links: ['API Reference', 'Webhooks', 'SDKs', 'Status Page'],
            },
            {
              title: 'Company',
              links: ['About', 'Blog', 'Careers', 'Press Kit', 'Contact'],
            },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">© 2026 Voxora Inc. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-muted-foreground">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'DPA', 'Security'].map(l => (
              <a key={l} href="#" className="hover:text-foreground transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <Hero />
      <SocialProofBar />
      <Solutions />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCta />
      <Footer />
    </div>
  )
}
