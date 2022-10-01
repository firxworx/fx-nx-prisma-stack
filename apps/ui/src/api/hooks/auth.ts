import { useCallback } from 'react'
import {
  UseMutateAsyncFunction,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'

import type { AuthUser } from '../../types/auth.types'
import type { ApiMutation } from './../types/mutation.types'
import type { AuthQueryEndpoint, AuthSignInCredentials } from '../types/auth.types'
import { useSessionContext } from '../../context/SessionContextProvider'
import { fetchSession, fetchSignIn, fetchSignOut } from '../fetchers/auth'

// @todo create shared lib with interfaces of api responses

const AUTH_KEY_BASE = 'auth' as const

/**
 * Query keys for auth API functions.
 */
export const authQueryKeys: Record<AuthQueryEndpoint | 'all', Readonly<string[]>> = {
  all: [AUTH_KEY_BASE] as const,
  session: [AUTH_KEY_BASE, 'session'] as const,
  refresh: [AUTH_KEY_BASE, 'refresh'] as const,
  signIn: [AUTH_KEY_BASE, 'signIn'] as const,
  signOut: [AUTH_KEY_BASE, 'signOut'] as const,
}

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
    // refetchOnMount: false, // potential consideration for non-auth + auth layout components that call useAuthSession() hook

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
 * Hook that provides facilities to sign in to the back-end API via `AuthSignInCredentials`.
 * The user's session context is fetched and cached on successful sign in.
 */
export function useAuthSignIn(): {
  signIn: UseMutateAsyncFunction<void, Error, AuthSignInCredentials, unknown>
} & ApiMutation {
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
    error: signInMutation.error,
    isLoading: signInMutation.isLoading,
    isSuccess: signInMutation.isSuccess,
    isError: signInMutation.isError,
  }
}

/**
 * Hook that provides facilities to sign out from the back-end API.
 * The query client's response cache is cleared on successful sign-out.
 */
export function useAuthSignOut(): { signOut: UseMutateAsyncFunction<void, unknown, void, unknown> } & ApiMutation {
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

  const { mutateAsync, error, isLoading, isSuccess, isError } = signOutMutation

  return {
    signOut: mutateAsync,
    error,
    isLoading,
    isSuccess,
    isError,
  }
}
