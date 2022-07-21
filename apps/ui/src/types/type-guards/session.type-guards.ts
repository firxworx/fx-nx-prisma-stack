import type { SessionResult, SessionError } from '../session.types'
import { isRecord } from './common.type-guards'

export const isSessionActive = (x: unknown): x is SessionResult => {
  return (
    isRecord(x) &&
    Object.prototype.hasOwnProperty.call(x, 'name') &&
    Object.prototype.hasOwnProperty.call(x, 'email') &&
    typeof x['name'] === 'string' &&
    typeof x['email'] === 'string' &&
    x['error'] === undefined
  )
}

export const isSessionError = (x: unknown): x is SessionError => {
  return (
    isRecord(x) &&
    Object.prototype.hasOwnProperty.call(x, 'error') &&
    x['error'] instanceof Error &&
    Object.keys(x).length === 1
  )
}
