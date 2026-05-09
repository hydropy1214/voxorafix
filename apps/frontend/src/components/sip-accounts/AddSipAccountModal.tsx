'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, Info, AlertCircle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(1, 'Name required').max(80),
  sipServer: z.string().min(3, 'SIP server required'),
  sipPort: z.coerce.number().int().min(1).max(65535).default(5060),
  username: z.string().min(1, 'Username required'),
  password: z.string().min(1, 'Password required'),
  transport: z.enum(['UDP', 'TCP', 'TLS']).default('UDP'),
  outboundProxy: z.string().optional(),
  // Caller ID is fully optional — providers assign their own if not set
  callerIdNumber: z.string().optional(),
  callerIdName: z.string().optional(),
  maxConcurrentCalls: z.coerce.number().int().min(1).max(1000).default(10),
  callsPerSecond: z.coerce.number().min(0.1).max(100).default(1),
})

type FormData = z.infer<typeof schema>

export function AddSipAccountModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      transport: 'UDP',
      sipPort: 5060,
      maxConcurrentCalls: 10,
      callsPerSecond: 1,
    },
  })

  const transport = watch('transport')

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/sip-accounts', {
      ...data,
      sipPort: data.sipPort || (data.transport === 'TLS' ? 5061 : 5060),
    }).then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['sip-accounts'] })
      toast.success('SIP account added', {
        description: `${data.name} — click "Test Connection" to verify registration`,
      })
      onClose()
    },
    onError: (e: any) => {
      const msg = Array.isArray(e.response?.data?.message)
        ? e.response.data.message.join(', ')
        : e.response?.data?.message || 'Failed to add account'
      toast.error('Failed to add SIP account', { description: msg })
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-modal max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold">Add SIP Account</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Connect your SIP provider for outbound calls</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(data => mutation.mutate(data))}
          className="p-6 space-y-4 overflow-y-auto"
        >
          {/* Account name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Account Name *</label>
            <input {...register('name')} placeholder="e.g. US Sales Line, Support Account" className="input-field" />
            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
          </div>

          {/* Server + Port */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">SIP Server *</label>
              <input {...register('sipServer')} placeholder="sip.provider.com" className="input-field" />
              {errors.sipServer && <p className="text-red-400 text-xs">{errors.sipServer.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Port</label>
              <input
                {...register('sipPort')}
                type="number"
                placeholder={transport === 'TLS' ? '5061' : '5060'}
                className="input-field"
              />
            </div>
          </div>

          {/* Transport */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Transport Protocol</label>
            <select {...register('transport')} className="input-field">
              <option value="UDP">UDP (default, most compatible)</option>
              <option value="TCP">TCP (reliable, NAT-friendly)</option>
              <option value="TLS">TLS (encrypted)</option>
            </select>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Username *</label>
              <input {...register('username')} placeholder="sip_username" className="input-field font-mono text-sm" />
              {errors.username && <p className="text-red-400 text-xs">{errors.username.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password *</label>
              <input {...register('password')} type="password" placeholder="••••••••" className="input-field" />
              {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
            </div>
          </div>

          {/* Outbound proxy */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Outbound Proxy <span className="text-muted-foreground/60 font-normal normal-case">(optional)</span></label>
            <input {...register('outboundProxy')} placeholder="proxy.provider.com:5060" className="input-field" />
          </div>

          {/* Caller ID — with guidance for providers who don't need it */}
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-blue-500/[0.07] border border-blue-500/20 rounded-xl">
              <Info className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-300">Caller ID is optional</p>
                <p className="text-[10px] text-blue-300/70 mt-0.5">
                  Many SIP providers assign caller ID automatically. Only set this if your provider requires a specific number.
                  If set incorrectly, calls may be rejected with SIP 403.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Caller ID Number <span className="text-muted-foreground/60 font-normal normal-case">(optional)</span></label>
                <input {...register('callerIdNumber')} placeholder="+15551234567" className="input-field" />
                <p className="text-[10px] text-muted-foreground/60">E.164 format: +country+number</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Caller ID Name <span className="text-muted-foreground/60 font-normal normal-case">(optional)</span></label>
                <input {...register('callerIdName')} placeholder="My Company" className="input-field" />
              </div>
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Max Concurrent Calls</label>
              <input {...register('maxConcurrentCalls')} type="number" min="1" max="1000" className="input-field" />
              <p className="text-[10px] text-muted-foreground/60">Check your provider limits</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Calls Per Second</label>
              <input {...register('callsPerSecond')} type="number" step="0.1" min="0.1" max="100" className="input-field" />
              <p className="text-[10px] text-muted-foreground/60">CPS limit from provider</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Add SIP Account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
