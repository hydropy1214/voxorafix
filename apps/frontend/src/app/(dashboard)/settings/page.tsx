'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  User, Lock, Bell, Key, Users, Webhook,
  Loader2, Save, Camera, Plus, Trash2, Eye, EyeOff,
  Copy, CheckCircle2, AlertCircle, RefreshCw,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/utils'

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
  'America/Denver', 'Europe/London', 'Europe/Berlin', 'Europe/Paris',
  'Asia/Tokyo', 'Asia/Singapore', 'Asia/Dubai', 'Australia/Sydney',
]

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const

type TabId = typeof TABS[number]['id']

function ApiKeysTab() {
  const qc = useQueryClient()
  const [showKey, setShowKey] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api.get('/auth/api-keys').then(r => r.data).catch(() => []),
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => api.post('/auth/api-keys', { name }).then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['api-keys'] })
      setCreatedKey(data.key || data.plainKey || null)
      setNewKeyName('')
      toast.success('API key created')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create key'),
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/auth/api-keys/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['api-keys'] })
      toast.success('API key revoked')
    },
  })

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="stat-card">
        <div className="mb-4">
          <h3 className="font-semibold text-sm">API Keys</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Use API keys to authenticate requests to the Voxora REST API from your own applications.
          </p>
        </div>

        {/* Create new key */}
        <div className="flex gap-2 mb-5">
          <input
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. CRM Integration, Production)"
            className="input-field flex-1"
            onKeyDown={e => e.key === 'Enter' && newKeyName && createMutation.mutate(newKeyName)}
          />
          <button
            onClick={() => newKeyName && createMutation.mutate(newKeyName)}
            disabled={!newKeyName || createMutation.isPending}
            className="btn-primary flex items-center gap-1.5 flex-shrink-0"
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create
          </button>
        </div>

        {/* New key display — shown once */}
        {createdKey && (
          <div className="mb-5 p-4 bg-green-500/[0.07] border border-green-500/20 rounded-xl">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-300 font-medium">
                Copy this key now — you will never see the full key again.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-background rounded-xl p-3 font-mono text-xs text-foreground break-all">
              <span className="flex-1">{createdKey}</span>
              <button
                onClick={() => copyKey(createdKey)}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <button onClick={() => setCreatedKey(null)} className="text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors">
              I have saved this key
            </button>
          </div>
        )}

        {/* Keys list */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => <div key={i} className="h-14 skeleton rounded-xl" />)}
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No API keys yet</p>
            <p className="text-xs opacity-60 mt-1">Create a key to access the REST API</p>
          </div>
        ) : (
          <div className="space-y-2">
            {keys.map((key: any) => (
              <div key={key.id} className="flex items-center gap-3 p-3.5 bg-muted/20 rounded-xl border border-border/50">
                <div className="h-8 w-8 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                  <Key className="h-4 w-4 text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{key.name}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                    <span className="font-mono">{key.prefix}••••••••</span>
                    <span>Created {timeAgo(key.createdAt)}</span>
                    {key.lastUsedAt && <span>Last used {timeAgo(key.lastUsedAt)}</span>}
                  </div>
                </div>
                <button
                  onClick={() => revokeMutation.mutate(key.id)}
                  className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API docs link */}
      <div className="stat-card">
        <h3 className="font-semibold text-sm mb-2">API Documentation</h3>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          Use the REST API to manage contacts, start campaigns, receive call events, and integrate with your CRM or data platform.
        </p>
        <div className="flex gap-2">
          <a href="/api/docs" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-xs hover:bg-accent transition-colors font-medium">
            View API Docs
          </a>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-xl text-xs text-muted-foreground">
            Base URL:
            <code className="font-mono text-foreground">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api</code>
          </div>
        </div>
      </div>
    </div>
  )
}

function WebhooksTab() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="stat-card">
        <div className="mb-4">
          <h3 className="font-semibold text-sm">Webhook Endpoints</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Receive real-time events for every call, AMD result, and campaign status change.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="h-12 w-12 rounded-2xl bg-muted/30 flex items-center justify-center">
            <Webhook className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No webhooks configured</p>
          <p className="text-xs text-muted-foreground/60 max-w-xs text-center">
            Add an endpoint URL to start receiving events for call answers, AMD results, and campaign completions.
          </p>
          <button className="btn-primary flex items-center gap-2 text-sm mt-2">
            <Plus className="h-4 w-4" />
            Add Webhook
          </button>
        </div>
      </div>

      <div className="stat-card">
        <h3 className="font-semibold text-sm mb-4">Available Events</h3>
        <div className="grid sm:grid-cols-2 gap-2 text-xs">
          {[
            { event: 'call.answered', desc: 'Fires when a call is answered' },
            { event: 'call.amd_result', desc: 'Human or machine detection result' },
            { event: 'call.completed', desc: 'Call ended with duration and outcome' },
            { event: 'call.failed', desc: 'Call failed with SIP error code' },
            { event: 'campaign.started', desc: 'Campaign begins dialling' },
            { event: 'campaign.completed', desc: 'All contacts processed' },
            { event: 'contact.opted_out', desc: 'Contact pressed opt-out key' },
          ].map(e => (
            <div key={e.event} className="flex items-start gap-2 p-2.5 bg-muted/20 rounded-lg border border-border/50">
              <code className="text-brand-400 font-mono text-[10px] flex-shrink-0">{e.event}</code>
              <span className="text-muted-foreground">{e.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>('profile')
  const user = useAuthStore(s => s.user)
  const updateUser = useAuthStore(s => s.updateUser)

  const profileForm = useForm({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: '',
      timezone: 'UTC',
    },
  })

  const passwordForm = useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>()

  const profileMutation = useMutation({
    mutationFn: (data: any) => api.put('/users/profile', data).then(r => r.data),
    onSuccess: (data) => { updateUser(data); toast.success('Profile updated') },
    onError: () => toast.error('Failed to update profile'),
  })

  const passwordMutation = useMutation({
    mutationFn: (data: any) => api.put('/users/password', data),
    onSuccess: () => { passwordForm.reset(); toast.success('Password changed') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to change password'),
  })

  const handlePasswordSubmit = (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    passwordMutation.mutate(data)
  }

  const userInitials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?'

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account, API access, and integrations</p>
      </div>

      {/* Tab switcher */}
      <div className="flex flex-wrap gap-1 bg-muted/40 rounded-2xl p-1 border border-border/50 w-fit">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all',
                tab === t.id
                  ? 'bg-card text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <form onSubmit={profileForm.handleSubmit(d => profileMutation.mutate(d))}
          className="stat-card space-y-5 animate-fade-in">
          <div>
            <h3 className="font-semibold text-sm">Profile Information</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Your personal details and account preferences</p>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl gradient-brand flex items-center justify-center text-2xl font-bold text-white shadow-glow-brand">
                {userInitials}
              </div>
              <button type="button" className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-card border-2 border-background flex items-center justify-center hover:bg-accent transition-colors">
                <Camera className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
            <div>
              <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5 uppercase tracking-wide">{user?.role}</p>
            </div>
          </div>

          <div className="divider" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">First Name</label>
              <input {...profileForm.register('firstName')} className="input-field" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Name</label>
              <input {...profileForm.register('lastName')} className="input-field" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone Number</label>
            <input {...profileForm.register('phone')} placeholder="+1 555 000 0000" className="input-field" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Timezone</label>
            <select {...profileForm.register('timezone')} className="input-field">
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>

          <button type="submit" disabled={profileMutation.isPending} className="btn-primary flex items-center gap-2">
            {profileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </form>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
          className="stat-card space-y-5 animate-fade-in">
          <div>
            <h3 className="font-semibold text-sm">Change Password</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Use a strong, unique password for your account</p>
          </div>

          {['currentPassword', 'newPassword', 'confirmPassword'].map((field, i) => (
            <div key={field} className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {i === 0 ? 'Current Password' : i === 1 ? 'New Password' : 'Confirm New Password'}
              </label>
              <input
                {...passwordForm.register(field as any)}
                type="password"
                placeholder="••••••••"
                className="input-field"
              />
            </div>
          ))}

          <div className="p-3.5 bg-muted/20 rounded-xl border border-border/50 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground/70 mb-1.5">Password requirements</p>
            <p>· Minimum 8 characters</p>
            <p>· At least one uppercase letter</p>
            <p>· At least one number</p>
          </div>

          <button type="submit" disabled={passwordMutation.isPending} className="btn-primary flex items-center gap-2">
            {passwordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Change Password
          </button>
        </form>
      )}

      {tab === 'api' && <ApiKeysTab />}
      {tab === 'webhooks' && <WebhooksTab />}

      {tab === 'notifications' && (
        <div className="stat-card space-y-5 animate-fade-in">
          <div>
            <h3 className="font-semibold text-sm">Notification Preferences</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Choose what you get notified about</p>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Campaign completed', desc: 'When a campaign finishes processing all contacts', enabled: true },
              { label: 'Campaign error', desc: 'When a campaign fails or stops unexpectedly', enabled: true },
              { label: 'SIP registration failed', desc: 'When a phone account loses registration', enabled: true },
              { label: 'High failure rate', desc: 'When call failure rate exceeds 20%', enabled: false },
              { label: 'Weekly summary', desc: 'Weekly digest of campaigns, calls, and performance', enabled: false },
            ].map(n => (
              <div key={n.label} className="flex items-center justify-between p-3.5 bg-muted/20 rounded-xl border border-border/50">
                <div>
                  <p className="text-sm font-semibold">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <div className={cn('h-5 w-9 rounded-full transition-colors cursor-pointer flex-shrink-0',
                  n.enabled ? 'bg-brand-500' : 'bg-muted/60'
                )}>
                  <div className={cn('h-4 w-4 rounded-full bg-white shadow-sm mt-0.5 transition-transform',
                    n.enabled ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                  )} />
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Preferences
          </button>
        </div>
      )}
    </div>
  )
}
