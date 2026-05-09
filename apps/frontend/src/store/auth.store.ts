import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  organizationId?: string
  organization?: any
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  _hasHydrated: boolean
  setAuth: (accessToken: string, refreshToken: string, user: User) => void
  updateUser: (user: Partial<User>) => void
  logout: () => void
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      _hasHydrated: false,

      setAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user }),

      updateUser: (update) =>
        set(state => ({
          user: state.user ? { ...state.user, ...update } : null,
        })),

      logout: () => set({ accessToken: null, refreshToken: null, user: null }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'voxora-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
