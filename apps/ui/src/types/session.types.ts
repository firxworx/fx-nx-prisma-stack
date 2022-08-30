import type { QueryObserverResult } from '@tanstack/react-query'
import type { AuthUser } from './auth.types'
import type { SessionStatus } from './enums/session.enums'

export interface SessionBase {
  setEnabled: (enabled: boolean) => void
  isLoading: boolean
  refetch: () => Promise<QueryObserverResult<AuthUser, unknown>>
  invalidate: () => Promise<void>
  remove: () => void
}

export interface SessionResult extends SessionBase {
  profile: AuthUser
  error?: undefined
}

export interface SessionError extends SessionBase {
  profile: undefined | null
  error: Error
}

export type AuthSession<T extends SessionStatus> = T extends SessionStatus.READY
  ? SessionResult
  : T extends SessionStatus.ERROR
  ? SessionError
  : never
