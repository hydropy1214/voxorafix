'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'

function HydrationGate({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Trigger Zustand persist rehydration on mount
    useAuthStore.persist.rehydrate()
    setIsMounted(true)
  }, [])

  // During SSR and before hydration, render a transparent wrapper
  // to avoid mismatches. Children still render but auth state is pending.
  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationGate>
        {children}
      </HydrationGate>
      <Toaster
        theme="dark"
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          classNames: {
            toast: 'bg-card border border-border text-foreground shadow-dropdown',
            title: 'text-foreground font-semibold text-sm',
            description: 'text-muted-foreground text-xs',
          },
        }}
      />
    </QueryClientProvider>
  )
}
