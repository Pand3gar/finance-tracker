import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Tiny stale-while-revalidate cache ──────────────────────────────────────────
// Keeps the last successful result for each key in memory. When a component
// mounts and the key is already cached, it renders that data immediately (no
// loading skeleton) while a fresh fetch runs in the background. This is what
// makes navigating back to a page feel instant instead of flashing a spinner.

const cache = new Map<string, unknown>()

/** Drop cached entries. Pass a prefix to clear a group, or nothing to clear all. */
export function invalidateCache(prefix?: string) {
  if (!prefix) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}

export function useCachedData<T>(key: string, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | undefined>(() => cache.get(key) as T | undefined)
  const [loading, setLoading] = useState(!cache.has(key))

  // Keep the latest fetcher without making it a dependency (it's usually a new
  // closure each render). Only `key` should drive re-fetching.
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const revalidate = useCallback(async () => {
    if (!cache.has(key)) setLoading(true)
    try {
      const fresh = await fetcherRef.current()
      cache.set(key, fresh)
      setData(fresh)
    } finally {
      setLoading(false)
    }
  }, [key])

  useEffect(() => {
    // Seed from cache synchronously when the key changes, then revalidate.
    setData(cache.get(key) as T | undefined)
    setLoading(!cache.has(key))
    revalidate()
  }, [key, revalidate])

  return { data, loading, revalidate }
}
