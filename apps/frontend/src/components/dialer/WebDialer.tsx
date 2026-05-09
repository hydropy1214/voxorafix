'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Phone, PhoneOff, X, Delete, ChevronLeft,
  Plus, Eraser, Info, User,
} from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useSocketStore } from '@/store/socket.store'
import { useQuery } from '@tanstack/react-query'

type CallState = 'idle' | 'dialling' | 'ringing' | 'answered' | 'ended' | 'failed'

const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
]

const formatElapsed = (s: number) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

type DialMode = 'digits' | 'digits_and_name'

export function WebDialer() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [dialMode, setDialMode] = useState<DialMode>('digits')
  const [number, setNumber] = useState('')
  const [contactName, setContactName] = useState('')
  const [callState, setCallState] = useState<CallState>('idle')
  const [callUuid, setCallUuid] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [amdResult, setAmdResult] = useState<string | null>(null)
  const [selectedSip, setSelectedSip] = useState<string>('')

  const events = useSocketStore(s => s.events)

  const { data: sipAccounts = [] } = useQuery({
    queryKey: ['sip-accounts'],
    queryFn: () => api.get('/sip-accounts').then(r => r.data),
  })

  const registeredSips = useMemo(
    () => sipAccounts.filter((s: { status: string }) => s.status === 'REGISTERED'),
    [sipAccounts],
  )

  useEffect(() => {
    if (!selectedSip && registeredSips.length > 0) {
      setSelectedSip(registeredSips[0].id)
    }
  }, [registeredSips, selectedSip])

  useEffect(() => {
    if (!callUuid) return
    const hit = events.find((e: { uuid?: string; type?: string }) => e.uuid === callUuid)
    if (!hit?.type) return

    if (hit.type === 'call:dialing') {
      setCallState(s => (s === 'dialling' ? 'ringing' : s))
    }
    if (hit.type === 'call:answered') {
      setCallState('answered')
      setAmdResult(hit.amdResult ?? null)
    }
    if (hit.type === 'call:hangup' || hit.type === 'call:completed') {
      setCallState('ended')
      setCallUuid(null)
    }
  }, [events, callUuid])

  useEffect(() => {
    if (callState !== 'answered') {
      setElapsed(0)
      return
    }
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [callState])

  const dial = useCallback(async () => {
    const digits = number.replace(/\D/g, '')
    if (digits.length < 7) {
      toast.error('Enter at least 7 digits')
      return
    }
    if (!selectedSip) {
      toast.error('No registered phone account found')
      return
    }

    setCallState('dialling')
    setAmdResult(null)
    setElapsed(0)

    const payload: { phone: string; sipAccountId: string; contactName?: string } = {
      phone: number.trim(),
      sipAccountId: selectedSip,
    }
    if (dialMode === 'digits_and_name' && contactName.trim()) {
      payload.contactName = contactName.trim()
    }

    try {
      const res = await api.post('/campaigns/quick-call', payload)
      setCallUuid(res.data.uuid)
      setCallState('ringing')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setCallState('failed')
      toast.error(err.response?.data?.message || 'Call failed to connect')
      setTimeout(() => setCallState('idle'), 3200)
    }
  }, [number, selectedSip, dialMode, contactName])

  const hangup = useCallback(async () => {
    if (callUuid) {
      try {
        await api.post(`/campaigns/hangup/${callUuid}`)
      } catch {
        /* uuid_kill best-effort */
      }
    }
    setCallState('ended')
    setCallUuid(null)
    setTimeout(() => setCallState('idle'), 1400)
  }, [callUuid])

  const pressKey = (k: string) => {
    if (callState !== 'idle') return
    setNumber(prev => (prev.length < 22 ? prev + k : prev))
  }

  const addPlusPrefix = () => {
    if (callState !== 'idle') return
    setNumber(prev => (prev.startsWith('+') ? prev : `+${prev.replace(/^\+/, '')}`))
  }

  const clearNumber = () => {
    if (callState !== 'idle') return
    setNumber('')
  }

  const deleteKey = () => setNumber(prev => prev.slice(0, -1))

  const closePanel = () => {
    setPanelOpen(false)
    if (callState !== 'idle' && callState !== 'ended' && callState !== 'failed') {
      hangup()
    }
  }

  const stateLabel: Record<CallState, string> = {
    idle: '',
    dialling: 'Connecting…',
    ringing: 'Ringing…',
    answered: formatElapsed(elapsed),
    ended: 'Call ended',
    failed: 'Failed to connect',
  }

  const stateColor: Record<CallState, string> = {
    idle: 'text-muted-foreground',
    dialling: 'text-amber-400',
    ringing: 'text-amber-400',
    answered: 'text-emerald-400',
    ended: 'text-muted-foreground',
    failed: 'text-red-400',
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setPanelOpen(o => !o)}
        title={panelOpen ? 'Close dialer' : 'Open dialer'}
        className={cn(
          'fixed bottom-6 right-6 z-[60] h-14 w-14 gradient-brand rounded-2xl flex items-center justify-center shadow-glow-violet hover:opacity-90 transition-all hover:-translate-y-0.5 active:translate-y-0',
          panelOpen && 'ring-2 ring-brand-400/50 ring-offset-2 ring-offset-background',
        )}
      >
        <Phone className="h-6 w-6 text-white" />
      </button>

      <button
        type="button"
        aria-hidden={!panelOpen}
        className={cn(
          'fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300',
          panelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => closePanel()}
      />

      <aside
        className={cn(
          'fixed top-0 right-0 z-[58] flex h-full w-full max-w-[400px] flex-col border-l border-border bg-card shadow-modal transition-transform duration-300 ease-out',
          panelOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 gradient-brand">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => closePanel()}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <Phone className="h-4 w-4 flex-shrink-0 text-white" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">Web Dialer</p>
              <p className="truncate text-[10px] text-white/70">Outbound via your SIP account</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => closePanel()}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close dialer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="flex gap-2 rounded-xl bg-muted/25 p-1">
            <button
              type="button"
              onClick={() => setDialMode('digits')}
              disabled={callState !== 'idle'}
              className={cn(
                'flex-1 rounded-lg py-2 text-[11px] font-semibold transition-all',
                dialMode === 'digits' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Number only
            </button>
            <button
              type="button"
              onClick={() => setDialMode('digits_and_name')}
              disabled={callState !== 'idle'}
              className={cn(
                'flex-1 rounded-lg py-2 text-[11px] font-semibold transition-all',
                dialMode === 'digits_and_name' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Name + number
            </button>
          </div>

          {dialMode === 'digits_and_name' && (
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <User className="h-3 w-3" />
                Contact label (optional)
              </label>
              <input
                type="text"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="e.g. Acme — Jane Doe"
                disabled={callState !== 'idle'}
                className="input-field text-sm"
                maxLength={120}
              />
              <p className="text-[10px] text-muted-foreground/80 leading-snug">
                Shown in Call logs only; not sent to the carrier.
              </p>
            </div>
          )}

          {registeredSips.length > 1 && (
            <select
              value={selectedSip}
              onChange={e => setSelectedSip(e.target.value)}
              className="input-field py-2 text-xs"
              disabled={callState !== 'idle'}
            >
              {registeredSips.map((s: { id: string; name: string }) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}

          {registeredSips.length === 0 && (
            <div className="flex gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-[11px] text-amber-200">
              <Info className="h-4 w-4 flex-shrink-0" />
              No registered phone accounts. Add and test a line under Phone Accounts first.
            </div>
          )}

          <div className="rounded-xl border border-border/80 bg-muted/15 p-3">
            <div className="mb-2 flex items-start gap-2 text-[11px] text-muted-foreground leading-snug">
              <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-cyan-400/90" />
              <span>
                Voice audio rides on your SIP trunk to the handset network. This panel places the call and streams live status —
                browser microphone listening or speaking is not wired here.
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+1 or digits"
                value={number}
                onChange={e => setNumber(e.target.value)}
                disabled={callState !== 'idle'}
                className="input-field flex-1 font-mono text-lg font-semibold tracking-wide"
              />
              <button
                type="button"
                onClick={addPlusPrefix}
                disabled={callState !== 'idle'}
                title="Leading + for country code"
                className="btn-secondary px-3 py-2 text-lg font-bold"
              >
                +
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearNumber}
                disabled={callState !== 'idle' || !number}
                className="btn-ghost flex flex-1 items-center justify-center gap-1.5 py-2 text-xs"
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </button>
              <button
                type="button"
                onClick={deleteKey}
                disabled={callState !== 'idle' || !number}
                className="btn-ghost flex flex-1 items-center justify-center gap-1.5 py-2 text-xs"
              >
                <Delete className="h-3.5 w-3.5" />
                Backspace
              </button>
            </div>
          </div>

          {callState !== 'idle' && (
            <div className={cn('text-center text-xs font-semibold', stateColor[callState])}>
              {callState === 'answered' && amdResult && (
                <span className="mr-1.5">{amdResult === 'HUMAN' ? 'Human answered' : 'Voicemail / machine'} · </span>
              )}
              {stateLabel[callState]}
            </div>
          )}

          {callState === 'idle' && (
            <div className="grid grid-cols-3 gap-2">
              {KEYPAD.flat().map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => pressKey(k)}
                  className="btn-secondary h-12 rounded-xl text-base font-bold active:scale-[0.97]"
                >
                  {k}
                </button>
              ))}
            </div>
          )}

          <div className="mt-auto flex justify-center pb-2 pt-2">
            {callState === 'idle' ? (
              <button
                type="button"
                onClick={dial}
                disabled={number.replace(/\D/g, '').length < 7 || registeredSips.length === 0}
                className="flex h-16 w-16 items-center justify-center rounded-full gradient-brand shadow-glow-violet transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Phone className="h-7 w-7 text-white" />
              </button>
            ) : callState === 'ended' || callState === 'failed' ? (
              <button
                type="button"
                onClick={() => {
                  setCallState('idle')
                  setNumber('')
                  setAmdResult(null)
                }}
                className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted/30 hover:bg-muted/50"
              >
                <Phone className="h-7 w-7 text-muted-foreground" />
              </button>
            ) : (
              <button
                type="button"
                onClick={hangup}
                className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-red-600 shadow-glow-red hover:bg-red-500 active:scale-95"
              >
                <PhoneOff className="h-7 w-7 text-white" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
