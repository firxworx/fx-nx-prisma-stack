import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import type { CookieOptions, Response } from 'express'
import { ConfigService } from '@nestjs/config'

import type { AuthConfig } from '../../config/types/auth-config.interface'
import type { AppConfig } from '../../config/types/app-config.interface'
import type { RequestWithUser } from './types/request-with-user.interface'
import type { SanitizedUser } from './types/sanitized-user.type'

import { GetUser } from './decorators/get-user.decorator'
import { AuthService } from './auth.service'
import { ChangePasswordDto } from './dto/change-password.dto'
import { RegisterUserDto } from './dto/register-user.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'

type SanitizedUserResponse = Pick<SanitizedUser, 'name' | 'email'>

@Controller('auth')
export class AuthController {
  private logger = new Logger(this.constructor.name)

  private ERROR_MESSAGES = {
    INVALID_CHANGE_PASSWORD_MATCH: 'New password cannot be the same as the old password',
  }

  private readonly authConfig: AuthConfig

  constructor(private readonly configService: ConfigService<AppConfig>, private readonly authService: AuthService) {
    const authConfig = this.configService.get<AuthConfig>('auth')

    if (!authConfig) {
      throw new Error('AuthModule unable to access auth config')
    }

    this.authConfig = authConfig
  }

  /**
   * Helper that returns an Express `CookieOptions` object with configuration for
   * authentication + refresh cookies.
   *
   * The function accepts an argument for the cookie lifetime in seconds relative to now.
   * It performs an internal conversion to the _milliseconds from `Date.now()`_ unit required
   * by Express.
   *
   * @future consider making SameSite configurable via env (values: 'lax' | 'strict' | 'none')
   */
  private getCookieOptions(expiresInSeconds: number): CookieOptions {
    return {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: true,
      signed: true,
      maxAge: expiresInSeconds * 1000,
    }
  }

  /**
   * Helper to set sign out cookies on the given Express `Response` object.
   */
  private setSignOutCookies(response: Response): void {
    response.clearCookie('Authentication', this.getCookieOptions(0))
    response.clearCookie('Refresh', this.getCookieOptions(0))
  }

  /**
   * Helper to set signed Authentication + Refresh token cookies on the given Express
   * `Response` object.
   *
   * If `expiresInSeconds` is not provided for a given cookie the config value obtained from
   * the environment for that cookie will be used.
   */
  private setCredentialsCookies(
    response: Response,
    config: {
      authentication: {
        signedTokenPayload: string
        expiresInSeconds?: number
      }
      refresh: {
        signedTokenPayload: string
        expiresInSeconds?: number
      }
    },
  ): void {
    const { authentication, refresh } = config

    response.cookie(
      'Authentication',
      authentication.signedTokenPayload,
      this.getCookieOptions(authentication.expiresInSeconds ?? this.authConfig.jwt.accessToken.expirationTime),
    )

    response.cookie(
      'Refresh',
      refresh.signedTokenPayload,
      this.getCookieOptions(refresh.expiresInSeconds ?? this.authConfig.jwt.refreshToken.expirationTime),
    )
  }

  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<SanitizedUserResponse> {
    // @todo restrict, send user verification, etc
    this.logger.log(`User registration request: ${dto.email}`)

    const { name, email } = await this.authService.registerUser(dto)
    return { name, email }
  }

  @Post('change-password')
  async changePassword(
    @GetUser() user: SanitizedUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    this.logger.log(`User change password request: ${user.email}`)

    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException(this.ERROR_MESSAGES.INVALID_CHANGE_PASSWORD_MATCH)
    }

    this.setSignOutCookies(response)
    return this.authService.changeUserPassword(user.email, dto)
  }

  @Post('sign-in')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK) // override default 201
  async signIn(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SanitizedUserResponse> {
    const { user } = request
    const { name, email } = user

    this.logger.log(`User sign-in: ${user.email} <${user.id}> <${user.uuid}> <${user.name}>`)

    const payload = this.authService.createJwtTokenPayload(user)
    const signedAuthenticationToken = await this.authService.signAuthenticationPayload(payload)
    const signedRefreshToken = await this.authService.signRefreshPayload(payload)

    await this.authService.setUserRefreshTokenHash(user.email, signedRefreshToken)

    this.setCredentialsCookies(response, {
      authentication: {
        signedTokenPayload: signedAuthenticationToken,
        expiresInSeconds: this.authConfig.jwt.accessToken.expirationTime,
      },
      refresh: {
        signedTokenPayload: signedRefreshToken,
        expiresInSeconds: this.authConfig.jwt.refreshToken.expirationTime,
      },
    })

    return { name, email }
  }

  @Get('session')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  session(@Req() request: RequestWithUser): SanitizedUserResponse {
    const { name, email } = request.user
    this.logger.debug(`User fetch session: ${email}`)

    return {
      name,
      email,
    }
  }

  @Post('sign-out')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(@Req() request: RequestWithUser, @Res({ passthrough: true }) response: Response): Promise<void> {
    const { email } = request.user
    this.logger.log(`User sign-out: ${email}`)

    await this.authService.clearUserRefreshToken(email)
    this.setSignOutCookies(response)
  }

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SanitizedUserResponse> {
    // the expended refresh token payload is verified + decoded to implement this security recommendation:
    // https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-05#section-8
    //
    // requirement: when issuing a rotated refresh token it MUST NOT extend the lifetime past
    //              that of initial refresh token expiry
    //
    // - `exp` claim of a signed jsonwebtoken is NumericDate format i.e. seconds since unix epoch
    //    - https://www.npmjs.com/package/jsonwebtoken#token-expiration-exp-claim
    // - `maxAge` of express CookieOptions is specified in milliseconds relative to now

    // @future consider SameSite as env file setting (options: 'lax' | 'strict' | 'none'; `true` === 'strict')
    // http://expressjs.com/en/resources/middleware/cookie-session.html

    const { user } = request
    const { name, email } = user

    this.logger.log(`Auth refresh token request by user: ${email}`)

    try {
      const payload = this.authService.createJwtTokenPayload(user)
      const redeemedRefreshTokenDecodedPayload = await this.authService.verifyRefreshToken(
        request.signedCookies?.Refresh,
      )

      const redeemedRefreshTokenExpiredInSeconds =
        redeemedRefreshTokenDecodedPayload.exp - Math.floor(Date.now() / 1000)

      const signedAuthenticationToken = await this.authService.signAuthenticationPayload(payload)
      const signedRefreshToken = await this.authService.signRefreshPayload(
        payload,
        redeemedRefreshTokenExpiredInSeconds,
      )

      await this.authService.setUserRefreshTokenHash(user.email, signedRefreshToken)

      this.logger.debug(`expended refresh token exp claim value: ${redeemedRefreshTokenDecodedPayload.exp}s`)
      this.logger.debug(`new-issue refresh token cookie maxAge is: ${redeemedRefreshTokenExpiredInSeconds}s`)

      this.setCredentialsCookies(response, {
        authentication: {
          signedTokenPayload: signedAuthenticationToken,
        },
        refresh: {
          signedTokenPayload: signedRefreshToken,
          expiresInSeconds: redeemedRefreshTokenExpiredInSeconds,
        },
      })

      return {
        name,
        email,
      }
    } catch (error: unknown) {
      this.logger.error('refresh token error', error)
      throw new UnauthorizedException()
    }
  }
}
