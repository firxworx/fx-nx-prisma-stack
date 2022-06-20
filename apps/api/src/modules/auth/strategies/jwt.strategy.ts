import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

import { TokenPayload } from '../types/token-payload.interface'
import { AuthConfig } from '../../../config/types/auth-config.interface'
import { AuthService } from '../auth.service'
import { SanitizedUser } from '../types/sanitized-user.type'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // cookies are added to request object by cookie-parser (refer to main.ts)
          return request?.cookies?.Authentication
        },
      ]),
      secretOrKey: configService.get<AuthConfig>('auth')?.jwt.accessToken.secret ?? '',
    })
  }

  /**
   * Given a JWT token payload, return the user entity associated with the `userId` contained in the payload.
   *
   * The object returned by this method is added as `request.user` to any controller handler method that is
   * decorated with the appropriate guard, e.g. `JwtAuthGuard`.
   *
   * Note: the JWT has already been validated by passport when this method is called.
   */
  async validate(payload: TokenPayload): Promise<SanitizedUser> {
    const user = await this.authService.getUserByEmail(payload.email)

    return user
  }
}
