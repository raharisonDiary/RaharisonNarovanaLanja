import { useCallback, useEffect, useState } from 'react'

export function useAsync<T>(factory: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await factory())
    } catch (exception) {
      setError(exception)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  useEffect(() => { void reload() }, [reload])
  return { data, error, loading, reload, setData }
}
