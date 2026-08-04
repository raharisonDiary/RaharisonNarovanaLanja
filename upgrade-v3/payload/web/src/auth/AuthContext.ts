import { createContext } from 'react'
import type { UserDto } from '../types/api'

export interface AuthContextValue {
  user: UserDto | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  updateCurrentUser: (user: UserDto) => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
