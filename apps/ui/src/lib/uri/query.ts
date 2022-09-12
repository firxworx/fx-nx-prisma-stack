/**
 * Helper that returns the URI-decoded value of the given NextJS router query parameter value, or else
 * `undefined` if the input is not defined.
 *
 * In the case where the given input is an array, this function will return the URI-decoded value of
 * the first item in the array.
 *
 * Intended for use by React components that leverage the NextJS `useRouter()` hook.
 * Helps handle the caveat where `router.query` is not populated on the first render.
 *
 * Usage:
 *
 * ```ts
 * const router = useRouter()
 * const value = getQueryStringValue(router.query?.targetQueryStringKey)
 * ```
 */
export const getQueryStringValue = (input: string | string[] | undefined): string | undefined => {
  return input === undefined
    ? undefined
    : typeof input === 'string'
    ? decodeURIComponent(input)
    : decodeURIComponent(input[0])
}
