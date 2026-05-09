'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'

function AuthHydrationInit() {
  useEffect(() => {
    // Trigger Zustand persist rehydration once on mount
    useAuthStore.persist.rehydrate()
  }, [])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,          // Cache data for 60s before considering stale
        gcTime: 300_000,            // Keep unused data in cache for 5 minutes
        retry: 1,
        retryDelay: 1000,
        refetchOnWindowFocus: false, // Don't refetch on tab switch — reduces server load
        refetchOnReconnect: true,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrationInit />
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(234 28% 9%)',
            border: '1px solid hsl(234 22% 16%)',
            color: 'hsl(220 20% 94%)',
          },
        }}
      />
    </QueryClientProvider>
  )
}
