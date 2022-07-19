import type { SessionActive, SessionError } from '../session.types'

const isObject = (x: unknown): boolean => x !== null && typeof x === 'object' && !Array.isArray(x)

export const isSessionActive = (x: unknown): x is SessionActive => {
  return (
    isObject(x) &&
    Object.prototype.hasOwnProperty.call(x, 'name') &&
    Object.prototype.hasOwnProperty.call(x, 'email') &&
    typeof x['name'] === 'string' &&
    typeof x['email'] === 'string' &&
    x['error'] === undefined
  )
}

export const isSessionError = (x: unknown): x is SessionError => {
  return (
    isObject(x) &&
    Object.prototype.hasOwnProperty.call(x, 'error') &&
    x['error'] instanceof Error &&
    Object.keys(x).length === 1
  )
}
