import type { TokenPayload } from '../token-payload.interface'
import type { SignedToken } from '../signed-token.interface'
import { isRecord } from './is-record'

export function isSignedTokenPayload(x: unknown): x is TokenPayload & SignedToken {
  const validTokenPayloadKeys: (keyof TokenPayload)[] = ['email', 'name']
  const validSignedTokenKeys: (keyof SignedToken)[] = ['iat', 'exp']

  if (!isRecord(x)) {
    console.error('x is not record')
    return false
  }

  return Object.entries(x).every(([key, value]: [unknown, unknown]) => {
    if (typeof key !== 'string') {
      console.error(`key ${key} is not string`)
      return false
    }

    if ((validTokenPayloadKeys as string[]).includes(key)) {
      console.error(`checking if ${key} is string`)
      return typeof value === 'string' && !!value.length
    }

    if ((validSignedTokenKeys as string[]).includes(key)) {
      console.error(`checking if ${key} is number`)
      return typeof value === 'number'
    }

    console.error(`key ${key} is not in either array`)

    return false
  })
}
