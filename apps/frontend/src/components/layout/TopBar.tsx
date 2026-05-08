'use client'

import { useRouter } from 'next/navigation'
import { Bell, LogOut, Settings, ChevronDown, Search } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { useState, useRef, useEffect } from 'react'
import { useLiveStats } from '@/hooks/useLiveStats'
import { cn } from '@/lib/utils'

export function TopBar() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const refreshToken = useAuthStore(s => s.refreshToken)
  const [showMenu, setShowMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const { connected, liveStats } = useLiveStats()

  useEffect(() => {
    if (showSearch) {
      searchRef.current?.focus()
    }
  }, [showSearch])

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken })
      }
    } catch {}
    logout()
    router.push('/login')
    toast.success('Signed out successfully')
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?'

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-5 bg-card/60 backdrop-blur-md flex-shrink-0">
      {/* Left: status + search */}
      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className={cn(
          'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors',
          connected
            ? 'text-green-400 bg-green-400/10 border-green-400/20'
            : 'text-muted-foreground bg-muted/30 border-border',
        )}>
          <div className={cn(
            'h-1.5 w-1.5 rounded-full',
            connected ? 'bg-green-400 animate-pulse' : 'bg-muted-foreground',
          )} />
          <span className="font-medium">{connected ? 'Live' : 'Offline'}</span>
          {connected && liveStats.activeCalls > 0 && (
            <span className="text-green-300 ml-0.5">· {liveStats.activeCalls} calls</span>
          )}
        </div>

        {/* Search bar */}
        <div className={cn(
          'flex items-center gap-2 rounded-xl border transition-all duration-200',
          showSearch
            ? 'w-56 bg-background border-brand-500/50 px-3'
            : 'w-8 h-8 border-transparent bg-transparent justify-center cursor-pointer hover:bg-accent/60',
        )}>
          {showSearch ? (
            <>
              <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setShowSearch(false) }}
                onKeyDown={e => e.key === 'Escape' && setShowSearch(false)}
                placeholder="Search..."
                className="flex-1 bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted-foreground/50 py-1.5"
              />
            </>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center justify-center h-full w-full"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all">
          <Bell className="h-4 w-4" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-accent/60 transition-all"
          >
            <div className="h-7 w-7 rounded-full gradient-brand flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-glow-brand">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-none">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[120px]">
                {user?.email}
              </p>
            </div>
            <ChevronDown className={cn(
              'h-3 w-3 text-muted-foreground transition-transform duration-200',
              showMenu && 'rotate-180',
            )} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-52 z-40 bg-card border border-border rounded-2xl shadow-dropdown py-1.5 animate-scale-in">
                <div className="px-3 py-2.5 border-b border-border mb-1">
                  <p className="text-sm font-semibold truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                </div>

                <button
                  onClick={() => { router.push('/settings'); setShowMenu(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent/60 transition-colors text-left rounded-lg mx-0.5"
                >
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  Settings
                </button>

                <div className="border-t border-border my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left rounded-lg mx-0.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
