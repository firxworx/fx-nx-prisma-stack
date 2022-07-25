import type { QueryObserverResult } from '@tanstack/react-query'
import type { AuthUser } from './auth.types'

export enum SessionStatus {
  'READY' = 'READY',
  'ERROR' = 'ERROR',
}

export interface SessionBase {
  isLoading: boolean
  refetch: () => Promise<QueryObserverResult<AuthUser, unknown>>
  invalidateCache: () => Promise<void>
  clear: () => void
}

export interface SessionResult extends SessionBase {
  session: AuthUser
  error?: undefined
}

export interface SessionError extends SessionBase {
  session: undefined | null
  error: Error
}

export type AuthSession<T extends SessionStatus> = T extends SessionStatus.READY
  ? SessionResult
  : T extends SessionStatus.ERROR
  ? SessionError
  : never
