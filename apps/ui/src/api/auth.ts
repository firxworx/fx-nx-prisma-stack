import {
  UseMutateAsyncFunction,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'
import { useCallback } from 'react'
import { useSessionContext } from '../context/SessionContextProvider'
import type { AuthUser } from '../types/auth.types'
import { apiFetch } from './lib/api-fetch'
import { ApiMutation } from './types/mutation.types'

// @todo create shared lib with interfaces of api responses

/**
 * LocalStorage key for persisting the enabled/disabled state of the session context query.
 *
 * The value 'enabled' or 'disabled' is saved to LocalStorage. If the corresponding value does
 * not exist or if the value is 'disabled' the user is presumed to be unauthenticated and the
 * session query will be disabled.
 *
 * @see SessionContextProvider
 */
export const LOCAL_STORAGE_SESSION_CTX_FLAG_KEY = 'FX_SESSION_CTX_FLAG'

export interface AuthSignInCredentials {
  email: string
  password: string
}

export type AuthQueryEndpoint = 'session' | 'refresh' | 'signIn' | 'signOut'

const AUTH_KEY_BASE = 'auth' as const

/**
 * Query keys for auth API functions.
 */
export const authQueryKeys: Record<AuthQueryEndpoint, Readonly<string[]>> = {
  session: [AUTH_KEY_BASE, 'session'] as const,
  refresh: [AUTH_KEY_BASE, 'refresh'] as const,
  signIn: [AUTH_KEY_BASE, 'signIn'] as const,
  signOut: [AUTH_KEY_BASE, 'signOut'] as const,
}

export const authQueryEndpointRoutes: Record<AuthQueryEndpoint, Readonly<string>> = {
  session: '/auth/session' as const,
  refresh: '/auth/refresh' as const,
  signIn: '/auth/sign-in' as const,
  signOut: '/auth/sign-out' as const,
}

export async function fetchSession(): Promise<AuthUser> {
  return apiFetch<AuthUser>(authQueryEndpointRoutes.session)
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
    onError: (error: unknown): void => {
      console.warn(`useAuthSessionQuery onError handler`, error)

      // queryClient.clear()
    },
  })

  return {
    ...query,
    invalidate,
    remove,
  }
}

export async function signIn({ email, password }: AuthSignInCredentials): Promise<void> {
  return apiFetch<void>(authQueryEndpointRoutes.signIn, {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })
}

/**
 * Hook that provides facilities to sign in to the back-end API via `AuthSignInCredentials`.
 * The user's session context is fetched and cached on successful sign in.
 */
export function useAuthSignIn(): {
  signIn: UseMutateAsyncFunction<void, Error, AuthSignInCredentials, unknown>
} & ApiMutation {
  const session = useSessionContext()

  const signInMutation = useMutation<void, Error, AuthSignInCredentials>(authQueryKeys.signIn, signIn, {
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

export async function signOut(): Promise<void> {
  return apiFetch<void>(authQueryEndpointRoutes.signOut, {
    method: 'POST',
  })
}

/**
 * Hook that provides facilities to sign out from the back-end API.
 * The query client's response cache is cleared on successful sign-out.
 */
export function useAuthSignOut(): { signOut: UseMutateAsyncFunction<void, unknown, void, unknown> } & ApiMutation {
  const queryClient = useQueryClient()
  const session = useSessionContext()

  const signOutMutation = useMutation<void, Error, void, unknown>(authQueryKeys.signOut, signOut, {
    retry: false,
    onSuccess: () => {
      if (!session) {
        throw new Error('useAuthSignOut missing expected session (via SessionContextProvider)')
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
