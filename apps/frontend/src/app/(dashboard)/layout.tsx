'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { SocketProvider } from '@/components/providers/SocketProvider'
import { WebDialer } from '@/components/dialer/WebDialer'
import { Waves } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const token = useAuthStore(s => s.accessToken)
  const hasHydrated = useAuthStore(s => s._hasHydrated)

  useEffect(() => {
    if (!hasHydrated) return
    if (!token) router.push('/login')
  }, [token, hasHydrated, router])

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="h-12 w-12 rounded-2xl gradient-brand flex items-center justify-center shadow-glow-violet animate-pulse">
            <Waves className="h-6 w-6 text-white" />
          </div>
          <div className="h-1 w-36 rounded-full overflow-hidden" style={{ background: 'hsl(234 22% 12%)' }}>
            <div className="h-full gradient-brand rounded-full animate-shimmer" style={{ backgroundSize: '200% 100%', width: '65%' }} />
          </div>
        </div>
      </div>
    )
  }

  if (!token) return null

  return (
    // SocketProvider wraps everything — ONE connection, shared by all child components
    <SocketProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-5 lg:p-6">
            <div className="max-w-screen-2xl">
              {children}
            </div>
          </main>
        </div>
      </div>
      <WebDialer />
    </SocketProvider>
  )
}
