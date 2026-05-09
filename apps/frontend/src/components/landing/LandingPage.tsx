'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import {
  Waves, Phone, Activity, Shield, Zap, BarChart3, Users, Globe,
  CheckCircle2, ArrowRight, Play, ChevronDown, Star, TrendingUp,
  Clock, Server, Mic, Radio, Cpu, Lock, HeadphonesIcon, Building2,
  X, Menu, ExternalLink, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '1,000+', label: 'Concurrent Calls', suffix: '' },
  { value: '99.9', label: 'Uptime SLA', suffix: '%' },
  { value: '< 50', label: 'Avg Latency', suffix: 'ms' },
  { value: '180+', label: 'Countries', suffix: '' },
]

const FEATURES = [
  {
    icon: Phone,
    title: 'Direct SIP Protocol',
    desc: 'Connect any SIP provider directly — no Twilio, no per-minute API markup. Pure SIP/RTP at infrastructure cost.',
    highlight: 'Up to 80% cheaper than API-based solutions',
    color: 'brand',
  },
  {
    icon: Shield,
    title: 'AMD Detection',
    desc: 'Answering Machine Detection powered by advanced audio analysis. Human vs voicemail in under 3 seconds.',
    highlight: '94% detection accuracy',
    color: 'green',
  },
  {
    icon: Activity,
    title: 'Real-time Monitoring',
    desc: 'Live dashboard with call-by-call visibility. WebSocket events, MOS scoring, and instant SIP error alerts.',
    highlight: 'Sub-second event latency',
    color: 'blue',
  },
  {
    icon: BarChart3,
    title: 'Campaign Analytics',
    desc: 'Answer rates, human rates, voicemail rates, RTP quality scores, and timeline charts — all in one place.',
    highlight: 'Full attribution per contact',
    color: 'purple',
  },
  {
    icon: Zap,
    title: 'BullMQ Queue Engine',
    desc: 'Distribute millions of calls across Redis-backed queues. Precise CPS limiting, retry logic, and concurrency control.',
    highlight: 'Process 1M+ contacts/day',
    color: 'yellow',
  },
  {
    icon: Globe,
    title: 'Multi-tenant SaaS',
    desc: 'Organisation-scoped data isolation, JWT auth, role-based access, Stripe billing, and white-label ready.',
    highlight: 'Enterprise security model',
    color: 'orange',
  },
]

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    desc: 'Perfect for small teams getting started with voice broadcasting',
    concurrent: 10,
    campaigns: 5,
    contacts: '50K',
    sip: 2,
    features: [
      '10 concurrent calls',
      'Up to 5 active campaigns',
      '50,000 contacts storage',
      '2 SIP accounts',
      'AMD detection',
      'Real-time monitoring',
      'Email support (48h)',
      'API access',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 149,
    desc: 'The go-to plan for scaling sales and marketing teams',
    concurrent: 50,
    campaigns: -1,
    contacts: '500K',
    sip: 10,
    features: [
      '50 concurrent calls',
      'Unlimited campaigns',
      '500,000 contacts storage',
      '10 SIP accounts',
      'Advanced AMD + voicemail drop',
      'Real-time live monitor',
      'Priority email support (12h)',
      'Full API + webhooks',
      'Call recordings (30 days)',
      'Analytics export (CSV)',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 399,
    desc: 'For high-volume operations that need maximum throughput',
    concurrent: 200,
    campaigns: -1,
    contacts: '5M',
    sip: -1,
    features: [
      '200 concurrent calls',
      'Unlimited everything',
      '5 million contacts',
      'Unlimited SIP accounts',
      'Priority queue processing',
      'Dedicated queue workers',
      'Priority Slack support (4h)',
      'Advanced analytics & RTP scoring',
      'Recordings unlimited retention',
      'Custom caller ID management',
      'Webhook retry + delivery logs',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0,
    desc: 'Dedicated infrastructure, custom SLA, and white-label options',
    concurrent: 1000,
    campaigns: -1,
    contacts: 'Unlimited',
    sip: -1,
    features: [
      '1,000+ concurrent calls',
      'Dedicated infrastructure',
      'Custom data retention',
      'White-label option',
      'On-premise deployment',
      '99.99% uptime SLA',
      'Dedicated account manager',
      '24/7 phone + Slack support',
      'Custom integration development',
      'Compliance & security audit',
      'Signed BAA available',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

const TESTIMONIALS = [
  {
    name: 'Marcus Rodriguez',
    role: 'VP Sales, GrowthForce',
    avatar: 'MR',
    stars: 5,
    text: 'We moved from Twilio to Voxora and cut our telecom bill by 65% overnight. The AMD detection alone saves our agents hours every week.',
    metric: '65% cost reduction',
  },
  {
    name: 'Sarah Chen',
    role: 'Head of Operations, LoanDirect',
    avatar: 'SC',
    stars: 5,
    text: 'The live monitor is incredible. We can see every call in real time, catch SIP issues instantly, and our compliance team loves the full audit trail.',
    metric: '3x call throughput',
  },
  {
    name: 'David Okafor',
    role: 'CTO, VoiceConnect Africa',
    avatar: 'DO',
    stars: 5,
    text: 'Running 800 concurrent calls across 12 SIP trunks. The BullMQ engine handles it flawlessly. Setup took one afternoon.',
    metric: '800 concurrent calls',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Connect your SIP trunk',
    desc: 'Add any SIP provider — Vonage, Twilio SIP, Bandwidth, or your own Asterisk. Voxora registers and tests the connection in seconds.',
    icon: Server,
  },
  {
    step: '02',
    title: 'Upload contacts & audio',
    desc: 'Import CSV contacts (auto-validated, deduplicated). Upload MP3/WAV audio files or use text-to-speech. Set up AMD rules.',
    icon: Users,
  },
  {
    step: '03',
    title: 'Launch and watch live',
    desc: 'Start your campaign with one click. Watch calls go out in real time — AMD results, MOS scores, and analytics update instantly.',
    icon: Radio,
  },
]

const FAQS = [
  {
    q: 'Do I need a SIP provider?',
    a: 'Yes — Voxora is a SIP broadcasting platform that routes calls through your own SIP trunk. This means you pay your provider\'s wholesale rate instead of per-minute API markup. We support any SIP provider (Vonage, Twilio, Bandwidth, Plivo, Twilio Elastic SIP, or your own Asterisk/FreePBX).',
  },
  {
    q: 'How does caller ID work?',
    a: 'Caller ID is optional. If you don\'t set one, your SIP provider assigns it automatically. You can override it per campaign or per SIP account. We validate the format before starting calls to avoid provider rejections.',
  },
  {
    q: 'What is AMD detection?',
    a: 'Answering Machine Detection (AMD) analyzes the audio within the first 3 seconds of a call to determine if a human or voicemail answered. You can configure Voxora to play different audio for humans vs machines, or drop calls that hit voicemail entirely.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes — all paid plans include a 14-day free trial, no credit card required. You start with 2 concurrent calls on Trial, and unlock the full plan immediately after adding a payment method.',
  },
  {
    q: 'Can I use this at scale (1000+ concurrent)?',
    a: 'Absolutely. Voxora is architected on BullMQ + Redis for queue management and FreeSWITCH + Kamailio for media handling. The Enterprise plan supports 1,000+ concurrent calls with dedicated infrastructure. Our largest customer runs 3,500 concurrent calls.',
  },
  {
    q: 'How is data billed?',
    a: 'Voxora charges a flat monthly platform fee based on your plan. You pay your SIP provider separately for actual call minutes at their wholesale rate. There are no per-minute or per-call charges from Voxora.',
  },
]

// ── Colour helpers ─────────────────────────────────────────────────────────────

const featureColors: Record<string, { bg: string; icon: string; border: string; glow: string }> = {
  brand:  { bg: 'bg-brand-500/10',  icon: 'text-brand-400',  border: 'border-brand-500/20',  glow: 'group-hover:shadow-glow-brand' },
  green:  { bg: 'bg-green-500/10',  icon: 'text-green-400',  border: 'border-green-500/20',  glow: 'group-hover:shadow-glow-green' },
  blue:   { bg: 'bg-blue-500/10',   icon: 'text-blue-400',   border: 'border-blue-500/20',   glow: '' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/20', glow: '' },
  yellow: { bg: 'bg-yellow-500/10', icon: 'text-yellow-400', border: 'border-yellow-500/20', glow: '' },
  orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400', border: 'border-orange-500/20', glow: '' },
}

// ── Components ────────────────────────────────────────────────────────────────

function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-md' : 'bg-transparent',
    )}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center shadow-glow-brand group-hover:shadow-lg transition-shadow">
            <Waves className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Voxora</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: 'Features', href: '#features' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'FAQ', href: '#faq' },
          ].map(item => (
            <a key={item.label} href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
            Sign in
          </Link>
          <Link href="/signup"
            className="btn-primary text-sm flex items-center gap-1.5">
            Start Free Trial
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile menu */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-accent">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border px-6 py-4 space-y-3">
          {['Features', 'How It Works', 'Pricing', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
              onClick={() => setMobileOpen(false)}
              className="block text-sm py-2 text-muted-foreground hover:text-foreground transition-colors">
              {item}
            </a>
          ))}
          <div className="flex gap-3 pt-2 border-t border-border">
            <Link href="/login" className="flex-1 text-center py-2 text-sm border border-border rounded-xl hover:bg-accent transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="flex-1 text-center py-2 text-sm gradient-brand text-white rounded-xl font-medium">
              Free Trial
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-grid opacity-[0.3]" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-brand-600/[0.07] blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/[0.05] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-600/[0.04] blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-8 animate-fade-in">
          <span className="flex h-1.5 w-1.5 rounded-full bg-brand-400" />
          The 2026 Standard for Enterprise Voice Broadcasting
          <ArrowRight className="h-3.5 w-3.5" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.05] mb-6 animate-fade-in">
          <span className="text-foreground">Outbound voice</span>
          <br />
          <span className="text-gradient">at any scale</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed animate-fade-in">
          Direct SIP broadcasting without the telecom API tax.
          Connect your own trunk. Launch campaigns in minutes.
        </p>
        <p className="text-base text-muted-foreground/70 max-w-xl mx-auto mb-12 animate-fade-in">
          No Twilio. No Plivo. No per-minute markups. <span className="text-foreground/80">Up to 80% cheaper.</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in">
          <Link href="/signup"
            className="flex items-center gap-2 px-8 py-4 gradient-brand rounded-2xl text-white font-semibold text-base hover:opacity-90 transition-all shadow-glow-brand hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
            Start Free — No Card Needed
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#how-it-works"
            className="flex items-center gap-2 px-8 py-4 bg-card border border-border rounded-2xl text-foreground font-medium text-base hover:bg-accent transition-all">
            <Play className="h-4 w-4 text-brand-400" />
            See How It Works
          </a>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground/70 mb-20 animate-fade-in">
          {['14-day free trial', 'No credit card', 'Cancel anytime', 'SOC 2 compliant', 'GDPR ready'].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span>{t}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {STATS.map(stat => (
            <div key={stat.label} className="glass-card p-5 rounded-2xl text-center group hover:border-brand-500/20 transition-all">
              <div className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">
                {stat.value}<span className="text-brand-400">{stat.suffix}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-5 w-5 text-muted-foreground/40" />
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-5">
            Built for 2026
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need.<br />
            <span className="text-gradient">Nothing you need not.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A complete voice broadcasting stack — SIP, AMD, analytics, billing, and real-time monitoring — in one platform.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(feature => {
            const Icon = feature.icon
            const c = featureColors[feature.color]
            return (
              <div key={feature.title}
                className={cn(
                  'group relative p-6 rounded-2xl border transition-all duration-300',
                  'bg-card border-border hover:border-brand-500/30 hover:-translate-y-1 hover:shadow-card-hover',
                  c.glow,
                )}>
                {/* Icon */}
                <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center mb-5 border', c.bg, c.border)}>
                  <Icon className={cn('h-5 w-5', c.icon)} />
                </div>

                <h3 className="font-bold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{feature.desc}</p>

                {/* Highlight */}
                <div className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border', c.bg, c.icon, c.border)}>
                  <span className="h-1 w-1 rounded-full bg-current" />
                  {feature.highlight}
                </div>
              </div>
            )
          })}
        </div>

        {/* Tech stack badge row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {[
            'FreeSWITCH', 'Kamailio', 'BullMQ', 'Redis', 'PostgreSQL',
            'Socket.io', 'NestJS', 'Next.js', 'Stripe',
          ].map(tech => (
            <div key={tech} className="px-3 py-1.5 bg-muted/50 border border-border rounded-xl text-xs text-muted-foreground font-medium">
              {tech}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-28 relative">
      <div className="absolute inset-0 bg-card/20 pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-medium mb-5">
            Setup in under 30 minutes
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Three steps to<br />
            <span className="text-gradient-green">your first campaign</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            No complex telephony setup. No carrier negotiations. Just paste your SIP credentials and go.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector lines */}
          <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px bg-gradient-to-r from-brand-500/0 via-brand-500/40 to-brand-500/0 z-0" />

          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.step} className="relative group">
                <div className="bg-card border border-border rounded-2xl p-7 hover:border-brand-500/30 transition-all hover:-translate-y-1 h-full">
                  {/* Step number */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-brand-400" />
                    </div>
                    <span className="text-4xl font-bold text-brand-500/20 font-mono">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA after how it works */}
        <div className="text-center mt-12">
          <Link href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 gradient-brand rounded-2xl text-white font-semibold hover:opacity-90 transition-all shadow-glow-brand">
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-3">14-day free trial · No credit card · Cancel anytime</p>
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="pricing" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-brand-600/[0.06] blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-5">
            Transparent pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Flat platform fee.<br />
            <span className="text-gradient">You own your SIP cost.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Pay Voxora once per month. Pay your SIP provider at wholesale rates.
            No per-minute markup — ever.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {PLANS.map(plan => (
            <div key={plan.id}
              className={cn(
                'relative flex flex-col rounded-2xl border transition-all duration-200',
                plan.popular
                  ? 'bg-card border-brand-500/60 shadow-glow-brand ring-1 ring-brand-500/30 scale-[1.02]'
                  : 'bg-card border-border hover:border-brand-500/30',
              )}>
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 px-4 py-1 gradient-brand rounded-full text-white text-[11px] font-bold shadow-glow-brand">
                    <Star className="h-3 w-3 fill-white" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                {/* Plan header */}
                <div className="mb-5">
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{plan.desc}</p>
                </div>

                {/* Price */}
                <div className="mb-5">
                  {plan.price > 0 ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">${plan.price}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground">Custom</div>
                  )}
                  {plan.price > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">+ your SIP carrier cost</p>
                  )}
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {[
                    { label: 'Concurrent', value: plan.concurrent === -1 ? '∞' : plan.concurrent },
                    { label: 'Contacts', value: plan.contacts },
                    { label: 'Campaigns', value: plan.campaigns === -1 ? '∞' : plan.campaigns },
                    { label: 'SIP Accts', value: plan.sip === -1 ? '∞' : plan.sip },
                  ].map(m => (
                    <div key={m.label} className="bg-muted/30 rounded-xl px-2.5 py-2 text-center border border-border/50">
                      <p className="text-sm font-bold">{m.value}</p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="space-y-1.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {plan.id === 'enterprise' ? (
                  <a href="mailto:sales@voxora.io"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border hover:bg-accent text-sm font-semibold transition-all">
                    Contact Sales
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <Link href="/signup"
                    className={cn(
                      'flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all',
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

        {/* Savings calculator callout */}
        <div className="bg-brand-500/[0.06] border border-brand-500/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold mb-1">See your savings vs Twilio/Plivo</h3>
            <p className="text-sm text-muted-foreground">
              Average Voxora customer saves <span className="text-green-400 font-semibold">$2,800/month</span> after switching from API-based providers.
            </p>
          </div>
          <Link href="/signup"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 gradient-brand rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all">
            Calculate My Savings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-card/30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Trusted by teams doing real volume
          </h2>
          <p className="text-muted-foreground">From 10 calls/day to 10,000+</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name}
              className="bg-card border border-border rounded-2xl p-6 hover:border-brand-500/20 transition-all hover:-translate-y-0.5">
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <blockquote className="text-sm text-muted-foreground leading-relaxed mb-5">
                &ldquo;{t.text}&rdquo;
              </blockquote>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
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

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground">Everything you need to know</p>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className={cn(
              'bg-card border rounded-2xl overflow-hidden transition-all',
              open === i ? 'border-brand-500/30' : 'border-border hover:border-brand-500/20',
            )}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
              >
                <span className="font-semibold text-sm">{faq.q}</span>
                <ChevronDown className={cn('h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200', open === i && 'rotate-180')} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            Still have questions?{' '}
            <a href="mailto:hello@voxora.io" className="text-brand-400 hover:text-brand-300 transition-colors">
              Email us at hello@voxora.io
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-[#0f0d2e] to-brand-950" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/15 border border-brand-500/25 text-brand-300 text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
          </span>
          Platform live — 1,000 concurrent call capacity available now
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5 leading-[1.1]">
          Ready to scale your<br />
          voice outreach?
        </h2>

        <p className="text-lg text-brand-200/80 mb-10 max-w-xl mx-auto">
          Join teams that switched from Twilio and Plivo and never looked back.
          Start free — no credit card, no commitment.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup"
            className="flex items-center gap-2 px-8 py-4 gradient-brand rounded-2xl text-white font-bold text-base hover:opacity-90 transition-all shadow-glow-brand hover:-translate-y-0.5">
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="mailto:sales@voxora.io"
            className="flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 rounded-2xl text-white font-medium text-base hover:bg-white/15 transition-all backdrop-blur-sm">
            <HeadphonesIcon className="h-4 w-4" />
            Talk to Sales
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-brand-300/60">
          {['Free 14-day trial', 'Setup in 30 minutes', '80% cheaper than API billing', 'Cancel any time'].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center">
                <Waves className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">Voxora</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The 2026 standard for enterprise voice broadcasting.
              Direct SIP, real-time analytics, built for scale.
            </p>
            <div className="flex gap-2 mt-4">
              {['SOC 2', 'GDPR', 'HIPAA Ready'].map(b => (
                <span key={b} className="text-[10px] px-2 py-1 bg-muted/50 border border-border rounded-lg text-muted-foreground font-medium">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
            { title: 'Developers', links: ['API Docs', 'Webhooks', 'SIP Guide', 'Status'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © 2026 Voxora Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'DPA'].map(l => (
              <a key={l} href="#" className="hover:text-foreground transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  )
}
