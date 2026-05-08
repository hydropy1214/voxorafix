'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { User, Lock, Loader2, Save, Camera } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
  'America/Denver', 'Europe/London', 'Europe/Berlin', 'Europe/Paris',
  'Asia/Tokyo', 'Asia/Singapore', 'Asia/Dubai', 'Australia/Sydney',
]

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
] as const

type TabId = typeof TABS[number]['id']

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

  const passwordForm = useForm<{
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }>()

  const profileMutation = useMutation({
    mutationFn: (data: any) => api.put('/users/profile', data).then(r => r.data),
    onSuccess: (data) => {
      updateUser(data)
      toast.success('Profile updated successfully')
    },
    onError: () => toast.error('Failed to update profile'),
  })

  const passwordMutation = useMutation({
    mutationFn: (data: any) => api.put('/users/password', data),
    onSuccess: () => {
      passwordForm.reset()
      toast.success('Password changed successfully')
    },
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
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences and security</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-muted/40 rounded-2xl p-1 w-fit border border-border/50">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                tab === t.id
                  ? 'bg-card text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
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
        <form
          onSubmit={profileForm.handleSubmit(data => profileMutation.mutate(data))}
          className="stat-card space-y-5 animate-fade-in"
        >
          <div>
            <h3 className="font-semibold text-sm">Profile Information</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Update your personal details</p>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl gradient-brand flex items-center justify-center text-2xl font-bold text-white shadow-glow-brand">
                {userInitials}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-card border-2 border-background flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Camera className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
            <div>
              <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{user?.role}</p>
            </div>
          </div>

          <div className="divider" />

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                First Name
              </label>
              <input {...profileForm.register('firstName')} className="input-field" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Last Name
              </label>
              <input {...profileForm.register('lastName')} className="input-field" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Phone Number
            </label>
            <input
              {...profileForm.register('phone')}
              placeholder="+1 555 000 0000"
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Timezone
            </label>
            <select {...profileForm.register('timezone')} className="input-field">
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={profileMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {profileMutation.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Save className="h-4 w-4" />
            }
            Save Changes
          </button>
        </form>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <form
          onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
          className="stat-card space-y-5 animate-fade-in"
        >
          <div>
            <h3 className="font-semibold text-sm">Change Password</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use a strong, unique password for your account
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Current Password
            </label>
            <input
              {...passwordForm.register('currentPassword')}
              type="password"
              placeholder="••••••••"
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              New Password
            </label>
            <input
              {...passwordForm.register('newPassword')}
              type="password"
              placeholder="Min 8 characters"
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Confirm New Password
            </label>
            <input
              {...passwordForm.register('confirmPassword')}
              type="password"
              placeholder="Repeat new password"
              className="input-field"
            />
          </div>

          <div className="p-3.5 bg-muted/20 rounded-xl border border-border/50 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground/70 mb-1">Password requirements</p>
            <p>· Minimum 8 characters</p>
            <p>· At least one uppercase letter</p>
            <p>· At least one number</p>
          </div>

          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {passwordMutation.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Lock className="h-4 w-4" />
            }
            Change Password
          </button>
        </form>
      )}
    </div>
  )
}
