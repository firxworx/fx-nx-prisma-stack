import { AuthUser } from '../types/auth.types'
import { apiFetch } from './lib/api-fetch'

// @todo create shared lib with interfaces of api responses
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

export async function fetchSession(): Promise<AuthUser> {
  return apiFetch<AuthUser>(`/auth/session`)
}
