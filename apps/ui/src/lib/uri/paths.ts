/**
 * Return the URI pathname + search query (router path) corresponding to the given input,
 * as validated by the built-in URL class.
 *
 * Returns `undefined` if the input is `undefined` or if the `URL` constructor throws a `TypeError`
 * when attempting to parse the input.
 *
 * Returns `/` if the input is an empty string.
 *
 * This function is intended to help React components that might trigger dynamic router redirects to
 * at least have confidence they are redirecting to a valid path pattern.
 *
 * Usage:
 *
 * ```ts
 * const router = useRouter()
 * const redirectPath = getValidatedPathUri(getQueryStringValue(router.query?.redirectPath)) ?? DEFAULT_PATH
 *
 * // ...
 * ```
 */
export const getValidatedPathUri = (input: string | undefined): string | undefined => {
  if (!process.env.NEXT_PUBLIC_PROJECT_BASE_URL) {
    throw new Error('environment NEXT_PUBLIC_PROJECT_BASE_URL must be set')
  }

  if (input === undefined) {
    return undefined
  }

  try {
    const uri = new URL(input, process.env.NEXT_PUBLIC_PROJECT_BASE_URL)

    return `${uri.pathname}${uri.search}`
  } catch (error: unknown) {
    if (error instanceof TypeError) {
      return undefined
    }

    throw error
  }
}
