'use client'

import Link from 'next/link'
import { useState, useEffect, memo } from 'react'
import {
  Waves, ArrowRight, CheckCircle2, ChevronDown, Star, Play,
  Phone, TrendingUp, Clock, Users, Shield, Zap, BarChart3,
  Target, MessageSquare, RefreshCw, Lock, HeadphonesIcon,
  Building2, ShoppingCart, Heart, X, Menu, Check, ChevronRight,
  Activity, Calendar, Radio, Voicemail, Globe, Key, Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Styles shared across sections ──────────────────────────── */
const S = {
  bg:       'bg-[hsl(234_30%_5%)]',
  bgCard:   'bg-[hsl(234_28%_8%)]',
  bgElevated:'bg-[hsl(234_28%_10%)]',
  border:   'border-[hsl(234_22%_14%)]',
  muted:    'text-[hsl(224_14%_52%)]',
  pill: (color: 'violet'|'green'|'cyan') => {
    const map = {
      violet: 'bg-violet-500/10 border-violet-500/25 text-violet-300',
      green:  'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
      cyan:   'bg-cyan-500/10 border-cyan-500/25 text-cyan-300',
    }
    return `inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${map[color]}`
  },
}

/* ─── Nav ──────────────────────────────────────────────────────── */
const Nav = memo(function Nav() {
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
      scrolled ? `${S.bgCard} backdrop-blur-2xl border-b ${S.border} shadow-lg` : 'bg-transparent',
    )}>
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center shadow-glow-violet">
            <Waves className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-[17px] tracking-tight text-white">Voxora</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-8">
          {links.map(l => (
            <a key={l.label} href={l.href}
              className={`text-sm font-medium transition-colors ${S.muted} hover:text-white`}>{l.label}</a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login" className={`text-sm font-medium transition-colors px-3 py-1.5 ${S.muted} hover:text-white`}>
            Sign in
          </Link>
          <Link href="/signup" className="btn-primary text-sm py-2 px-5">
            Get started free <ArrowRight className="h-3.5 w-3.5 inline ml-1" />
          </Link>
        </div>
        <button className={`lg:hidden p-2 rounded-xl ${S.muted} hover:text-white`} onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className={`lg:hidden ${S.bgCard} border-t ${S.border} px-5 py-4 space-y-1`}>
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className={`block py-2.5 text-sm font-medium ${S.muted} hover:text-white transition-colors`}>{l.label}</a>
          ))}
          <div className={`flex gap-3 pt-3 border-t ${S.border} mt-2`}>
            <Link href="/login" className={`flex-1 text-center py-2.5 text-sm border ${S.border} rounded-xl ${S.muted}`}>Sign in</Link>
            <Link href="/signup" className="flex-1 text-center py-2.5 text-sm gradient-brand text-white rounded-xl font-semibold">Get started</Link>
          </div>
        </div>
      )}
    </header>
  )
})

