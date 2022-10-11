import type { ParsedUrlQuery } from 'querystring'

/**
 * NextJS dynamic routes helper that returns the value of a dynamic route parameter with the given key or
 * `undefined` if it is not yet set or does not exist.
 *
 * This helper makes for cleaner component implementations in TypeScript: NextJS `router.query` is of type
 * `ParsedUrlQuery` and values may be `undefined` on first render(s) due to the Automatic Site Optimization feature.
 *
 * For more complex logic that requires the router to be ready, consider implementing that logic inside a useEffect
 * that includes `router.isReady` in the dependency array.
 *
 * @param query full `router.query` as returned by NextJS `useRouter()` hook
 * @param key dynamic route key
 */
export const getRouterParamValue = (query: ParsedUrlQuery, key: string): string | undefined => {
  const value = query[key]
  return typeof value === 'string' ? value : undefined
}
