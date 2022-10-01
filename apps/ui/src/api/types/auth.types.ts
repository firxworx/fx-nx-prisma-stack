export interface AuthSignInCredentials {
  email: string
  password: string
}

export type AuthQueryEndpoint = 'session' | 'refresh' | 'signIn' | 'signOut'