/* ─── Hero ──────────────────────────────────────────────────────── */
const Hero = memo(function Hero() {
  const [calls, setCalls] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCalls(c => c < 2847 ? c + 19 : 2847), 16)
    return () => clearInterval(t)
  }, [])

  return (
    <section className={`relative min-h-screen flex items-center pt-16 overflow-hidden ${S.bg}`}>
      <div className="absolute inset-0 bg-dots opacity-25 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[130px] pointer-events-none bg-violet-600/[0.1]" />

      <div className="relative max-w-7xl mx-auto px-5 py-24 grid lg:grid-cols-2 gap-16 items-center">
        {/* Copy */}
        <div className="space-y-7 animate-fade-in">
          <div className={S.pill('violet')}>
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            Trusted by 500+ outreach teams worldwide
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl xl:text-[62px] font-bold tracking-tight leading-[1.06] text-white">
              Your contacts.<br />
              Your message.<br />
              <span className="text-gradient">Delivered at scale.</span>
            </h1>
            <p className="text-xl leading-relaxed max-w-lg pt-1" style={{ color: 'hsl(224 14% 60%)' }}>
              The call automation platform that reaches thousands of people automatically — with full visibility into every answer, every outcome, every second.
            </p>
          </div>
          <div className="space-y-2.5">
            {[
              'Launch a campaign in under 10 minutes',
              'Know if a human or voicemail answered — every call',
              'Watch your calls happen live on a real-time dashboard',
              'Connect any phone number you already have',
            ].map(v => (
              <div key={v} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm" style={{ color: 'hsl(224 14% 60%)' }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/signup" className="btn-primary flex items-center gap-2 px-7 py-3.5 text-base rounded-xl">
              Start free — no card needed
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how" className={`flex items-center gap-2 px-7 py-3.5 rounded-xl font-medium border ${S.border} ${S.bgElevated} text-white/75 hover:text-white transition-colors`}>
              <Play className="h-4 w-4 text-violet-400" />
              See how it works
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-5 pt-1">
            {['3-day free trial', 'No credit card', 'Cancel any time'].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-xs" style={{ color: 'hsl(224 14% 45%)' }}>
                <Check className="h-3 w-3 text-emerald-500" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard mock */}
        <div className="hidden lg:block relative animate-slide-in-right">
          <div className={`rounded-2xl overflow-hidden shadow-modal ${S.bgCard} border ${S.border}`}>
            {/* Chrome */}
            <div className={`px-4 py-3 flex items-center gap-3 border-b ${S.border}`}>
              <div className="flex gap-1.5">
                {['bg-red-500/60','bg-yellow-500/60','bg-green-500/60'].map(c => <div key={c} className={`h-3 w-3 rounded-full ${c}`} />)}
              </div>
              <div className={`flex-1 h-6 rounded-md flex items-center px-3 ${S.bgElevated}`}>
                <span className="text-[10px]" style={{ color: 'hsl(224 14% 38%)' }}>app.voxora.io/dashboard</span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Dashboard</p>
                  <p className="text-[11px]" style={{ color: 'hsl(224 14% 48%)' }}>Good afternoon, Alex</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  {calls.toLocaleString()} active calls
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: '4,812', l: 'Calls today',  c: 'text-violet-400' },
                  { v: '43%',   l: 'Answer rate',  c: 'text-emerald-400' },
                  { v: '71%',   l: 'Human rate',   c: 'text-cyan-400' },
                ].map(s => (
                  <div key={s.l} className={`p-3 rounded-xl text-center ${S.bgElevated} border ${S.border}`}>
                    <p className={`text-base font-bold tabular-nums ${s.c}`}>{s.v}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'hsl(224 14% 48%)' }}>{s.l}</p>
                  </div>
                ))}
              </div>
              {[
                { name: 'Q2 Sales Outreach',    pct: 68, live: 18, human: '44%', bar: 'bg-violet-500' },
                { name: 'Appointment Reminders', pct: 91, live: 3,  human: '82%', bar: 'bg-cyan-500' },
                { name: 'Customer Win-back',    pct: 35, live: 12, human: '39%', bar: 'bg-emerald-500' },
              ].map(c => (
                <div key={c.name} className={`p-3 rounded-xl ${S.bgElevated} border ${S.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white">{c.name}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">{c.live} live</span>
                  </div>
                  <div className="h-1.5 rounded-full mb-1.5" style={{ background: 'hsl(234 22% 16%)' }}>
                    <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${c.pct}%` }} />
                  </div>
                  <div className="flex gap-3 text-[10px]" style={{ color: 'hsl(224 14% 48%)' }}>
                    <span>{c.pct}% done</span>
                    <span className="text-emerald-400 font-semibold">{c.human} human</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Floating cards — CSS animation only */}
          <div className={`absolute -left-14 top-20 ${S.bgCard} border ${S.border} rounded-xl p-3 shadow-dropdown animate-slide-in-right`} style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white">Human answered</p>
                <p className="text-[10px]" style={{ color: 'hsl(224 14% 48%)' }}>Detection in 0.4s</p>
              </div>
            </div>
          </div>
          <div className={`absolute -right-10 bottom-20 ${S.bgCard} border ${S.border} rounded-xl p-3 shadow-dropdown animate-slide-in-right`} style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white">Answer rate +8%</p>
                <p className="text-[10px]" style={{ color: 'hsl(224 14% 48%)' }}>vs last campaign</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a href="#how" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 transition-colors" style={{ color: 'hsl(224 14% 35%)' }}>
        <span className="text-[10px] font-bold tracking-widest uppercase">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  )
})

