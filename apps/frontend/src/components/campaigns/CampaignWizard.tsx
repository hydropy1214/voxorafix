'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  X, ChevronRight, ChevronLeft, Megaphone, Users, FileAudio,
  Clock, Zap, CheckCircle2, AlertCircle, Loader2, Radio, Phone,
  Voicemail, Calendar, Info, Shield,
} from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface WizardData {
  // Step 1 — Type & name
  name: string
  description: string
  type: 'BROADCAST' | 'VOICEMAIL_DROP' | 'POWER_DIAL'

  // Step 2 — Contacts
  contactListId: string
  sipAccountId: string

  // Step 3 — Audio & AMD
  audioFileId: string
  voicemailAudioId?: string
  amdEnabled: boolean
  amdAction: 'PLAY_ON_HUMAN' | 'PLAY_ON_BOTH' | 'DROP_VOICEMAIL' | 'HANGUP_ON_MACHINE'

  // Step 4 — Timing & compliance
  maxConcurrentCalls: number
  callsPerSecond: number
  callerIdNumber: string
  callerIdName: string
  retryAttempts: number
  retryDelay: number
  scheduledAt: string

  // Step 5 — Review
}

const DIALER_TYPES = [
  {
    id: 'BROADCAST',
    icon: Radio,
    title: 'Broadcast',
    desc: 'Play a recorded message to every contact. Best for announcements, reminders, and one-way outreach.',
    badge: 'Most common',
  },
  {
    id: 'VOICEMAIL_DROP',
    icon: Voicemail,
    title: 'Voicemail Drop',
    desc: 'Only leave messages on voicemail. Skip contacts who answer live. Ideal for non-intrusive outreach.',
    badge: null,
  },
  {
    id: 'POWER_DIAL',
    icon: Phone,
    title: 'Power Dial',
    desc: 'Dial one number at a time, moving to the next automatically. Use when live agent follow-up is planned.',
    badge: 'Agent-assisted',
  },
]

const AMD_ACTIONS = [
  { id: 'PLAY_ON_HUMAN', label: 'Play for humans only', desc: 'Human = play message · Voicemail = hang up' },
  { id: 'PLAY_ON_BOTH', label: 'Play for everyone', desc: 'Human and voicemail both hear the message' },
  { id: 'DROP_VOICEMAIL', label: 'Drop voicemail message', desc: 'Human = play message A · Voicemail = play message B then hang up' },
  { id: 'HANGUP_ON_MACHINE', label: 'Skip voicemail entirely', desc: 'Human = play message · Voicemail = silent hang up' },
]

const STEPS = [
  { n: 1, label: 'Type & Name', icon: Megaphone },
  { n: 2, label: 'Contacts & SIP', icon: Users },
  { n: 3, label: 'Audio & AMD', icon: FileAudio },
  { n: 4, label: 'Timing & Compliance', icon: Clock },
  { n: 5, label: 'Review & Launch', icon: Zap },
]

