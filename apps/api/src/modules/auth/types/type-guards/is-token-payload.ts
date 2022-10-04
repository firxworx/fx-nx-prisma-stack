import type { TokenPayload } from '../token-payload.interface'
import { isRecord } from './is-record'

export function isTokenPayload(x: unknown): x is TokenPayload {
  const validKeys: (keyof TokenPayload)[] = ['email', 'name']

  return (
    isRecord(x) &&
    Object.entries(x).every(
      ([key, value]: [unknown, unknown]) => typeof key === 'string' && typeof value === 'string' && key in validKeys,
    )
  )
}
