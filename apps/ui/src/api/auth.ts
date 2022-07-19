import { AuthUser } from '../types/auth.types'
import { apiFetch } from './lib/api-fetch'

// @todo create shared lib with interfaces of api responses
export async function signIn(username: string, password: string): Promise<void> {
  return apiFetch(`/auth/sign-in`, {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
    }),
  })
}

export async function fetchSession(): Promise<AuthUser> {
  return apiFetch<AuthUser>(`/auth/session`)
}
