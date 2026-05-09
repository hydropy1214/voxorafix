'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export default function RootPage() {
  const router = useRouter()
  const token = useAuthStore(s => s.accessToken)
  const hasHydrated = useAuthStore(s => s._hasHydrated)

  useEffect(() => {
    if (!hasHydrated) return
    if (token) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [token, hasHydrated, router])

  // Show a minimal loading screen while waiting for localStorage to hydrate
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-xl gradient-brand animate-pulse" />
          <div className="absolute inset-0 rounded-xl gradient-brand opacity-50 scale-75" />
        </div>
        <div className="h-1 w-32 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full animate-shimmer" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  )
}
