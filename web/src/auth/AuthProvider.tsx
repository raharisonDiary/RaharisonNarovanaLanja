import { useMemo, useState, type PropsWithChildren } from 'react'
import { sessionApi } from '../api/resources'
import { tokenStore } from '../api/tokenStore'
import type { UserDto } from '../types/api'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserDto | null>(() => tokenStore.getUser())
  const [isLoading, setIsLoading] = useState(false)

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && tokenStore.getAccessToken()),
      isLoading,
      login: async (email: string, password: string) => {
        setIsLoading(true)
        try {
          const session = await sessionApi.login(email, password)
          tokenStore.save(session.accessToken, session.refreshToken, session.user)
          setUser(session.user)
        } finally {
          setIsLoading(false)
        }
      },
      logout: async () => {
        const refreshToken = tokenStore.getRefreshToken()
        try {
          if (refreshToken) await sessionApi.logout(refreshToken)
        } finally {
          tokenStore.clear()
          setUser(null)
        }
      },
      updateCurrentUser: (nextUser: UserDto) => {
        const accessToken = tokenStore.getAccessToken() ?? ''
        const refreshToken = tokenStore.getRefreshToken() ?? ''
        tokenStore.save(accessToken, refreshToken, nextUser)
        setUser(nextUser)
      },
      logoutAll: async () => {
        try {
          await sessionApi.logoutAll()
        } finally {
          tokenStore.clear()
          setUser(null)
        }
      },
    }),
    [isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
