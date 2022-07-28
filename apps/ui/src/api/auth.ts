import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
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

export async function signIn(email: string, password: string): Promise<void> {
  return apiFetch<void>(`/auth/sign-in`, {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })
}

export async function signOut() {
  return apiFetch<void>(`/auth/sign-out`, {
    method: 'POST',
  })
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
