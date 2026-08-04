import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { mobileApi } from '../api/resources'
import { sessionStore } from '../storage/sessionStore'
import type { UserDto } from '../types/api'

interface Value { user: UserDto | null; loading: boolean; login(email: string, password: string): Promise<void>; logout(): Promise<void> }
const Context = createContext<Value | null>(null)
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserDto | null>(null); const [loading, setLoading] = useState(true)
  useEffect(() => { sessionStore.getUser().then(setUser).finally(() => setLoading(false)) }, [])
  const value = useMemo<Value>(() => ({ user, loading, async login(email, password) { const session = await mobileApi.login(email, password); await sessionStore.save(session); setUser(session.user) }, async logout() { const refresh = await sessionStore.getRefreshToken(); try { if (refresh) await mobileApi.logout(refresh) } finally { await sessionStore.clear(); setUser(null) } } }), [loading, user])
  return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useAuth() { const value = useContext(Context); if (!value) throw new Error('AuthProvider manquant.'); return value }
