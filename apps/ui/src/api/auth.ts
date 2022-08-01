import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useSessionContext } from '../context/SessionContextProvider'
import { AuthUser } from '../types/auth.types'
import { apiFetch } from './lib/api-fetch'

// @todo create shared lib with interfaces of api responses

const AUTH_KEY_BASE = 'auth' as const

/**
 * Query keys for auth API functions.
 */
export const authQueryKeys = {
  session: [AUTH_KEY_BASE, 'session'] as const,
  signIn: [AUTH_KEY_BASE, 'signIn'] as const,
  signOut: [AUTH_KEY_BASE, 'signOut'] as const,
}

export async function fetchSession(): Promise<AuthUser> {
  return apiFetch<AuthUser>(`/auth/session`)
}

export function useApiSession() {
  const queryClient = useQueryClient()

  const invalidate = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries(authQueryKeys.session)
  }, [queryClient])

  const remove = useCallback((): void => {
    queryClient.removeQueries(authQueryKeys.session)
  }, [queryClient])

  return {
    ...useQuery<AuthUser>(authQueryKeys.session, fetchSession, { retry: false, refetchInterval: 900000 }),
    invalidate,
    remove,
  }
}

export interface AuthSignInCredentials {
  email: string
  password: string
}

export async function signIn({ email, password }: AuthSignInCredentials): Promise<void> {
  return apiFetch<void>(`/auth/sign-in`, {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })
}

export function useAuthSignIn() {
  const session = useSessionContext()

  const signInMutation = useMutation<void, Error, AuthSignInCredentials>(authQueryKeys.signIn, signIn, {
    retry: false,
    onSuccess: () => {
      session?.refetch()
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
  return apiFetch<void>(`/auth/sign-out`, {
    method: 'POST',
  })
}

/**
 * Hook to request sign out from the back-end API. Clears response cache on successful sign-out.
 */
export function useAuthSignOut() {
  const queryClient = useQueryClient()

  const signOutMutation = useMutation(authQueryKeys.signOut, signOut, {
    retry: false,
    onSuccess: () => {
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
