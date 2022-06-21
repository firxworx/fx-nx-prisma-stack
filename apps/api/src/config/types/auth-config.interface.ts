export interface AuthConfig {
  jwt: {
    accessToken: {
      secret: string
      expirationTime: number
    }
    refreshToken: {
      secret: string
      expirationTime: number
    }
  }
}
