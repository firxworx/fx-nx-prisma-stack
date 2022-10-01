import type { AuthUser } from '../../types/auth.types'
import type { AuthQueryEndpoint, AuthSignInCredentials } from '../types/auth.types'

import { apiFetch } from '../lib/api-fetch'

export const authQueryEndpointRoutes: Record<AuthQueryEndpoint, Readonly<string>> = {
  session: '/auth/session' as const,
  refresh: '/auth/refresh' as const,
  signIn: '/auth/sign-in' as const,
  signOut: '/auth/sign-out' as const,
}

export async function fetchSession(): Promise<AuthUser> {
  return apiFetch<AuthUser>(authQueryEndpointRoutes.session)
}

export async function fetchSignIn({ email, password }: AuthSignInCredentials): Promise<void> {
  return apiFetch<void>(authQueryEndpointRoutes.signIn, {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })
}

export async function fetchSignOut(): Promise<void> {
  return apiFetch<void>(authQueryEndpointRoutes.signOut, {
    method: 'POST',
  })
}
