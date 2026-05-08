'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Mic, Play, Pause, Download, Trash2, Search } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { formatDuration, formatFileSize, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function RecordingsPage() {
  const [search, setSearch] = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['recordings', search],
    queryFn: () => api.get(`/recordings?search=${search}`).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/recordings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recordings'] })
      toast.success('Recording deleted')
    },
  })

  const togglePlay = (rec: any) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/recordings/${rec.id}/stream`
    if (playingId === rec.id) {
      audioEl?.pause()
      setPlayingId(null)
      return
    }
    if (audioEl) audioEl.pause()
    const audio = new Audio(url)
    audio.addEventListener('ended', () => setPlayingId(null))
    audio.play().catch(() => toast.error('Cannot play recording'))
    setAudioEl(audio)
    setPlayingId(rec.id)
  }

  const recordings = data?.data ?? []

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Recordings</h1>
        <p className="page-subtitle">Call recordings archive</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by phone or campaign..."
          className="input-field pl-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={cn('h-14 rounded-2xl skeleton', i > 2 && 'opacity-50')} />
          ))}
        </div>
      ) : recordings.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-4">
            <Mic className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <p className="font-semibold text-lg mb-1">No recordings yet</p>
          <p className="text-muted-foreground text-sm">Recordings appear here after calls complete</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="data-table">
            <thead>
              <tr>
                {['Phone', 'Campaign', 'Duration', 'Size', 'Date', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recordings.map((rec: any) => {
                const call = rec.callLogs?.[0]
                const isPlaying = playingId === rec.id
                return (
                  <tr key={rec.id} className={isPlaying ? 'bg-brand-500/[0.03]' : ''}>
                    <td>
                      <span className="font-mono text-xs">{call?.phone ?? '—'}</span>
                    </td>
                    <td className="text-muted-foreground text-xs max-w-[140px] truncate">
                      {call?.campaign?.name ?? '—'}
                    </td>
                    <td className="tabular-nums text-xs">{formatDuration(rec.duration ?? 0)}</td>
                    <td className="text-muted-foreground text-xs">{formatFileSize(rec.size ?? 0)}</td>
                    <td className="text-muted-foreground text-xs">{timeAgo(rec.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => togglePlay(rec)}
                          className={cn(
                            'p-1.5 rounded-lg transition-all',
                            isPlaying
                              ? 'bg-brand-500/15 text-brand-400'
                              : 'hover:bg-accent',
                          )}
                        >
                          {isPlaying
                            ? <Pause className="h-3.5 w-3.5" />
                            : <Play className="h-3.5 w-3.5" />
                          }
                        </button>
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}/api/recordings/${rec.id}/stream`}
                          download
                          className="p-1.5 rounded-lg hover:bg-accent transition-all"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => deleteMutation.mutate(rec.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
