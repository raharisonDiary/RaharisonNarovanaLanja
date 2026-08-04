import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { mobileApi } from '../api/resources'
import { subscribeSessionExpired } from './sessionEvents'
import { sessionStore } from '../storage/sessionStore'
import type { UserDto } from '../types/api'

interface Value {
  user: UserDto | null
  loading: boolean
  login(email: string, password: string): Promise<void>
  logout(): Promise<void>
  updateUser(user: UserDto): Promise<void>
}

const Context = createContext<Value | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeSessionExpired(() => {
      setUser(null)
    })

    void Promise.all([
      sessionStore.getUser(),
      sessionStore.getAccessToken(),
      sessionStore.getRefreshToken(),
    ])
      .then(async ([savedUser, accessToken, refreshToken]) => {
        if (savedUser && accessToken && refreshToken) {
          setUser(savedUser)
          return
        }

        await sessionStore.clear()
        setUser(null)
      })
      .finally(() => setLoading(false))

    return unsubscribe
  }, [])

  const value = useMemo<Value>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const session = await mobileApi.login(email, password)
        await sessionStore.save(session)
        setUser(session.user)
      },
      async logout() {
        const refresh = await sessionStore.getRefreshToken()
        try {
          if (refresh) await mobileApi.logout(refresh)
        } finally {
          await sessionStore.clear()
          setUser(null)
        }
      },
      async updateUser(next) {
        await sessionStore.saveUser(next)
        setUser(next)
      },
    }),
    [loading, user],
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useAuth() {
  const value = useContext(Context)
  if (!value) throw new Error('AuthProvider missing.')
  return value
}
