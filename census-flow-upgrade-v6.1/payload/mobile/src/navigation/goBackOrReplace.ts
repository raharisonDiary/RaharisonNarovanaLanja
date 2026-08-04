import type { Href, useRouter } from 'expo-router'

type Router = ReturnType<typeof useRouter>

export function goBackOrReplace(
  router: Router,
  fallback: Href,
): void {
  if (router.canGoBack()) {
    router.back()
    return
  }

  router.replace(fallback)
}
