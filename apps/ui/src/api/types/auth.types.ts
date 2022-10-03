/**
 * User credentials required to sign-in to the back-end API.
 */
export interface AuthSignInCredentials {
  email: string
  password: string
}

/**
 * Available endpoints of the back-end API related to authentication (for use with react-query).
 * Note the project fetch wrapper hits an additional endpoint for token refresh.
 */
export type AuthQueryEndpoint = 'session' | 'signIn' | 'signOut'
