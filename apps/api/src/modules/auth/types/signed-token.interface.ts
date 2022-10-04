/**
 * Base interface for payload of a signed token with `iac` and `exp` properties.
 *
 * @see TokenPayload
 */
export interface SignedToken {
  iat: number
  exp: number
}
