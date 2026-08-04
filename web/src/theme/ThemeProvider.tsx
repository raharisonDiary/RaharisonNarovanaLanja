import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { ThemeContext, type ThemeMode } from './ThemeContext'

const STORAGE_KEY = 'census.theme'
const resolve = (mode: ThemeMode) => mode === 'system'
  ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  : mode

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'dark' || saved === 'light' || saved === 'system' ? saved : 'system'
  })
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => resolve(mode))

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const next = resolve(mode)
      document.documentElement.dataset.theme = next
      setResolved(next)
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [mode])

  const value = useMemo(() => ({
    mode,
    resolved,
    setMode: (next: ThemeMode) => {
      localStorage.setItem(STORAGE_KEY, next)
      setModeState(next)
    },
  }), [mode, resolved])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
