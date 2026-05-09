'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Phone, PhoneOff, X, Delete, Minimize2, Maximize2,
  Mic, MicOff, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useSocketStore } from '@/store/socket.store'
import { useQuery } from '@tanstack/react-query'

type CallState = 'idle' | 'dialling' | 'ringing' | 'answered' | 'ended' | 'failed'

const KEYPAD = [
  ['1','2','3'],
  ['4','5','6'],
  ['7','8','9'],
  ['*','0','#'],
]

const formatElapsed = (s: number) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2,'0')}`
}

export function WebDialer() {
  const [open, setOpen] = useState(false)
  const [minimised, setMinimised] = useState(false)
  const [number, setNumber] = useState('')
  const [callState, setCallState] = useState<CallState>('idle')
  const [callUuid, setCallUuid] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [amdResult, setAmdResult] = useState<string | null>(null)
  const [muted, setMuted] = useState(false)
  const [selectedSip, setSelectedSip] = useState<string>('')
  const events = useSocketStore(s => s.events)

  const { data: sipAccounts = [] } = useQuery({
    queryKey: ['sip-accounts'],
    queryFn: () => api.get('/sip-accounts').then(r => r.data),
  })
  const registeredSips = sipAccounts.filter((s: any) => s.status === 'REGISTERED')

  // Auto-select first registered SIP
  useEffect(() => {
    if (!selectedSip && registeredSips.length > 0) {
      setSelectedSip(registeredSips[0].id)
    }
  }, [registeredSips, selectedSip])

  // Listen for call events from WebSocket
  useEffect(() => {
    if (!callUuid || !events.length) return
    const ev = events[0]
    if (!ev || (ev as any).uuid !== callUuid) return

    if (ev.type === 'call:answered' || ev.type === 'call:update') {
      setCallState('answered')
      setAmdResult(ev.amdResult ?? null)
    }
    if (ev.type === 'call:hangup' || ev.type === 'call:completed') {
      setCallState('ended')
      setCallUuid(null)
    }
  }, [events, callUuid])

  // Elapsed timer
  useEffect(() => {
    if (callState !== 'answered') { setElapsed(0); return }
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [callState])

  const dial = useCallback(async () => {
    if (!number || number.length < 7) { toast.error('Enter a valid phone number'); return }
    if (!selectedSip) { toast.error('No registered phone account found'); return }

    setCallState('dialling')
    setAmdResult(null)
    setElapsed(0)

    try {
      const res = await api.post('/campaigns/quick-call', {
        phone: number,
        sipAccountId: selectedSip,
      })
      setCallUuid(res.data.uuid)
      setCallState('ringing')

      // Timeout to answered state if no WS event
      setTimeout(() => {
        setCallState(s => s === 'ringing' ? 'answered' : s)
      }, 8000)
    } catch (e: any) {
      setCallState('failed')
      toast.error(e.response?.data?.message || 'Call failed to connect')
      setTimeout(() => setCallState('idle'), 3000)
    }
  }, [number, selectedSip])

  const hangup = useCallback(async () => {
    if (callUuid) {
      try { await api.post(`/campaigns/hangup/${callUuid}`) } catch {}
    }
    setCallState('ended')
    setCallUuid(null)
    setTimeout(() => setCallState('idle'), 1500)
  }, [callUuid])

  const pressKey = (k: string) => {
    if (callState !== 'idle') return
    setNumber(prev => prev.length < 18 ? prev + k : prev)
  }

  const deleteKey = () => setNumber(prev => prev.slice(0, -1))

  const stateLabel: Record<CallState, string> = {
    idle:      '',
    dialling:  'Connecting...',
    ringing:   'Ringing...',
    answered:  formatElapsed(elapsed),
    ended:     'Call ended',
    failed:    'Failed to connect',
  }

  const stateColor: Record<CallState, string> = {
    idle:     'text-muted-foreground',
    dialling: 'text-amber-400',
    ringing:  'text-amber-400',
    answered: 'text-emerald-400',
    ended:    'text-muted-foreground',
    failed:   'text-red-400',
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Open dialler"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 gradient-brand rounded-2xl flex items-center justify-center shadow-glow-violet hover:opacity-90 transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        <Phone className="h-6 w-6 text-white" />
      </button>
    )
  }

  return (
    <div className={cn(
      'fixed z-50 right-6 bottom-6 transition-all duration-200',
      minimised ? 'w-64' : 'w-72',
    )}>
      <div className="bg-card border border-border rounded-2xl shadow-modal overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border gradient-brand">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Quick Dial</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setMinimised(!minimised)}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              {minimised ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
            </button>
            <button onClick={() => { setOpen(false); if (callState !== 'idle') hangup() }}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {!minimised && (
          <div className="p-4 space-y-4">
            {/* SIP selector */}
            {registeredSips.length > 1 && (
              <select
                value={selectedSip}
                onChange={e => setSelectedSip(e.target.value)}
                className="input-field text-xs py-1.5"
                disabled={callState !== 'idle'}
              >
                {registeredSips.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}

            {registeredSips.length === 0 && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                No registered phone accounts. Add one in Phone Accounts.
              </div>
            )}

            {/* Number display */}
            <div className="relative">
              <div className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all',
                callState === 'idle' ? 'border-border bg-muted/20' : 'border-violet-500/40 bg-violet-500/5',
              )}>
                <span className="font-mono text-xl font-bold tracking-wider text-white flex-1 min-w-0 truncate">
                  {number || <span className="text-muted-foreground/50 font-normal text-base">Enter number</span>}
                </span>
                {callState === 'idle' && number && (
                  <button onClick={deleteKey} className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                    <Delete className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Call state indicator */}
              {callState !== 'idle' && (
                <div className={cn('text-center text-xs font-semibold mt-1.5', stateColor[callState])}>
                  {callState === 'answered' && amdResult && (
                    <span className="mr-1.5">{amdResult === 'HUMAN' ? '👤 Human' : '📱 Voicemail'} ·</span>
                  )}
                  {stateLabel[callState]}
                </div>
              )}
            </div>

            {/* Keypad */}
            {callState === 'idle' && (
              <div className="grid grid-cols-3 gap-1.5">
                {KEYPAD.flat().map(k => (
                  <button
                    key={k}
                    onClick={() => pressKey(k)}
                    className="h-11 rounded-xl text-base font-bold text-foreground bg-muted/30 hover:bg-muted/60 active:scale-95 transition-all border border-border/50"
                  >
                    {k}
                  </button>
                ))}
              </div>
            )}

            {/* Active call controls */}
            {callState === 'answered' && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setMuted(!muted)}
                  className={cn(
                    'h-11 w-11 rounded-full flex items-center justify-center transition-all border',
                    muted
                      ? 'bg-red-500/15 border-red-500/30 text-red-400'
                      : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground',
                  )}
                  title={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>
            )}

            {/* Dial / Hang up button */}
            <div className="flex justify-center">
              {callState === 'idle' ? (
                <button
                  onClick={dial}
                  disabled={!number || number.length < 7 || registeredSips.length === 0}
                  className="h-14 w-14 rounded-full gradient-brand flex items-center justify-center shadow-glow-violet hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Phone className="h-6 w-6 text-white" />
                </button>
              ) : callState === 'ended' || callState === 'failed' ? (
                <button
                  onClick={() => { setCallState('idle'); setNumber('') }}
                  className="h-14 w-14 rounded-full bg-muted/40 border border-border flex items-center justify-center hover:bg-muted/70 transition-all"
                >
                  <Phone className="h-6 w-6 text-muted-foreground" />
                </button>
              ) : (
                <button
                  onClick={hangup}
                  className="h-14 w-14 rounded-full bg-red-600 flex items-center justify-center shadow-glow-red hover:bg-red-500 active:scale-95 transition-all animate-pulse"
                >
                  <PhoneOff className="h-6 w-6 text-white" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Minimised active call display */}
        {minimised && callState !== 'idle' && (
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono font-bold text-white">{number}</p>
              <p className={cn('text-[10px] font-semibold', stateColor[callState])}>{stateLabel[callState]}</p>
            </div>
            {(callState === 'dialling' || callState === 'ringing' || callState === 'answered') && (
              <button onClick={hangup} className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center">
                <PhoneOff className="h-3.5 w-3.5 text-white" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
