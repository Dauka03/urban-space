import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  phone: string
  isAuthenticated: boolean
  setPhone: (phone: string) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      phone: '',
      isAuthenticated: false,
      setPhone: (phone) => set({ phone }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, phone: '' }),
    }),
    { name: 'auth' }
  )
)
