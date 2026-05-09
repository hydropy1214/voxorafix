/**
 * useLiveStats — reads from the global WebSocket store.
 *
 * Does NOT create any connections. The connection is managed
 * once by SocketProvider in the dashboard layout.
 * Multiple components can call this safely with zero overhead.
 */
'use client'
import { useSocketStore } from '@/store/socket.store'
import { useCallback } from 'react'

export function useLiveStats() {
  const connected  = useSocketStore(s => s.connected)
  const liveStats  = useSocketStore(s => s.liveStats)
  const events     = useSocketStore(s => s.events)
  const _socket    = useSocketStore(s => s._socket)

  const joinCampaign = useCallback((campaignId: string) => {
    _socket?.emit('join:campaign', { campaignId })
  }, [_socket])

  const leaveCampaign = useCallback((campaignId: string) => {
    _socket?.emit('leave:campaign', { campaignId })
  }, [_socket])

  return { liveStats, events, connected, joinCampaign, leaveCampaign }
}

export type { LiveCallEvent, LiveStats } from '@/store/socket.store'