/* ─── Stats bar ─────────────────────────────────────────────────── */
const StatsBar = memo(function StatsBar() {
  return (
    <div className={`${S.bgCard} border-y ${S.border} py-4`}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-sm">
          {[
            { v: '500+',   l: 'businesses' },
            { v: '3B+',    l: 'calls delivered' },
            { v: '99.9%',  l: 'platform uptime' },
            { v: '<3 sec', l: 'human detection' },
            { v: '180+',   l: 'countries' },
            { v: '4.9 ★',  l: 'rating' },
          ].map(s => (
            <div key={s.l} className="flex items-center gap-2">
              <span className="font-bold text-white">{s.v}</span>
              <span className={S.muted}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

/* ─── How it works ──────────────────────────────────────────────── */
const HowItWorks = memo(function HowItWorks() {
  return (
    <section id="how" className={`py-28 ${S.bg}`}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-16">
          <div className={`${S.pill('green')} mb-6`}>Ready to dial in 30 minutes</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Four steps from sign-up<br />to <span className="text-gradient">your first live campaign</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'hsl(224 14% 55%)' }}>
            No engineers. No complex configuration. The guided setup handles everything.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { n:'01', icon:Globe,    title:'Connect your phone numbers',  desc:'Paste your phone account credentials. Connection is verified automatically.', note:'Standard SIP credentials only.' },
            { n:'02', icon:Users,    title:'Upload your contact list',    desc:'Import a CSV with the numbers to reach. Auto-validated, deduped, and formatted.', note:'Any format. International numbers supported.' },
            { n:'03', icon:Radio,    title:'Configure your campaign',     desc:'Set your message, calling hours, and what to do when voicemail answers.', note:'Guided 5-step wizard. Nothing to figure out.' },
            { n:'04', icon:Activity, title:'Launch and watch live',       desc:'Start with one click. Every call and outcome appears on your dashboard in real time.', note:'Pause or stop any time.' },
          ].map((step) => {
            const Icon = step.icon
            return (
              <div key={step.n}
                className={`${S.bgCard} border ${S.border} rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-glow-violet`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-xl gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {step.n}
                  </div>
                  <Icon className="h-5 w-5 text-violet-400/60" />
                </div>
                <h3 className="font-bold text-[15px] text-white mb-2">{step.title}</h3>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: 'hsl(224 14% 55%)' }}>{step.desc}</p>
                <p className="text-[11px] font-medium text-violet-400/70">{step.note}</p>
              </div>
            )
          })}
        </div>
        <div className="text-center mt-12">
          <Link href="/signup" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-base rounded-xl">
            Start free today
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs mt-3" style={{ color: 'hsl(224 14% 42%)' }}>3-day trial · No credit card · Cancel any time</p>
        </div>
      </div>
    </section>
  )
})

/* ─── Use cases ─────────────────────────────────────────────────── */
const UseCases = memo(function UseCases() {
  const [active, setActive] = useState(0)
  const cases = [
    { icon:ShoppingCart, label:'Sales',           headline:'Turn your contact list into real conversations', metric:'10× outbound reach',  color:'text-violet-400', body:'Reach hundreds of prospects per hour automatically. Human answers play your message. Voicemail gets a separate drop. Your team handles callbacks only.', bullets:['10× more calls per hour vs manual dialling','Callback identification per contact','Answer rate analytics by hour of day','Scales from 50 to 500,000 contacts'] },
    { icon:Calendar,     label:'Appointment reminders',    headline:'Cut no-shows. Protect your revenue.',        metric:'70% fewer no-shows', color:'text-cyan-400',   body:'Send voice reminders 24, 48, or 72 hours before appointments. Clients confirm or cancel with a keypress — recorded instantly.', bullets:['Configurable reminder windows','Keypress confirm or cancel','Automatic follow-up on no response','Works for any appointment type'] },
    { icon:RefreshCw,    label:'Re-engagement',   headline:'Win back customers who went quiet',          metric:'3× re-engagement',  color:'text-emerald-400',body:'Reach lapsed contacts with a personal voice message. Run two different messages to see which one gets more callbacks. Act while interest is still warm.', bullets:['Segment by last activity date','A/B message testing','Callback tracking per message','Webhook to your CRM on response'] },
    { icon:Heart,        label:'Healthcare',       headline:'Reach patients on time, every time',         metric:'94% contact rate',  color:'text-rose-400',   body:'Send appointment and follow-up reminders compliantly. Calling hours enforced by patient timezone. Full audit trail and opt-out tracking included.', bullets:['Timezone-aware calling enforcement','Consent-first with opt-out key','Full call log and audit trail','Restricted calling windows by region'] },
    { icon:Building2,    label:'Collections',      headline:'Reach more accounts, recover more revenue',  metric:'3× recovery rate',  color:'text-amber-400',  body:'Intelligent retry logic reaches every reachable account. Busy lines retry in 30 min. Unanswered try again in 4 hours. Opt-outs captured instantly.', bullets:['Smart retry by outcome type','DNC and opt-out management','Calling hour enforcement by region','Per-call outcome reporting'] },
  ]
  const c = cases[active]
  const Icon = c.icon
  return (
    <section id="use-cases" className={`py-28 ${S.bgCard}`}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            One platform.<br />
            <span className="text-gradient-cyan">Every outreach scenario.</span>
          </h2>
          <p className="text-lg max-w-lg mx-auto" style={{ color: 'hsl(224 14% 55%)' }}>
            Sales teams, healthcare providers, financial services, and operations teams — all running on the same reliable platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {cases.map((cs, i) => {
            const TI = cs.icon
            return (
              <button key={cs.label} onClick={() => setActive(i)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                  active === i
                    ? 'bg-violet-500/15 border border-violet-500/30 text-violet-300'
                    : `${S.bgElevated} border ${S.border} text-white/50 hover:text-white/80`,
                )}>
                <TI className="h-4 w-4" />
                {cs.label}
              </button>
            )
          })}
        </div>
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5 animate-fade-in" key={active}>
            <h3 className="text-3xl font-bold text-white tracking-tight">{c.headline}</h3>
            <p className="leading-relaxed" style={{ color: 'hsl(224 14% 60%)' }}>{c.body}</p>
            <div className="space-y-2.5">
              {c.bullets.map(b => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-violet-400 flex-shrink-0" />
                  <span className="text-sm" style={{ color: 'hsl(224 14% 58%)' }}>{b}</span>
                </div>
              ))}
            </div>
            <Link href="/signup" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm rounded-xl">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="animate-fade-in" key={`m-${active}`}>
            <div className={`${S.bgElevated} border ${S.border} rounded-2xl p-12 text-center`}>
              <div className="h-16 w-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-5 shadow-glow-violet">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <div className={`text-6xl font-bold text-gradient mb-3`}>{c.metric}</div>
              <p className="text-sm font-medium" style={{ color: 'hsl(224 14% 52%)' }}>typical result · {c.label.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

/* ─── Features grid ─────────────────────────────────────────────── */
const Features = memo(function Features() {
  const list = [
    { icon:Target,        title:'Broadcast dialling',    desc:'Reach thousands simultaneously. One campaign, one click, any scale.' },
    { icon:Voicemail,     title:'Voicemail drop',        desc:'Detect answering machines and leave a pre-recorded message automatically.' },
    { icon:Shield,        title:'Human detection',       desc:'Know who answered — human or machine — within 3 seconds of pick-up.' },
    { icon:Activity,      title:'Live monitor',          desc:'Watch every call in real time. Outcome, duration, and quality — live.' },
    { icon:RefreshCw,     title:'Smart retry',           desc:'Busy = retry in 30 min. No answer = retry in 4 hours. Configurable per campaign.' },
    { icon:Clock,         title:'Calling hours',         desc:'Set allowed windows. Contacts in other timezones handled automatically.' },
    { icon:Lock,          title:'DNC & compliance',      desc:'Opt-out tracking, calling hour enforcement, and a full audit trail.' },
    { icon:BarChart3,     title:'Analytics',             desc:'Answer rates, human rates, best time to call, cost per contact.' },
    { icon:MessageSquare, title:'A/B testing',           desc:'Two messages, same list. See which one drives more callbacks.' },
    { icon:Key,           title:'API & webhooks',        desc:'Every call event fires a webhook. Full REST API for custom integrations.' },
    { icon:Users,         title:'Team management',       desc:'Role-based access for your whole team. Audit logs included.' },
    { icon:Globe,         title:'Any phone number',      desc:'Bring your existing numbers. No carrier lock-in. No switching required.' },
  ]
  return (
    <section className={`py-28 ${S.bg}`}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Built for teams that take<br />
            <span className="text-gradient">calling seriously</span>
          </h2>
          <p className="text-lg max-w-lg mx-auto" style={{ color: 'hsl(224 14% 55%)' }}>
            Every feature designed around the reality of running outbound calls at scale. Nothing missing.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title}
                className={`group ${S.bgCard} border ${S.border} rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/30`}>
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  <Icon className="h-[18px] w-[18px] text-violet-400" />
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
})

/* ─── Pricing ───────────────────────────────────────────────────── */
const Pricing = memo(function Pricing() {
  const plans = [
    { name:'Starter', price:49,  desc:'For teams making their first automated calls', concurrent:'10',    contacts:'50K',  campaigns:'5',  features:['10 simultaneous calls','5 active campaigns','50,000 contacts','Human detection','Live dashboard','DNC management','Email support'], popular:false },
    { name:'Growth',  price:149, desc:'For growing teams that need real scale',        concurrent:'50',    contacts:'500K', campaigns:'∞',  features:['50 simultaneous calls','Unlimited campaigns','500,000 contacts','Voicemail drop','Timezone calling','Smart retry logic','Webhooks & API','Analytics export','Recordings (30d)','Priority support'], popular:true },
    { name:'Pro',     price:399, desc:'For high-volume daily operations',              concurrent:'200',   contacts:'5M',   campaigns:'∞',  features:['200 simultaneous calls','5 million contacts','Unlimited everything','A/B message testing','Advanced analytics','Full recording archive','Custom calling windows','Slack support (4h)'], popular:false },
    { name:'Enterprise', price:0, desc:'Dedicated infrastructure and custom SLA',     concurrent:'1,000+',contacts:'∞',   campaigns:'∞',  features:['1,000+ simultaneous calls','Dedicated infrastructure','Custom SLA 99.99%','White-label option','On-premise available','Compliance audit','Dedicated account manager','24/7 support'], popular:false },
  ]
  return (
    <section id="pricing" className={`py-28 ${S.bgCard} overflow-hidden`}>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(124,58,237,0.06),transparent)]" />
      <div className="relative max-w-7xl mx-auto px-5">
        <div className="text-center mb-14">
          <div className={`${S.pill('violet')} mb-6`}>Simple, honest pricing</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            One monthly fee.<br />
            <span className="text-gradient">You keep the savings.</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'hsl(224 14% 55%)' }}>
            Voxora charges a flat platform fee. You connect your own phone numbers and pay your carrier directly — with no per-minute markup from us.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {plans.map(plan => (
            <div key={plan.name}
              className={cn(
                'relative flex flex-col rounded-2xl transition-all',
                plan.popular
                  ? `${S.bgCard} border-violet-500/50 shadow-glow-violet`
                  : `${S.bg} border-[hsl(234_22%_14%)] hover:border-violet-500/20`,
                'border',
                plan.popular && 'lg:scale-[1.03]',
              )}>
              {plan.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="flex items-center gap-1.5 px-4 py-1.5 gradient-brand rounded-full text-white text-[11px] font-bold shadow-glow-violet">
                    <Star className="h-3 w-3 fill-white" />Most popular
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
                    <p className="text-[11px] mt-1" style={{ color: 'hsl(224 14% 42%)' }}>+ your carrier cost</p>
                  </div>
                ) : (
                  <div className="mb-5 text-2xl font-bold" style={{ color: 'hsl(224 14% 55%)' }}>Custom</div>
                )}
                <div className="grid grid-cols-3 gap-1.5 mb-5">
                  {[
                    { v: plan.concurrent, l: 'calls' },
                    { v: plan.contacts,   l: 'contacts' },
                    { v: plan.campaigns,  l: 'campaigns' },
                  ].map(m => (
                    <div key={m.l} className={`rounded-xl p-2 text-center ${S.bgElevated} border ${S.border}`}>
                      <p className="text-xs font-bold text-white">{m.v}</p>
                      <p className="text-[9px] mt-0.5" style={{ color: 'hsl(224 14% 45%)' }}>{m.l}</p>
                    </div>
                  ))}
                </div>
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
                    className={`flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold border ${S.border} text-white/60 hover:text-white hover:border-violet-500/25 transition-all`}>
                    Contact sales
                  </a>
                ) : (
                  <Link href="/signup"
                    className={cn(
                      'flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold transition-all',
                      plan.popular ? 'gradient-brand text-white shadow-glow-violet hover:opacity-90' : `border ${S.border} text-white/60 hover:text-white hover:border-violet-500/25`,
                    )}>
                    Start free <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 justify-between bg-emerald-500/[0.07] border border-emerald-500/20">
          <div>
            <p className="font-bold text-base text-white mb-1 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Customers who own their calling costs pay significantly less per call
            </p>
            <p className="text-sm" style={{ color: 'hsl(224 14% 55%)' }}>
              By connecting your own numbers directly, you pay your carrier at wholesale rates — without any per-minute markup from Voxora.
            </p>
          </div>
          <Link href="/signup" className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 transition-colors">
            Start saving <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
})

/* ─── Testimonials ──────────────────────────────────────────────── */
const Testimonials = memo(function Testimonials() {
  const quotes = [
    { init:'MR', name:'Marcus R.', role:'VP Sales', stars:5, quote:'We went from 200 manual calls a day to over 4,000 automated contacts. The human detection changed how our entire team operates.', result:'20× outreach' },
    { init:'SK', name:'Sarah K.',  role:'Head of Ops', stars:5, quote:'The compliance tools were the deciding factor. Opt-out tracking, calling hours, audit logs — all automatic. Legal were happy from day one.', result:'Zero incidents' },
    { init:'DO', name:'David O.',  role:'CTO', stars:5, quote:'50,000 appointment reminders per week. No-shows dropped 68% and my team spend zero time on reminder calls. ROI was clear in two weeks.', result:'68% fewer no-shows' },
  ]
  return (
    <section className={`py-24 ${S.bg}`}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">Results that matter</h2>
          <p style={{ color: 'hsl(224 14% 52%)' }}>Real outcomes from real customers</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {quotes.map(t => (
            <div key={t.name} className={`${S.bgCard} border ${S.border} rounded-2xl p-6 transition-all duration-200 hover:border-violet-500/20 hover:-translate-y-0.5`}>
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.stars)].map((_,i) => <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />)}
              </div>
              <blockquote className="text-sm leading-relaxed mb-5" style={{ color: 'hsl(224 14% 60%)' }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className={`flex items-center justify-between pt-4 border-t ${S.border}`}>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">{t.init}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-[11px]" style={{ color: 'hsl(224 14% 48%)' }}>{t.role}</p>
                  </div>
                </div>
                <div className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  {t.result}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

/* ─── FAQ ───────────────────────────────────────────────────────── */
const FAQ = memo(function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    { q:'What phone numbers do I need?', a:'You need a phone service that supports SIP — a standard protocol used by virtually every business phone provider. You bring your own numbers and pay your carrier directly. Voxora handles the call automation on top.' },
    { q:'How does the 3-day free trial work?', a:'You get full access to your chosen plan tier for 3 days with no credit card required. At the end of the trial you can add payment details to continue — or your account pauses automatically with no charge.' },
    { q:'What happens when voicemail answers?', a:'Voxora detects voicemail within 2–3 seconds. You configure what happens: play a different pre-recorded message, drop a voicemail silently and hang up, or skip voicemail contacts entirely. Set per campaign.' },
    { q:'Is this compliant for my country?', a:'Voxora provides timezone-aware calling windows, DNC list management, opt-out key detection, and full audit logs — the foundations for compliant calling. Legal requirements vary by country and industry. Confirm the rules that apply to your situation with a legal professional.' },
    { q:'Can I connect Voxora to my CRM?', a:'Yes. Every call event — answered, human detected, voicemail, keypress, hang up — fires a webhook to any URL you configure. A full REST API gives you programmatic access to contacts, campaigns, and call logs.' },
    { q:'How do retries work?', a:'You configure retry rules per campaign. A typical setup: busy lines retry in 30 minutes, no-answer numbers retry in 4 hours, maximum 3 attempts. Contacts that opt out are never called again regardless of campaign.' },
  ]
  return (
    <section id="faq" className={`py-24 ${S.bgCard}`}>
      <div className="max-w-3xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">Common questions</h2>
          <p style={{ color: 'hsl(224 14% 52%)' }}>Everything you need to know before signing up</p>
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={i}
              className={`${S.bgCard} rounded-2xl overflow-hidden transition-all border ${open===i ? 'border-violet-500/35' : S.border}`}>
              <button onClick={() => setOpen(open===i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
                <span className="font-semibold text-sm text-white">{f.q}</span>
                <ChevronDown className={cn('h-4 w-4 text-violet-400 flex-shrink-0 transition-transform', open===i && 'rotate-180')} />
              </button>
              {open===i && (
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'hsl(224 14% 58%)' }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <p className="text-sm" style={{ color: 'hsl(224 14% 48%)' }}>
            Still have a question?{' '}
            <a href="mailto:hello@voxora.io" className="text-violet-400 hover:text-violet-300 transition-colors">
              Email hello@voxora.io
            </a>
          </p>
        </div>
      </div>
    </section>
  )
})

/* ─── CTA ───────────────────────────────────────────────────────── */
const CTA = memo(function CTA() {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(263 60% 11%) 0%, hsl(234 40% 7%) 50%, hsl(263 55% 11%) 100%)' }}>
      <div className="absolute inset-0 bg-dots opacity-15 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.14), transparent)' }} />
      <div className="relative max-w-4xl mx-auto px-5 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold mb-8 bg-violet-500/15 border-violet-500/30 text-violet-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
          </span>
          Platform live · Start your first campaign in 30 minutes
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-5 leading-[1.08]">
          Ready to automate<br />your outreach?
        </h2>
        <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: 'hsl(263 20% 68%)' }}>
          Join hundreds of sales, marketing, and operations teams reaching their audiences at scale — automatically and compliantly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link href="/signup" className="btn-primary flex items-center gap-2 px-8 py-4 text-base rounded-xl hover:-translate-y-0.5">
            Start free trial <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="mailto:sales@voxora.io"
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-base transition-all hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)' }}>
            <HeadphonesIcon className="h-4 w-4" />
            Talk to the team
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs" style={{ color: 'hsl(263 15% 55%)' }}>
          {['3-day free trial', 'No credit card', '30-minute setup', 'Cancel any time'].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

/* ─── Footer ────────────────────────────────────────────────────── */
const Footer = memo(function Footer() {
  return (
    <footer className={`${S.bg} border-t ${S.border}`}>
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
              A professional call automation platform. Reach your audience at scale — automatically, compliantly, and with full visibility.
            </p>
            <div className="flex flex-wrap gap-2">
              {['SOC 2', 'GDPR', 'HIPAA Ready', 'TCPA'].map(b => (
                <span key={b} className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold ${S.bgElevated} border ${S.border}`} style={{ color: 'hsl(224 14% 48%)' }}>{b}</span>
              ))}
            </div>
          </div>
          {[
            { title:'Platform',   links:['Broadcast Calling','Voicemail Drop','Live Monitor','Analytics','Compliance Center'] },
            { title:'Solutions',  links:['Sales Outreach','Appointment Reminders','Re-engagement','Healthcare','Collections'] },
            { title:'Developers', links:['API Reference','Webhooks','Status Page','Changelog'] },
            { title:'Company',    links:['About','Blog','Careers','Contact'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'hsl(224 14% 42%)' }}>{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}><a href="#" className={`text-sm transition-colors ${S.muted} hover:text-white`}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t ${S.border}`}>
          <p className="text-xs" style={{ color: 'hsl(224 14% 38%)' }}>© 2026 Voxora Inc. All rights reserved.</p>
          <div className="flex gap-5 text-xs" style={{ color: 'hsl(224 14% 38%)' }}>
            {['Privacy Policy','Terms of Service','Cookie Policy','Data Processing Agreement'].map(l => (
              <a key={l} href="#" className="hover:text-white/70 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
})

/* ─── Main ──────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className={`min-h-screen ${S.bg} text-white`}>
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
