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
import type { Response } from 'express'
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
   * Helper to set sign out cookies on the given ExpressJS `Response` object.
   */
  private setSignOutCookies(response: Response): void {
    response.clearCookie('Authentication', {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: true,
      signed: true,
      maxAge: 0,
    })

    response.clearCookie('Refresh', {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: true,
      signed: true,
      maxAge: 0,
    })
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

    const payload = this.authService.buildJwtTokenPayload(user)
    const signedAuthenticationPayload = await this.authService.signAuthenticationPayload(payload)
    const signedRefreshToken = await this.authService.signRefreshPayload(payload)

    await this.authService.setUserRefreshTokenHash(user.email, signedRefreshToken)

    response.cookie('Authentication', signedAuthenticationPayload, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: true, // @future make SameSite an env file setting // also 'lax' | 'strict' | 'none'
      signed: true,
      maxAge: this.authConfig.jwt.accessToken.expirationTime,
    })

    response.cookie('Refresh', signedRefreshToken, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: true, // @future make SameSite an env file setting // also 'lax' | 'strict' | 'none'
      signed: true,
      maxAge: this.authConfig.jwt.refreshToken.expirationTime,
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
    // - `maxAge` of express CookieOptions is specified in milliseconds relative to current time
    //    - e.g. Math.floor(Date.now() / 1000) * 60 * 60 === expires 1 hour from now

    // @future consider SameSite as env file setting (options: 'lax' | 'strict' | 'none'; `true` === 'strict')
    // http://expressjs.com/en/resources/middleware/cookie-session.html

    const { user } = request
    const { name, email } = user

    this.logger.log(`Auth refresh token request by user: ${email}`)

    try {
      const payload = this.authService.buildJwtTokenPayload(user)
      const expendedRefreshTokenPayload = await this.authService.verifyRefreshToken(request.signedCookies?.Refresh)

      const currentTime_s = Math.floor(Date.now() / 1000)
      const refreshTokenExpiresIn_s = expendedRefreshTokenPayload.exp - currentTime_s

      const signedAuthenticationPayload = await this.authService.signAuthenticationPayload(payload)
      const signedRefreshTokenPayload = await this.authService.signRefreshPayload(payload, refreshTokenExpiresIn_s)

      await this.authService.setUserRefreshTokenHash(user.email, signedRefreshTokenPayload)

      const newAuthenticationCookieMaxAge = this.authConfig.jwt.accessToken.expirationTime * 1000
      const newRefreshCookieMaxAge =
        (refreshTokenExpiresIn_s < this.authConfig.jwt.refreshToken.expirationTime
          ? refreshTokenExpiresIn_s
          : this.authConfig.jwt.refreshToken.expirationTime) * 1000

      this.logger.debug(`expended refresh token exp claim value: ${expendedRefreshTokenPayload.exp}s`)
      this.logger.debug(`new refresh token cookie maxAge is: ${newRefreshCookieMaxAge}`)

      response.cookie('Authentication', signedAuthenticationPayload, {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: true,
        signed: true,
        maxAge: newAuthenticationCookieMaxAge,
      })

      response.cookie('Refresh', signedRefreshTokenPayload, {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: true,
        signed: true,
        maxAge: newRefreshCookieMaxAge,
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
