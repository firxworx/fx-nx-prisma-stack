import { useCallback } from 'react'
import {
  UseMutateAsyncFunction,
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'

import type { AuthUser } from '../../types/auth.types'
import type { AuthQueryEndpoint, AuthSignInCredentials } from '../types/auth.types'
import { useSessionContext } from '../../context/SessionContextProvider'
import { fetchSession, fetchSignIn, fetchSignOut } from '../fetchers/auth'

// @todo create shared lib with interfaces of api responses

const AUTH_KEY_BASE = 'auth' as const

/**
 * Query keys for auth API functions used with react-query.
 */
export const authQueryKeys: Record<Exclude<AuthQueryEndpoint, 'refresh'> | 'all', Readonly<string[]>> = {
  all: [AUTH_KEY_BASE] as const,
  session: [AUTH_KEY_BASE, 'session'] as const,
  signIn: [AUTH_KEY_BASE, 'signIn'] as const,
  signOut: [AUTH_KEY_BASE, 'signOut'] as const,
}

/**
 * React query hook to obtain user session profile/context data from the back-end API.
 *
 * This hook provides essential functionality for the project authentication strategy with http-only cookies.
 * Refer to `_app.tsx` for global query client auth error handler.
 *
 * @param enabled if the query is enabled (and should periodically resend requests) or not
 * @see SessionContextProvider
 */
export function useAuthSessionQuery(
  enabled: boolean,
): UseQueryResult<AuthUser, unknown> & { invalidate: () => Promise<void>; remove: () => void } {
  const queryClient = useQueryClient()

  const invalidate = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries(authQueryKeys.session)
  }, [queryClient])

  const remove = useCallback((): void => {
    queryClient.removeQueries(authQueryKeys.session)
  }, [queryClient])

  const query = useQuery<AuthUser>(authQueryKeys.session, fetchSession, {
    enabled,
    retry: false,
    refetchInterval: 900000,

    // potential consideration for non-auth + auth layout components that call useAuthSession() hook...
    // refetchOnMount: false,

    // @see _app.tsx for global query client auth error handler + SessionContextProvider
    onError: (error: unknown): void => {
      console.warn(`useAuthSessionQuery onError handler`, error)

      // // queryClient.clear()
    },
  })

  return {
    ...query,
    invalidate,
    remove,
  }
}

/**
 * React query hook that provides an async `signIn()` function to sign in to the back-end API with a set of
 * `AuthSignInCredentials`.
 *
 * The user's session context is fetched and cached on successful sign in.
 */
export function useAuthSignIn(): {
  signIn: UseMutateAsyncFunction<void, Error, AuthSignInCredentials, unknown>
} & UseMutationResult<void, Error, AuthSignInCredentials> {
  const session = useSessionContext()

  const signInMutation = useMutation<void, Error, AuthSignInCredentials>(authQueryKeys.signIn, fetchSignIn, {
    retry: false,
    onSuccess: () => {
      if (!session) {
        throw new Error('useAuthSignIn missing expected session (via SessionContextProvider)')
      }

      session.setEnabled(true)
      session.refetch()
    },
  })

  return {
    signIn: signInMutation.mutateAsync,
    ...signInMutation,
  }
}

/**
 * React hook that provides a `signOut()` function to sign out from the back-end API.
 *
 * The underlying react-query `QueryClient` cache is cleared on successful sign-out and the session profile/context
 * query is disabled.
 *
 * @see useAuthSessionQuery
 */
export function useAuthSignOut(): { signOut: UseMutateAsyncFunction<void, unknown, void, unknown> } & UseMutationResult<
  void,
  Error,
  void
> {
  const queryClient = useQueryClient()
  const session = useSessionContext()

  const signOutMutation = useMutation<void, Error, void, unknown>(authQueryKeys.signOut, fetchSignOut, {
    retry: false,
    onSuccess: () => {
      if (!session) {
        throw new Error('useAuthSignOut missing expected session via SessionContextProvider')
      }

      session.setEnabled(false)
      queryClient.clear()
    },
  })

  return {
    signOut: signOutMutation.mutateAsync,
    ...signOutMutation,
  }
}
