import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

type AuthMode = 'login' | 'register'

interface AuthState {
  user: User | null
  token: string | null
  phone: string
  mode: AuthMode
  isAuthenticated: boolean
  setPhone: (phone: string) => void
  setMode: (mode: AuthMode) => void
  setAuth: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      phone: '',
      mode: 'login',
      isAuthenticated: false,
      setPhone: (phone) => set({ phone }),
      setMode: (mode) => set({ mode }),
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false, phone: '', mode: 'login' }),
    }),
    { name: 'auth' }
  )
)
