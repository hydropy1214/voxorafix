'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import LandingPage from '@/components/landing/LandingPage'

export default function RootPage() {
  const router = useRouter()
  const token = useAuthStore(s => s.accessToken)
  const hasHydrated = useAuthStore(s => s._hasHydrated)

  useEffect(() => {
    if (hasHydrated && token) {
      router.replace('/dashboard')
    }
  }, [token, hasHydrated, router])

  // Show landing page while checking auth (and for unauthenticated visitors)
  return <LandingPage />
}
