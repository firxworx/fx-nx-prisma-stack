export interface AuthConfig {
  jwt: {
    accessToken: {
      secret: string

      /** JWT token expiration time in seconds. */
      expirationTime: number
    }
    refreshToken: {
      secret: string

      /** JWT token expiration time in seconds. */
      expirationTime: number
    }
  }
}
