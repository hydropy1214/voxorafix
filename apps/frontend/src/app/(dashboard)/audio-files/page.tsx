'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, FileAudio, Play, Pause, Trash2, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { formatDuration, formatFileSize, getStatusColor, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function AudioFilesPage() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null)
  const qc = useQueryClient()

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['audio-files'],
    queryFn: () => api.get('/audio-files').then(r => r.data),
    refetchInterval: 5000,
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      form.append('name', file.name.replace(/\.[^.]+$/, ''))
      return api.post('/audio-files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['audio-files'] })
      toast.success('Audio file uploaded')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Upload failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/audio-files/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['audio-files'] })
      toast.success('File deleted')
    },
    onError: () => toast.error('Failed to delete file'),
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => uploadMutation.mutate(file))
  }, [uploadMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/mpeg': ['.mp3'], 'audio/wav': ['.wav'], 'audio/wave': ['.wav'] },
    maxSize: 50 * 1024 * 1024,
  })

  const togglePlay = (file: any) => {
    const streamUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/audio-files/${file.id}/stream`

    if (playingId === file.id) {
      audioEl?.pause()
      setPlayingId(null)
      return
    }

    if (audioEl) audioEl.pause()
    const audio = new Audio(streamUrl)
    audio.addEventListener('ended', () => setPlayingId(null))
    audio.play().catch(() => toast.error('Cannot play audio'))
    setAudioEl(audio)
    setPlayingId(file.id)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Audio Files</h1>
        <p className="page-subtitle">Upload and manage your broadcast audio messages</p>
      </div>

      {/* Upload dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-brand-500 bg-brand-500/[0.06] shadow-glow-brand/10'
            : 'border-border hover:border-brand-500/40',
        )}
      >
        <input {...getInputProps()} />
        <div className={cn(
          'h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4',
          isDragActive ? 'bg-brand-500/20' : 'bg-muted/50',
        )}>
          {uploadMutation.isPending ? (
            <Loader2 className="h-6 w-6 text-brand-400 animate-spin" />
          ) : (
            <Upload className={cn('h-6 w-6', isDragActive ? 'text-brand-400' : 'text-muted-foreground')} />
          )}
        </div>
        <p className="font-semibold text-sm">
          {isDragActive
            ? 'Drop your audio files here'
            : uploadMutation.isPending
            ? 'Uploading...'
            : 'Upload MP3 or WAV'}
        </p>
        <p className="text-xs text-muted-foreground mt-1.5">
          Drag & drop or click to browse · Max 50 MB per file
        </p>
      </div>

      {/* Files grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={cn('h-32 rounded-2xl skeleton', i > 1 && 'opacity-50')} />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-4">
            <FileAudio className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <p className="font-semibold text-lg mb-1">No audio files yet</p>
          <p className="text-muted-foreground text-sm">Upload MP3 or WAV files to use in campaigns</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {files.map((file: any) => {
            const isPlaying = playingId === file.id
            return (
              <div
                key={file.id}
                className={cn(
                  'bg-card border rounded-2xl p-4 transition-all duration-200',
                  isPlaying
                    ? 'border-brand-500/40 shadow-glow-brand/10'
                    : 'border-border hover:border-brand-500/20',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    isPlaying ? 'bg-brand-500/20' : 'bg-brand-500/10',
                  )}>
                    <FileAudio className={cn(
                      'h-5 w-5',
                      isPlaying ? 'text-brand-300' : 'text-brand-400',
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm truncate">{file.name}</p>
                      <span className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-md border flex-shrink-0',
                        getStatusColor(file.status),
                      )}>
                        {file.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{file.format?.toUpperCase()}</span>
                      <span>·</span>
                      <span>{formatDuration(file.duration ?? 0)}</span>
                      <span>·</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{timeAgo(file.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {file.status === 'READY' && (
                      <button
                        onClick={() => togglePlay(file)}
                        className={cn(
                          'p-2 rounded-xl border transition-all',
                          isPlaying
                            ? 'bg-brand-500/15 border-brand-500/30 text-brand-400'
                            : 'border-border hover:bg-accent',
                        )}
                      >
                        {isPlaying
                          ? <Pause className="h-3.5 w-3.5" />
                          : <Play className="h-3.5 w-3.5" />
                        }
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(file.id)}
                      className="p-2 rounded-xl border border-border hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Waveform visualization */}
                {file.status === 'READY' && (
                  <div className="mt-3 h-8 bg-muted/30 rounded-xl overflow-hidden px-2 flex items-center gap-px">
                    {[...Array(52)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-0.5 rounded-full flex-shrink-0 transition-colors',
                          isPlaying ? 'bg-brand-400' : 'bg-brand-500/35',
                        )}
                        style={{
                          height: `${25 + Math.sin(i * 0.4) * 18 + Math.cos(i * 0.25) * 12}%`,
                          animationDelay: isPlaying ? `${i * 0.04}s` : '0s',
                          animation: isPlaying ? 'wave 0.8s ease-in-out infinite alternate' : 'none',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
