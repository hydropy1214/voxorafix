/**
 * Global WebSocket store — ONE connection shared across all components.
 *
 * Previously each useLiveStats() call created its own socket, causing
 * 3–5 simultaneous connections per page which hammered the server
 * and caused visible slowness.
 *
 * All components now read state from this store. The connection is
 * initialised once in the dashboard layout.
 */
import { create } from 'zustand'

export interface LiveCallEvent {
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

export interface LiveStats {
  activeCalls: number
  callsPerMinute: number
  activeCampaigns: number
}

interface SocketState {
  connected: boolean
  liveStats: LiveStats
  events: LiveCallEvent[]
  _socket: any | null

  setConnected: (v: boolean) => void
  setSocket: (s: any) => void
  updateStats: (s: Partial<LiveStats>) => void
  pushEvent: (e: LiveCallEvent) => void
  clearEvents: () => void
}

export const useSocketStore = create<SocketState>((set, get) => ({
  connected: false,
  liveStats: { activeCalls: 0, callsPerMinute: 0, activeCampaigns: 0 },
  events: [],
  _socket: null,

  setConnected: (v) => set({ connected: v }),
  setSocket: (s) => set({ _socket: s }),

  updateStats: (s) =>
    set(state => ({ liveStats: { ...state.liveStats, ...s } })),

  pushEvent: (e) =>
    set(state => ({ events: [e, ...state.events.slice(0, 199)] })),

  clearEvents: () => set({ events: [] }),
}))
