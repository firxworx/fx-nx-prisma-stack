import type { AuthSession, SessionStatus } from '../session.types'
import { isRecord } from './common.type-guards'

/**
 * Type guard that evaluates if the input argument is a ready (i.e. data fetch successful) `AuthSession`.
 */
export const isAuthSessionResult = (x: unknown): x is AuthSession<SessionStatus.READY> => {
  return (
    isRecord(x) &&
    Object.prototype.hasOwnProperty.call(x, 'session') &&
    Object.prototype.hasOwnProperty.call(x['session'], 'name') &&
    Object.prototype.hasOwnProperty.call(x['session'], 'email') &&
    typeof x['session']['name'] === 'string' &&
    typeof x['session']['email'] === 'string' &&
    x['error'] === undefined
  )
}
