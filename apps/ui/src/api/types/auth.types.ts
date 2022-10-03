/**
 * User credentials required to sign-in to the back-end API.
 */
export interface AuthSignInCredentials {
  email: string
  password: string
}

/**
 * Available endpoints of the back-end API related to authentication.
 *
 * The project fetch implementation makes use of the token refresh point and
 * the remaining queries are used via react-query.
 *
 * @see apiFetch
 */
export type AuthQueryEndpoint = 'session' | 'refresh' | 'signIn' | 'signOut'
