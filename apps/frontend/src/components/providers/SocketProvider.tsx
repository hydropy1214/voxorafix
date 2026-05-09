'use client'
/**
 * SocketProvider — manages a SINGLE WebSocket connection for the dashboard.
 * Mounted once in (dashboard)/layout.tsx.
 * All components read events from useSocketStore / useLiveStats.
 */
import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/store/auth.store'
import { useSocketStore } from '@/store/socket.store'
import { toast } from 'sonner'

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.accessToken)
  const hasHydrated = useAuthStore(s => s._hasHydrated)
  const { setConnected, setSocket, updateStats, pushEvent } = useSocketStore.getState()
  const reconnectAttempts = useRef(0)

  useEffect(() => {
    if (!hasHydrated || !token) return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'

    const socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 30000,
      timeout: 10000,
    })

    setSocket(socket)

    socket.on('connect', () => {
      setConnected(true)
      reconnectAttempts.current = 0
      socket.emit('join:live-monitor')
    })

    socket.on('disconnect', (reason) => {
      setConnected(false)
      if (reason === 'io server disconnect') socket.connect()
    })

    socket.on('connect_error', () => {
      setConnected(false)
      reconnectAttempts.current++
    })

    // Stats
    socket.on('stats:update', (data: any) => {
      updateStats(data)
    })

    // Call lifecycle events — all push into shared store
    const callEvents = [
      'call:dialing', 'call:answered', 'call:hangup',
      'call:completed', 'call:update', 'amd:human', 'amd:machine',
    ]
    callEvents.forEach(ev => {
      socket.on(ev, (event: any) => {
        pushEvent({ ...event, type: ev })
        // Update active call count
        if (ev === 'call:answered') {
          updateStats({ activeCalls: (useSocketStore.getState().liveStats.activeCalls || 0) + 1 })
        }
        if (ev === 'call:hangup' || ev === 'call:completed') {
          updateStats({ activeCalls: Math.max(0, (useSocketStore.getState().liveStats.activeCalls || 1) - 1) })
        }
      })
    })

    // SIP errors — push event + show toast for critical
    socket.on('sip:error', (event: any) => {
      pushEvent({ ...event, type: 'sip:error' })
      if (event.severity === 'critical') {
        toast.error(`Call error${event.code ? ` (${event.code})` : ''}: ${event.error}`, {
          description: event.suggestion,
          duration: 8000,
        })
      }
    })

    // Campaign events
    socket.on('campaign:started', () => {
      updateStats({ activeCampaigns: (useSocketStore.getState().liveStats.activeCampaigns || 0) + 1 })
    })
    socket.on('campaign:completed', (event: any) => {
      updateStats({ activeCampaigns: Math.max(0, (useSocketStore.getState().liveStats.activeCampaigns || 1) - 1) })
      toast.success('Campaign completed')
    })
    socket.on('campaign:error', (event: any) => {
      toast.error(`Campaign error: ${event.error}`, { duration: 10000 })
    })

    return () => {
      socket.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [token, hasHydrated]) // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>
}
