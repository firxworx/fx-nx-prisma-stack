import { registerAs } from '@nestjs/config'
import { AuthConfig } from './types/auth-config.interface'

export default registerAs('auth', (): AuthConfig => {
  if (
    !process.env.JWT_ACCESS_TOKEN_SECRET ||
    !process.env.JWT_REFRESH_TOKEN_SECRET ||
    !process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME ||
    !process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME
  ) {
    throw new Error(
      'Environment variables JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET, JWT_ACCESS_TOKEN_EXPIRATION_TIME, and JWT_REFRESH_TOKEN_EXPIRATION_TIME must be specified',
    )
  }

  return {
    jwt: {
      accessToken: {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        expirationTime: +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
      },
      refreshToken: {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        expirationTime: +process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
      },
    },
  }
})