export function CampaignWizard({ onClose, onCreated }: { onClose: () => void; onCreated?: (id: string) => void }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<Partial<WizardData>>({
    type: 'BROADCAST',
    amdEnabled: true,
    amdAction: 'PLAY_ON_HUMAN',
    maxConcurrentCalls: 5,
    callsPerSecond: 1,
    retryAttempts: 2,
    retryDelay: 300,
    callerIdNumber: '',
    callerIdName: '',
  })
  const qc = useQueryClient()

  const { data: contactLists = [] } = useQuery({
    queryKey: ['contact-lists'],
    queryFn: () => api.get('/contacts/lists').then(r => r.data),
  })
  const { data: sipAccounts = [] } = useQuery({
    queryKey: ['sip-accounts'],
    queryFn: () => api.get('/sip-accounts').then(r => r.data),
  })
  const { data: audioFiles = [] } = useQuery({
    queryKey: ['audio-files'],
    queryFn: () => api.get('/audio-files').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (d: Partial<WizardData>) => api.post('/campaigns', {
      name: d.name,
      description: d.description,
      type: d.type,
      sipAccountId: d.sipAccountId,
      contactListId: d.contactListId,
      audioFileId: d.audioFileId,
      voicemailAudioId: d.voicemailAudioId || undefined,
      amdEnabled: d.amdEnabled,
      amdAction: d.amdAction,
      maxConcurrentCalls: d.maxConcurrentCalls,
      callsPerSecond: d.callsPerSecond,
      callerIdNumber: d.callerIdNumber || undefined,
      callerIdName: d.callerIdName || undefined,
      retryAttempts: d.retryAttempts,
      retryDelay: d.retryDelay,
      scheduledAt: d.scheduledAt || undefined,
    }).then(r => r.data),
    onSuccess: (resp) => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campaign created!', { description: 'Ready to launch when you are.' })
      if (onCreated) onCreated(resp.id)
      onClose()
    },
    onError: (e: any) => {
      const msg = Array.isArray(e.response?.data?.message)
        ? e.response.data.message.join(', ')
        : e.response?.data?.message || 'Failed to create campaign'
      toast.error(msg)
    },
  })

  const update = (partial: Partial<WizardData>) => setData(prev => ({ ...prev, ...partial }))

  const canAdvance = () => {
    if (step === 1) return !!(data.name && data.name.trim() && data.type)
    if (step === 2) return !!(data.contactListId && data.sipAccountId)
    if (step === 3) return !!(data.audioFileId)
    if (step === 4) return true
    return true
  }

  const selectedList = contactLists.find((l: any) => l.id === data.contactListId)
  const selectedSip = sipAccounts.find((s: any) => s.id === data.sipAccountId)
  const selectedAudio = audioFiles.filter((f: any) => f.status === 'READY').find((f: any) => f.id === data.audioFileId)
  const selectedVoicemail = audioFiles.filter((f: any) => f.status === 'READY').find((f: any) => f.id === data.voicemailAudioId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-modal flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-bold text-lg">New Campaign</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Step {step} of {STEPS.length}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const done = step > s.n
              const active = step === s.n
              return (
                <div key={s.n} className="flex items-center gap-1 flex-1">
                  <button
                    onClick={() => done && setStep(s.n)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex-shrink-0',
                      active ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30' :
                      done ? 'text-green-400 cursor-pointer hover:bg-green-500/10' :
                      'text-muted-foreground/50',
                    )}
                  >
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={cn('flex-1 h-px', done ? 'bg-green-500/30' : 'bg-border')} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* STEP 1 — Type & Name */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Campaign Name *
                </label>
                <input
                  value={data.name || ''}
                  onChange={e => update({ name: e.target.value })}
                  placeholder="e.g. Q3 Sales Outreach, Appointment Reminders"
                  className="input-field"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Description <span className="text-muted-foreground/60 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  value={data.description || ''}
                  onChange={e => update({ description: e.target.value })}
                  placeholder="What is this campaign for?"
                  rows={2}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">
                  Dialer Mode *
                </label>
                <div className="space-y-2.5">
                  {DIALER_TYPES.map(t => {
                    const Icon = t.icon
                    const selected = data.type === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => update({ type: t.id as any })}
                        className={cn(
                          'w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all',
                          selected
                            ? 'border-brand-500/50 bg-brand-500/[0.07] shadow-glow-brand/10'
                            : 'border-border hover:border-brand-500/20 bg-card',
                        )}
                      >
                        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0',
                          selected ? 'bg-brand-500/15' : 'bg-muted/50'
                        )}>
                          <Icon className={cn('h-5 w-5', selected ? 'text-brand-400' : 'text-muted-foreground')} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{t.title}</span>
                            {t.badge && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-brand-500/10 text-brand-300 border border-brand-500/20 rounded-full font-medium">
                                {t.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                        </div>
                        {selected && <CheckCircle2 className="h-4 w-4 text-brand-400 flex-shrink-0 mt-0.5" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Contacts & SIP */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              {/* Contact list */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Contact List *
                </label>
                {contactLists.length === 0 ? (
                  <div className="p-4 bg-yellow-500/[0.07] border border-yellow-500/20 rounded-xl text-sm text-yellow-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>No contact lists found. <a href="/contacts" className="underline">Create one first</a>.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contactLists.map((list: any) => (
                      <button
                        key={list.id}
                        onClick={() => update({ contactListId: list.id })}
                        className={cn(
                          'w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all',
                          data.contactListId === list.id
                            ? 'border-brand-500/50 bg-brand-500/[0.07]'
                            : 'border-border hover:border-brand-500/20',
                        )}
                      >
                        <div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{list.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {list.validCount?.toLocaleString()} valid contacts
                          </p>
                        </div>
                        {data.contactListId === list.id && <CheckCircle2 className="h-4 w-4 text-brand-400 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SIP account */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Phone Account (SIP) *
                </label>
                {sipAccounts.length === 0 ? (
                  <div className="p-4 bg-yellow-500/[0.07] border border-yellow-500/20 rounded-xl text-sm text-yellow-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>No phone accounts found. <a href="/sip-accounts" className="underline">Add one first</a>.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sipAccounts.map((sip: any) => {
                      const isRegistered = sip.status === 'REGISTERED'
                      return (
                        <button
                          key={sip.id}
                          onClick={() => isRegistered && update({ sipAccountId: sip.id })}
                          disabled={!isRegistered}
                          className={cn(
                            'w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all',
                            data.sipAccountId === sip.id
                              ? 'border-brand-500/50 bg-brand-500/[0.07]'
                              : isRegistered
                              ? 'border-border hover:border-brand-500/20'
                              : 'border-border opacity-50 cursor-not-allowed',
                          )}
                        >
                          <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0',
                            isRegistered ? 'bg-green-500/15' : 'bg-muted/50'
                          )}>
                            <Radio className={cn('h-4 w-4', isRegistered ? 'text-green-400' : 'text-muted-foreground')} />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{sip.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {sip.username} · {sip.maxConcurrentCalls} max concurrent
                            </p>
                          </div>
                          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
                            isRegistered ? 'bg-green-500/15 text-green-400' : 'bg-muted text-muted-foreground'
                          )}>
                            {sip.status}
                          </span>
                          {data.sipAccountId === sip.id && <CheckCircle2 className="h-4 w-4 text-brand-400 flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 — Audio & AMD */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              {/* Audio file */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Main Audio Message *
                </label>
                {audioFiles.filter((f: any) => f.status === 'READY').length === 0 ? (
                  <div className="p-4 bg-yellow-500/[0.07] border border-yellow-500/20 rounded-xl text-sm text-yellow-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>No ready audio files. <a href="/audio-files" className="underline">Upload one first</a>.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {audioFiles.filter((f: any) => f.status === 'READY').map((file: any) => (
                      <button
                        key={file.id}
                        onClick={() => update({ audioFileId: file.id })}
                        className={cn(
                          'w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all',
                          data.audioFileId === file.id
                            ? 'border-brand-500/50 bg-brand-500/[0.07]'
                            : 'border-border hover:border-brand-500/20',
                        )}
                      >
                        <div className="h-9 w-9 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                          <FileAudio className="h-4 w-4 text-brand-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{file.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {file.format?.toUpperCase()} · {file.duration ?? 0}s
                          </p>
                        </div>
                        {data.audioFileId === file.id && <CheckCircle2 className="h-4 w-4 text-brand-400 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* AMD toggle */}
              <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">Answering Machine Detection</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Detect whether a human or voicemail answered within 3 seconds
                    </p>
                  </div>
                  <button
                    onClick={() => update({ amdEnabled: !data.amdEnabled })}
                    className={cn(
                      'h-6 w-11 rounded-full transition-colors flex-shrink-0',
                      data.amdEnabled ? 'bg-brand-500' : 'bg-muted/60',
                    )}
                  >
                    <div className={cn(
                      'h-5 w-5 rounded-full bg-white shadow-sm mx-0.5 transition-transform',
                      data.amdEnabled ? 'translate-x-5' : 'translate-x-0',
                    )} />
                  </button>
                </div>

                {data.amdEnabled && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      When voicemail is detected:
                    </p>
                    {AMD_ACTIONS.map(a => (
                      <button
                        key={a.id}
                        onClick={() => update({ amdAction: a.id as any })}
                        className={cn(
                          'w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all text-xs',
                          data.amdAction === a.id
                            ? 'border-brand-500/40 bg-brand-500/[0.07] text-brand-200'
                            : 'border-border/50 hover:border-border',
                        )}
                      >
                        <div className={cn('h-4 w-4 rounded-full border-2 flex-shrink-0 mt-0.5',
                          data.amdAction === a.id ? 'border-brand-400 bg-brand-400' : 'border-muted-foreground/40'
                        )} />
                        <div>
                          <span className="font-semibold">{a.label}</span>
                          <span className="text-muted-foreground ml-2">{a.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Voicemail audio if DROP */}
              {data.amdEnabled && data.amdAction === 'DROP_VOICEMAIL' && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                    Voicemail Message (for machine answers)
                  </label>
                  <select
                    value={data.voicemailAudioId || ''}
                    onChange={e => update({ voicemailAudioId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select voicemail audio...</option>
                    {audioFiles.filter((f: any) => f.status === 'READY').map((f: any) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — Timing & Compliance */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-start gap-2 p-3.5 bg-blue-500/[0.07] border border-blue-500/20 rounded-xl">
                <Shield className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-300">Compliance settings</p>
                  <p className="text-[11px] text-blue-300/70 mt-0.5">
                    Configure these carefully. Respecting calling hours and opt-out lists protects your business and your recipients.
                  </p>
                </div>
              </div>

              {/* Concurrency + CPS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Max Concurrent Calls
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={data.maxConcurrentCalls || 5}
                    onChange={e => update({ maxConcurrentCalls: parseInt(e.target.value) })}
                    className="input-field"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Max: {selectedSip?.maxConcurrentCalls ?? 10}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Calls Per Second
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    max="100"
                    value={data.callsPerSecond || 1}
                    onChange={e => update({ callsPerSecond: parseFloat(e.target.value) })}
                    className="input-field"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Recommended: 1–5 CPS</p>
                </div>
              </div>

              {/* Caller ID */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Caller ID Number <span className="text-muted-foreground/60 font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    value={data.callerIdNumber || ''}
                    onChange={e => update({ callerIdNumber: e.target.value })}
                    placeholder="+15551234567"
                    className="input-field"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Leave blank — provider assigns automatically</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Caller Name <span className="text-muted-foreground/60 font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    value={data.callerIdName || ''}
                    onChange={e => update({ callerIdName: e.target.value })}
                    placeholder="My Company"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Retry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Retry Attempts
                  </label>
                  <select
                    value={data.retryAttempts ?? 2}
                    onChange={e => update({ retryAttempts: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    <option value={0}>No retries</option>
                    <option value={1}>1 retry</option>
                    <option value={2}>2 retries (recommended)</option>
                    <option value={3}>3 retries</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Retry Delay
                  </label>
                  <select
                    value={data.retryDelay ?? 300}
                    onChange={e => update({ retryDelay: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    <option value={300}>5 minutes</option>
                    <option value={1800}>30 minutes</option>
                    <option value={3600}>1 hour</option>
                    <option value={14400}>4 hours</option>
                    <option value={86400}>Next day</option>
                  </select>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Schedule Start <span className="text-muted-foreground/60 font-normal normal-case">(optional — leave blank to start manually)</span>
                </label>
                <input
                  type="datetime-local"
                  value={data.scheduledAt || ''}
                  onChange={e => update({ scheduledAt: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* STEP 5 — Review */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-muted-foreground">Review your campaign settings before creating.</p>

              <div className="space-y-3">
                {[
                  {
                    label: 'Campaign',
                    items: [
                      { k: 'Name', v: data.name },
                      { k: 'Type', v: data.type },
                      { k: 'Description', v: data.description || 'None' },
                    ],
                  },
                  {
                    label: 'Contacts & SIP',
                    items: [
                      { k: 'Contact List', v: selectedList?.name },
                      { k: 'Contacts', v: selectedList?.validCount?.toLocaleString() },
                      { k: 'Phone Account', v: selectedSip?.name },
                      { k: 'SIP Status', v: selectedSip?.status },
                    ],
                  },
                  {
                    label: 'Audio & AMD',
                    items: [
                      { k: 'Audio', v: selectedAudio?.name },
                      { k: 'AMD', v: data.amdEnabled ? `Enabled — ${data.amdAction}` : 'Disabled' },
                      { k: 'Voicemail Audio', v: selectedVoicemail?.name || 'None' },
                    ],
                  },
                  {
                    label: 'Timing',
                    items: [
                      { k: 'Concurrent Calls', v: data.maxConcurrentCalls },
                      { k: 'Calls/sec', v: data.callsPerSecond },
                      { k: 'Retries', v: `${data.retryAttempts} × (${data.retryDelay}s delay)` },
                      { k: 'Caller ID', v: data.callerIdNumber || 'Auto' },
                      { k: 'Scheduled', v: data.scheduledAt ? new Date(data.scheduledAt).toLocaleString() : 'Manual start' },
                    ],
                  },
                ].map(section => (
                  <div key={section.label} className="bg-muted/20 rounded-xl p-4 border border-border/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-3">{section.label}</p>
                    <div className="space-y-1.5">
                      {section.items.map(item => (
                        <div key={item.k} className="flex items-center justify-between text-xs gap-4">
                          <span className="text-muted-foreground">{item.k}</span>
                          <span className={cn('font-medium truncate text-right', !item.v && 'text-muted-foreground/50')}>
                            {item.v ?? '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-6 border-t border-border flex-shrink-0 gap-3">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="btn-secondary flex items-center gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            {step > 1 ? 'Back' : 'Cancel'}
          </button>

          {step < 5 ? (
            <button
              onClick={() => canAdvance() && setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="btn-primary flex items-center gap-1.5 disabled:opacity-40"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => createMutation.mutate(data)}
              disabled={createMutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Create Campaign
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
