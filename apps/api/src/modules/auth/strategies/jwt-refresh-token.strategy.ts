import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

import { TokenPayload } from '../types/token-payload.interface'
import { AuthService } from '../auth.service'
import type { AuthConfig } from '../../../config/types/auth-config.interface'

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // cookies are added to request object via cookie-parser (refer to main.ts)
          return request?.cookies?.Refresh
        },
      ]),
      // pass request to `validate()` to access request.cookies
      secretOrKey: configService.get<AuthConfig>('auth')?.jwt.refreshToken.secret ?? '',
      passReqToCallback: true,
    })
  }

  /**
   *
   */
  async validate(request: Request, payload: TokenPayload) {
    const refreshTokenFromRequest = request.cookies?.Refresh
    const user = await this.authService.getAuthenticatedUserByRefreshToken(payload.email, refreshTokenFromRequest)

    return user
  }
}
