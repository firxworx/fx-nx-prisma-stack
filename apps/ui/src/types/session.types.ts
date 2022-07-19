import type { AuthUser } from './auth.types'

export enum SessionStatus {
  'ACTIVE' = 'ACTIVE',
  'ERROR' = 'ERROR',
}

export interface SessionActive extends AuthUser {
  error?: undefined
}

export interface SessionError {
  error: Error
}

// export type Session = SessionActive | SessionError

export type Session<T extends SessionStatus> = T extends SessionStatus.ACTIVE
  ? SessionActive
  : T extends SessionStatus.ERROR
  ? SessionError
  : never
