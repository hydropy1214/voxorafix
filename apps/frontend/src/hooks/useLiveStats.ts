'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'

export interface LiveStats {
  activeCalls: number
  callsPerMinute: number
  activeCampaigns: number
  recentEvents: any[]
}

export interface LiveEvent {
  type: string
  uuid?: string
  phone?: string
  campaignId?: string
  hangupCause?: string
  hangupMessage?: string
  duration?: number
  amdResult?: string
  rtpMos?: number
  error?: string
  code?: string
  severity?: 'warning' | 'error' | 'critical'
  suggestion?: string
  status?: string
  timestamp: string
}

const RECONNECT_DELAY = 2000
const MAX_EVENTS = 200

export function useLiveStats() {
  const token = useAuthStore(s => s.accessToken)
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [liveStats, setLiveStats] = useState<LiveStats>({
    activeCalls: 0,
    callsPerMinute: 0,
    activeCampaigns: 0,
    recentEvents: [],
  })
  const [events, setEvents] = useState<LiveEvent[]>([])

  const addEvent = useCallback((event: LiveEvent) => {
    setEvents(prev => [event, ...prev.slice(0, MAX_EVENTS - 1)])
  }, [])

  useEffect(() => {
    if (!token) return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'

    const socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: RECONNECT_DELAY,
      timeout: 10000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join:live-monitor')
    })

    socket.on('disconnect', (reason) => {
      setConnected(false)
      if (reason === 'io server disconnect') {
        // Server kicked us — reauth
        socket.connect()
      }
    })

    socket.on('connect_error', () => {
      setConnected(false)
    })

    // Stats update from server
    socket.on('stats:update', (data: Partial<LiveStats>) => {
      setLiveStats(prev => ({ ...prev, ...data }))
    })

    // Call lifecycle events
    socket.on('call:dialing', (event: LiveEvent) => {
      addEvent(event)
    })

    socket.on('call:answered', (event: LiveEvent) => {
      setLiveStats(prev => ({ ...prev, activeCalls: prev.activeCalls + 1 }))
      addEvent(event)
    })

    socket.on('call:hangup', (event: LiveEvent) => {
      setLiveStats(prev => ({ ...prev, activeCalls: Math.max(0, prev.activeCalls - 1) }))
      addEvent(event)
    })

    socket.on('call:completed', (event: LiveEvent) => {
      setLiveStats(prev => ({ ...prev, activeCalls: Math.max(0, prev.activeCalls - 1) }))
      addEvent(event)
    })

    socket.on('call:update', (event: LiveEvent) => {
      addEvent(event)
    })

    // Real-time SIP errors
    socket.on('sip:error', (event: LiveEvent) => {
      addEvent(event)

      // Show toast for critical errors
      if (event.severity === 'critical') {
        toast.error(`SIP Error ${event.code ? `(${event.code})` : ''}: ${event.error}`, {
          description: event.suggestion,
          duration: 8000,
        })
      } else if (event.severity === 'error') {
        toast.warning(`SIP Warning: ${event.error}`, { duration: 5000 })
      }
    })

    // AMD results
    socket.on('amd:human', (event: LiveEvent) => {
      addEvent({ ...event, amdResult: 'HUMAN' })
    })

    socket.on('amd:machine', (event: LiveEvent) => {
      addEvent({ ...event, amdResult: 'MACHINE' })
    })

    // Campaign events
    socket.on('campaign:started', (event: any) => {
      toast.success(`Campaign started`, { description: `Dialing contacts...` })
    })

    socket.on('campaign:completed', (event: any) => {
      toast.success(`Campaign completed`)
      setLiveStats(prev => ({ ...prev, activeCampaigns: Math.max(0, prev.activeCampaigns - 1) }))
    })

    socket.on('campaign:error', (event: any) => {
      toast.error(`Campaign error: ${event.error}`, {
        description: event.code === 'SIP_NOT_REGISTERED' ? 'Please test and re-register your SIP account' : undefined,
        duration: 10000,
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token, addEvent])

  const joinCampaign = useCallback((campaignId: string) => {
    socketRef.current?.emit('join:campaign', { campaignId })
  }, [])

  const leaveCampaign = useCallback((campaignId: string) => {
    socketRef.current?.emit('leave:campaign', { campaignId })
  }, [])

  return { liveStats, events, connected, joinCampaign, leaveCampaign }
}
