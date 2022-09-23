import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'

import { AuthService } from '../auth.service'
import type { TokenPayload } from '../types/token-payload.interface'
import type { AuthConfig } from '../../../config/types/auth-config.interface'
import type { SanitizedUser } from '../types/sanitized-user.type'

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  private logger = new Logger(this.constructor.name)

  constructor(private readonly configService: ConfigService, private readonly authService: AuthService) {
    const secretOrKey = configService.get<AuthConfig>('auth')?.jwt.refreshToken.secret

    if (!secretOrKey) {
      throw new InternalServerErrorException('Authentication error') // better safe than sorry
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          // cookies are added to request object via cookie-parser - @see main.ts
          return request?.cookies?.Refresh ?? null
        },
      ]),
      secretOrKey,
      passReqToCallback: true, // pass request to `validate()` to access request.cookies
    })
  }

  /**
   * Validate user's refresh token via the AuthService.
   */
  async validate(request: Request, payload: TokenPayload): Promise<SanitizedUser> {
    const refreshTokenFromRequest = request.cookies?.Refresh

    this.logger.log(`User refresh token validation request: ${payload.email}`)
    const user = await this.authService.getAuthenticatedUserByRefreshToken(payload.email, refreshTokenFromRequest)

    return user
  }
}
