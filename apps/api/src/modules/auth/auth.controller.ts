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
  UseGuards,
} from '@nestjs/common'
import { Response } from 'express'

import { GetUser } from '../../decorators/get-user.decorator'
import { AuthService } from './auth.service'
import { ChangePasswordDto } from './dto/change-password.dto'
import { RegisterUserDto } from './dto/register-user.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { RequestWithUser } from './types/request-with-user.interface'
import { SanitizedUser } from './types/sanitized-user.type'

type SanitizedUserResponse = Pick<SanitizedUser, 'name' | 'email'>

@Controller('auth')
export class AuthController {
  private logger = new Logger(this.constructor.name)

  private ERROR_MESSAGES = {
    INVALID_CHANGE_PASSWORD_MATCH: 'New password cannot be the same as the old password',
  }

  constructor(private readonly authService: AuthService) {}

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
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    this.logger.log(`User change password request: ${user.email}`)

    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException(this.ERROR_MESSAGES.INVALID_CHANGE_PASSWORD_MATCH)
    }

    res.setHeader('Set-Cookie', this.authService.buildSignOutCookies())
    return this.authService.changeUserPassword(user.email, dto)
  }

  @Post('sign-in')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK) // override default 201
  async signIn(@Req() request: RequestWithUser): Promise<SanitizedUserResponse> {
    const { user } = request
    const { name, email } = user

    this.logger.log(`User sign-in: ${user.email} <${user.id}> <${user.uuid}> <${user.name}>`)

    const payload = this.authService.buildJwtTokenPayload(user)

    const authTokenCookie = this.authService.buildSignedAuthenticationTokenCookie(payload)
    const { cookie: refreshTokenCookie, token: signedRefreshToken } =
      this.authService.buildSignedRefreshTokenCookie(payload)

    await this.authService.setUserRefreshTokenHash(user.email, signedRefreshToken)

    request.res?.setHeader('Set-Cookie', [authTokenCookie, refreshTokenCookie])

    return { name, email }
  }

  @Get('session')
  @UseGuards(JwtRefreshGuard)
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
  async signOut(@Req() request: RequestWithUser): Promise<void> {
    const { email } = request.user
    this.logger.log(`User sign-out: ${email}`)

    await this.authService.clearUserRefreshToken(email)
    request.res?.setHeader('Set-Cookie', this.authService.buildSignOutCookies())
  }

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  refreshToken(@Req() request: RequestWithUser): SanitizedUserResponse {
    const { user } = request
    const { name, email } = user

    this.logger.log(`Auth refresh token request: ${email}`)

    const payload = this.authService.buildJwtTokenPayload(user)
    const authTokenCookie = this.authService.buildSignedAuthenticationTokenCookie(payload)

    request.res?.setHeader('Set-Cookie', authTokenCookie)

    return {
      name,
      email,
    }
  }
}
