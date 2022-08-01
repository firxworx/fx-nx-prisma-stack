import type { SessionStatus } from '../enums/session.enums'
import type { AuthSession } from '../session.types'
import { isRecord } from './common.type-guards'

/**
 * Type guard that evaluates if the input argument is a ready (i.e. data fetch successful) `AuthSession`.
 */
export const isAuthSessionResult = (x: unknown): x is AuthSession<SessionStatus.READY> => {
  return (
    isRecord(x) &&
    isRecord(x['profile']) &&
    Object.prototype.hasOwnProperty.call(x, 'profile') &&
    Object.prototype.hasOwnProperty.call(x['profile'], 'name') &&
    Object.prototype.hasOwnProperty.call(x['profile'], 'email') &&
    typeof x['profile']['name'] === 'string' &&
    typeof x['profile']['email'] === 'string' &&
    x['error'] === undefined
  )
}
